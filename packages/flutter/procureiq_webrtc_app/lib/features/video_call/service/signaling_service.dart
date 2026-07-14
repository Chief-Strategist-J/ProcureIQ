import 'dart:convert';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import '../../../shared/config.dart';
import '../model/signaling_message.dart';

class SignalingService {
  WebSocketChannel? _channel;
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  final Map<String, dynamic> _iceConfig = {
    'iceServers': AppConfig.iceServers
  };

  final Map<String, dynamic> _mediaConstraints = {
    'audio': true,
    'video': {
      'mandatory': {
        'minWidth': '640',
        'minHeight': '480',
        'minFrameRate': '30',
      },
      'facingMode': 'user',
      'optional': [],
    }
  };

  Future<MediaStream?> startLocalStream(Function(String) logCallback) async {
    try {
      logCallback('Requesting local media devices...');
      final stream = await navigator.mediaDevices.getUserMedia(_mediaConstraints);
      _localStream = stream;
      logCallback('Successfully captured local camera feed.');
      return stream;
    } catch (e) {
      logCallback('Error getting user media: $e');
      return null;
    }
  }

  void connect({
    required String serverUrl,
    required String roomId,
    required String userId,
    required Function(String, String) onLog,
    required Function(String) onPeerJoined,
    required Function() onPeerLeft,
    required Function(MediaStream) onRemoteStream,
  }) {
    onLog('Connecting to WebSocket signaling server: $serverUrl...', 'info');

    try {
      _channel = WebSocketChannel.connect(Uri.parse(serverUrl));
      
      _channel!.stream.listen(
        (message) {
          final raw = jsonDecode(message) as Map<String, dynamic>;
          final msg = SignalingMessage.fromJson(raw);
          _handleMessage(
            msg: msg,
            roomId: roomId,
            userId: userId,
            onLog: onLog,
            onPeerJoined: onPeerJoined,
            onPeerLeft: onPeerLeft,
            onRemoteStream: onRemoteStream,
          );
        },
        onError: (err) {
          onLog('WebSocket Error: $err', 'error');
          disconnect(roomId, userId);
        },
        onDone: () {
          onLog('WebSocket Connection Closed.', 'warning');
          disconnect(roomId, userId);
        },
      );

      _send(SignalingMessage(
        type: 'join',
        roomId: roomId,
        userId: userId,
      ));

      onLog('Joined room $roomId as $userId', 'success');
    } catch (e) {
      onLog('Failed to connect to signaling: $e', 'error');
    }
  }

  Future<void> _handleMessage({
    required SignalingMessage msg,
    required String roomId,
    required String userId,
    required Function(String, String) onLog,
    required Function(String) onPeerJoined,
    required Function() onPeerLeft,
    required Function(MediaStream) onRemoteStream,
  }) async {
    final type = msg.type;
    final senderId = msg.senderId ?? '';

    onLog('Signaling received: $type', 'info');

    switch (type) {
      case 'peer-joined':
        final peerId = msg.userId ?? '';
        onPeerJoined(peerId);
        onLog('New peer discovered: $peerId. Sending WebRTC Offer...', 'info');
        
        final pc = await _createPeerConnection(peerId, roomId, userId, onLog, onRemoteStream);
        final offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        _send(SignalingMessage(
          type: 'offer',
          roomId: roomId,
          senderId: userId,
          receiverId: peerId,
          sdp: offer.sdp,
        ));
        break;

      case 'offer':
        onLog('SDP Offer received from $senderId. Replying with SDP Answer...', 'info');
        final pc = await _createPeerConnection(senderId, roomId, userId, onLog, onRemoteStream);
        await pc.setRemoteDescription(RTCSessionDescription(msg.sdp, 'offer'));
        
        final answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        _send(SignalingMessage(
          type: 'answer',
          roomId: roomId,
          senderId: userId,
          receiverId: senderId,
          sdp: answer.sdp,
        ));
        break;

      case 'answer':
        onLog('SDP Answer received. Completing peer connection handshake.', 'success');
        if (_peerConnection != null) {
          await _peerConnection!.setRemoteDescription(RTCSessionDescription(msg.sdp, 'answer'));
        }
        break;

      case 'candidate':
        onLog('ICE Candidate received. Adding network relay point...', 'info');
        if (_peerConnection != null) {
          await _peerConnection!.addCandidate(RTCIceCandidate(
            msg.candidate,
            msg.sdpMid,
            msg.sdpMLineIndex,
          ));
        }
        break;

      case 'peer-left':
        onLog('Remote peer left the call.', 'warning');
        onPeerLeft();
        if (_peerConnection != null) {
          await _peerConnection!.close();
          _peerConnection = null;
        }
        break;
    }
  }

  Future<RTCPeerConnection> _createPeerConnection(
    String targetPeerId,
    String roomId,
    String userId,
    Function(String, String) onLog,
    Function(MediaStream) onRemoteStream,
  ) async {
    onLog('Initializing RTCPeerConnection for $targetPeerId...', 'info');
    final pc = await createPeerConnection(_iceConfig);

    if (_localStream != null) {
      _localStream!.getTracks().forEach((track) {
        pc.addTrack(track, _localStream!);
      });
      onLog('Local audio/video tracks attached.', 'info');
    }

    pc.onIceCandidate = (candidate) {
      if (candidate.candidate != null && _channel != null) {
        _send(SignalingMessage(
          type: 'candidate',
          roomId: roomId,
          senderId: userId,
          receiverId: targetPeerId,
          candidate: candidate.candidate,
          sdpMid: candidate.sdpMid,
          sdpMLineIndex: candidate.sdpMLineIndex,
        ));
      }
    };

    pc.onAddStream = (stream) {
      onRemoteStream(stream);
    };

    pc.onConnectionState = (state) {
      onLog('PeerConnection State Changed: ${state.name.toUpperCase()}', 'info');
    };

    _peerConnection = pc;
    return pc;
  }

  void _send(SignalingMessage message) {
    if (_channel != null) {
      _channel!.sink.add(jsonEncode(message.toJson()));
    }
  }

  void disconnect(String roomId, String userId) {
    if (_channel != null) {
      _send(SignalingMessage(
        type: 'leave',
        roomId: roomId,
        userId: userId,
      ));
      _channel!.sink.close();
      _channel = null;
    }
    if (_peerConnection != null) {
      _peerConnection!.close();
      _peerConnection = null;
    }
  }

  void dispose() {
    if (_localStream != null) {
      _localStream!.getTracks().forEach((track) => track.stop());
      _localStream = null;
    }
  }
}
