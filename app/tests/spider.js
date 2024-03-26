const puppeteer = require("puppeteer");

const spider = async () => {
  const urls = ["https://test.pl/", "https://www.wp.pl/"];

  for (const url of urls) {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: "",
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url);

    await crawlImages(page);
    await crawlLinks(page);
    await takeScreenshot(page, parseURL(url));
    await crawlSeoTags(page);

    await crawlHtags(page).then((correctStructure) => {
      if (correctStructure) {
        console.log("Heading structure is correct.");
      } else {
        console.log("Heading structure is incorrect.");
      }
    });

    await browser.close();
  }
};

spider();

const parseURL = (url) => {
  let parsedURL = url
    .replace(/^(https?:\/\/)?(www\.)?/i, "")
    .replace(/[\/.]/g, "-");

  if (parsedURL.endsWith("-")) {
    parsedURL = parsedURL.slice(0, -1);
  }

  return parsedURL;
};

const saveCSVFile = () => {};

const crawlImages = async (page) => {
  const imageCrawling = await page.evaluate(() => {
    const srcTab = [];
    const allImages = document.querySelectorAll("img");

    allImages.forEach((img) => {
      srcTab.push(img.src);
    });

    return srcTab;
  });

  console.log(imageCrawling);
};

const listenConsole = () => {};

const crawlLinks = async (page) => {
  const linksCrawling = await page.evaluate(() => {
    const internalLinksTab = [];
    const allHTMLElements = document.querySelectorAll("*");

    allHTMLElements.forEach((el) => {
      if (el.href) {
        internalLinksTab.push(el.href);
      }
    });

    return internalLinksTab;
  });

  console.log(linksCrawling);
};

const takeScreenshot = async (page, path) => {
  await page.screenshot({ path: `${path}.png`, fullPage: true });
};

const crawlSeoTags = async (page) => {
  const seoTags = await page.evaluate(() => {
    const metaTags = document.querySelectorAll("meta[name], meta[property]");
    const tab = [];
    metaTags.forEach((meta) => {
      let metaName = meta.name;

      if (metaName == "") {
        metaName = meta.attributes.property.textContent;
      }

      console.log(metaName);

      tab.push([metaName, meta.content]);
    });

    return tab;
  });

  console.log(seoTags);
};

const crawlHtags = async (page) => {
  try {
    const headings = await page.evaluate(() => {
      const allHeadings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
      const headingsText = [];

      allHeadings.forEach((heading) => {
        headingsText.push({
          level: parseInt(heading.tagName.charAt(1)),
          text: heading.innerText,
        });
      });

      return headingsText;
    });

    let correctStructure = true;
    let previousLevel = null;
    headings.forEach((heading) => {
      if (previousLevel !== null) {
        if (heading.level > previousLevel + 1) {
          correctStructure = false;
        }
      }
      previousLevel = heading.level;
    });

    return correctStructure;
  } catch (err) {
    console.error("Error:", error);
    await browser.close();
    return false;
  }
};
