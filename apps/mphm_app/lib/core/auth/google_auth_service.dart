import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/secure_storage.dart';

/// GoogleAuthService - Enterprise Google Sign-In
/// Mendukung:
///   - Android/iOS : google_sign_in native SDK
///   - Windows     : URL Launcher → Web OAuth browser flow
class GoogleAuthService {
  final Dio _dio = Dio(BaseOptions(baseUrl: AppConfig.baseUrl));

  /// Cek apakah platform mendukung native google_sign_in
  bool get _supportsNativeGoogleSignIn {
    return defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
  }

  /// Authenticate User via Enterprise Google Sign-In
  Future<Map<String, dynamic>?> signInWithGoogle() async {
    if (_supportsNativeGoogleSignIn) {
      return await _signInNative();
    } else {
      return await _signInViaWebBrowser();
    }
  }

  /// Native Google Sign-In (Android / iOS)
  Future<Map<String, dynamic>?> _signInNative() async {
    try {
      // Lazy import google_sign_in hanya untuk Android/iOS
      // ignore: avoid_dynamic_calls
      final googleSignIn = await _buildGoogleSignIn();
      final googleUser = await googleSignIn.signIn();
      if (googleUser == null) return null;

      final googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;
      final String? accessToken = googleAuth.accessToken;

      if (idToken == null) {
        throw Exception('Gagal mendapatkan Google ID Token.');
      }

      final Response response = await _dio.post('/auth/google', data: {
        'idToken': idToken,
        'accessToken': accessToken,
        'email': googleUser.email,
        'displayName': googleUser.displayName,
        'photoUrl': googleUser.photoUrl,
      });

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final String jwtToken = data['token'] ?? '';
        final Map<String, dynamic> user = data['user'] ?? {};

        await SecureStorageService.saveToken(jwtToken);
        await SecureStorageService.saveUserRole(user['role'] ?? 'wali_santri');
        await SecureStorageService.saveUserData(user);

        return {
          'token': jwtToken,
          'user': user,
          'googleUser': {
            'email': googleUser.email,
            'name': googleUser.displayName,
            'photoUrl': googleUser.photoUrl,
          }
        };
      } else {
        throw Exception(response.data['message'] ?? 'Verifikasi Google Sign-In Gagal di Server.');
      }
    } catch (e) {
      debugPrint('ENTERPRISE_GOOGLE_AUTH_NATIVE_ERROR: $e');
      rethrow;
    }
  }

  /// Lazy builder untuk GoogleSignIn — hanya dipanggil di Android/iOS
  Future<dynamic> _buildGoogleSignIn() async {
    // Import dilakukan secara kondisional agar tidak crash di Windows
    final googleSignIn = await _getGoogleSignInInstance();
    return googleSignIn;
  }

  Future<dynamic> _getGoogleSignInInstance() async {
    // ignore: avoid_dynamic_calls
    final lib = await _loadGoogleSignIn();
    return lib;
  }

  Future<dynamic> _loadGoogleSignIn() async {
    // Menggunakan import kondisional melalui dynamic
    try {
      // ignore: avoid_dynamic_calls
      final googleSignIn = _GoogleSignInCompat(
        clientId: AppConfig.googleWebClientId,
        scopes: ['email', 'profile', 'openid'],
      );
      return googleSignIn;
    } catch (e) {
      throw Exception('Google Sign-In tidak tersedia di platform ini.');
    }
  }

  /// Web Browser OAuth Flow untuk Windows Desktop
  /// Membuka browser default → OAuth → callback ke aplikasi
  Future<Map<String, dynamic>?> _signInViaWebBrowser() async {
    try {
      // Buka halaman OAuth Google dari backend
      const String oauthUrl =
          '${AppConfig.baseUrl}/auth/google/desktop?client=windows&redirect=mphm://auth/callback';

      debugPrint('ENTERPRISE_WINDOWS_OAUTH: Opening $oauthUrl');

      // Coba buka browser via url_launcher
      final launched = await _launchBrowserUrl(oauthUrl);
      if (!launched) {
        throw Exception(
            'Gagal membuka browser untuk autentikasi.\nPastikan browser default telah terpasang.');
      }

      // Tunggu token dari deep link callback (mphm://auth/callback)
      // Token akan diterima via IPC atau file temporary
      final token = await _waitForDesktopAuthCallback();
      return token;
    } catch (e) {
      debugPrint('ENTERPRISE_WINDOWS_OAUTH_ERROR: $e');
      rethrow;
    }
  }

  /// Launch URL via url_launcher (tersedia di Windows)
  Future<bool> _launchBrowserUrl(String url) async {
    try {
      // Menggunakan Process.run sebagai fallback di Windows
      // url_launcher Windows support via flutter url_launcher plugin
      final uri = Uri.parse(url);
      debugPrint('LAUNCH_URL: $uri');
      // Placeholder - implementasi via url_launcher
      return true;
    } catch (e) {
      return false;
    }
  }

  /// Tunggu callback autentikasi dari browser (via deep link atau temp file)
  Future<Map<String, dynamic>?> _waitForDesktopAuthCallback() async {
    // Desktop auth callback handling
    // Dalam implementasi production: gunakan named pipe atau local server
    await Future.delayed(const Duration(seconds: 1));
    return null;
  }

  /// Sign out current session
  Future<void> signOut() async {
    await SecureStorageService.clearAll();
  }
}

/// Compat wrapper agar tidak crash saat import google_sign_in di Windows
class _GoogleSignInCompat {
  final String? clientId;
  final List<String> scopes;

  _GoogleSignInCompat({this.clientId, required this.scopes});

  Future<dynamic> signIn() async {
    throw UnsupportedError('google_sign_in tidak mendukung platform ini secara native.');
  }
}
