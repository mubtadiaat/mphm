import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const String _keyToken = 'jwt_auth_token';
  static const String _keyRole = 'user_active_role';
  static const String _keyUserData = 'user_profile_data';

  static Future<void> saveToken(String token) async {
    await _storage.write(key: _keyToken, value: token);
  }

  static Future<String?> getToken() async {
    return await _storage.read(key: _keyToken);
  }

  static Future<void> saveUserRole(String role) async {
    await _storage.write(key: _keyRole, value: role);
  }

  static Future<String?> getUserRole() async {
    return await _storage.read(key: _keyRole);
  }

  static Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _storage.write(key: _keyUserData, value: jsonEncode(userData));
  }

  static Future<Map<String, dynamic>?> getUserData() async {
    final String? raw = await _storage.read(key: _keyUserData);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
