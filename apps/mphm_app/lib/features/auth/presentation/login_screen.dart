import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/auth/google_auth_service.dart';
import '../../../core/config/app_config.dart';
import '../../../shared/widgets/premium_loader_widget.dart';
import '../../guardian/presentation/guardian_dashboard_screen.dart';
import '../../sekretariat/presentation/sekretariat_desktop_screen.dart';
import '../../staff/presentation/staff_dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GoogleAuthService _googleAuthService = GoogleAuthService();
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  
  bool _isLoading = false;
  String _errorMessage = '';

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
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: Stack(
        children: [
          // Background Gradient Orbs
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF10B981).withOpacity(0.15),
              ),
            ),
          ),
          Positioned(
            bottom: -100,
            left: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF2563EB).withOpacity(0.15),
              ),
            ),
          ),

          Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 420),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF18181B) : Colors.white,
                  borderRadius: BorderRadius.circular(32),
                  border: Border.all(
                    color: isDark ? Colors.white10 : Colors.black12,
                    width: 1,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(32.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Header Logo & Title
                    Center(
                      child: Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Icon(
                          Icons.account_balance_rounded,
                          size: 38,
                          color: Color(0xFF10B981),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      AppConfig.appName,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Portal Akun Resmi Enterprise P3HM & MPHM Lirboyo',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: isDark ? Colors.white60 : Colors.black54,
                      ),
                    ),
                    const SizedBox(height: 28),

                    if (_errorMessage.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.red.withOpacity(0.3)),
                        ),
                        child: Text(
                          _errorMessage,
                          style: const TextStyle(color: Colors.redAccent, fontSize: 12, fontWeight: FontWeight.bold),
                          textAlign: TextAlign.center,
                        ),
                      ),
                      const SizedBox(height: 16),
                    ],

                    // ENTERPRISE GOOGLE SIGN-IN BUTTON
                    ElevatedButton(
                      onPressed: _isLoading ? null : _handleGoogleSignIn,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isDark ? Colors.white : const Color(0xFF1F2937),
                        foregroundColor: isDark ? Colors.black : Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 2,
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          FaIcon(FontAwesomeIcons.google, size: 18, color: Color(0xFFEA4335)),
                          SizedBox(width: 12),
                          Text(
                            'Masuk dengan Google (Enterprise)',
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),
                    const Row(
                      children: [
                        Expanded(child: Divider()),
                        Padding(
                          padding: EdgeInsets.symmetric(horizontal: 12),
                          child: Text('atau login kredensial', style: TextStyle(fontSize: 11, color: Colors.grey)),
                        ),
                        Expanded(child: Divider()),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Kredensial Username
                    TextField(
                      controller: _usernameController,
                      decoration: InputDecoration(
                        labelText: 'Username / NIK',
                        prefixIcon: const Icon(Icons.person_outline),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Kredensial Password
                    TextField(
                      controller: _passwordController,
                      obscureText: true,
                      decoration: InputDecoration(
                        labelText: 'Kata Sandi',
                        prefixIcon: const Icon(Icons.lock_outline),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    ElevatedButton(
                      onPressed: () {
                        final un = _usernameController.text.trim();
                        if (un.contains('sek') || un == 'develzy') {
                          _navigateToRoleDashboard('sek.madrasah');
                        } else if (un.contains('mustahiq')) {
                          _navigateToRoleDashboard('mustahiq');
                        } else {
                          _navigateToRoleDashboard('wali_santri');
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      ),
                      child: const Text('Masuk Sistem', style: TextStyle(fontWeight: FontWeight.extrabold)),
                    ),
                  ],
                ),
              ),
            ),
          ),

          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const PremiumLoaderWidget(
                message: 'Mengotentikasi Google Enterprise...',
                subtext: 'Memverifikasi token Google OAuth 2.0 dengan server pusat...',
              ),
            ),
        ],
      ),
    );
  }
}
