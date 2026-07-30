!macro customUnInstall
  DetailPrint "Menghapus seluruh berkas konfigurasi, cache, dan data aplikasi Admin Mubtadiaat..."
  RMDir /r "$APPDATA\admin-mubtadiaat-desktop"
  RMDir /r "$LOCALAPPDATA\admin-mubtadiaat-desktop"
  RMDir /r "$LOCALAPPDATA\admin-mubtadiaat-desktop-updater"
  DeleteRegKey HKCU "Software\Classes\mphm"
  DeleteRegKey HKCU "Software\admin-mubtadiaat-desktop"
  DeleteRegKey HKLM "Software\admin-mubtadiaat-desktop"
!macroend
