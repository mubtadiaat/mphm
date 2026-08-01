import 'dart:async';
import 'package:flutter/material.dart';

class WindowsInstallerScreen extends StatefulWidget {
  final VoidCallback onInstallationComplete;

  const WindowsInstallerScreen({Key? key, required onInstallationComplete})
      : _onInstallationComplete = onInstallationComplete,
        super(key: key);

  final VoidCallback _onInstallationComplete;

  @override
  State<WindowsInstallerScreen> createState() => _WindowsInstallerScreenState();
}

class _WindowsInstallerScreenState extends State<WindowsInstallerScreen> {
  int _currentStep = 0;
  String _installPath = 'C:\\Program Files\\MPHM Enterprise Lirboyo';
  bool _agreedToTerms = true;
  bool _launchOnFinish = true;

  // Step 3 Extraction Progress
  double _extractProgress = 0.0;
  String _currentExtractFile = 'Menyiapkan arsip paket biner C++ native...';
  final List<String> _logs = [];
  Timer? _extractTimer;

  final List<String> _sampleFiles = [
    'mphm_app.exe',
    'flutter_windows.dll',
    'data/icudtl.dat',
    'data/flutter_assets/kernel_blob.bin',
    'data/flutter_assets/assets/logo.png',
    'data/flutter_assets/FontManifest.json',
    'url_launcher_windows_plugin.dll',
    'local_auth_windows_plugin.dll',
    'secure_storage_windows_plugin.dll',
    'registries/mphm_protocol_handler.reg',
  ];

  void _startExtraction() {
    int index = 0;
    _extractTimer = Timer.periodic(const Duration(milliseconds: 350), (timer) {
      if (!mounted) return;
      setState(() {
        if (index < _sampleFiles.length) {
          final file = _sampleFiles[index];
          _currentExtractFile = 'Ekstrak file: $file';
          _logs.add('[SUCCESS] Extracted -> $_installPath\\$file');
          _extractProgress = (index + 1) / _sampleFiles.length;
          index++;
        } else {
          _extractProgress = 1.0;
          _currentExtractFile = 'Pemasangan Lisensi & Pendaftaran Registri Sistem Selesai!';
          _extractTimer?.cancel();
          _currentStep = 3; // Move to Finish step
        }
      });
    });
  }

  @override
  void dispose() {
    _extractTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Center(
        child: Container(
          width: 750,
          height: 520,
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white10),
            boxShadow: const [
              BoxShadow(
                color: Colors.black54,
                blurRadius: 32,
                offset: Offset(0, 16),
              ),
            ],
          ),
          child: Row(
            children: [
              // Left Sidebar Branding Banner
              Container(
                width: 230,
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF059669), Color(0xFF0284C7)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(20),
                    bottomLeft: Radius.circular(20),
                  ),
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Image.asset('assets/logo.png', width: 64, height: 64, fit: BoxFit.contain),
                    const SizedBox(height: 16),
                    const Text(
                      'Setup Wizard\nMPHM Enterprise',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'P3HM & MPHM Lirboyo Kediri Native C++ Installer',
                      style: TextStyle(color: Colors.white70, fontSize: 11),
                    ),
                    const Spacer(),
                    Text(
                      'Langkah ${_currentStep + 1} dari 4',
                      style: const TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ],
                ),
              ),

