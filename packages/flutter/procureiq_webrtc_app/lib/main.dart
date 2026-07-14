import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ProcureIQ WebRTC',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF000000),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0D9488),
          brightness: Brightness.dark,
        ),
      ),
      home: const CallScreen(),
    );
  }
}

class CallScreen extends StatefulWidget {
  const CallScreen({super.key});

  @override
  State<CallScreen> createState() => _CallScreenState();
}

class _CallScreenState extends State<CallScreen> {
  // Input Controllers
  final _serverUrlController = TextEditingController(text: 'ws://localhost:8082/api/v1/webrtc/signaling');
  final _roomIdController = TextEditingController(text: 'procureiq-session-1');
  final _userIdController = TextEditingController(text: 'user-mobile');

  // Video Renderers
  final RTCVideoRenderer _localRenderer = RTCVideoRenderer();
  final RTCVideoRenderer _remoteRenderer = RTCVideoRenderer();

  // WebRTC & Socket States
  MediaStream? _localStream;
  RTCPeerConnection? _peerConnection;
  WebSocketChannel? _channel;
  bool _joined = false;
  bool _micMuted = false;
  bool _cameraOff = false;
  final List<String> _consoleLogs = [];

  // STUN servers configuration
  final Map<String, dynamic> _iceConfig = {
    'iceServers': [
      {'urls': 'stun:stun.l.google.com:19302'},
      {'urls': 'stun:stun1.l.google.com:19302'}
    ]
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
    _cleanupConnection();
    super.dispose();
  }

  Future<void> _initRenderers() async {
    await _localRenderer.initialize();
    await _remoteRenderer.initialize();
    _log('Renderers initialized.');
    _startLocalStream();
  }

  void _log(String message) {
    final timestamp = DateTime.now().toLocal().toString().split(' ')[1].substring(0, 8);
    setState(() {
      _consoleLogs.insert(0, '[$timestamp] $message');
    });
  }

  // Capture hardware camera and microphone
  Future<void> _startLocalStream() async {
    try {
      _log('Requesting local media devices...');
      final stream = await navigator.mediaDevices.getUserMedia(_mediaConstraints);
      _localStream = stream;
      _localRenderer.srcObject = stream;
      setState(() {});
      _log('Successfully captured local camera feed.');
    } catch (e) {
      _log('Error getting user media: $e');
    }
  }

  // Initialize RTCPeerConnection
  Future<RTCPeerConnection> _createPeerConnection(String targetPeerId) async {
    _log('Initializing RTCPeerConnection for $targetPeerId...');
    final pc = await createPeerConnection(_iceConfig);

    // Add tracks to PeerConnection
    if (_localStream != null) {
      _localStream!.getTracks().forEach((track) {
        pc.addTrack(track, _localStream!);
      });
      _log('Local audio/video tracks attached.');
    }

    // Handle outgoing ICE candidates
    pc.onIceCandidate = (candidate) {
      if (candidate.candidate != null && _channel != null) {
        _log('Local ICE candidate found, sending to peer...');
        _send({
          'type': 'candidate',
          'roomId': _roomIdController.text,
          'senderId': _userIdController.text,
          'receiverId': targetPeerId,
          'candidate': candidate.candidate,
          'sdpMid': candidate.sdpMid,
          'sdpMLineIndex': candidate.sdpMLineIndex,
        });
      }
    };

    // Receive remote stream
    pc.onAddStream = (stream) {
      _log('Remote video stream added successfully.');
      _remoteRenderer.srcObject = stream;
      setState(() {});
    };

    pc.onConnectionState = (state) {
      _log('PeerConnection State Changed: ${state.name.toUpperCase()}');
    };

    _peerConnection = pc;
    return pc;
  }

  // Connect to Signaling WebSockets
  void _connectSignaling() {
    if (_roomIdController.text.isEmpty || _userIdController.text.isEmpty) return;

    final url = _serverUrlController.text;
    _log('Connecting to WebSocket signaling server: $url...');
    
    try {
      _channel = WebSocketChannel.connect(Uri.parse(url));
      
      _channel!.stream.listen(
        (message) {
          final data = jsonDecode(message);
          _handleSignalingMessage(data);
        },
        onError: (err) {
          _log('WebSocket Error: $err');
          _cleanupConnection();
        },
        onDone: () {
          _log('WebSocket Connection Closed.');
          _cleanupConnection();
        },
      );

      // Send Join Room Payload
      _send({
        'type': 'join',
        'roomId': _roomIdController.text,
        'userId': _userIdController.text,
      });
      
      setState(() {
        _joined = true;
      });
      _log('Joined room ${_roomIdController.text} as ${_userIdController.text}');
    } catch (e) {
      _log('Failed to connect to signaling: $e');
    }
  }

