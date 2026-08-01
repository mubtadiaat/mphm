import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MPHMEnterpriseApp());
}

class MPHMEnterpriseApp extends StatelessWidget {
  const MPHMEnterpriseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MPHM & P3HM Lirboyo Enterprise',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const LoginScreen(),
    );
  }
}
