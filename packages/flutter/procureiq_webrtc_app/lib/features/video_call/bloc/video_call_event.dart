import 'package:flutter_webrtc/flutter_webrtc.dart';

abstract class VideoCallEvent {}

class ConnectEvent extends VideoCallEvent {
  final String serverUrl;
  final String roomId;
  final String userId;
  ConnectEvent({required this.serverUrl, required this.roomId, required this.userId});
}

class DisconnectEvent extends VideoCallEvent {}

class ToggleMicEvent extends VideoCallEvent {}

class ToggleCameraEvent extends VideoCallEvent {}

class LogEvent extends VideoCallEvent {
  final String message;
  LogEvent(this.message);
}

class PeerJoinedEvent extends VideoCallEvent {
  final String peerId;
  PeerJoinedEvent(this.peerId);
}

class PeerLeftEvent extends VideoCallEvent {}

class SetLocalStreamEvent extends VideoCallEvent {
  final MediaStream stream;
  SetLocalStreamEvent(this.stream);
}

class SetRemoteStreamEvent extends VideoCallEvent {
  final MediaStream stream;
  SetRemoteStreamEvent(this.stream);
}
