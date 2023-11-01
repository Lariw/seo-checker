const fsP = require("fs/promises");
const lighthouse = require("lighthouse");
const util = require("util");
const fs = require("fs");

const seoValue = document.querySelector(".js-seoValue");
const performanceValue = document.querySelector(".js-performanceValue");
const bestPracticesValue = document.querySelector(".js-bestPracticesValue");
const accessbilityValue = document.querySelector(".js-accessbilityValue");
const pwaValue = document.querySelector(".js-pwaValue");
const lighthouseStartBtn = document.querySelector(".js-lighthouseStartBtn");
const lighthouseRadioOutputHTML = document.querySelector(
  ".js-lighthouse-outputHTML"
);
const lighthouseRadioOutputCSV = document.querySelector(
  ".js-lighthouse-outputCSV"
);
const lighthouseFileName = document.querySelector(".js-lighthouse__fileName");

lighthouseStartBtn.addEventListener("click", () => {
  let lighthouseElements = {
    seoValue: seoValue.checked,
    performanceValue: performanceValue.checked,
    bestPracticesValue: bestPracticesValue.checked,
    accessbilityValue: accessbilityValue.checked,
    pwaValue: pwaValue.checked,
    lighthouseFileName: lighthouseFileName.value,
    lighthouseRadioOutputHTML: lighthouseRadioOutputHTML.checked,
    lighthouseRadioOutputCSV: lighthouseRadioOutputCSV.checked,
  };

  lighthouseTool(lighthouseElements);
});

function formatUrlForFileName(url) {
  return url
    .replace(/^(https?:\/\/)/, "")
    .replace(/:/g, "")
    .replace(/[<>:"\/\\|?*]/g, "_");
}

async function lighthouseTool(lighthouseElements) {
  try {
    const saveFileName = "Lighthouse-Reports";

    let testsFolderName = lighthouseElements.lighthouseFileName;

    fsP
      .mkdir(saveFileName, { recursive: true })
      .then(() => {
        return fsP.mkdir(`${saveFileName}/${testsFolderName}`);
      })
      .then(() => {})
      .catch((err) => {});

    let arrayCattegory = [];
    let arrayOutput = [];

    if (lighthouseElements.lighthouseRadioOutputHTML) {
      arrayOutput.push("html");
    }
    if (lighthouseElements.lighthouseRadioOutputCSV) {
      arrayOutput.push("csv");
    }

    if (lighthouseElements.seoValue) {
      arrayCattegory.push("seo");
    }
    if (lighthouseElements.performanceValue) {
      arrayCattegory.push("performance");
    }
    if (lighthouseElements.bestPracticesValue) {
      arrayCattegory.push("best-practices");
    }
    if (lighthouseElements.accessbilityValue) {
      arrayCattegory.push("accessibility");
    }
    if (lighthouseElements.pwaValue) {
      arrayCattegory.push("pwa");
    }

    const writeHtmlFile = util.promisify(fs.writeFile);
    const writeCsvFile = util.promisify(fs.writeFile);

    let urlsToTest = getListOfUrls();

    for (const url of urlsToTest) {
      const browser = await puppeteer.launch({
        executablePath: pathChromeBrowser,
        headless: getHeadless(),
      });

      const page = await browser.newPage();

      await page.goto(url);

      const options = {
        logLevel: "info",
        output: arrayOutput,
        onlyCategories: arrayCattegory,
        port: new URL(browser.wsEndpoint()).port,
        disableStorageReset: true,
      };

      const report = await lighthouse(url, options);

      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const formattedUrl = formatUrlForFileName(url);

      if (arrayOutput.includes("html")) {
        const htmlFileName = `${date}_${formattedUrl}.html`;
        await writeHtmlFile(
          saveFileName + "/" + testsFolderName + "/" + htmlFileName,
          report.report[0]
        );
      }
      if (arrayOutput.includes("csv")) {
        const csvFileName = `${date}_${formattedUrl}.csv`;
        await writeCsvFile(
          saveFileName + "/" + testsFolderName + "/" + csvFileName,
          report.report[1]
        );
      }

      await browser.close();

      await delay(getDelay());
    }
  } catch (err) {
    console.log(err);
  }
}
