import 'package:get_it/get_it.dart';
import '../features/video_call/service/signaling_service.dart';
import '../features/video_call/bloc/video_call_bloc.dart';

final GetIt sl = GetIt.instance;

Future<void> initInjection() async {
  sl.registerLazySingleton<SignalingService>(() => SignalingService());
  sl.registerFactory<VideoCallBloc>(() => VideoCallBloc(sl<SignalingService>()));
}
