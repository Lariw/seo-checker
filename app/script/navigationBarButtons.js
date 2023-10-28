const { ipcRenderer } = require("electron");

const ipc = ipcRenderer;

const exitButton = document.querySelector(".js-exitButton");
const minimizeButton = document.querySelector(".js-minimizeButton");
const maximizeButton = document.querySelector(".js-maximizeButton");

exitButton.addEventListener("click", () => {
  ipc.send("closeApp");
});

minimizeButton.addEventListener("click", () => {
  ipc.send("minimizeApp");
});

maximizeButton.addEventListener("click", () => {
  ipc.send("maximizeRestoreApp");
});
