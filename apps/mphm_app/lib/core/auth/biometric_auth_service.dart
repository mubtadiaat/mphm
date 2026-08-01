import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import '../config/app_config.dart';
import 'package:dio/dio.dart';

class BiometricAuthService {
  static final LocalAuthentication _localAuth = LocalAuthentication();
  static final Dio _dio = Dio();

  /// Check if device supports Biometrics (Fingerprint / Face ID)
  static Future<bool> isBiometricAvailable() async {
    try {
      final bool canAuthenticateWithBiometrics = await _localAuth.canCheckBiometrics;
      final bool canAuthenticate = canAuthenticateWithBiometrics || await _localAuth.isDeviceSupported();
      return canAuthenticate;
    } catch (e) {
      return false;
    }
  }

  /// Get list of available biometrics (Fingerprint, Face ID, Iris)
  static Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _localAuth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }

  /// Trigger native Biometric Prompt (Fingerprint / Face ID)
  static Future<bool> authenticateWithBiometrics({String reason = 'PIN / Sidik Jari untuk Masuk Aplikasi'}) async {
    try {
      final bool didAuthenticate = await _localAuth.authenticate(
        localizedReason: reason,
        biometricOnly: true,
        persistAcrossBackgrounding: true,
      );
      return didAuthenticate;
    } on PlatformException catch (e) {
      return false;
    } catch (e) {
      return false;
    }
  }

  /// Sync Biometric Token with Live Production Database API Gateway
  static Future<Map<String, dynamic>> toggleBiometricStatus({
    required String userId,
    required String token,
  }) async {
    try {
      final response = await _dio.post(
        '${AppConfig.baseUrl}/auth/biometric',
        data: {
          'action': 'toggle',
          'userId': userId,
          'biometricToken': token,
        },
      );
      return response.data ?? {'status': 'error', 'message': 'Gagal memperbarui status biometrik'};
    } catch (e) {
      return {'status': 'error', 'message': 'Gagal terhubung ke server biometrik.'};
    }
  }

  /// Authenticate 1-Tap Login using Biometrics
  static Future<Map<String, dynamic>> loginWithBiometricToken({
    required String biometricToken,
  }) async {
    try {
      final response = await _dio.post(
        '${AppConfig.baseUrl}/auth/biometric',
        data: {
          'action': 'verify',
          'biometricToken': biometricToken,
        },
      );
      return response.data ?? {'status': 'error', 'message': 'Autentikasi Biometrik Gagal'};
    } catch (e) {
      return {'status': 'error', 'message': 'Autentikasi biometrik tidak valid.'};
    }
  }
}
