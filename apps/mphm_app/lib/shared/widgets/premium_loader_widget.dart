import 'package:flutter/material.dart';

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
          color: Theme.of(context).cardColor.withAlpha(217),
          borderRadius: BorderRadius.circular(28),
          border: Border.all(
            color: const Color(0xFFFFFFFF).withAlpha(38),
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF000000).withAlpha(51),
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
              child: CircularProgressIndicator(
                strokeWidth: 3.0,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)),
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
                color: Theme.of(context).textTheme.bodySmall?.color?.withAlpha(179),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
