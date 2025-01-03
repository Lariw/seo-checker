const { AxePuppeteer } = require('@axe-core/puppeteer');
const axeStartBtn = document.querySelector('.js-axeStartBtn');
const { createHtmlReport } = require("axe-html-reporter");

axeStartBtn.addEventListener('click', () => {
    const axeReportFilename = document.querySelector('.js-axeFilename').value;
    const reportPath = path.join(axeReportsFile, axeReportFilename);
    const axeInputs = document.querySelectorAll('.axe-input');

    if (!document.querySelector(".js-axeFilename").value) {
        checkInputs();
        return 0;
    }

    let checkedOptions = Array.from(axeInputs)
        .filter(input => input.checked)
        .map(input => input.getAttribute('name'));

    if (checkedOptions.length == 0) {
        checkForms();
        return 0;
    }
    try {
        axeCrawling(reportPath, checkedOptions)
            .then(() => {
                axeStartBtn.innerHTML = 'Check';
                axeStartBtn.classList.remove('btn-active');
            })

    } catch (e) {
        console.log(e);
        axeStartBtn.innerHTML = 'Check';
        axeStartBtn.classList.remove('btn-active');
    }
})

const trimUrls = (url) => {
    const prefix = "https://";
    return url.startsWith(prefix) ? url.substring(prefix.length) : url;
}

const createReportsFolder = (reportPath, fileName, reportHTML) => {

    if (!fs.existsSync(reportPath)) {
        fs.mkdirSync(reportPath);
    }

    fs.writeFileSync(path.join(reportPath, fileName), reportHTML, "utf-8");
}


const axeCrawling = async (reportPath, checkedOptions) => {

    let index = 0;

    let axeUrls = getUrls();

    for (const url of getUrls()) {
        const browser = await puppeteer.launch({
            headless: getHeadless(),
        });

        const page = await browser.newPage();

        index++;

        let changeStatusBar = (index / axeUrls.length) * 100;
        changeStatusBar = changeStatusBar.toFixed(0);

        await page.goto(url);

        const statusBarValue = document.querySelector('.js-statusBar__axe--value').innerText = changeStatusBar + "%";
        const barWidth = document.querySelector(".js-statusBar__axe").style.width = changeStatusBar + "%";

        const prefixUrl = trimUrls(url);

        try {
            const results = await new AxePuppeteer(page)
                .withTags(checkedOptions)
                .analyze();

            const reportHTML = createHtmlReport({
                results: results,
                options: {
                    projectKey: prefixUrl,
                    doNotCreateReportFile: true,
                    rules: {
                        "object-alt": { enabled: true },
                        "role-img-alt": { enabled: true },
                        "input-image-alt": { enabled: true },
                        "image-alt": { enabled: true },
                    },
                },
            });

            const fileName = `axe${getCurrentDate()}_report_${encodeURIComponent(
                prefixUrl
            )}.html`;

            createReportsFolder(reportPath, fileName, reportHTML);
            console.log(`Report for ${prefixUrl} has been saved to ${fileName}`);

        } catch (e) {
            console.log(e);
        }

        await browser.close();

    }

}
