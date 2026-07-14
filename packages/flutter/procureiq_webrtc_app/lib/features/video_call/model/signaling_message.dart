class SignalingMessage {
  final String type;
  final String roomId;
  final String? userId;
  final String? senderId;
  final String? receiverId;
  final String? sdp;
  final String? candidate;
  final String? sdpMid;
  final int? sdpMLineIndex;

  const SignalingMessage({
    required this.type,
    required this.roomId,
    this.userId,
    this.senderId,
    this.receiverId,
    this.sdp,
    this.candidate,
    this.sdpMid,
    this.sdpMLineIndex,
  });

  factory SignalingMessage.fromJson(Map<String, dynamic> json) {
    return SignalingMessage(
      type: json['type'] as String,
      roomId: json['roomId'] as String? ?? '',
      userId: json['userId'] as String?,
      senderId: json['senderId'] as String?,
      receiverId: json['receiverId'] as String?,
      sdp: json['sdp'] as String?,
      candidate: json['candidate'] as String?,
      sdpMid: json['sdpMid'] as String?,
      sdpMLineIndex: json['sdpMLineIndex'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    final val = <String, dynamic>{
      'type': type,
      'roomId': roomId,
    };
    if (userId != null) val['userId'] = userId;
    if (senderId != null) val['senderId'] = senderId;
    if (receiverId != null) val['receiverId'] = receiverId;
    if (sdp != null) val['sdp'] = sdp;
    if (candidate != null) val['candidate'] = candidate;
    if (sdpMid != null) val['sdpMid'] = sdpMid;
    if (sdpMLineIndex != null) val['sdpMLineIndex'] = sdpMLineIndex;
    return val;
  }
}
