import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import '../../../shared/config.dart';
import '../bloc/video_call_bloc.dart';
import '../bloc/video_call_event.dart';
import '../bloc/video_call_state.dart';

class CallScreen extends StatefulWidget {
  const CallScreen({super.key});

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  final _serverUrlController = TextEditingController(text: AppConfig.signalingUrl);
  final _roomIdController = TextEditingController(text: AppConfig.defaultRoomId);
  final _userIdController = TextEditingController(text: AppConfig.defaultUserId);

  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();

  @override
  void initState() {
    super.initState();
    _initRenderers();
  }

  @override
  void dispose() {
    _localRenderer.dispose();
    _remoteRenderer.dispose();
    _roomIdController.dispose();
    _userIdController.dispose();
    _serverUrlController.dispose();
    super.dispose();
  }

  Future<void> _initRenderers() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<VideoCallBloc, VideoCallState>(
      listenWhen: (previous, current) =>
          previous.localStream != current.localStream ||
          previous.remoteStream != current.remoteStream,
      listener: (context, state) {
        setState(() {
          _localRenderer.srcObject = state.localStream;
          _remoteRenderer.srcObject = state.remoteStream;
        });
      },
      child: BlocBuilder<VideoCallBloc, VideoCallState>(
        builder: (context, state) {
          return Scaffold(
            appBar: AppBar(
              title: const Text('ProcureIQ WebRTC Client', style: TextStyle(fontWeight: FontWeight.w300, fontSize: 18)),
              centerTitle: true,
              actions: [
                if (state.joined)
                  const Padding(
                    padding: EdgeInsets.only(right: 16.0),
                    child: Icon(Icons.circle, color: Color(0xFF10B981), size: 12),
                  ),
              ],
            ),
            body: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  children: [
                    Expanded(
                      flex: 4,
                      child: Row(
                        children: [
                          Expanded(
                            child: Container(
                              margin: const EdgeInsets.only(right: 6.0),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F0F0F),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFF1E1E1E)),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Stack(
                                children: [
                                  RTCVideoView(_localRenderer, mirror: true, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover),
                                  Positioned(
                                    top: 10,
                                    left: 10,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(4)),
                                      child: Text(state.userId.isEmpty ? _userIdController.text : state.userId, style: const TextStyle(fontSize: 10, fontFamily: 'monospace')),
                                    ),
                                  ),
                                  if (state.cameraOff)
                                    const Center(child: Icon(Icons.videocam_off, color: Colors.grey, size: 40)),
                                ],
                              ),
                            ),
                          ),
                          Expanded(
                            child: Container(
                              margin: const EdgeInsets.only(left: 6.0),
                              decoration: BoxDecoration(
                                color: const Color(0xFF0F0F0F),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: const Color(0xFF1E1E1E)),
                              ),
                              clipBehavior: Clip.antiAlias,
                              child: Stack(
                                children: [
                                  RTCVideoView(_remoteRenderer, objectFit: RTCVideoViewObjectFit.RTCVideoViewObjectFitCover),
                                  Positioned(
                                    top: 10,
                                    left: 10,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(4)),
                                      child: Text(state.remotePeerId ?? 'Remote Peer', style: const TextStyle(fontSize: 10, fontFamily: 'monospace')),
                                    ),
                                  ),
                                  if (state.remoteStream == null)
                                    const Center(
                                      child: Column(
                                        mainAxisAlignment: MainAxisAlignment.center,
                                        children: [
                                          CircularProgressIndicator(strokeWidth: 2),
                                          SizedBox(height: 10),
                                          Text('Waiting for peer...', style: TextStyle(color: Colors.grey, fontSize: 10)),
                                        ],
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    Expanded(
                      flex: 2,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF080808),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFF1A1A1A)),
                        ),
                        child: ListView.builder(
                          itemCount: state.consoleLogs.length,
                          itemBuilder: (context, index) {
                            return Padding(
                              padding: const EdgeInsets.symmetric(vertical: 2.0),
                              child: Text(
                                state.consoleLogs[index],
                                style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 9, fontFamily: 'monospace'),
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (!state.joined) ...[
                      TextField(
                        controller: _serverUrlController,
                        decoration: const InputDecoration(labelText: 'Signaling Server URL'),
                        style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                      ),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _roomIdController,
                              decoration: const InputDecoration(labelText: 'Room ID'),
                              style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: _userIdController,
                              decoration: const InputDecoration(labelText: 'User ID'),
                              style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () {
                            context.read<VideoCallBloc>().add(ConnectEvent(
                                  serverUrl: _serverUrlController.text,
                                  roomId: _roomIdController.text,
                                  userId: _userIdController.text,
                                ));
                          },
                          icon: const Icon(Icons.flash_on),
                          label: const Text('JOIN MEETING ROOM'),
                        ),
                      ),
                    ] else ...[
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            onPressed: () {
                              context.read<VideoCallBloc>().add(ToggleMicEvent());
                            },
                            icon: Icon(state.micMuted ? Icons.mic_off : Icons.mic),
                            style: IconButton.styleFrom(
                              backgroundColor: state.micMuted ? Colors.red.withAlpha(51) : const Color(0xFF18181B),
                              foregroundColor: state.micMuted ? Colors.red : Colors.white,
                              padding: const EdgeInsets.all(12),
                            ),
                          ),
                          const SizedBox(width: 16),
                          IconButton(
                            onPressed: () {
                              context.read<VideoCallBloc>().add(ToggleCameraEvent());
                            },
                            icon: Icon(state.cameraOff ? Icons.videocam_off : Icons.videocam),
                            style: IconButton.styleFrom(
                              backgroundColor: state.cameraOff ? Colors.red.withAlpha(51) : const Color(0xFF18181B),
                              foregroundColor: state.cameraOff ? Colors.red : Colors.white,
                              padding: const EdgeInsets.all(12),
                            ),
                          ),
                          const SizedBox(width: 32),
                          ElevatedButton.icon(
                            onPressed: () {
                              context.read<VideoCallBloc>().add(DisconnectEvent());
                            },
                            icon: const Icon(Icons.call_end),
                            label: const Text('DISCONNECT'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red.shade800,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
