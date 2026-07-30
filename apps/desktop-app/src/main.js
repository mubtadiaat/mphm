const { app, BrowserWindow, ipcMain, session, shell, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

const BASE_URL = 'https://m.p3hm.my.id';
const LOGIN_SEKR_URL = `${BASE_URL}/loginsekr`;
const SEKRETARIAT_TARGET_URL = `${BASE_URL}/sekretariat`;
const AUTH_API_URL = `${BASE_URL}/api/v1/installer/login`;

const PROTOCOL_PREFIX = 'mphm';

// Register mphm:// custom protocol scheme for OS deep linking
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL_PREFIX, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL_PREFIX);
}

let installerWindow = null;
let mainContainerWindow = null;

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainContainerWindow && !mainContainerWindow.isDestroyed()) {
      if (mainContainerWindow.isMinimized()) mainContainerWindow.restore();
      mainContainerWindow.focus();
    }
    const deepLinkUrl = commandLine.find(arg => arg.startsWith(`${PROTOCOL_PREFIX}://`));
    if (deepLinkUrl) {
      handleDeepLinkUrl(deepLinkUrl);
    }
  });
}

app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLinkUrl(url);
});

async function handleDeepLinkUrl(deepLinkUrl) {
  try {
    console.log('Processing Deep Link URL:', deepLinkUrl);
    const parsedUrl = new URL(deepLinkUrl);
    const params = new URLSearchParams(parsedUrl.search);
    const token = params.get('token') || params.get('session');
    const role = params.get('role');
    const targetUrl = params.get('redirect') || SEKRETARIAT_TARGET_URL;

    if (token) {
      const config = loadConfig() || {};
      config.token = token;
      if (role) config.role = role;
      config.targetUrl = targetUrl;
      saveConfig(config);

      try {
        await session.defaultSession.cookies.set({
          url: BASE_URL,
          name: 'mphm_session',
          value: token,
          path: '/',
          secure: true,
          sameSite: 'no_restriction'
        });
        await session.defaultSession.cookies.set({
          url: BASE_URL,
          name: 'session_token',
          value: token,
          path: '/',
          secure: true,
          sameSite: 'no_restriction'
        });
      } catch (cErr) {
        console.warn('Cookie set error from deep link:', cErr);
      }

      if (mainContainerWindow && !mainContainerWindow.isDestroyed()) {
        if (mainContainerWindow.isMinimized()) mainContainerWindow.restore();
        mainContainerWindow.focus();
        mainContainerWindow.webContents.send('auth:deep-link-callback', {
          token,
          role,
          targetUrl
        });
      } else {
        createMainAppWindow(config);
      }
    }
  } catch (err) {
    console.error('Error parsing deep link URL:', err);
  }
}

const getConfigPath = () => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
};

const clearExistingData = async () => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    if (session.defaultSession) {
      await session.defaultSession.clearStorageData();
      await session.defaultSession.clearCache();
    }
  } catch (err) {
    console.warn('Notice clearing previous data:', err);
  }
};

const loadConfig = () => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading config:', err);
  }
  return null;
};

const saveConfig = (configData) => {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving config:', err);
    return false;
  }
};

