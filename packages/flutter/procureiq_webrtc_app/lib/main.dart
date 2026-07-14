import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'features/video_call/bloc/video_call_bloc.dart';
import 'features/video_call/ui/call_screen.dart';
import 'shared/theme.dart';
import 'shared/injection.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initInjection();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<VideoCallBloc>(),
      child: MaterialApp(
        title: 'ProcureIQ WebRTC',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const CallScreen(),
      ),
    );
  }
}
