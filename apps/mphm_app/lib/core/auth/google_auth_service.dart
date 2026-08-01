import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../storage/secure_storage.dart';

class GoogleAuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    clientId: AppConfig.googleWebClientId,
    scopes: <String>[
      'email',
      'profile',
      'openid',
    ],
  );

  final Dio _dio = Dio(BaseOptions(baseUrl: AppConfig.baseUrl));

  /// Authenticate User using Enterprise Google Sign-In Flow
  Future<Map<String, dynamic>?> signInWithGoogle() async {
    try {
      // 1. Trigger Native / Web Google OAuth Dialog
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        // User cancelled authentication
        return null;
      }

      // 2. Fetch Authentication Tokens (ID Token & Access Token)
      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;

      final String? idToken = googleAuth.idToken;
      final String? accessToken = googleAuth.accessToken;

      if (idToken == null) {
        throw Exception('Gagal mendapatkan Google ID Token.');
      }

      // 3. Exchange & Verify Token with Enterprise Backend API Gateway
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

        // 4. Save Session Token to Secure Storage
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
      debugPrint('ENTERPRISE_GOOGLE_AUTH_ERROR: $e');
      rethrow;
    }
  }

  /// Sign out current Google session
  Future<void> signOut() async {
    await _googleSignIn.signOut();
    await SecureStorageService.clearAll();
  }
}
