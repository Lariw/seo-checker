const { app, BrowserWindow, ipcMain } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    minWidth: 1300,
    minHeight: 900,
    frame: false,
    icon: "icon\\icon.ico",
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile("app/index.html");
  ipcMain.on("closeApp", () => {
    if (win) {
      win.close();
    }
  });
  ipcMain.on("minimizeApp", () => {
    if (win) {
      win.minimize();
    }
  });
  ipcMain.on("maximizeRestoreApp", () => {
    if (win) {
      if (win.isMaximized()) {
        win.restore();
      } else {
        win.maximize();
      }
    }
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
