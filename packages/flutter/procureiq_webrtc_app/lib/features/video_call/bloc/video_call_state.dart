import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../../../shared/config.dart';

class VideoCallState {
  final String serverUrl;
  final String roomId;
  final String userId;
  final bool joined;
  final bool micMuted;
  final bool cameraOff;
  final List<String> consoleLogs;
  final String? remotePeerId;
  final MediaStream? localStream;
  final MediaStream? remoteStream;

  VideoCallState({
    required this.serverUrl,
    required this.roomId,
    required this.userId,
    required this.joined,
    required this.micMuted,
    required this.cameraOff,
    required this.consoleLogs,
    this.remotePeerId,
    this.localStream,
    this.remoteStream,
  });

  factory VideoCallState.initial() {
    return VideoCallState(
      serverUrl: AppConfig.signalingUrl,
      roomId: AppConfig.defaultRoomId,
      userId: AppConfig.defaultUserId,
      joined: false,
      micMuted: false,
      cameraOff: false,
      consoleLogs: const [],
    );
  }

  VideoCallState copyWith({
    String? serverUrl,
    String? roomId,
    String? userId,
    bool? joined,
    bool? micMuted,
    bool? cameraOff,
    List<String>? consoleLogs,
    String? remotePeerId,
    MediaStream? localStream,
    MediaStream? remoteStream,
    bool clearRemote = false,
  }) {
    return VideoCallState(
      serverUrl: serverUrl ?? this.serverUrl,
      roomId: roomId ?? this.roomId,
      userId: userId ?? this.userId,
      joined: joined ?? this.joined,
      micMuted: micMuted ?? this.micMuted,
      cameraOff: cameraOff ?? this.cameraOff,
      consoleLogs: consoleLogs ?? this.consoleLogs,
      remotePeerId: clearRemote ? null : (remotePeerId ?? this.remotePeerId),
      localStream: localStream ?? this.localStream,
      remoteStream: clearRemote ? null : (remoteStream ?? this.remoteStream),
    );
  }
}
