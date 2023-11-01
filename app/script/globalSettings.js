const path = require("path");
const pathChromeBrowser = path.join(
  __dirname,
  "browsers",
  "chromium-1055",
  "chrome-win",
  "chrome.exe"
);
const pathFirefoxBrowser = path.join(
  __dirname,
  "browsers",
  "firefox-1424",
  "firefox",
  "firefox.exe"
);

const getDelay = () => {
  const delayInput = document.querySelector(".js-delayInput");
  return delayInput.value;
};

const getHeadless = () => {
  const headlessInput = document.querySelector(".js-headlessInput");
  return headlessInput.checked;
};

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const getListOfUrls = () => {
  const urlsListInput = document.querySelector(".js-listOfUrls").value;
  let lines = urlsListInput.split("\n");

  lines = lines.filter(function (lines) {
    return lines.trim() !== "";
  });

  return lines;
};
