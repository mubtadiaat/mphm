package com.p3hm.guardian

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

object AppUpdateManager {

    private const val UPDATE_API_URL = "https://m.p3hm.my.id/api/app/latest"

    fun checkForUpdates(context: Context) {
        thread {
            try {
                val url = URL(UPDATE_API_URL)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 8000
                connection.readTimeout = 8000
                connection.setRequestProperty("Accept", "application/json")

                if (connection.responseCode == 200) {
                    val reader = BufferedReader(InputStreamReader(connection.inputStream))
                    val response = StringBuilder()
                    var line: String?
                    while (reader.readLine().also { line = it } != null) {
                        response.append(line)
                    }
                    reader.close()

                    val json = JSONObject(response.toString())
                    val latestBuild = json.optInt("build", 0)
                    val latestVersion = json.optString("version", "1.4.10")
                    val apkUrl = json.optString("apk", "")
                    val isMandatory = json.optBoolean("mandatory", false)
                    val notesArray = json.optJSONArray("notes")

                    val notesList = StringBuilder()
                    if (notesArray != null) {
                        for (i in 0 until notesArray.length()) {
                            notesList.append("• ").append(notesArray.getString(i)).append("\n")
                        }
                    } else {
                        notesList.append("• Perbaikan performa dan stabilitas aplikasi.")
                    }

                    val currentVersionName = try {
                        context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "1.4.15"
                    } catch (e: Exception) {
                        "1.4.15"
                    }

                    val currentBuild = try {
                        val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                            pInfo.longVersionCode.toInt()
                        } else {
                            @Suppress("DEPRECATION")
                            pInfo.versionCode
                        }
                    } catch (e: Exception) {
                        10415
                    }

                    if (latestBuild > currentBuild || isVersionGreater(latestVersion, currentVersionName)) {
                        Handler(Looper.getMainLooper()).post {
                            showUpdateDialog(context, latestVersion, notesList.toString(), apkUrl, isMandatory)
                        }
                    }
                }
            } catch (e: Exception) {
                // Silently ignore update check connection issues
            }
        }
    }

    private fun isVersionGreater(v1: String, v2: String): Boolean {
        try {
            val p1 = v1.split(".").map { it.toIntOrNull() ?: 0 }
            val p2 = v2.split(".").map { it.toIntOrNull() ?: 0 }
            for (i in 0 until maxOf(p1.size, p2.size)) {
                val n1 = p1.getOrElse(i) { 0 }
                val n2 = p2.getOrElse(i) { 0 }
                if (n1 > n2) return true
                if (n1 < n2) return false
            }
        } catch (e: Exception) { }
        return false
    }

    private fun showUpdateDialog(
        context: Context,
        version: String,
        notes: String,
        apkUrl: String,
        mandatory: Boolean
    ) {
        val builder = AlertDialog.Builder(context)
            .setTitle("🚀 Versi Baru Tersedia ($version)")
            .setMessage("Pembaruan aplikasi e-mubtadi'aat siap dipasang:\n\n$notes\nUpdate berjalan di latar belakang tanpa membuka browser.")
            .setCancelable(!mandatory)
            .setPositiveButton("Update Sekarang") { dialog, _ ->
                dialog.dismiss()
                downloadAndInstallApk(context, apkUrl, version)
            }

        if (!mandatory) {
            builder.setNegativeButton("Nanti") { dialog, _ -> dialog.dismiss() }
        }

        builder.show()
    }

    private fun downloadAndInstallApk(context: Context, apkUrl: String, version: String) {
        if (apkUrl.isEmpty()) return

        Toast.makeText(context, "Mengunduh pembaruan v$version di latar belakang...", Toast.LENGTH_LONG).show()

        try {
            val fileName = "mubtadiaat_v${version.replace(".", "_")}.apk"
            val destinationFile = File(context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
            if (destinationFile.exists()) {
                destinationFile.delete()
            }

            val request = DownloadManager.Request(Uri.parse(apkUrl)).apply {
                setTitle("Admin Mubtadiaat v$version")
                setDescription("Mengunduh paket pembaruan otomatis...")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationUri(Uri.fromFile(destinationFile))
                setMimeType("application/vnd.android.package-archive")
            }

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val downloadId = downloadManager.enqueue(request)

            val onCompleteReceiver = object : BroadcastReceiver() {
                override fun onReceive(c: Context?, intent: Intent?) {
                    val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) ?: -1
                    if (id == downloadId) {
                        try {
                            context.unregisterReceiver(this)
                        } catch (e: Exception) { }
                        
                        promptApkInstallation(context, destinationFile)
                    }
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(
                    onCompleteReceiver,
                    IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                    Context.RECEIVER_EXPORTED
                )
            } else {
                context.registerReceiver(
                    onCompleteReceiver,
                    IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
                )
            }

        } catch (e: Exception) {
            Toast.makeText(context, "Gagal mengunduh update: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
        }
    }

    fun promptApkInstallation(context: Context, apkFile: File) {
        if (!apkFile.exists()) return

        try {
            val apkUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.fileprovider",
                apkFile
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            context.startActivity(intent)
        } catch (e: Exception) {
            Toast.makeText(context, "Gagal membuka installer APK: ${e.localizedMessage}", Toast.LENGTH_LONG).show()
        }
    }
}
