/**
 * Automasi Build Desktop App & Packaging Advanced Installer
 * Membikin installer .exe profesional bertema macOS Dark Glassmorphism
 * dengan Gerbang Otentikasi Online khusus Sekretariat.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const DESKTOP_DIR = path.join(ROOT_DIR, "apps", "desktop-app");
const DIST_DIR = path.join(DESKTOP_DIR, "dist");
const UNPACKED_DIR = path.join(DIST_DIR, "win-unpacked");
const INSTALLER_CONFIG = path.join(DESKTOP_DIR, "installer", "mphm-installer.aip");

console.log("=================================================");
console.log("🚀 LALUAN BUILD DESKTOP INSTALLER (ADVANCED INSTALLER)");
console.log("=================================================");

try {
  // 1. Compile Electron app into unpacked raw directory
  console.log("📦 1. Mem-build biner mentah Electron (Target: DIR)...");
  execSync("npm run build:dir", { cwd: DESKTOP_DIR, stdio: "inherit" });

  if (!fs.existsSync(UNPACKED_DIR)) {
    throw new Error(`Folder mentah ${UNPACKED_DIR} tidak ditemukan setelah build!`);
  }

  console.log("✅ Build Electron DIR selesai!");
  console.log(`📁 Lokasi biner: ${UNPACKED_DIR}`);

  // 2. Check Advanced Installer CLI
  console.log("\n🛠️ 2. Menyiapkan Pengemasan Advanced Installer...");

  const advInstallerPaths = [
    "C:\\Program Files (x86)\\Caphyon\\Advanced Installer 21.0\\bin\\x86\\AdvancedInstaller.com",
    "C:\\Program Files (x86)\\Caphyon\\Advanced Installer 20.0\\bin\\x86\\AdvancedInstaller.com",
    "C:\\Program Files (x86)\\Caphyon\\Advanced Installer 19.0\\bin\\x86\\AdvancedInstaller.com",
    "AdvancedInstaller.com",
  ];

  let advCmd = null;
  for (const p of advInstallerPaths) {
    if (fs.existsSync(p)) {
      advCmd = `"${p}"`;
      break;
    }
  }

  if (advCmd && fs.existsSync(INSTALLER_CONFIG)) {
    console.log(`⚡ Menggunakan Advanced Installer CLI: ${advCmd}`);
    console.log(`📄 Menggunakan Konfigurasi Proyek: ${INSTALLER_CONFIG}`);

    execSync(`${advCmd} /build "${INSTALLER_CONFIG}"`, { stdio: "inherit" });
    console.log("\n🎉 BERHASIL! Berkas Setup.exe bergaya macOS berhasil diterbitkan.");
  } else {
    console.log("⚠️ Advanced Installer CLI belum terdeteksi di lingkungan sistem lokal.");
    console.log("ℹ️ Folder biner mentah 'win-unpacked' sudah siap untuk diimpor ke proyek Advanced Installer GUI.");
    console.log(`📄 Template Proyek AIP: ${INSTALLER_CONFIG}`);
  }
} catch (error) {
  console.error("❌ Gagal memproses build installer:", error.message);
  process.exit(1);
}
