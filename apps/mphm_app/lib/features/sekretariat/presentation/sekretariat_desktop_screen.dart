import 'package:flutter/material.dart';

class SekretariatDesktopScreen extends StatefulWidget {
  const SekretariatDesktopScreen({super.key});

  @override
  State<SekretariatDesktopScreen> createState() => _SekretariatDesktopScreenState();
}

class _SekretariatDesktopScreenState extends State<SekretariatDesktopScreen> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          // Native Desktop Navigation Sidebar
          NavigationRail(
            selectedIndex: _selectedIndex,
            onDestinationSelected: (int index) {
              setState(() {
                _selectedIndex = index;
              });
            },
            labelType: NavigationRailLabelType.all,
            leading: const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Icon(Icons.school, size: 32, color: Color(0xFF10B981)),
            ),
            trailing: Expanded(
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: IconButton(
                    icon: const Icon(Icons.logout, color: Colors.redAccent),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ),
              ),
            ),
            destinations: const [
              NavigationRailDestination(icon: Icon(Icons.dashboard_rounded), label: Text('Overview')),
              NavigationRailDestination(icon: Icon(Icons.people_alt_rounded), label: Text('Santriwati')),
              NavigationRailDestination(icon: Icon(Icons.meeting_room_rounded), label: Text('Asrama')),
              NavigationRailDestination(icon: Icon(Icons.grade_rounded), label: Text('Rapor')),
            ],
          ),
          const VerticalDivider(thickness: 1, width: 1),

          // Desktop Main Workspace Content
          Expanded(
            child: Container(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Cockpit Sekretariat Desktop (Native Windows)', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      ElevatedButton.icon(
                        onPressed: () {},
                        icon: const Icon(Icons.sync_rounded),
                        label: const Text('Tarik Data dari Pondok P3HM'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Theme.of(context).cardColor,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white10),
                      ),
                      child: const Center(
                        child: Text('Windows Native Multi-Column Data Grid Ready (RAM < 60 MB)', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