              // Right Main Step Workspace
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(28.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Step Content Switcher
                      Expanded(child: _buildStepContent()),

                      const Divider(color: Colors.white10),
                      const SizedBox(height: 12),

                      // Navigation Buttons
                      Row(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if (_currentStep > 0 && _currentStep < 2)
                            OutlinedButton(
                              onPressed: () => setState(() => _currentStep--),
                              style: OutlinedButton.styleFrom(foregroundColor: Colors.white70),
                              child: const Text('Kembali'),
                            ),
                          const SizedBox(width: 12),
                          ElevatedButton(
                            onPressed: _handleNextButton,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF10B981),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            ),
                            child: Text(_getNextButtonText()),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Selamat Datang di Wisaya Instalasi MPHM Enterprise', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Software ini akan menginstall MPHM & P3HM Lirboyo versi Desktop C++ Native di komputer Anda.', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
                child: const SingleChildScrollView(
                  child: Text(
                    'PERJANJIAN LISENSI PENGGUNAAN SOFTWARE\n\n'
                    '1. Software ini dimiliki dan dikelola secara resmi oleh Pengurus P3HM & MPHM Lirboyo Kediri.\n'
                    '2. Dilarang melakukan penggandaan, rekayasa balik (reverse engineering), atau distribusi tanpa izin tertulis dari Sekretariat Utama.\n'
                    '3. Seluruh data transaksi akademis dan kesiswaan tersinkronkan 100% secara langsung ke Server Cloud Production https://m.p3hm.my.id.',
                    style: TextStyle(color: Colors.white60, fontSize: 11, height: 1.4),
                  ),
                ),
              ),
            ),
            Row(
              children: [
                Checkbox(
                  value: _agreedToTerms, 
                  onChanged: (val) => setState(() => _agreedToTerms = val ?? true),
                  activeColor: const Color(0xFF10B981),
                ),
                const Text('Saya menyetujui Perjanjian Lisensi di atas', style: TextStyle(color: Colors.white, fontSize: 12)),
              ],
            ),
          ],
        );
      case 1:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Pilih Lokasi Instalasi Software', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('Pilih folder tujuan di mana berkas biner MPHM Enterprise akan diekstrak.', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 24),
            TextField(
              controller: TextEditingController(text: _installPath),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Folder Tujuan',
                labelStyle: const TextStyle(color: Color(0xFF10B981)),
                filled: true,
                fillColor: const Color(0xFF0F172A),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                suffixIcon: IconButton(
                  icon: const Icon(Icons.folder_open, color: Color(0xFF10B981)),
                  onPressed: () {},
                ),
              ),
            ),
            const SizedBox(height: 16),
            const Text('Dibutuhkan ruang penyimpanan minimum: 120 MB\nRuang penyimpanan tersedia: 45.8 GB', style: TextStyle(color: Colors.white54, fontSize: 11)),
          ],
        );
      case 2:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Menguji & Mengekstrak Berkas Biner...', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(_currentExtractFile, style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 12)),
            const SizedBox(height: 16),
            LinearProgressIndicator(
              value: _extractProgress,
              backgroundColor: Colors.white10,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFF0F172A), borderRadius: BorderRadius.circular(12)),
                child: ListView.builder(
                  itemCount: _logs.length,
                  itemBuilder: (_, i) => Text(_logs[i], style: const TextStyle(color: Colors.greenAccent, fontFamily: 'monospace', fontSize: 10)),
                ),
              ),
            ),
          ],
        );
      case 3:
      default:
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle_outline_rounded, color: Color(0xFF10B981), size: 64),
            const SizedBox(height: 16),
            const Text('Instalasi Software Selesai Sempurna!', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Text('MPHM Enterprise v2.0.1 telah berhasil dipasang dan siap digunakan.', style: TextStyle(color: Colors.white70, fontSize: 12)),
            const SizedBox(height: 24),
            Row(
              children: [
                Checkbox(
                  value: _launchOnFinish,
                  onChanged: (val) => setState(() => _launchOnFinish = val ?? true),
                  activeColor: const Color(0xFF10B981),
                ),
                const Text('Jalankan MPHM Enterprise sekarang', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        );
    }
  }

  String _getNextButtonText() {
    switch (_currentStep) {
      case 0:
        return 'Lanjut >';
      case 1:
        return 'Pasang Sekarang';
      case 2:
        return 'Mengekstrak...';
      case 3:
      default:
        return 'Selesai & Jalankan';
    }
  }

  void _handleNextButton() {
    if (_currentStep == 0) {
      if (!_agreedToTerms) return;
      setState(() => _currentStep = 1);
    } else if (_currentStep == 1) {
      setState(() => _currentStep = 2);
      _startExtraction();
    } else if (_currentStep == 3) {
      widget._onInstallationComplete();
    }
  }
}
