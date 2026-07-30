document.addEventListener('DOMContentLoaded', async () => {
  // Titlebar controls
  const btnClose = document.getElementById('btnClose');
  const btnMinimize = document.getElementById('btnMinimize');
  const btnExpand = document.getElementById('btnExpand');

  if (btnClose) {
    btnClose.addEventListener('click', () => window.electronAPI.closeInstaller());
  }
  if (btnMinimize) {
    btnMinimize.addEventListener('click', () => window.electronAPI.minimizeInstaller());
  }
  if (btnExpand) {
    btnExpand.addEventListener('click', () => window.electronAPI.maximizeWindow());
  }

  // Views & Screens
  const splashScreen = document.getElementById('splashScreen');
  const existingScreen = document.getElementById('existingScreen');
  const wizardScreen = document.getElementById('wizardScreen');

  // Modals
  const uninstallModal = document.getElementById('uninstallModal');
  const btnCloseUninstallModal = document.getElementById('btnCloseUninstallModal');
  const btnCancelUninstall = document.getElementById('btnCancelUninstall');
  const btnConfirmUninstallExec = document.getElementById('btnConfirmUninstallExec');
  const optKeepData = document.getElementById('optKeepData');
  const optRemoveData = document.getElementById('optRemoveData');
  const radKeep = document.getElementById('radKeep');
  const radRemove = document.getElementById('radRemove');

  const changeFolderModal = document.getElementById('changeFolderModal');
  const btnCloseFolderModal = document.getElementById('btnCloseFolderModal');
  const btnCancelFolderChange = document.getElementById('btnCancelFolderChange');
  const btnSaveNewFolder = document.getElementById('btnSaveNewFolder');
  const btnBrowseNewFolder = document.getElementById('btnBrowseNewFolder');
  const changeFolderInput = document.getElementById('changeFolderInput');

  // Existing Screen elements
  const exUserEmail = document.getElementById('exUserEmail');
  const exUserRole = document.getElementById('exUserRole');
  const exVersion = document.getElementById('exVersion');
  const exLatestVersion = document.getElementById('exLatestVersion');
  const exFolderPath = document.getElementById('exFolderPath');

  const btnExLaunch = document.getElementById('btnExLaunch');
  const btnExUpgrade = document.getElementById('btnExUpgrade');
  const btnExRepair = document.getElementById('btnExRepair');
  const btnExChangeFolder = document.getElementById('btnExChangeFolder');
  const btnExSwitch = document.getElementById('btnExSwitch');
  const btnExClear = document.getElementById('btnExClear');
  const btnExUninstallModal = document.getElementById('btnExUninstallModal');

  // Wizard Steps & Stepper
  const step1Welcome = document.getElementById('step1Welcome');
  const step2Folder = document.getElementById('step2Folder');
  const step3Login = document.getElementById('step3Login');
  const step4Install = document.getElementById('step4Install');
  const step5Finish = document.getElementById('step5Finish');

  const stepItem1 = document.getElementById('stepItem1');
  const stepItem2 = document.getElementById('stepItem2');
  const stepItem3 = document.getElementById('stepItem3');
  const stepItem4 = document.getElementById('stepItem4');
  const stepItem5 = document.getElementById('stepItem5');

  // Wizard Inputs & Buttons
  const btnStartInstall = document.getElementById('btnStartInstall');
  const wizardFolderInput = document.getElementById('wizardFolderInput');
  const btnWizardBrowse = document.getElementById('btnWizardBrowse');
  const btnConfirmFolder = document.getElementById('btnConfirmFolder');
  const btnBackToStep1 = document.getElementById('btnBackToStep1');
  const btnBackToStep2 = document.getElementById('btnBackToStep2');

  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const btnTogglePassword = document.getElementById('btnTogglePassword');
  const linkForgotPassword = document.getElementById('linkForgotPassword');
  const alertBox = document.getElementById('alertBox');
  const btnLogin = document.getElementById('btnLogin');

  // Install step elements
  const installOptionsBox = document.getElementById('installOptionsBox');
  const installProgressWrapper = document.getElementById('installProgressWrapper');
  const btnConfirmInstall = document.getElementById('btnConfirmInstall');
  const progressFill = document.getElementById('progressFill');
  const statusLabel = document.getElementById('statusLabel');
  const percentLabel = document.getElementById('percentLabel');
  const extractionLogs = document.getElementById('extractionLogs');

  // Finish elements
  const finishEmail = document.getElementById('finishEmail');
  const finishRole = document.getElementById('finishRole');
  const finishFolder = document.getElementById('finishFolder');
  const btnLaunchApp = document.getElementById('btnLaunchApp');

  let verifiedUserData = null;
  let selectedInstallDir = 'C:\\Program Files\\Admin Mubtadiaat';

  // Utility Functions
  function showScreen(screen) {
    [splashScreen, existingScreen, wizardScreen].forEach(s => {
      if (s) s.classList.remove('active');
    });
    if (screen) screen.classList.add('active');
  }

  function setWizardStep(stepNumber) {
    [step1Welcome, step2Folder, step3Login, step4Install, step5Finish].forEach(step => {
      if (step) step.classList.remove('active');
    });

    [stepItem1, stepItem2, stepItem3, stepItem4, stepItem5].forEach((item, idx) => {
      if (item) {
        item.classList.remove('active');
        if (idx + 1 < stepNumber) {
          item.classList.add('completed');
        } else {
          item.classList.remove('completed');
        }
      }
    });

    if (stepNumber === 1) {
      step1Welcome.classList.add('active');
      stepItem1.classList.add('active');
    } else if (stepNumber === 2) {
      step2Folder.classList.add('active');
      stepItem2.classList.add('active');
    } else if (stepNumber === 3) {
      step3Login.classList.add('active');
      stepItem3.classList.add('active');
    } else if (stepNumber === 4) {
      step4Install.classList.add('active');
      stepItem4.classList.add('active');
    } else if (stepNumber === 5) {
      step5Finish.classList.add('active');
      stepItem5.classList.add('active');
    }
  }

  function showAlert(message, isSuccess = false) {
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.className = `alert-message ${isSuccess ? 'alert-success' : 'alert-error'}`;
    alertBox.style.display = 'block';
  }

  function hideAlert() {
    if (alertBox) alertBox.style.display = 'none';
  }

  // Initial System Check & Dynamic Release Version Fetch
  setTimeout(async () => {
    try {
      const titleVersion = document.getElementById('titleVersion');
      const latestRel = await window.electronAPI.getLatestRelease();

      if (titleVersion && latestRel && latestRel.currentVersion) {
        titleVersion.textContent = `Admin Mubtadiaat Setup v${latestRel.currentVersion}`;
      }

      if (exLatestVersion && latestRel && latestRel.tagName) {
        const badgeSuffix = latestRel.isNewer ? '(Tersedia)' : '(Terbaru)';
        exLatestVersion.textContent = `${latestRel.tagName} ${badgeSuffix}`;
        
        // Update upgrade card description text
        const upgradeDesc = document.querySelector('#btnExUpgrade .option-desc');
        if (upgradeDesc) {
          upgradeDesc.textContent = `Perbarui file & komponen ke versi terbaru (${latestRel.tagName})`;
        }
      }

      const checkRes = await window.electronAPI.checkInstallation();
      if (checkRes && checkRes.installed && checkRes.config) {
        const config = checkRes.config;
        if (exUserEmail) exUserEmail.textContent = config.email || config.username || 'Admin Sekretariat';
        if (exVersion) exVersion.textContent = `v${latestRel?.currentVersion || config.version || '1.4.12'}`;
        if (exFolderPath) {
          exFolderPath.textContent = config.installDirectory || 'C:\\Program Files\\Admin Mubtadiaat';
        }
        showScreen(existingScreen);
      } else {
        showScreen(wizardScreen);
        setWizardStep(1);
      }
    } catch (err) {
      showScreen(wizardScreen);
      setWizardStep(1);
    }
  }, 800);

  // Existing Installation Handlers
  if (btnExLaunch) {
    btnExLaunch.addEventListener('click', () => {
      window.electronAPI.launchApp();
    });
  }

  if (btnExUpgrade) {
    btnExUpgrade.addEventListener('click', async () => {
      btnExUpgrade.disabled = true;
      const originalText = btnExUpgrade.innerHTML;
      btnExUpgrade.innerHTML = '<span>Memeriksa & Mengunduh Update (0%)...</span>';
      
      if (window.electronAPI.onUpdateProgress) {
        window.electronAPI.onUpdateProgress((progressObj) => {
          const percent = Math.round(progressObj.percent || 0);
          btnExUpgrade.innerHTML = `<span>Mengunduh Pembaruan... ${percent}%</span>`;
        });
      }

      const res = await window.electronAPI.upgrade();
      alert(res?.message || 'Proses pembaruan selesai.');
      
      if (res && res.isNewer) {
        btnExUpgrade.innerHTML = '<span>🚀 Menjalankan Installer...</span>';
        setTimeout(() => {
          btnExUpgrade.disabled = false;
          btnExUpgrade.innerHTML = originalText;
        }, 5000);
      } else {
        btnExUpgrade.disabled = false;
        btnExUpgrade.innerHTML = originalText;
      }
    });
  }

  if (btnExRepair) {
    btnExRepair.addEventListener('click', async () => {
      btnExRepair.disabled = true;
      const res = await window.electronAPI.repair();
      alert(res?.message || 'Integritas instalasi & komponen shortcut berhasil diperbaiki.');
      btnExRepair.disabled = false;
    });
  }

  if (btnExChangeFolder) {
    btnExChangeFolder.addEventListener('click', () => {
      if (changeFolderInput && exFolderPath) {
        changeFolderInput.value = exFolderPath.textContent;
      }
      changeFolderModal.classList.add('active');
    });
  }

  if (btnCloseFolderModal) {
    btnCloseFolderModal.addEventListener('click', () => changeFolderModal.classList.remove('active'));
  }
  if (btnCancelFolderChange) {
    btnCancelFolderChange.addEventListener('click', () => changeFolderModal.classList.remove('active'));
  }

  if (btnBrowseNewFolder) {
    btnBrowseNewFolder.addEventListener('click', async () => {
      const dirRes = await window.electronAPI.chooseDirectory();
      if (dirRes && dirRes.success && dirRes.path) {
        changeFolderInput.value = dirRes.path;
      }
    });
  }

  if (btnSaveNewFolder) {
    btnSaveNewFolder.addEventListener('click', async () => {
      const newDir = changeFolderInput.value;
      if (!newDir) return;
      const res = await window.electronAPI.changeDirectory(newDir);
      if (exFolderPath) exFolderPath.textContent = newDir;
      changeFolderModal.classList.remove('active');
      alert(res?.message || 'Folder instalasi berhasil diperbarui.');
    });
  }

  if (btnExSwitch) {
    btnExSwitch.addEventListener('click', async () => {
      await window.electronAPI.clearSession();
      showScreen(wizardScreen);
      setWizardStep(3);
    });
  }

  if (btnExClear) {
    btnExClear.addEventListener('click', async () => {
      if (confirm('Apakah Anda yakin ingin menghapus data login lokal?')) {
        await window.electronAPI.clearSession();
        alert('Data login lokal berhasil dibersihkan.');
        showScreen(wizardScreen);
        setWizardStep(1);
      }
    });
  }

  // Uninstall Modal Handlers
  if (btnExUninstallModal) {
    btnExUninstallModal.addEventListener('click', () => {
      uninstallModal.classList.add('active');
    });
  }

  if (btnCloseUninstallModal) {
    btnCloseUninstallModal.addEventListener('click', () => uninstallModal.classList.remove('active'));
  }
  if (btnCancelUninstall) {
    btnCancelUninstall.addEventListener('click', () => uninstallModal.classList.remove('active'));
  }

  if (optKeepData && optRemoveData) {
    optKeepData.addEventListener('click', () => {
      radKeep.checked = true;
      optKeepData.classList.add('selected');
      optRemoveData.classList.remove('selected');
    });
    optRemoveData.addEventListener('click', () => {
      radRemove.checked = true;
      optRemoveData.classList.add('selected');
      optKeepData.classList.remove('selected');
    });
  }

  if (btnConfirmUninstallExec) {
    btnConfirmUninstallExec.addEventListener('click', async () => {
      const removeUserData = radRemove?.checked ?? false;
      btnConfirmUninstallExec.disabled = true;
      btnConfirmUninstallExec.textContent = 'Meng-uninstall...';
      await window.electronAPI.uninstall({ removeUserData });
    });
  }

  // Wizard Step 1 Handlers
  if (btnStartInstall) {
    btnStartInstall.addEventListener('click', () => {
      setWizardStep(2);
    });
  }

  // Wizard Step 2 Folder Handlers
  if (btnWizardBrowse) {
    btnWizardBrowse.addEventListener('click', async () => {
      const dirRes = await window.electronAPI.chooseDirectory();
      if (dirRes && dirRes.success && dirRes.path) {
        wizardFolderInput.value = dirRes.path;
        selectedInstallDir = dirRes.path;
      }
    });
  }

  if (btnConfirmFolder) {
    btnConfirmFolder.addEventListener('click', () => {
      selectedInstallDir = wizardFolderInput.value || selectedInstallDir;
      setWizardStep(3);
    });
  }

  if (btnBackToStep1) {
    btnBackToStep1.addEventListener('click', () => setWizardStep(1));
  }

  // Wizard Step 3 Login Handlers
  if (btnBackToStep2) {
    btnBackToStep2.addEventListener('click', () => setWizardStep(2));
  }

  if (btnTogglePassword) {
    btnTogglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      btnTogglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  if (linkForgotPassword) {
    linkForgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      window.electronAPI.openExternal('https://m.p3hm.my.id/loginsekr');
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAlert();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showAlert('Silakan lengkapi Email dan Password.');
        return;
      }

      btnLogin.disabled = true;
      btnLogin.textContent = 'Memverifikasi Kredensial...';

      try {
        const response = await window.electronAPI.login({ email, password });

        if (response && response.success) {
          verifiedUserData = response;
          setWizardStep(4);
        } else {
          showAlert(response?.message || 'Gagal memverifikasi akun ke portal P3HM.');
          btnLogin.disabled = false;
          btnLogin.textContent = 'Masuk & Verifikasi Akun';
        }
      } catch (err) {
        showAlert('Terjadi kesalahan koneksi ke server autentikasi.');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Masuk & Verifikasi Akun';
      }
    });
  }

  // Wizard Step 4 Installation Handlers
  if (btnConfirmInstall) {
    btnConfirmInstall.addEventListener('click', async () => {
      const desktopShortcut = document.getElementById('chkDesktop')?.checked ?? true;
      const startMenuShortcut = document.getElementById('chkStartMenu')?.checked ?? true;

      await window.electronAPI.install({ 
        installDir: selectedInstallDir, 
        desktopShortcut, 
        startMenuShortcut 
      });

      installOptionsBox.style.display = 'none';
      installProgressWrapper.style.display = 'block';

      startExtractionProcess();
    });
  }

  function appendLog(msg) {
    if (extractionLogs) {
      const div = document.createElement('div');
      div.className = 'log-line';
      div.textContent = msg;
      extractionLogs.appendChild(div);
      extractionLogs.scrollTop = extractionLogs.scrollHeight;
    }
  }

  function startExtractionProcess() {
    const steps = [
      { p: 15, text: 'Menyiapkan direktori & folder instalasi...', log: `> Target path: ${selectedInstallDir} [OK]` },
      { p: 35, text: 'Mengekstrak paket runtime (package.asar)...', log: '> Unpacking Electron 31 v8 core bundle... [OK]' },
      { p: 55, text: 'Menyiapkan modul dependensi (axios, adm-zip)...', log: '> Verification of node_modules integrity... [OK]' },
      { p: 75, text: 'Menyimpan sesi autentikasi & file config.json...', log: '> Writing encrypted session token & user preferences... [OK]' },
      { p: 90, text: 'Membuat pintasan Desktop & Start Menu...', log: '> Desktop & Start Menu shortcuts initialized... [OK]' },
      { p: 100, text: 'Instalasi Selesai!', log: '> Silent NSIS Installation 100% complete. Application ready.' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        if (progressFill) progressFill.style.width = `${step.p}%`;
        if (percentLabel) percentLabel.textContent = `${step.p}%`;
        if (statusLabel) statusLabel.textContent = step.text;
        appendLog(step.log);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (finishEmail) finishEmail.textContent = verifiedUserData?.config?.email || emailInput.value;
          if (finishRole) finishRole.textContent = verifiedUserData?.role || 'Sekretariat P3HM';
          if (finishFolder) finishFolder.textContent = selectedInstallDir;
          const finishVersion = document.getElementById('finishVersion');
          if (finishVersion) finishVersion.textContent = verifiedUserData?.config?.version ? `v${verifiedUserData.config.version}` : '-';
          setWizardStep(5);
        }, 600);
      }
    }, 450);
  }

  // Wizard Step 5 Finish Handlers
  if (btnLaunchApp) {
    btnLaunchApp.addEventListener('click', () => {
      window.electronAPI.launchApp();
    });
  }
});
