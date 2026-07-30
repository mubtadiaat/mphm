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

  // 2. Check Advanced Installer CLI dynamically
  console.log("\n🛠️ 2. Menyiapkan Pengemasan Advanced Installer...");

  function findAdvancedInstaller() {
    if (process.env.ADVANCED_INSTALLER_PATH && fs.existsSync(process.env.ADVANCED_INSTALLER_PATH)) {
      return `"${process.env.ADVANCED_INSTALLER_PATH}"`;
    }

    const candidateRoots = [
      "C:\\Program Files (x86)\\Caphyon",
      "C:\\Program Files\\Caphyon",
      "D:\\Program Files\\Caphyon",
      "E:\\Program Files\\Caphyon",
    ];

    for (const root of candidateRoots) {
      if (fs.existsSync(root)) {
        try {
          const subdirs = fs.readdirSync(root);
          for (const dir of subdirs) {
            const p86 = path.join(root, dir, "bin", "x86", "AdvancedInstaller.com");
            if (fs.existsSync(p86)) return `"${p86}"`;
            const p64 = path.join(root, dir, "bin", "x64", "AdvancedInstaller.com");
            if (fs.existsSync(p64)) return `"${p64}"`;
            const pDirect = path.join(root, dir, "AdvancedInstaller.com");
            if (fs.existsSync(pDirect)) return `"${pDirect}"`;
          }
        } catch (e) {}
      }
    }

    try {
      const whereResult = execSync("where AdvancedInstaller.com", { encoding: "utf8" }).trim();
      if (whereResult) {
        const firstLine = whereResult.split("\n")[0].trim();
        if (fs.existsSync(firstLine)) return `"${firstLine}"`;
      }
    } catch (e) {}

    return null;
  }

  const advCmd = findAdvancedInstaller();

  if (advCmd && fs.existsSync(INSTALLER_CONFIG)) {
    console.log(`⚡ Menggunakan Advanced Installer CLI: ${advCmd}`);
    console.log(`📄 Menggunakan Konfigurasi Proyek: ${INSTALLER_CONFIG}`);

    execSync(`${advCmd} /build "${INSTALLER_CONFIG}"`, { stdio: "inherit" });
    console.log("\n🎉 BERHASIL! Berkas Setup.exe bergaya macOS berhasil diterbitkan.");
  } else {
    console.log("ℹ️ Folder biner mentah 'win-unpacked' telah selesai dikompilasi.");
    console.log(`📂 Lokasi folder: ${UNPACKED_DIR}`);
    console.log(`📄 Template Proyek AIP: ${INSTALLER_CONFIG}`);
    console.log("\n💡 Catatan:");
    console.log("   • Jika Advanced Installer terpasang di lokasi kustom, Anda dapat menentukan jalurnya melalui:");
    console.log("     set ADVANCED_INSTALLER_PATH=\"C:\\Jalur\\Ke\\AdvancedInstaller.com\"");
    console.log("   • Atau buka file proyek 'mphm-installer.aip' langsung menggunakan Advanced Installer GUI.");
  }
} catch (error) {
  console.error("❌ Gagal memproses build installer:", error.message);
  process.exit(1);
}