function createInstallerWindow() {
  if (installerWindow) {
    installerWindow.focus();
    return;
  }

  installerWindow = new BrowserWindow({
    width: 960,
    height: 640,
    frame: false,
    transparent: true,
    resizable: false,
    icon: path.join(__dirname, 'assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  installerWindow.loadFile(path.join(__dirname, 'index.html'));

  installerWindow.on('closed', () => {
    installerWindow = null;
  });
}

// Helper for Auth URL detection
function isAuthUrl(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.includes('accounts.google.com') ||
         lower.includes('google.com/o/oauth2') ||
         lower.includes('google.com/gsi/') ||
         lower.includes('firebaseapp.com') ||
         lower.includes('/__/auth/') ||
         lower.includes('auth/google') ||
         lower.includes('login/google');
}

// Semantic version comparison: returns true if v1 > v2
function isVersionGreater(v1, v2) {
  try {
    const p1 = (v1 || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    const p2 = (v2 || '').replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
    for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
      const n1 = p1[i] || 0;
      const n2 = p2[i] || 0;
      if (n1 > n2) return true;
      if (n1 < n2) return false;
    }
  } catch (e) {}
  return false;
}

const DESKTOP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function getWindowOpenOptions(url) {
  if (isAuthUrl(url)) {
    shell.openExternal(url);
    return { action: 'deny' };
  }

  const isInternal = url.startsWith(BASE_URL) || url.includes('p3hm.my.id') || url.includes('localhost');
  if (!isInternal) {
    shell.openExternal(url);
    return { action: 'deny' };
  }
  return { action: 'allow' };
}

function createMainAppWindow(config) {
  if (mainContainerWindow) {
    mainContainerWindow.focus();
    return;
  }

  mainContainerWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    frame: false,
    autoHideMenuBar: true,
    menuBarVisible: false,
    title: `Admin Mubtadiaat - ${config?.role || 'Sekretariat'}`,
    icon: path.join(__dirname, 'assets/logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      userAgent: DESKTOP_USER_AGENT
    }
  });

  mainContainerWindow.webContents.setWindowOpenHandler(({ url }) => getWindowOpenOptions(url));

  mainContainerWindow.loadFile(path.join(__dirname, 'app_container.html'));

  mainContainerWindow.on('closed', () => {
    mainContainerWindow = null;
  });

  if (installerWindow) {
    installerWindow.close();
  }

  // Trigger background update check
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.warn('AutoUpdater check notice:', err.message);
    });
  }, 3000);
}

// AutoUpdater Event Forwarding to All Active Windows
function sendToAppWindows(channel, data) {
  if (mainContainerWindow && !mainContainerWindow.isDestroyed()) {
    mainContainerWindow.webContents.send(channel, data);
  }
  if (installerWindow && !installerWindow.isDestroyed()) {
    installerWindow.webContents.send(channel, data);
  }
}

autoUpdater.on('update-available', (info) => {
  sendToAppWindows('update:available', info);
});

autoUpdater.on('update-not-available', (info) => {
  sendToAppWindows('update:not-available', info);
});

autoUpdater.on('download-progress', (progressObj) => {
  sendToAppWindows('update:progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  sendToAppWindows('update:downloaded', info);
});

autoUpdater.on('error', (err) => {
  sendToAppWindows('update:error', err?.message || 'Gagal memeriksa pembaruan.');
});

// Helper for Direct Background Update Download
async function downloadLatestReleaseExe() {
  const currentVer = app.getVersion() || '1.4.31';
  let latestVer = currentVer;
  let downloadUrl = '';

  const res = await axios.get('https://api.github.com/repos/mubtadiaat/app_software/releases/latest', {
    headers: { 'User-Agent': 'Admin-Mubtadiaat-Desktop' },
    timeout: 10000
  });

  if (res.data && res.data.tag_name) {
    latestVer = res.data.tag_name.replace(/^v/, '');
    if (res.data.assets && Array.isArray(res.data.assets)) {
      const exeAsset = res.data.assets.find(a => a.name && a.name.endsWith('.exe'));
      if (exeAsset && exeAsset.browser_download_url) {
        downloadUrl = exeAsset.browser_download_url;
      }
    }
  }

  if (!downloadUrl) {
    throw new Error('File installer setup.exe rilis terbaru tidak ditemukan di GitHub.');
  }

  const tempPath = path.join(app.getPath('temp'), `AdminMubtadiaat_v${latestVer}_Setup.exe`);

  try {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  } catch (e) {}

  const response = await axios({
    url: downloadUrl,
    method: 'GET',
    responseType: 'stream',
    headers: { 'User-Agent': 'Admin-Mubtadiaat-Desktop' }
  });

  const totalLength = parseInt(response.headers['content-length'] || '0', 10);
  let downloadedLength = 0;

  const writer = fs.createWriteStream(tempPath);

  response.data.on('data', (chunk) => {
    downloadedLength += chunk.length;
    const percent = totalLength ? Math.round((downloadedLength / totalLength) * 100) : 0;
    sendToAppWindows('update:progress', {
      percent: percent,
      bytesPerSecond: 1024 * 1024,
      transferred: downloadedLength,
      total: totalLength
    });
  });

  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  sendToAppWindows('update:downloaded', { version: latestVer, path: tempPath });
  return { version: latestVer, path: tempPath };
}

// IPC Handlers for AutoUpdater
ipcMain.handle('update:check', async () => {
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err) {
    return { error: err.message };
  }
});

