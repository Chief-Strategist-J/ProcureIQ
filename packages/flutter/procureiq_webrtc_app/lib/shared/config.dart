class AppConfig {
  static const String signalingUrl = String.fromEnvironment(
    'WEBRTC_SIGNALING_URL',
    defaultValue: 'ws://localhost:8082/api/v1/webrtc/signaling',
  );

  static const String defaultRoomId = String.fromEnvironment(
    'DEFAULT_ROOM_ID',
    defaultValue: 'procureiq-session-1',
  );

  static const String defaultUserId = String.fromEnvironment(
    'DEFAULT_USER_ID',
    defaultValue: 'user-mobile',
  );

  static const List<Map<String, dynamic>> iceServers = [
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun1.l.google.com:19302'},
  ];
}
