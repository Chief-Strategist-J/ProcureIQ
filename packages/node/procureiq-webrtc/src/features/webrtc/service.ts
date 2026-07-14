import { WebSocket } from "ws";
import { Room, Peer, SignalingMessage } from "./types";

export class WebRtcService {
  private rooms: Map<string, Room> = new Map();
  // Reverse lookup to find user/room by socket on disconnect
  private activeSockets: Map<WebSocket, { roomId: string; userId: string }> = new Map();

  public joinRoom(roomId: string, userId: string, socket: WebSocket): void {
    // Check if peer is already registered elsewhere and cleanup
    this.cleanupSocket(socket);

    let room = this.rooms.get(roomId);
    if (!room) {
      room = { roomId, peers: new Map() };
      this.rooms.set(roomId, room);
    }

    const newPeer: Peer = { userId, socket };
    room.peers.set(userId, newPeer);
    this.activeSockets.set(socket, { roomId, userId });

    console.log(`[webrtc] User ${userId} joined room ${roomId}. Active peers in room: ${room.peers.size}`);

    // Notify all existing peers in the room about the new peer
    const joinNotification = JSON.stringify({
      type: "peer-joined",
      userId: userId
    });

    room.peers.forEach((peer) => {
      if (peer.userId !== userId && peer.socket.readyState === WebSocket.OPEN) {
        peer.socket.send(joinNotification);
      }
    });
  }

  public leaveRoom(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const peer = room.peers.get(userId);
    if (peer) {
      this.activeSockets.delete(peer.socket);
      room.peers.delete(userId);
      console.log(`[webrtc] User ${userId} left room ${roomId}. Remaining peers: ${room.peers.size}`);

      // Notify remaining peers
      const leaveNotification = JSON.stringify({
        type: "peer-left",
        userId: userId
      });

      room.peers.forEach((otherPeer) => {
        if (otherPeer.socket.readyState === WebSocket.OPEN) {
          otherPeer.socket.send(leaveNotification);
        }
      });
    }

    if (room.peers.size === 0) {
      this.rooms.delete(roomId);
      console.log(`[webrtc] Room ${roomId} is empty. Closed room.`);
    }
  }

  public handleMessage(socket: WebSocket, data: string): void {
    try {
      const msg: SignalingMessage = JSON.parse(data);

      switch (msg.type) {
        case "join":
          this.joinRoom(msg.roomId, msg.userId, socket);
          break;

        case "leave":
          this.leaveRoom(msg.roomId, msg.userId);
          break;

        case "offer":
        case "answer":
        case "candidate":
          this.relayMessage(msg);
          break;

        default:
          console.warn(`[webrtc] Unknown message type: ${(msg as any).type}`);
      }
    } catch (err) {
      console.error("[webrtc] Failed to process message:", err);
    }
  }

  public handleDisconnect(socket: WebSocket): void {
    const session = this.activeSockets.get(socket);
    if (session) {
      this.leaveRoom(session.roomId, session.userId);
    }
  }

  private relayMessage(msg: Extract<SignalingMessage, { receiverId: string }>): void {
    const room = this.rooms.get(msg.roomId);
    if (!room) {
      console.warn(`[webrtc] Room ${msg.roomId} not found for relay.`);
      return;
    }

    const recipient = room.peers.get(msg.receiverId);
    if (recipient && recipient.socket.readyState === WebSocket.OPEN) {
      recipient.socket.send(JSON.stringify(msg));
    } else {
      console.warn(`[webrtc] Recipient peer ${msg.receiverId} not active/found in room ${msg.roomId}.`);
    }
  }

  private cleanupSocket(socket: WebSocket): void {
    const session = this.activeSockets.get(socket);
    if (session) {
      this.leaveRoom(session.roomId, session.userId);
    }
  }
}
