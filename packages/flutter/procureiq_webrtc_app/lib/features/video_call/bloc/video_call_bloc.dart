import 'package:flutter_bloc/flutter_bloc.dart';
import '../service/signaling_service.dart';
import 'video_call_event.dart';
import 'video_call_state.dart';

class VideoCallBloc extends Bloc<VideoCallEvent, VideoCallState> {
  final SignalingService _signalingService;

  VideoCallBloc(this._signalingService) : super(VideoCallState.initial()) {
    on<ConnectEvent>(_onConnect);
    on<DisconnectEvent>(_onDisconnect);
    on<ToggleMicEvent>(_onToggleMic);
    on<ToggleCameraEvent>(_onToggleCamera);
    on<LogEvent>(_onLog);
    on<PeerJoinedEvent>(_onPeerJoined);
    on<PeerLeftEvent>(_onPeerLeft);
    on<SetLocalStreamEvent>(_onSetLocalStream);
    on<SetRemoteStreamEvent>(_onSetRemoteStream);
  }

  Future<void> _onConnect(ConnectEvent event, Emitter<VideoCallState> emit) async {
    emit(state.copyWith(
      serverUrl: event.serverUrl,
      roomId: event.roomId,
      userId: event.userId,
    ));

    final localStream = await _signalingService.startLocalStream((msg) {
      add(LogEvent(msg));
    });

    if (localStream != null) {
      add(SetLocalStreamEvent(localStream));
    }

    _signalingService.connect(
      serverUrl: event.serverUrl,
      roomId: event.roomId,
      userId: event.userId,
      onLog: (msg, type) {
        add(LogEvent('[$type] $msg'));
      },
      onPeerJoined: (peerId) {
        add(PeerJoinedEvent(peerId));
      },
      onPeerLeft: () {
        add(PeerLeftEvent());
      },
      onRemoteStream: (stream) {
        add(SetRemoteStreamEvent(stream));
      },
    );

    emit(state.copyWith(joined: true));
  }

  void _onDisconnect(DisconnectEvent event, Emitter<VideoCallState> emit) {
    _signalingService.disconnect(state.roomId, state.userId);
    emit(state.copyWith(
      joined: false,
      clearRemote: true,
    ));
    add(LogEvent('[info] Disconnected from signaling.'));
  }

  void _onToggleMic(ToggleMicEvent event, Emitter<VideoCallState> emit) {
    if (state.localStream != null) {
      final audioTrack = state.localStream!.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      emit(state.copyWith(micMuted: !audioTrack.enabled));
      add(LogEvent('[info] Microphone ${audioTrack.enabled ? "Active" : "Muted"}'));
    }
  }

  void _onToggleCamera(ToggleCameraEvent event, Emitter<VideoCallState> emit) {
    if (state.localStream != null) {
      final videoTrack = state.localStream!.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      emit(state.copyWith(cameraOff: !videoTrack.enabled));
      add(LogEvent('[info] Camera ${videoTrack.enabled ? "On" : "Off"}'));
    }
  }

  void _onLog(LogEvent event, Emitter<VideoCallState> emit) {
    final updatedLogs = List<String>.from(state.consoleLogs)..insert(0, event.message);
    emit(state.copyWith(consoleLogs: updatedLogs.length > 50 ? updatedLogs.sublist(0, 50) : updatedLogs));
  }

  void _onPeerJoined(PeerJoinedEvent event, Emitter<VideoCallState> emit) {
    emit(state.copyWith(remotePeerId: event.peerId));
  }

  void _onPeerLeft(PeerLeftEvent event, Emitter<VideoCallState> emit) {
    emit(state.copyWith(clearRemote: true));
  }

  void _onSetLocalStream(SetLocalStreamEvent event, Emitter<VideoCallState> emit) {
    emit(state.copyWith(localStream: event.stream));
  }

  void _onSetRemoteStream(SetRemoteStreamEvent event, Emitter<VideoCallState> emit) {
    emit(state.copyWith(remoteStream: event.stream));
  }

  @override
  Future<void> close() {
    _signalingService.dispose();
    return super.close();
  }
}
