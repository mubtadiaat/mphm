import 'package:flutter/material.dart';

class StaffDashboardScreen extends StatelessWidget {
  const StaffDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Portal Mustahiq & Pengurus'),
        actions: [
          IconButton(icon: const Icon(Icons.qr_code_scanner), onPressed: () {}),
          IconButton(icon: const Icon(Icons.logout), onPressed: () => Navigator.of(context).pop()),
        ],
      ),
      body: const Center(
        child: Text('Dashboard Pengurus & Mustahiq Active', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
    );
  }
}
