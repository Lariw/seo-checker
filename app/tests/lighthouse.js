const puppeteer = require("puppeteer");
const lighthouse = require('lighthouse');
const path = require('path')
const util = require("util");
const fs = require("fs");

const lighthouseStartBtn = document.querySelector('.js-lighthouseStartBtn');
const saveFileName = "Lighthouse - Reports";

lighthouseStartBtn.addEventListener('click', () => {




  const lighthouseFileName = document.querySelector('.input-lighthouse').value;

  let lighthouseOptions = document.querySelectorAll('.lighthouse__input');


  let checkedOptions = Array.from(lighthouseOptions)
    .filter(input => input.checked)
    .map(input => input.getAttribute('name'));


    console.log(checkedOptions.length)

    if(checkedOptions.length == 0){
      checkForms();
      return 0;
    }


    if(!document.querySelector(".input-lighthouse").value){
      checkInputs();
      return 0;
    }

  try {
    lighthouseCrawler(lighthouseFileName, checkedOptions)
      .then(() => {
        lighthouseStartBtn.innerHTML = 'Test';
        lighthouseStartBtn.classList.remove('btn-active');
      })
  } catch (e) {
    console.log(e)
    lighthouseStartBtn.innerHTML = 'Test';
    lighthouseStartBtn.classList.remove('btn-active');
  }
})

const lighthouseCrawler = async (lighthouseFileName, checkedOptions) => {

  let index = 0;

  let lighthouseUrls = getUrls();


  for (const url of getUrls()) {
    const browser = await puppeteer.launch({
      headless: getHeadless(),
    });

    const page = await browser.newPage();

    index++;
    let changeStatusBar = (index / lighthouseUrls.length) * 100;
    changeStatusBar = changeStatusBar.toFixed(0);

    const statusBarValue = document.querySelector('.js-statusBar__lighthouse--value').innerText = changeStatusBar + "%";
    const barWidth = document.querySelector(".js-statusBar__lighthouse").style.width = changeStatusBar + "%";




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


    const htmlFileName = `${index}.html`;
    const csvFileName = `${index}.csv`;

    await writeHtmlFile(
      path.join(saveFileName, lighthouseFileName, htmlFileName), report.report[0]
    );

    await writeCsvFile(
      path.join(saveFileName, lighthouseFileName, csvFileName), report.report[1]
    );


    await browser.close();

  }

}
