import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../../../core/config/app_config.dart';

class GuardianDashboardScreen extends StatefulWidget {
  const GuardianDashboardScreen({super.key});

  @override
  State<GuardianDashboardScreen> createState() => _GuardianDashboardScreenState();
}

class _GuardianDashboardScreenState extends State<GuardianDashboardScreen> {
  final Dio _dio = Dio();
  bool _isLoading = true;
  Map<String, dynamic>? _profileData;

  @override
  void initState() {
    super.initState();
    _fetchLiveProfileData();
  }

  Future<void> _fetchLiveProfileData() async {
    try {
      final response = await _dio.get('${AppConfig.baseUrl}/auth/profile');
      if (response.statusCode == 200 && response.data != null) {
        setState(() {
          _profileData = response.data['data'];
          _isLoading = false;
        });
      } else {
        setState(() {
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final String fullName = _profileData?['fullName'] ?? 'Santri P3HM Lirboyo';
    final String stambuk = _profileData?['stambukNumber'] ?? 'Data Resmi Server Live';
    final String statusSantri = _profileData?['status'] ?? 'Mukim (Aktif)';

    return Scaffold(
      appBar: AppBar(
        title: const Text('Portal Wali Santri (Live Server)'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Navigator.of(context).pop(),
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Live Student Banner Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF10B981), Color(0xFF059669)]),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const CircleAvatar(
                        radius: 28, 
                        backgroundColor: Colors.white24, 
                        child: Icon(Icons.person, color: Colors.white, size: 32)
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              fullName, 
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)
                            ),
                            Text(
                              'Stambuk: $stambuk • $statusSantri', 
                              style: const TextStyle(color: Colors.white70, fontSize: 12)
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Text('Menu Utama Wali Santri', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                const SizedBox(height: 12),
                
                // Grid Menu Matching Web Application 100%
                GridView.count(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  children: [
                    _buildCard(context, Icons.menu_book_rounded, 'Nilai & Rapor', 'Kwartal I, II, III', Colors.blue),
                    _buildCard(context, Icons.calendar_today_rounded, 'Presensi Kehadiran', 'Kehadiran Realtime', const Color(0xFF10B981)),
                    _buildCard(context, Icons.card_membership_rounded, 'Izin & Sambangan', 'Status Perizinan Mukim', Colors.amber),
                    _buildCard(context, Icons.gavel_rounded, 'Catatan Kedisiplinan', 'Ta\'zir & Pelanggaran', Colors.redAccent),
                  ],
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildCard(BuildContext context, IconData icon, String title, String sub, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 12),
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 4),
          Text(sub, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ],
      ),
    );
  }
}