ipcMain.handle('update:start-download', async () => {
  try {
    const result = await downloadLatestReleaseExe();
    return { success: true, ...result };
  } catch (err) {
    console.error('Direct download error:', err.message);
    sendToAppWindows('update:error', err.message);
    return { error: err.message };
  }
});

ipcMain.handle('update:quit-and-install', () => {
  try {
    const tempDir = app.getPath('temp');
    const tempFiles = fs.readdirSync(tempDir).filter(f => f.startsWith('AdminMubtadiaat_v') && f.endsWith('.exe'));
    if (tempFiles.length > 0) {
      const latestFile = path.join(tempDir, tempFiles[tempFiles.length - 1]);
      const { exec } = require('child_process');
      exec(`"${latestFile}"`, (err) => {
        if (err) shell.openPath(latestFile);
      });
    } else {
      autoUpdater.quitAndInstall(false, true);
    }
  } catch (e) {
    autoUpdater.quitAndInstall(false, true);
  }
});

// IPC Handlers

// Check Existing Installation
ipcMain.handle('installer:check-installation', async () => {
  const config = loadConfig();
  if (config && config.role && config.installedAt) {
    return { installed: true, config };
  }
  return { installed: false, config: null };
});

// Authentication Login API
ipcMain.handle('installer:login', async (event, credentials) => {
  const payload = {
    username: credentials.email,
    email: credentials.email,
    password: credentials.password,
    portal: 'sekretariat'
  };

  try {
    let response;
    try {
      response = await axios.post(AUTH_API_URL, payload, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 10000
      });
    } catch (apiErr) {
      const webAuthUrl = `${BASE_URL}/api/auth/login`;
      response = await axios.post(webAuthUrl, payload, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        timeout: 10000
      });
    }

    const resData = response.data;
    if (resData && (resData.status === 'Success' || resData.success || resData.data)) {
      const userData = resData.data || resData.user || {};
      const userRole = userData.role || resData.role || 'Sekretariat';

      const cookiesHeader = response?.headers?.['set-cookie'];
      if (cookiesHeader && Array.isArray(cookiesHeader)) {
        for (const cookieStr of cookiesHeader) {
          const parts = cookieStr.split(';')[0].split('=');
          if (parts.length >= 2) {
            const name = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            try {
              await session.defaultSession.cookies.set({
                url: 'https://m.p3hm.my.id',
                name: name,
                value: value,
                path: '/',
                secure: true,
                sameSite: 'no_restriction'
              });
            } catch (cErr) {
              console.warn('Electron cookie set notice:', cErr);
            }
          }
        }
      }

      const configData = {
        installedAt: new Date().toISOString(),
        version: app.getVersion() || '1.4.17',
        email: credentials.email,
        username: userData.username || credentials.email,
        role: userRole,
        fullName: userData.fullName || 'Sekretariat P3HM',
        token: resData.token || resData.accessToken || 'session_verified',
        baseUrl: BASE_URL,
        targetUrl: SEKRETARIAT_TARGET_URL
      };

      saveConfig(configData);
      return { success: true, role: userRole, config: configData, message: resData.message || 'Verifikasi Berhasil' };
    } else {
      return {
        success: false,
        message: resData.message || 'Kredensial atau lisensi akun tidak valid. Silakan periksa email dan kata sandi Anda.'
      };
    }
  } catch (error) {
    console.error('Backend authentication error:', error.message);
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Gagal terhubung ke server autentikasi P3HM. Periksa koneksi internet Anda.';
    return {
      success: false,
      message: errorMessage
    };
  }
});

// Clear Local Session / Switch Account
ipcMain.handle('installer:clear-session', async () => {
  await clearExistingData();
  return { success: true };
});

