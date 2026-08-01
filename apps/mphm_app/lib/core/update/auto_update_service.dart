import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../config/app_config.dart';

class AutoUpdateService {
  static final Dio _dio = Dio();
  static bool _isDownloading = false;
  static bool _isUpdateReady = false;
  static String _latestVersion = AppConfig.appVersion;
  static String _downloadedFilePath = '';

  static bool get isUpdateReady => _isUpdateReady;
  static String get latestVersion => _latestVersion;

  /// Check background update silently from live server API gateway
  static Future<void> checkForBackgroundUpdates({
    required Function(String newVersion) onUpdateAvailable,
    required Function() onUpdateDownloaded,
  }) async {
    try {
      final response = await _dio.get(
        'https://api.github.com/repos/mubtadiaat/app_software/releases/latest',
        options: Options(
          headers: {'Accept': 'application/vnd.github.v3+json'},
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final String tag = response.data['tag_name'] ?? '';
        final String remoteVer = tag.replaceAll('v', '').trim();

        if (_isVersionNewer(AppConfig.appVersion, remoteVer)) {
          _latestVersion = remoteVer;
          onUpdateAvailable(remoteVer);

          // Find appropriate asset download URL
          final List assets = response.data['assets'] ?? [];
          String? downloadUrl;

          for (var asset in assets) {
            final String name = asset['name'] ?? '';
            if (kIsWeb) break;
            if (defaultTargetPlatform == TargetPlatform.windows && name.endsWith('.zip')) {
              downloadUrl = asset['browser_download_url'];
              break;
            } else if (defaultTargetPlatform == TargetPlatform.android && name.endsWith('.apk')) {
              downloadUrl = asset['browser_download_url'];
              break;
            }
          }

          if (downloadUrl != null && !_isDownloading && !_isUpdateReady) {
            _silentlyDownloadUpdate(downloadUrl, onUpdateDownloaded);
          }
        }
      }
    } catch (_) {
      // Background check fails silently without interrupting user flow
    }
  }

  static Future<void> _silentlyDownloadUpdate(
    String downloadUrl, 
    Function() onUpdateDownloaded
  ) async {
    _isDownloading = true;
    try {
      // Simulated silent background download completion
      await Future.delayed(const Duration(seconds: 4));
      _isDownloading = false;
      _isUpdateReady = true;
      _downloadedFilePath = downloadUrl;
      onUpdateDownloaded();
    } catch (_) {
      _isDownloading = false;
    }
  }

  static bool _isVersionNewer(String current, String remote) {
    try {
      final List<int> curParts = current.split('.').map((e) => int.tryParse(e) ?? 0).toList();
      final List<int> remParts = remote.split('.').map((e) => int.tryParse(e) ?? 0).toList();

      for (int i = 0; i < mathMin(curParts.length, remParts.length); i++) {
        if (remParts[i] > curParts[i]) return true;
        if (remParts[i] < curParts[i]) return false;
      }
      return remParts.length > curParts.length;
    } catch (_) {
      return false;
    }
  }

  static int mathMin(int a, int b) => a < b ? a : b;
}
