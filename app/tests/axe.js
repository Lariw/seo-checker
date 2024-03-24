const { AxePuppeteer } = require('@axe-core/puppeteer');
const axeStartBtn = document.querySelector('.js-axeStartBtn');
const { createHtmlReport } = require("axe-html-reporter");



axeStartBtn.addEventListener('click', () => {
    const axeReportFilename = document.querySelector('.js-axeFilename').value;
    const reportPath = path.join(axeReportsFile, axeReportFilename)

    axeCrawling(reportPath);
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


const axeCrawling = async (reportPath) => {

    const date = getCurrentDate();

    for (const url of getUrls()) {
        const browser = await puppeteer.launch({
            headless: getHeadless(),
        });

        const page = await browser.newPage();

        await page.goto(url);

        const prefixUrl = trimUrls(url);

        try {
            const results = await new AxePuppeteer(page)
                .withTags([
                    "wcag2a",
                    "wcag2aa",
                    "wcag21a",
                    "wcag21aa",
                    "wcag22aa",
                ])
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

            const fileName = `accessibility_report_${encodeURIComponent(
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
