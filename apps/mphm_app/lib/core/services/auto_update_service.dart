import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_config.dart';

/// Service Pembaruan Otomatis Realtime (Auto-Update Service)
/// • Windows Desktop: Mendownload installer .exe di background & menampilkan dialog modal
///   "Jalankan Pembaruan Sekarang" atau "Nanti Saja".
/// • Android Mobile: Menampilkan dialog rilis versi baru dengan tombol unduh & pasang langsung.
class AutoUpdateService {
  static final Dio _dio = Dio(
    BaseOptions(
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
    ),
  );

  static bool _isChecking = false;

  /// Membandingkan dua string versi (contoh: "2.0.1" vs "2.0.2")
  /// Returns true jika targetVersion > currentVersion
  static bool isVersionHigher(String currentVersion, String targetVersion) {
    try {
      final currentParts = currentVersion
          .replaceAll(RegExp(r'[^0-9.]'), '')
          .split('.')
          .map((e) => int.tryParse(e) ?? 0)
          .toList();
      final targetParts = targetVersion
          .replaceAll(RegExp(r'[^0-9.]'), '')
          .split('.')
          .map((e) => int.tryParse(e) ?? 0)
          .toList();

      for (int i = 0; i < 3; i++) {
        final c = i < currentParts.length ? currentParts[i] : 0;
        final t = i < targetParts.length ? targetParts[i] : 0;
        if (t > c) return true;
        if (t < c) return false;
      }
    } catch (e) {
      debugPrint('AUTO_UPDATE_VERSION_COMPARE_ERROR: $e');
    }
    return false;
  }

  /// Periksa pembaruan secara otomatis saat aplikasi dibuka
  static Future<void> checkForUpdates(BuildContext context) async {
    if (_isChecking) return;
    _isChecking = true;

    try {
      debugPrint('AUTO_UPDATE: Checking for updates from live API...');
      final response = await _dio.get('${AppConfig.baseUrl}/download/releases');

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        final latest = data['latest'];
        if (latest == null) return;

        final String latestVersion = (latest['version'] ?? '').toString();
        final String currentVersion = AppConfig.appVersion;

        debugPrint(
            'AUTO_UPDATE: Current=$currentVersion, Latest=$latestVersion');

        if (isVersionHigher(currentVersion, latestVersion)) {
          if (!context.mounted) return;

          if (defaultTargetPlatform == TargetPlatform.windows) {
            // Flow Windows Desktop: Download .exe di background + Tampilkan Prompt Restart
            await _handleWindowsAutoUpdate(context, latestVersion, latest);
          } else if (defaultTargetPlatform == TargetPlatform.android ||
              defaultTargetPlatform == TargetPlatform.iOS) {
            // Flow Mobile: Tampilkan Modal Informasi Pembaruan
            _showMobileUpdateDialog(context, latestVersion, latest);
          }
        }
      }
    } catch (e) {
      debugPrint('AUTO_UPDATE_CHECK_ERROR: $e');
    } finally {
      _isChecking = false;
    }
  }

  /// Download installer .exe di background & tampilkan modal prompt restart
  static Future<void> _handleWindowsAutoUpdate(
      BuildContext context, String newVersion, dynamic latestData) async {
    final String windowsDownloadUrl = latestData['windows']?['downloadUrl'] ??
        'https://github.com/mubtadiaat/app_software/releases/download/v$newVersion/MPHM.Enterprise.Setup.$newVersion.exe';

    final tempDir = Directory.systemTemp.path;
    final installerPath = '$tempDir\\MPHM.Enterprise.Setup.$newVersion.exe';

    debugPrint('AUTO_UPDATE_WINDOWS: Downloading to $installerPath...');

    try {
      // Download installer file ke folder temporary
      await _dio.download(windowsDownloadUrl, installerPath);
      debugPrint('AUTO_UPDATE_WINDOWS: Download complete! Prompting user...');

      if (!context.mounted) return;

      // Tampilkan Dialog Modal Restart Software
      _showWindowsRestartDialog(context, newVersion, installerPath);
    } catch (e) {
      debugPrint('AUTO_UPDATE_WINDOWS_DOWNLOAD_ERROR: $e');
    }
  }

  /// Dialog Modal Windows Desktop: "Jalankan Pembaruan Sekarang" / "Nanti Saja"
  static void _showWindowsRestartDialog(
      BuildContext context, String newVersion, String installerPath) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF10B981), width: 1.5),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xFF10B981),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.system_update_rounded,
                  color: Colors.white, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Versi Baru Tersedia! (v$newVersion)',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pembaruan MPHM Enterprise v$newVersion telah selesai diunduh secara latar belakang.',
              style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline_rounded,
                      color: Color(0xFF38BDF8), size: 18),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Tekan "Jalankan Pembaruan Sekarang" untuk menutup software & memasang versi terbaru secara otomatis.',
                      style: TextStyle(color: Color(0xFF7DD3FC), fontSize: 11),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actionsPadding: const EdgeInsets.all(16),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text(
              'Nanti Saja',
              style: TextStyle(color: Colors.white60, fontWeight: FontWeight.w600),
            ),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              Navigator.of(ctx).pop();
              // Jalankan installer .exe & tutup aplikasi saat ini
              try {
                await Process.start(installerPath, []);
                exit(0); // Restart / Close current app
              } catch (e) {
                debugPrint('INSTALLER_EXEC_ERROR: $e');
              }
            },
            icon: const Icon(Icons.restart_alt_rounded, size: 18),
            label: const Text('Jalankan Pembaruan Sekarang'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF10B981),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Dialog Modal Mobile (Android / iOS)
  static void _showMobileUpdateDialog(
      BuildContext context, String newVersion, dynamic latestData) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF38BDF8), width: 1.5),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: const BoxDecoration(
                color: Color(0xFF0284C7),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.new_releases_rounded,
                  color: Colors.white, size: 24),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Pembaruan Versi $newVersion',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Text(
          'Versi terbaru MPHM Enterprise (v$newVersion) telah tersedia dengan peningkatan performa dan fitur baru.',
          style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.4),
        ),
        actionsPadding: const EdgeInsets.all(16),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Nanti Saja', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              Navigator.of(ctx).pop();
              final Uri downloadUri = Uri.parse('https://m.p3hm.my.id/download/staff');
              if (await canLaunchUrl(downloadUri)) {
                await launchUrl(downloadUri, mode: LaunchMode.externalApplication);
              }
            },
            icon: const Icon(Icons.download_rounded, size: 18),
            label: const Text('Unduh & Pasang Sekarang'),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0284C7),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
