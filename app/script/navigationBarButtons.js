(() => {
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
})();

(() => {
  document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".sections_button");
    const sections = document.querySelectorAll("section");

    function hideAllSections() {
      sections.forEach((section) => (section.style.display = "none"));
    }

    function showSection(sectionToShow) {
      hideAllSections();
      sectionToShow.style.display = "flex";
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", function () {
        showSection(sections[index]);
      });
    });

    showSection(sections[0]);
  });
})();
