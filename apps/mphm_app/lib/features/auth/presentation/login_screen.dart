import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../../../core/auth/google_auth_service.dart';
import '../../../core/auth/biometric_auth_service.dart';
import '../../../core/config/app_config.dart';
import '../../../core/services/auto_update_service.dart';
import '../../../core/storage/secure_storage.dart';
import '../../../shared/widgets/premium_loader_widget.dart';
import '../../guardian/presentation/guardian_dashboard_screen.dart';
import '../../sekretariat/presentation/sekretariat_desktop_screen.dart';
import '../../staff/presentation/staff_dashboard_screen.dart';

// ─────────────────────────────────────────────────────────────────────────────
//  ROLE-PLATFORM ENFORCEMENT POLICY
//  • Windows Desktop → KHUSUS role Sekretariat (sek.pondok / sek.madrasah)
//  • Android / iOS  → SEMUA role KECUALI Sekretariat (Wali, Staff, Pengurus)
// ─────────────────────────────────────────────────────────────────────────────

bool _isSekretariatRole(String role) {
  final r = role.toLowerCase().trim();
  return r == 'sek.pondok' || r == 'sek.madrasah' || r.startsWith('sek.');
}

bool _isWindowsPlatform() =>
    defaultTargetPlatform == TargetPlatform.windows;

bool _isMobilePlatform() =>
    defaultTargetPlatform == TargetPlatform.android ||
    defaultTargetPlatform == TargetPlatform.iOS;