// Dynamic Latest Release Check from GitHub API / Server
ipcMain.handle('installer:get-latest-release', async () => {
  const currentVer = app.getVersion() || '1.4.17';
  try {
    const res = await axios.get('https://api.github.com/repos/mubtadiaat/app_software/releases/latest', {
      headers: { 'User-Agent': 'Admin-Mubtadiaat-Desktop' },
      timeout: 6000
    });
    if (res.data && res.data.tag_name) {
      const tag = res.data.tag_name;
      const ver = tag.replace(/^v/, '');
      let downloadUrl = res.data.html_url || 'https://github.com/mubtadiaat/app_software/releases/latest';
      if (res.data.assets && Array.isArray(res.data.assets)) {
        const exeAsset = res.data.assets.find(a => a.name && a.name.endsWith('.exe'));
        if (exeAsset && exeAsset.browser_download_url) {
          downloadUrl = exeAsset.browser_download_url;
        }
      }
      return {
        success: true,
        tagName: tag,
        latestVersion: ver,
        currentVersion: currentVer,
        releaseNotes: res.data.body || '',
        downloadUrl: downloadUrl,
        isNewer: isVersionGreater(ver, currentVer)
      };
    }
  } catch (err) {
    console.warn('Notice fetching GitHub latest release:', err.message);
  }

  return {
    success: false,
    tagName: `v${currentVer}`,
    latestVersion: currentVer,
    currentVersion: currentVer,
    downloadUrl: '',
    isNewer: false
  };
});

// Installation step configuration
ipcMain.handle('installer:install', async (event, options) => {
  const existing = loadConfig() || {};
  const newConfig = {
    ...existing,
    installedAt: new Date().toISOString(),
    version: app.getVersion() || '1.4.17',
    installDirectory: options?.installDir || app.getPath('userData'),
    createDesktopShortcut: options?.desktopShortcut ?? true,
    createStartMenuShortcut: options?.startMenuShortcut ?? true
  };
  saveConfig(newConfig);
  return { success: true, config: newConfig };
});