  // Parse and handle signaling payloads
  Future<void> _handleSignalingMessage(Map<String, dynamic> data) async {
    final type = data['type'];
    final senderId = data['senderId'] ?? '';

    _log('Signaling received: $type');

    switch (type) {
      case 'peer-joined':
        final peerId = data['userId'];
        _log('New peer discovered: $peerId. Sending WebRTC Offer...');
        
        final pc = await _createPeerConnection(peerId);
        final offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        _send({
          'type': 'offer',
          'roomId': _roomIdController.text,
          'senderId': _userIdController.text,
          'receiverId': peerId,
          'sdp': offer.sdp,
        });
        break;

      case 'offer':
        _log('SDP Offer received from $senderId. Replying with SDP Answer...');
        final pc = await _createPeerConnection(senderId);
        await pc.setRemoteDescription(RTCSessionDescription(data['sdp'], 'offer'));
        
        final answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        _send({
          'type': 'answer',
          'roomId': _roomIdController.text,
          'senderId': _userIdController.text,
          'receiverId': senderId,
          'sdp': answer.sdp,
        });
        break;

      case 'answer':
        _log('SDP Answer received. Completing peer connection handshake.');
        if (_peerConnection != null) {
          await _peerConnection!.setRemoteDescription(RTCSessionDescription(data['sdp'], 'answer'));
        }
        break;

      case 'candidate':
        _log('ICE Candidate received. Adding network relay point...');
        if (_peerConnection != null) {
          await _peerConnection!.addCandidate(RTCIceCandidate(
            data['candidate'],
            data['sdpMid'],
            data['sdpMLineIndex'],
          ));
        }
        break;

      case 'peer-left':
        _log('Remote peer left the call.');
        _remoteRenderer.srcObject = null;
        if (_peerConnection != null) {
          await _peerConnection!.close();
          _peerConnection = null;
        }
        setState(() {});
        break;
    }
  }

  void _send(Map<String, dynamic> msg) {
    if (_channel != null) {
      _channel!.sink.add(jsonEncode(msg));
    }
  }

  void _cleanupConnection() {
    _log('Cleaning up active call resources...');
    if (_channel != null) {
      _send({
        'type': 'leave',
        'roomId': _roomIdController.text,
        'userId': _userIdController.text,
      });
      _channel!.sink.close();
      _channel = null;
    }
    if (_peerConnection != null) {
      _peerConnection!.close();
      _peerConnection = null;
    }
    _remoteRenderer.srcObject = null;
    setState(() {
      _joined = false;
    });
  }

  void _toggleMic() {
    if (_localStream != null) {
      final audioTrack = _localStream!.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setState(() {
        _micMuted = !audioTrack.enabled;
      });
      _log('Microphone ${_micMuted ? "Muted" : "Active"}.');
    }
  }

  void _toggleCamera() {
    if (_localStream != null) {
      final videoTrack = _localStream!.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setState(() {
        _cameraOff = !videoTrack.enabled;
      });
      _log('Camera ${_cameraOff ? "Off" : "On"}.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ProcureIQ WebRTC Client', style: TextStyle(fontWeight: FontWeight.w300, fontSize: 18)),
        centerTitle: true,
        backgroundColor: Colors.black,
        elevation: 0,
        actions: [
          if (_joined)
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
              // Renderers Grid
              Expanded(
                flex: 4,
                child: Row(
                  children: [
                    // Local Camera Card
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
                                child: Text(_userIdController.text, style: const TextStyle(fontSize: 10, fontFamily: 'monospace')),
                              ),
                            ),
                            if (_cameraOff)
                              const Center(child: Icon(Icons.videocam_off, color: Colors.grey, size: 40)),
                          ],
                        ),
                      ),
                    ),
                    // Remote Camera Card
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
                                child: const Text('Remote Peer', style: TextStyle(fontSize: 10, fontFamily: 'monospace')),
                              ),
                            ),
                            if (_remoteRenderer.srcObject == null)
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
              
              // Console Logs Card
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
                    itemCount: _consoleLogs.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2.0),
                        child: Text(
                          _consoleLogs[index],
                          style: const TextStyle(color: Color(0xFF14B8A6), fontSize: 9, fontFamily: 'monospace'),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 12),

              // Inputs area & Controls Bar
              if (!_joined) ...[
                TextField(
                  controller: _serverUrlController,
                  decoration: const InputDecoration(labelText: 'Signaling Server URL', labelStyle: TextStyle(fontSize: 12)),
                  style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                ),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _roomIdController,
                        decoration: const InputDecoration(labelText: 'Room ID', labelStyle: TextStyle(fontSize: 12)),
                        style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: TextField(
                        controller: _userIdController,
                        decoration: const InputDecoration(labelText: 'User ID', labelStyle: TextStyle(fontSize: 12)),
                        style: const TextStyle(fontSize: 12, fontFamily: 'monospace'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _connectSignaling,
                    icon: const Icon(Icons.flash_on),
                    label: const Text('JOIN MEETING ROOM'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D9488),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                  ),
                ),
              ] else ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      onPressed: _toggleMic,
                      icon: Icon(_micMuted ? Icons.mic_off : Icons.mic),
                      style: IconButton.styleFrom(
                        backgroundColor: _micMuted ? Colors.red.withAlpha(51) : const Color(0xFF18181B),
                        foregroundColor: _micMuted ? Colors.red : Colors.white,
                        padding: const EdgeInsets.all(12),
                      ),
                    ),
                    const SizedBox(width: 16),
                    IconButton(
                      onPressed: _toggleCamera,
                      icon: Icon(_cameraOff ? Icons.videocam_off : Icons.videocam),
                      style: IconButton.styleFrom(
                        backgroundColor: _cameraOff ? Colors.red.withAlpha(51) : const Color(0xFF18181B),
                        foregroundColor: _cameraOff ? Colors.red : Colors.white,
                        padding: const EdgeInsets.all(12),
                      ),
                    ),
                    const SizedBox(width: 32),
                    ElevatedButton.icon(
                      onPressed: _cleanupConnection,
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
  }
}
