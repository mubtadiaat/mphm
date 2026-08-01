import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../../../core/config/app_config.dart';
import '../../../core/services/auto_update_service.dart';
import '../../auth/presentation/login_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late AnimationController _rotationController;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  double _progress = 0.0;
  String _statusText = 'Menyiapkan Ekosistem Pesantren...';
  Timer? _progressTimer;

  @override
  void initState() {
    super.initState();

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.94, end: 1.08).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _startSimulatedLoading();
    // Memeriksa pembaruan otomatis secara realtime di latar belakang
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AutoUpdateService.checkForUpdates(context);
    });
  }

  void _startSimulatedLoading() {
    _progressTimer = Timer.periodic(const Duration(milliseconds: 50), (timer) {
      if (!mounted) return;
      setState(() {
        _progress += 0.025;
        if (_progress >= 0.3 && _progress < 0.6) {
          _statusText = 'Menghubungkan ke Gateway Server Live Production...';
        } else if (_progress >= 0.6 && _progress < 0.85) {
          _statusText = 'Memverifikasi Matriks Otorisasi Akun...';
        } else if (_progress >= 0.85) {
          _statusText = 'Sistem Pesantren Siap!';
        }

        if (_progress >= 1.0) {
          _progress = 1.0;
          _progressTimer?.cancel();
          _navigateToLogin();
        }
      });
    });
  }

  void _navigateToLogin() {
    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) {
        Navigator.of(context).pushReplacement(
          PageRouteBuilder(
            pageBuilder: (_, __, ___) => const LoginScreen(),
            transitionsBuilder: (_, animation, __, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 800),
          ),
        );
      }
    });
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();
    _progressTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070B14),
      body: Stack(
        alignment: Alignment.center,
        children: [
          // Ambient Background Glowing Orbs
          Positioned(
            top: -80,
            left: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF059669).withAlpha(46),
                    blurRadius: 110,
                    spreadRadius: 50,
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            right: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF0284C7).withAlpha(46),
                    blurRadius: 110,
                    spreadRadius: 50,
                  ),
                ],
              ),
            ),
          ),

          // Central Content Container
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(),

                // Animated Logo with Dual Orbiting Rings
                Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer Rotating Ring
                    AnimatedBuilder(
                      animation: _rotationController,
                      builder: (_, __) {
                        return Transform.rotate(
                          angle: _rotationController.value * 2 * math.pi,
                          child: Container(
                            width: 175,
                            height: 175,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF10B981).withAlpha(89),
                                width: 2,
                              ),
                            ),
                          ),
                        );
                      },
                    ),

                    // Counter-Rotating Inner Ring
                    AnimatedBuilder(
                      animation: _rotationController,
                      builder: (_, __) {
                        return Transform.rotate(
                          angle: -_rotationController.value * 2 * math.pi,
                          child: Container(
                            width: 145,
                            height: 145,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: const Color(0xFF38BDF8).withAlpha(115),
                                width: 1.5,
                              ),
                            ),
                          ),
                        );
                      },
                    ),

                    // Central Pulsing OFFICIAL INSTITUTION LOGO
                    ScaleTransition(
                      scale: _pulseAnimation,
                      child: Container(
                        width: 115,
                        height: 115,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF0F172A),
                          border: Border.all(color: const Color(0xFF10B981).withAlpha(128), width: 2),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF10B981).withAlpha(102),
                              blurRadius: 28,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Image.asset(
                          'assets/logo.png',
                          width: 80,
                          height: 80,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => const Icon(
                            Icons.school_rounded,
                            size: 56,
                            color: Color(0xFF10B981),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 36),

                // Official Institution Titles
                const Text(
                  AppConfig.instansiPondok,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  AppConfig.instansiMadrasah,
                  style: TextStyle(
                    color: const Color(0xFF38BDF8).withAlpha(230),
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 14),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFFFFF).withAlpha(15),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFFFFFFFF).withAlpha(26)),
                  ),
                  child: Text(
                    'Pusat Data Abadi Enterprise v${AppConfig.appVersion}',
                    style: TextStyle(
                      color: const Color(0xFFFFFFFF).withAlpha(153),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),

                const Spacer(),

                // Progress Bar & Dynamic Loading Status
                Column(
                  children: [
                    Text(
                      _statusText,
                      style: TextStyle(
                        color: const Color(0xFFFFFFFF).withAlpha(179),
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: SizedBox(
                        height: 4,
                        width: 220,
                        child: LinearProgressIndicator(
                          value: _progress,
                          backgroundColor: const Color(0xFFFFFFFF).withAlpha(26),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
