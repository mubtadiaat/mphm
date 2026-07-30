const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkInstallation: () => ipcRenderer.invoke('installer:check-installation'),
  getLatestRelease: () => ipcRenderer.invoke('installer:get-latest-release'),
  login: (credentials) => ipcRenderer.invoke('installer:login', credentials),
  clearSession: () => ipcRenderer.invoke('installer:clear-session'),
  install: (options) => ipcRenderer.invoke('installer:install', options),
  chooseDirectory: () => ipcRenderer.invoke('installer:choose-directory'),
  changeDirectory: (newDir) => ipcRenderer.invoke('installer:change-directory', newDir),
  repair: () => ipcRenderer.invoke('installer:repair'),
  upgrade: () => ipcRenderer.invoke('installer:upgrade'),
  uninstall: (options) => ipcRenderer.invoke('installer:uninstall', options),
  launchApp: () => ipcRenderer.invoke('installer:launch-app'),
  getConfig: () => ipcRenderer.invoke('installer:get-config'),
  closeInstaller: () => ipcRenderer.invoke('installer:close'),
  minimizeInstaller: () => ipcRenderer.invoke('installer:minimize'),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  openExternal: (url) => ipcRenderer.invoke('system:open-external', url),
  onProgressUpdate: (callback) => ipcRenderer.on('installer:progress', (event, value) => callback(value)),
  onDeepLinkAuth: (callback) => ipcRenderer.on('auth:deep-link-callback', (event, data) => callback(data)),

  // Auto Updater APIs
  checkForUpdates: () => ipcRenderer.invoke('update:check'),
  startUpdateDownload: () => ipcRenderer.invoke('update:start-download'),
  quitAndInstallUpdate: () => ipcRenderer.invoke('update:quit-and-install'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update:available', (event, info) => callback(info)),
  onUpdateProgress: (callback) => ipcRenderer.on('update:progress', (event, progressObj) => callback(progressObj)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update:downloaded', (event, info) => callback(info)),
  onUpdateError: (callback) => ipcRenderer.on('update:error', (event, err) => callback(err))
});
