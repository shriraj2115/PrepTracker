// PrepTracker desktop shell (Electron).
// Loads the same index.html/js/css as the browser version, but as a real desktop
// app with its own fixed local storage (Electron's per-app userData folder) —
// no more "did I open it the same way" ambiguity — plus native OS notifications
// and a system tray icon so reminders still fire while the window is minimized.

const { app, BrowserWindow, Tray, Menu, Notification, nativeImage, shell } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isQuitting = false;

// A tiny embedded PNG (target emoji) so we don't depend on an external icon file.
const TRAY_ICON_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA' +
  'BHNCSVQICAgIfAhkiAAAAF5JREFUOI1jYBgFo2AU0Beov/GfAR2wIGmYPEqAP3GAsQ' +
  'oYGRgY/mMBSNhgAxxgYGD4jw3QwjBMwHDCwAYYGRgYGDAZwEA1DAiswVCQrIGh4T82' +
  'wDAKRsEoGAWjAAcAAOafBihf1XPXAAAAAElFTkSuQmCC';

const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'PrepTracker',
    backgroundColor: '#0a0e1a',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      plugins: true // needed for the built-in Chromium PDF viewer (PYQ papers open inline)
    }
  });

  mainWindow.loadFile('index.html');

  // Resource links use target="_blank" — Electron doesn't open those anywhere by
  // default. Send them to the user's regular browser instead of a bare Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Minimize to tray instead of quitting, so reminders keep working in the background.
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

function createTray() {
  const icon = nativeImage.createFromDataURL(TRAY_ICON_DATA_URL);
  tray = new Tray(icon);
  tray.setToolTip('PrepTracker');

  const menu = Menu.buildFromTemplate([
    { label: 'Open PrepTracker', click: () => { mainWindow.show(); mainWindow.focus(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(menu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

app.on('window-all-closed', () => {
  // Keep running in the tray on Windows/Linux; on macOS the dock icon persists too.
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow.show();
});
