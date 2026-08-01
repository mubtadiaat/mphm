import 'package:flutter/material.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

class PremiumLoaderWidget extends StatelessWidget {
  final String message;
  final String subtext;

  const PremiumLoaderWidget({
    Key? key,
    this.message = 'Memuat Sistem Enterprise...',
    this.subtext = 'Menyinkronkan data instansi dengan server pusat...',
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(28.0),
        constraints: const BoxConstraints(maxWidth: 320),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor.withValues(alpha: 0.85),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.15),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.2),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(
              height: 70,
              width: 70,
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SpinKitRing(
                    color: Color(0xFF10B981),
                    size: 70.0,
                    lineWidth: 3.0,
                  ),
                  SpinKitRipple(
                    color: Color(0xFF2563EB),
                    size: 45.0,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 15,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtext,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: Theme.of(context).textTheme.bodySmall?.color?.withValues(alpha: 0.7),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
