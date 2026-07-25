import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { sessionsActions } from "./sessionsSlice";
import { WebRtcSignalingClient } from "@/lib/webrtc-helper";
import { AppConfig } from "@/config/app-config";

export interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
  text: string;
}

export function useVideoCallPageState() {
  const dispatch = useAppDispatch();
  const { data: items, status, error } = useAppSelector((state) => state.sessions.items);
  const { formFields } = useAppSelector((state) => state.sessions.ui);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const signalingClientRef = useRef<WebRtcSignalingClient | null>(null);

  const iceConfiguration = useMemo<RTCConfiguration>(() => ({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" }
    ]
  }), []);

  const { joined = false, roomId = "procureiq-session-1", userId = "", micActive = true, videoActive = true, screenShareActive = false, logs = [], peersInRoom = [] } = formFields ?? {};

  const addLog = useCallback((text: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    const newLogs = [{ timestamp, type, text }, ...(logs || []).slice(0, 49)];
    dispatch(sessionsActions.setFormField({ field: "logs", value: newLogs }));
  }, [dispatch, logs]);

  const startLocalStream = useCallback(async () => {
    try {
      addLog("Requesting access to camera and microphone...", "info");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      addLog("Successfully captured camera and microphone.", "success");
    } catch (err: any) {
      addLog(`Failed to capture local stream: ${err.message}`, "error");
    }
  }, [addLog]);

  const createPeerConnection = useCallback((targetPeerId: string): RTCPeerConnection => {
    addLog(`Creating RTCPeerConnection for peer: ${targetPeerId}`, "info");
    const pc = new RTCPeerConnection(iceConfiguration);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
      addLog("Added local tracks to peer connection.", "info");
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && signalingClientRef.current) {
        addLog("Local ICE Candidate found, sending to signaling server...", "info");
        signalingClientRef.current.sendCandidate(
          targetPeerId,
          event.candidate.candidate,
          event.candidate.sdpMid || "",
          event.candidate.sdpMLineIndex || 0
        );
      }
    };

    pc.ontrack = (event) => {
      addLog("Received remote stream track from peer.", "success");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onconnectionstatechange = () => {
      addLog(`WebRTC Connection State: ${pc.connectionState}`, 
        pc.connectionState === "connected" ? "success" : "info"
      );
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [addLog, iceConfiguration]);

  const handleJoinCall = useCallback(async () => {
    if (!roomId.trim() || !userId.trim()) return;

    if (!localStreamRef.current) {
      await startLocalStream();
    }

    addLog(`Connecting to WebSocket signaling server...`, "info");
    
    const client = new WebRtcSignalingClient(
      AppConfig.webrtcSignalingUrl,
      roomId,
      userId,
      async (message) => {
        switch (message.type) {
          case "peer-joined":
            addLog(`New peer joined: ${message.userId}. Establishing WebRTC handshake...`, "success");
            dispatch(sessionsActions.setFormField({ field: "peersInRoom", value: [...peersInRoom, message.userId] }));
            
            const pc = createPeerConnection(message.userId);
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              addLog(`SDP Offer created, sending to ${message.userId}`, "info");
              client.sendOffer(message.userId, offer.sdp || "");
            } catch (err: any) {
              addLog(`Offer creation error: ${err.message}`, "error");
            }
            break;

          case "peer-left":
            addLog(`Peer left room: ${message.userId}`, "warning");
            dispatch(sessionsActions.setFormField({ field: "peersInRoom", value: peersInRoom.filter((id: any) => id !== message.userId) }));
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }
            if (peerConnectionRef.current) {
              peerConnectionRef.current.close();
              peerConnectionRef.current = null;
            }
            break;

          case "offer":
            addLog(`SDP Offer received from ${message.senderId}. Setting remote description...`, "info");
            const offerPc = createPeerConnection(message.senderId);
            try {
              await offerPc.setRemoteDescription(new RTCSessionDescription({
                type: "offer",
                sdp: message.sdp
              }));
              
              const answer = await offerPc.createAnswer();
              await offerPc.setLocalDescription(answer);
              addLog(`SDP Answer created, sending to ${message.senderId}`, "info");
              client.sendAnswer(message.senderId, answer.sdp || "");
            } catch (err: any) {
              addLog(`Answer creation error: ${err.message}`, "error");
            }
            break;

          case "answer":
            addLog(`SDP Answer received from ${message.senderId}. Completing connection...`, "success");
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription({
                type: "answer",
                sdp: message.sdp
              }));
            }
            break;

          case "candidate":
            addLog(`Received ICE Candidate from ${message.senderId}. Adding candidate...`, "info");
            if (peerConnectionRef.current) {
              try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate({
                  candidate: message.candidate,
                  sdpMid: message.sdpMid,
                  sdpMLineIndex: message.sdpMLineIndex
                }));
              } catch (err: any) {
                addLog(`Error adding ICE candidate: ${err.message}`, "error");
              }
            }
            break;
        }
      }
    );

    client.connect();
    signalingClientRef.current = client;
    dispatch(sessionsActions.setFormField({ field: "joined", value: true }));
    addLog(`Joined signaling room: ${roomId} as ${userId}`, "success");
  }, [roomId, userId, startLocalStream, addLog, dispatch, peersInRoom, createPeerConnection]);

  const handleLeaveCall = useCallback(() => {
    addLog("Leaving the video session...", "warning");
    
    if (signalingClientRef.current) {
      signalingClientRef.current.disconnect();
      signalingClientRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    dispatch(sessionsActions.setFormField({ field: "joined", value: false }));
    dispatch(sessionsActions.setFormField({ field: "peersInRoom", value: [] }));
    dispatch(sessionsActions.setFormField({ field: "screenShareActive", value: false }));
    addLog("Successfully left room and released media devices.", "info");
  }, [addLog, dispatch]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        dispatch(sessionsActions.setFormField({ field: "videoActive", value: videoTrack.enabled }));
        addLog(`Camera ${videoTrack.enabled ? "Enabled" : "Disabled"}`, "info");
      }
    }
  }, [addLog, dispatch]);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        dispatch(sessionsActions.setFormField({ field: "micActive", value: audioTrack.enabled }));
        addLog(`Microphone ${audioTrack.enabled ? "Muted" : "Unmuted"}`, "info");
      }
    }
  }, [addLog, dispatch]);

  useEffect(() => {
    dispatch(sessionsActions.fetchRequest(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (!userId) {
      const randomUserId = `user-${Math.floor(Math.random() * 900) + 100}`;
      dispatch(sessionsActions.setFormField({ field: "userId", value: randomUserId }));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    startLocalStream();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startLocalStream]);

  return {
    dispatch,
    items,
    status,
    error,
    formFields,
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    peerConnectionRef,
    signalingClientRef,
    iceConfiguration,
    joined,
    roomId,
    userId,
    micActive,
    videoActive,
    screenShareActive,
    logs,
    peersInRoom,
    addLog,
    startLocalStream,
    createPeerConnection,
    handleJoinCall,
    handleLeaveCall,
    toggleVideo,
    toggleAudio,
  };
}