/// Validasi apakah role diizinkan di platform ini.
String? _validateRoleForPlatform(String role) {
  if (_isWindowsPlatform() && !_isSekretariatRole(role)) {
    return 'Akun Anda (${role.toUpperCase()}) tidak memiliki akses ke Software Desktop ini.\n\n'
        'Software ini KHUSUS untuk:\n'
        '• Sekretariat Pondok (sek.pondok)\n'
        '• Sekretariat Madrasah (sek.madrasah)\n\n'
        'Gunakan Aplikasi Mobile untuk Wali Santri & Staff Mustahiq.';
  }

  if (_isMobilePlatform() && _isSekretariatRole(role)) {
    return 'Akun Sekretariat tidak dapat mengakses Aplikasi Mobile ini.\n\n'
        'Sekretariat hanya dapat menggunakan:\n'
        '• Software Desktop Windows → m.p3hm.my.id/download\n\n'
        'Aplikasi ini diperuntukkan untuk Wali Santri, Staff Mustahiq & Pengurus Kamar.';
  }

  return null; // Diizinkan
}

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GoogleAuthService _googleAuthService = GoogleAuthService();
  final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConfig.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
  ));

  // Form Controllers
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false;
  bool _obscurePassword = true;
  String _errorMessage = '';
  bool _canUseBiometrics = false;

  @override
  void initState() {
    super.initState();
    _checkBiometricsSupport();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AutoUpdateService.checkForUpdates(context);
    });
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _checkBiometricsSupport() async {
    if (!_isMobilePlatform()) return;
    final available = await BiometricAuthService.isBiometricAvailable();
    if (mounted) {
      setState(() {
        _canUseBiometrics = available;
      });
    }
  }

  /// Direct Username & Password Login Handler
  Future<void> _handleDirectLogin() async {
    final String username = _usernameController.text.trim();
    final String password = _passwordController.text;

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Username dan Kata Sandi wajib diisi.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final Response response = await _dio.post('/auth/login', data: {
        'username': username,
        'password': password,
      });

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final String jwtToken = data['token'] ?? '';
        final Map<String, dynamic> user = data['user'] ?? {};
        final String role = user['role'] ?? 'sek.pondok';

        // Validasi Platform vs Role
        final String? platformError = _validateRoleForPlatform(role);
        if (platformError != null) {
          setState(() {
            _errorMessage = platformError;
          });
          return;
        }

        // Simpan sesi login secara aman
        await SecureStorageService.saveToken(jwtToken);
        await SecureStorageService.saveUserRole(role);
        await SecureStorageService.saveUserData(user);

        _navigateToRoleDashboard(role);
      } else {
        setState(() {
          _errorMessage =
              response.data['message'] ?? 'Gagal masuk. Periksa kembali kredensial Anda.';
        });
      }
    } catch (e) {
      if (e is DioException && e.response?.data != null) {
        final msg = e.response?.data['message'] ?? 'Username atau Kata Sandi salah.';
        setState(() {
          _errorMessage = msg.toString();
        });
      } else {
        setState(() {
          _errorMessage = 'Gagal terhubung ke Server Live Production (https://m.p3hm.my.id).';
        });
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  /// Google Enterprise OAuth Sign In Handler
  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final result = await _googleAuthService.signInWithGoogle();
      if (result == null) {
        setState(() => _isLoading = false);
        return;
      }

      final String role = result['user']['role'] ?? 'sek.pondok';

      final String? platformError = _validateRoleForPlatform(role);
      if (platformError != null) {
        await _googleAuthService.signOut();
        setState(() {
          _errorMessage = platformError;
        });
        return;
      }

      _navigateToRoleDashboard(role);
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

  /// Biometric Login Handler
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
          _errorMessage = 'Autentikasi Biometrik dibatalkan.';
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

  void _navigateToRoleDashboard(String role) {
    Widget targetScreen;
    if (_isSekretariatRole(role)) {
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
    final bool isWindows = _isWindowsPlatform();
    final Color platformAccentColor =
        isWindows ? const Color(0xFF10B981) : const Color(0xFF38BDF8);

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SizedBox.expand(
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Center Layout Container
            Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 440),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                        color: const Color(0xFFFFFFFF).withAlpha(26)),
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
                      // ── Logo Resmi Instansi ──────────────────────────────
                      Container(
                        width: 90,
                        height: 90,
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF0F172A),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: platformAccentColor.withAlpha(128),
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: platformAccentColor.withAlpha(77),
                              blurRadius: 24,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Image.asset(
                          'assets/logo.png',
                          width: 70,
                          height: 70,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => Icon(
                            Icons.school,
                            color: platformAccentColor,
                            size: 44,
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      const Text(
                        AppConfig.appName,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.3,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 6),

                      // ── Platform Badge (Seragam semua platform) ──────────
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: platformAccentColor.withAlpha(26),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: platformAccentColor.withAlpha(77)),
                        ),
                        child: Text(
                          'P3HM – MPHM',
                          style: TextStyle(
                            color: platformAccentColor,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Lirboyo · Kediri',
                        style: TextStyle(
                          color: const Color(0xFFFFFFFF).withAlpha(128),
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 0.5,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),

                      // ── Error Message ────────────────────────────────────
                      if (_errorMessage.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(14),
                          margin: const EdgeInsets.only(bottom: 20),
                          decoration: BoxDecoration(
                            color: Colors.red.withAlpha(26),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.red.withAlpha(77)),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(Icons.block_rounded,
                                  color: Colors.redAccent, size: 18),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  _errorMessage,
                                  style: const TextStyle(
                                    color: Colors.redAccent,
                                    fontSize: 12,
                                    height: 1.5,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // ── FORM LOGIN USERNAME & PASSWORD ───────────────────
                      TextField(
                        controller: _usernameController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Username / NIK / Email',
                          hintStyle: TextStyle(
                              color: Colors.white.withAlpha(100), fontSize: 14),
                          prefixIcon: const Icon(Icons.person_outline_rounded,
                              color: Color(0xFF10B981)),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                                color: Colors.white.withAlpha(30)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                                color: Colors.white.withAlpha(30)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(
                                color: Color(0xFF10B981), width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 16),
                        ),
                      ),
                      const SizedBox(height: 14),

                      TextField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Kata Sandi',
                          hintStyle: TextStyle(
                              color: Colors.white.withAlpha(100), fontSize: 14),
                          prefixIcon: const Icon(Icons.lock_outline_rounded,
                              color: Color(0xFF10B981)),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility_off_outlined
                                  : Icons.visibility_outlined,
                              color: Colors.white54,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                          filled: true,
                          fillColor: const Color(0xFF0F172A),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                                color: Colors.white.withAlpha(30)),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                                color: Colors.white.withAlpha(30)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(
                                color: Color(0xFF10B981), width: 1.5),
                          ),
                          contentPadding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 16),
                        ),
                        onSubmitted: (_) => _handleDirectLogin(),
                      ),
                      const SizedBox(height: 20),

                      // Tombol Utamakan Direct Login Sekretariat
                      ElevatedButton(
                        onPressed: _isLoading ? null : _handleDirectLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          minimumSize: const Size(double.infinity, 52),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                          elevation: 2,
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.login_rounded, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Masuk ke Sistem Enterprise',
                              style: TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 15),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Divider Opsi Google
                      Row(
                        children: [
                          Expanded(
                              child: Divider(
                                  color: Colors.white.withAlpha(30))),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              'atau masuk dengan',
                              style: TextStyle(
                                  color: Colors.white.withAlpha(100),
                                  fontSize: 11),
                            ),
                          ),
                          Expanded(
                              child: Divider(
                                  color: Colors.white.withAlpha(30))),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // ── Google Sign-In Button ─────────────────────────────
                      OutlinedButton(
                        onPressed: _isLoading ? null : _handleGoogleSignIn,
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white,
                          side: BorderSide(
                              color: Colors.white.withAlpha(40), width: 1.5),
                          minimumSize: const Size(double.infinity, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.g_mobiledata_rounded,
                                color: Color(0xFFEA4335), size: 28),
                            const SizedBox(width: 8),
                            Text(
                              isWindows
                                  ? 'Masuk via Browser Google'
                                  : 'Masuk via Google Account',
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ],
                        ),
                      ),

                      // ── Info Platform Enforcement ─────────────────────────
                      const SizedBox(height: 14),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: platformAccentColor.withAlpha(15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                              color: platformAccentColor.withAlpha(51)),
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              isWindows
                                  ? Icons.computer_rounded
                                  : Icons.smartphone_rounded,
                              color: platformAccentColor,
                              size: 16,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                isWindows
                                    ? 'Software ini HANYA untuk Sekretariat Pondok & Madrasah.\nAkun selain Sekretariat akan ditolak otomatis.'
                                    : 'Aplikasi ini untuk Wali Santri, Staff Mustahiq & Pengurus.\nAkun Sekretariat harus menggunakan Software Desktop.',
                                style: TextStyle(
                                  color: platformAccentColor.withAlpha(204),
                                  fontSize: 11,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // ── Biometric Auth (Mobile Only) ─────────────────────
                      if (_canUseBiometrics && _isMobilePlatform()) ...[
                        const SizedBox(height: 14),
                        OutlinedButton(
                          onPressed: _isLoading ? null : _handleBiometricLogin,
                          style: OutlinedButton.styleFrom(
                            foregroundColor: const Color(0xFF38BDF8),
                            side: const BorderSide(
                                color: Color(0xFF0284C7), width: 1.5),
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.fingerprint,
                                  color: Color(0xFF38BDF8), size: 22),
                              SizedBox(width: 10),
                              Text(
                                'Masuk via Sidik Jari / Wajah',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 14),
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

            // ── Loading Overlay ──────────────────────────────────────────────
            if (_isLoading)
              Container(
                color: const Color(0xFF000000).withAlpha(179),
                child: const Center(
                  child: PremiumLoaderWidget(
                      message: 'Memverifikasi Kredensial Enterprise...'),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