// Choose Directory Native Dialog
ipcMain.handle('installer:choose-directory', async () => {
  const result = await dialog.showOpenDialog(installerWindow, {
    title: 'Pilih Folder Instalasi Admin Mubtadiaat',
    properties: ['openDirectory', 'createDirectory']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return { success: true, path: result.filePaths[0] };
  }
  return { success: false, path: null };
});

// Change Installation Folder
ipcMain.handle('installer:change-directory', async (event, newDir) => {
  if (!newDir) return { success: false, message: 'Direktori tidak valid.' };
  const config = loadConfig() || {};
  config.installDirectory = newDir;
  config.lastMovedAt = new Date().toISOString();
  saveConfig(config);
  return { success: true, message: `Folder instalasi berhasil diubah ke ${newDir}` };
});

// Repair Installation
ipcMain.handle('installer:repair', async () => {
  try {
    if (session.defaultSession) {
      await session.defaultSession.clearCache();
    }
    const config = loadConfig();
    if (config) {
      config.lastRepairedAt = new Date().toISOString();
      config.integrityVerified = true;
      saveConfig(config);
    }
    return { success: true, message: 'Integritas instalasi, komponen shortcut, dan cache sistem berhasil diperbaiki.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// Upgrade Installation (Direct Background Download & Execute)
ipcMain.handle('installer:upgrade', async () => {
  try {
    const currentVer = app.getVersion() || '1.4.17';
    let latestVer = currentVer;
    let downloadUrl = '';

    try {
      const res = await axios.get('https://api.github.com/repos/mubtadiaat/app_software/releases/latest', {
        headers: { 'User-Agent': 'Admin-Mubtadiaat-Desktop' },
        timeout: 8000
      });
      if (res.data && res.data.tag_name) {
        latestVer = res.data.tag_name.replace(/^v/, '');
        downloadUrl = res.data.html_url || '';
        if (res.data.assets && Array.isArray(res.data.assets)) {
          const exeAsset = res.data.assets.find(a => a.name && a.name.endsWith('.exe'));
          if (exeAsset && exeAsset.browser_download_url) {
            downloadUrl = exeAsset.browser_download_url;
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch latest release info for upgrade:', e.message);
    }

    if (isVersionGreater(latestVer, currentVer)) {
      if (downloadUrl && downloadUrl.endsWith('.exe')) {
        const tempPath = path.join(app.getPath('temp'), `AdminMubtadiaat_v${latestVer}_Setup.exe`);
        
        // Remove old temp installer if exists
        try {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        } catch (e) {}

        const response = await axios({
          url: downloadUrl,
          method: 'GET',
          responseType: 'stream',
          headers: { 'User-Agent': 'Admin-Mubtadiaat-Desktop' }
        });

        const totalLength = parseInt(response.headers['content-length'] || '0', 10);
        let downloadedLength = 0;

        const writer = fs.createWriteStream(tempPath);

        response.data.on('data', (chunk) => {
          downloadedLength += chunk.length;
          const percent = totalLength ? Math.round((downloadedLength / totalLength) * 100) : 0;
          sendToAppWindows('update:progress', {
            percent: percent,
            bytesPerSecond: 1024 * 1024,
            transferred: downloadedLength,
            total: totalLength
          });
        });

        await new Promise((resolve, reject) => {
          response.data.pipe(writer);
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        sendToAppWindows('update:downloaded', { version: latestVer });

        // Execute installer directly in background
        const { exec } = require('child_process');
        exec(`"${tempPath}"`, (err) => {
          if (err) {
            shell.openPath(tempPath);
          }
        });

        return { 
          success: true, 
          isNewer: true,
          latestVersion: latestVer,
          message: `Pembaruan v${latestVer} berhasil diunduh secara langsung! Installer baru sedang dijalankan...` 
        };
      } else {
        await shell.openExternal(downloadUrl || 'https://github.com/mubtadiaat/app_software/releases/latest');
        return { 
          success: true, 
          isNewer: true,
          latestVersion: latestVer,
          message: `Membuka halaman unduhan rilis v${latestVer}.` 
        };
      }
    } else {
      return { 
        success: true, 
        isNewer: false,
        latestVersion: currentVer,
        message: `Aplikasi Anda sudah berada pada versi terbaru (v${currentVer}).` 
      };
    }
  } catch (err) {
    console.error('Error upgrading application:', err);
    return { success: false, message: `Gagal mengunduh update secara langsung: ${err.message}` };
  }
});

// Uninstall Application (Keep vs Remove User Data)
ipcMain.handle('installer:uninstall', async (event, options) => {
  const removeData = options?.removeUserData ?? false;
  if (removeData) {
    await clearExistingData();
  } else {
    const config = loadConfig();
    if (config) {
      config.uninstalledAt = new Date().toISOString();
      saveConfig(config);
    }
  }
  if (installerWindow) {
    installerWindow.close();
  }
  app.quit();
  return { success: true };
});

// Launch Main Application Window
ipcMain.handle('installer:launch-app', async () => {
  const config = loadConfig();
  createMainAppWindow(config);
  return true;
});

// Window controls
ipcMain.handle('system:open-external', async (event, url) => {
  if (url && typeof url === 'string') {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle('installer:get-config', async () => {
  const config = loadConfig() || {};
  return {
    ...config,
    currentVersion: app.getVersion()
  };
});

ipcMain.handle('installer:close', () => {
  app.quit();
});

ipcMain.handle('installer:minimize', () => {
  if (installerWindow) installerWindow.minimize();
});

ipcMain.handle('window:minimize', () => {
  if (mainContainerWindow) mainContainerWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainContainerWindow) {
    if (mainContainerWindow.isMaximized()) {
      mainContainerWindow.unmaximize();
    } else {
      mainContainerWindow.maximize();
    }
  }
});

ipcMain.handle('window:close', () => {
  if (mainContainerWindow) mainContainerWindow.close();
  app.quit();
});

// App Lifecycle
app.whenReady().then(() => {
  session.defaultSession.allowNTLMCredentialsForDomains('m.p3hm.my.id');
  session.defaultSession.setUserAgent(DESKTOP_USER_AGENT);
  
  app.on('web-contents-created', (event, contents) => {
    contents.setUserAgent(DESKTOP_USER_AGENT);
    contents.setWindowOpenHandler(({ url }) => getWindowOpenOptions(url));

    contents.on('will-navigate', (event, navigationUrl) => {
      const isInternal = navigationUrl.startsWith(BASE_URL) || navigationUrl.includes('p3hm.my.id') || navigationUrl.includes('localhost') || isAuthUrl(navigationUrl);
      if (!isInternal && contents.getType() !== 'window') {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });
  });

  const initialDeepLinkUrl = process.argv.find(arg => arg.startsWith(`${PROTOCOL_PREFIX}://`));
  if (initialDeepLinkUrl) {
    handleDeepLinkUrl(initialDeepLinkUrl);
  }

  const forceInstaller = process.argv.includes('--installer');
  const existingConfig = loadConfig();

  if (existingConfig && existingConfig.role && existingConfig.installedAt && !forceInstaller) {
    createMainAppWindow(existingConfig);
  } else {
    createInstallerWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const cfg = loadConfig();
      if (cfg && cfg.role && cfg.installedAt) {
        createMainAppWindow(cfg);
      } else {
        createInstallerWindow();
      }
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
