(() => {
  const showLighthouseSection = document.querySelector(
    ".js-lighthouseSectionButton"
  );
  const showFireSection = document.querySelector(".js-fireSectionButton");
  const showSpiderSection = document.querySelector(".js-spiderSectionButton");
  const showSettingsSection = document.querySelector(
    ".js-settingsSectionButton"
  );

  const lighthouseSection = document.querySelector(".js-section-1");
  const fireSection = document.querySelector(".js-section-2");
  const spiderSection = document.querySelector(".js-section-3");
  const settingsSection = document.querySelector(".js-section-4");

  const lightStyleCurrentSection = () => {
    const tab = [
      showLighthouseSection,
      showFireSection,
      showSpiderSection,
      showSettingsSection,
    ];

    for (activeTab of tab) {
      if (activeTab.classList.contains("sections__currentSection")) {
        activeTab.classList.remove("sections__currentSection");
      }
    }
  };

  const displaySection = (section) => {
    const tab = [
      lighthouseSection,
      fireSection,
      spiderSection,
      settingsSection,
    ];

    for (hideSection of tab) {
      hideSection.style.display = "none";
    }

    section.style.display = "block";
  };

  showLighthouseSection.addEventListener("click", () => {
    lightStyleCurrentSection();
    showLighthouseSection.classList.add("sections__currentSection");
    displaySection(lighthouseSection);
  });

  showFireSection.addEventListener("click", () => {
    lightStyleCurrentSection();
    showFireSection.classList.add("sections__currentSection");
    displaySection(fireSection);
  });

  showSpiderSection.addEventListener("click", () => {
    lightStyleCurrentSection();
    showSpiderSection.classList.add("sections__currentSection");
    displaySection(spiderSection);
  });

  showSettingsSection.addEventListener("click", () => {
    lightStyleCurrentSection();
    showSettingsSection.classList.add("sections__currentSection");
    displaySection(settingsSection);
  });
})();
