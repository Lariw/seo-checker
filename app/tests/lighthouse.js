const puppeteer = require("puppeteer");
const lighthouse = require('lighthouse');
const path = require('path')
const util = require("util");
const fs = require("fs");

const lighthouseStartBtn = document.querySelector('.js-lighthouseStartBtn');
const saveFileName = "Lighthouse - Reports";

lighthouseStartBtn.addEventListener('click', () => {

  lighthouseStartBtn.innerHTML = 'In progress.. <div class="loadingCircle"></div>';
  lighthouseStartBtn.classList.add('btn-active');
  const lighthouseFileName = document.querySelector('.input-lighthouse').value;

  let lighthouseOptions = document.querySelectorAll('.lighthouse__input');

  let checkedOptions = Array.from(lighthouseOptions)
    .filter(input => input.checked)
    .map(input => input.getAttribute('name'));

  lighthouseCrawler(lighthouseFileName, checkedOptions);
})


const lighthouseCrawler = async (lighthouseFileName, checkedOptions) => {

  for (const url of getUrls()) {
    const browser = await puppeteer.launch({
      headless: getHeadless(),
    });

    const page = await browser.newPage();

    await page.goto(url);

    const options = {
      logLevel: "quiet",
      output: ['html', 'csv'],
      onlyCategories: checkedOptions,
      port: new URL(browser.wsEndpoint()).port,
      disableStorageReset: true,
    };

    const report = await lighthouse(url, options);

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

    if (!fs.existsSync(path.join(saveFileName, lighthouseFileName))) {
      fs.mkdirSync(path.join(saveFileName, lighthouseFileName));
    }

    const writeHtmlFile = util.promisify(fs.writeFile);
    const writeCsvFile = util.promisify(fs.writeFile);


    const htmlFileName = `${date}.html`;
    const csvFileName = `${date}.csv`;

    await writeHtmlFile(
      path.join(saveFileName, lighthouseFileName, htmlFileName), report.report[0]
    );

    await writeCsvFile(
      path.join(saveFileName, lighthouseFileName, csvFileName), report.report[1]
    );


    await browser.close();

  }

}
