import 'package:flutter/material.dart';
import '../../../core/auth/google_auth_service.dart';
import '../../../core/auth/biometric_auth_service.dart';
import '../../../core/config/app_config.dart';
import '../../../shared/widgets/premium_loader_widget.dart';
import '../../guardian/presentation/guardian_dashboard_screen.dart';
import '../../sekretariat/presentation/sekretariat_desktop_screen.dart';
import '../../staff/presentation/staff_dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GoogleAuthService _googleAuthService = GoogleAuthService();
  
  bool _isLoading = false;
  String _errorMessage = '';
  bool _canUseBiometrics = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricsSupport();
  }

  Future<void> _checkBiometricsSupport() async {
    final available = await BiometricAuthService.isBiometricAvailable();
    if (mounted) {
      setState(() {
        _canUseBiometrics = available;
      });
    }
  }

  Future<void> _handleBiometricLogin() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final authenticated = await BiometricAuthService.authenticateWithBiometrics(
        reason: 'Pindai Sidik Jari / Wajah untuk Masuk ke Aplikasi MPHM Enterprise',
      );

      if (authenticated) {
        _navigateToRoleDashboard('staff');
      } else {
        setState(() {
          _errorMessage = 'Autentikasi Biometrik (Sidik Jari/Wajah) dibatalkan.';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal memproses Sidik Jari/Wajah.';
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final result = await _googleAuthService.signInWithGoogle();
      if (result != null) {
        final String role = result['user']['role'] ?? 'wali_santri';
        _navigateToRoleDashboard(role);
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _navigateToRoleDashboard(String role) {
    Widget targetScreen;
    if (role.contains('sek')) {
      targetScreen = const SekretariatDesktopScreen();
    } else if (role == 'staff' || role == 'mustahiq') {
      targetScreen = const StaffDashboardScreen();
    } else {
      targetScreen = const GuardianDashboardScreen();
    }

    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => targetScreen),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 420),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: const Color(0xFFFFFFFF).withAlpha(26)),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF000000).withAlpha(102),
                      blurRadius: 32,
                      offset: const Offset(0, 16),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Official Institution Logo Header
                    Container(
                      width: 84,
                      height: 84,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF10B981).withAlpha(128), width: 2),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF059669).withAlpha(102),
                            blurRadius: 20,
                            offset: const Offset(0, 8),
                          ),
                        ],
                      ),
                      child: Image.asset(
                        'assets/logo.png',
                        width: 64,
                        height: 64,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.school,
                          color: Colors.white,
                          size: 40,
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    const Text(
                      AppConfig.appName,
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Portal Wali Santri & Staff Mustahiq (v${AppConfig.appVersion})',
                      style: TextStyle(
                        color: const Color(0xFFFFFFFF).withAlpha(153),
                        fontSize: 13,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 28),

                    if (_errorMessage.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 20),
                        decoration: BoxDecoration(
                          color: Colors.red.withAlpha(38),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.withAlpha(77)),
                        ),
                        child: Text(
                          _errorMessage,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                      ),

                    // Google Enterprise Sign In Button
                    ElevatedButton(
                      onPressed: _isLoading ? null : _handleGoogleSignIn,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: const Color(0xFF0F172A),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.g_mobiledata_rounded, color: Color(0xFFEA4335), size: 28),
                          SizedBox(width: 8),
                          Text(
                            'Masuk via Google Account',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                          ),
                        ],
                      ),
                    ),

                    // Biometric Authentication (Fingerprint / Face ID) Button
                    if (_canUseBiometrics) ...[
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: _isLoading ? null : _handleBiometricLogin,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: const Color(0xFF38BDF8),
                          side: const BorderSide(color: Color(0xFF0284C7), width: 1.5),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.fingerprint, color: Color(0xFF38BDF8), size: 22),
                            SizedBox(width: 10),
                            Text(
                              'Masuk via Sidik Jari / Wajah',
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),

          // Loading Overlay
          if (_isLoading)
            Container(
              color: const Color(0xFF000000).withAlpha(179),
              child: const Center(
                child: PremiumLoaderWidget(message: 'Memverifikasi Akses Enterprise...'),
              ),
            ),
        ],
      ),
    );
  }
}
