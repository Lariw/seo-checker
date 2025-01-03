const crawlerStartBtn = document.querySelector('.js-crawlerStartBtn');
crawlerStartBtn.addEventListener('click', async () => {
  const options = {
    font: document.querySelector(".jsFonts").checked,
    image: document.querySelector(".jsImages").checked,
    log: document.querySelector(".jsLogs").checked,
    link: document.querySelector(".jsLinks").checked,
    screenshot: document.querySelector(".jsScreenshot").checked,
    seoTag: document.querySelector(".jsSeo").checked,
    hTag: document.querySelector(".jsHtags").checked,
    titleDocument: document.querySelector(".js-FileNameSpider").value,
  };
  const checkedOptions = [
    options.font,
    options.image,
    options.log,
    options.link,
    options.screenshot,
    options.seoTag,
    options.hTag
  ];
  const isAnyOptionChecked = checkedOptions.some(option => option);
  if (!isAnyOptionChecked) {
    checkForms();
    return 0;
  }
  if (!options.titleDocument) {
    checkInputs();
    return 0;
  }
  await spider(options);
});


const spider = async (options) => {
  const urls = getUrls();
  const allResults = {
    headings: [],
    seoTags: [],
    consoleLogs: [],
    images: [],
    links: [],
    fonts: [],
  };

  let index = 0;

  for (const url of urls) {
    const browser = await puppeteer.launch({
      headless: getHeadless(),
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(url);

    const reportPath = `Spider - Reports/${options.titleDocument}`;
    createFolderIfNotExists(reportPath);

    if (options.hTag) {
      const headings = await crawlHeadings(page, url);
      allResults.headings.push(...headings);
    }

    if (options.seoTag) {
      const seoTags = await crawlSeoTags(page, url);
      allResults.seoTags.push(...seoTags);
    }

    if (options.log) {
      const logs = await crawlConsoleLogs(page, url);
      fs.writeFileSync(reportPath + "/console-logs.csv", logs, 'UTF-8');
    }

    if (options.image) {
      const images = await crawlImages(page, url);
      allResults.images.push(...images);
    }

    if (options.link) {
      const links = await crawlLinks(page, url);
      allResults.links.push(...links);
    }

    if (options.font) {
      const fonts = await crawlFonts(page, url);
      allResults.fonts.push(...fonts);
    }

    if (options.screenshot) {
      await takeScreenshots(page, `${reportPath}/screenshots/${parseURL(url)}`, url);
    }

    index++;

    let changeStatusBar = (index / urls.length) * 100;
    changeStatusBar = changeStatusBar.toFixed(0);

    const statusBarValue = document.querySelector('.js-statusBar__spider--value').innerText = changeStatusBar + "%";
    const barWidth = document.querySelector(".js-statusBar__spider").style.width = changeStatusBar + "%";

    await browser.close();
  }

  saveResultsToCsv(allResults, options.titleDocument);
};

const saveResultsToCsv = (results, titleDocument) => {
  const reportPath = `Spider - Reports/${titleDocument}`;

  if (results.headings.length) {
    saveToCsv(results.headings, `${reportPath}/headings_structure.csv`, ["Source", "H-Tag", "Text"]);
  }

  if (results.seoTags.length) {
    saveToCsv(results.seoTags, `${reportPath}/seo-tags.csv`, ["Source", "Title", "Meta Description", "Meta Keywords", "Canonical Link", "Open Graph Title", "Open Graph Description"]);
  }

  if (results.consoleLogs.length) {
    saveToCsv(results.consoleLogs, `${reportPath}/console-logs.csv`, ["Source", "Type", "Message"]);
  }

  if (results.images.length) {
    saveToCsv(results.images, `${reportPath}/images.csv`, ["Source", "Src", "Alt", "Width", "Height"]);
  }

  if (results.links.length) {
    saveToCsv(results.links, `${reportPath}/links.csv`, ["Source", "Href", "Text"]);
  }

  if (results.fonts.length) {
    saveToCsv(results.fonts, `${reportPath}/fonts.csv`, ["Source", "Element", "Font Family", "Font Size", "Font Weight", "Color"]);
  }
};

const parseURL = (url) => {
  let parsedURL = url
    .replace(/^(https?:\/\/)?(www\.)?/i, "")
    .replace(/[\/.]/g, "-");

  if (parsedURL.endsWith("-")) {
    parsedURL = parsedURL.slice(0, -1);
  }

  return parsedURL;
};

const createFolderIfNotExists = (folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const screenshotsPath = path.join(folderPath, "screenshots");
    if (!fs.existsSync(screenshotsPath)) {
      fs.mkdirSync(screenshotsPath);
    }
  } catch (err) {
    console.error(`Error creating folder: ${err.message}`);
  }
};

const saveToCsv = (data, filePath, headers) => {
  const folderPath = path.dirname(filePath);
  createFolderIfNotExists(folderPath);

  const csvContent = [headers.join(",")]
    .concat(
      data.map((row) => headers.map((header) => row[header.toLowerCase()] || "Brak").join(","))
    )
    .join("\n");

  fs.writeFileSync(filePath, csvContent, "utf-8");
};

const crawlHeadings = async (page, source) => {
  return await page.evaluate((source) => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((heading) => ({
        source,
        "h-tag": heading.tagName,
        text: heading.innerText.replace(/\s+/g, " ").replaceAll(",", "").replaceAll(";", "").trim(),
      }));
    return headings;
  }, source);
};

const crawlSeoTags = async (page, source) => {
  return await page.evaluate((source) => {
    const title = document.title || "Brak";
    const metaDescription = document.querySelector("meta[name='description']")?.content || "Brak";
    const metaKeywords = document.querySelector("meta[name='keywords']")?.content || "Brak";
    const canonicalLink = document.querySelector("link[rel='canonical']")?.href || "Brak";
    const ogTitle = document.querySelector("meta[property='og:title']")?.content || "Brak";
    const ogDescription = document.querySelector("meta[property='og:description']")?.content || "Brak";

    return [
      { source, title, "meta description": metaDescription, "meta keywords": metaKeywords, "canonical link": canonicalLink, "open graph title": ogTitle, "open graph description": ogDescription }
    ];
  }, source);
};

let allLogs = `SOURCE,MSG TYPE,MSG TEXT \n`;

const crawlConsoleLogs = async (page, source) => {


  page.on("console", (msg) => {
    allLogs += `${source},${msg.type()},${msg.text().trim().replace(/\s+/g, " ")}\n`;
  });
  return allLogs;
};


const crawlImages = async (page, source) => {
  return await page.evaluate((source) => {
    return Array.from(document.querySelectorAll("img")).map((img) => ({
      source,
      src: img.src.replaceAll(";", ":") || "Brak",
      alt: img.alt || "Brak",
      width: img.width || "Brak",
      height: img.height || "Brak",
    }));
  }, source);
};

const crawlLinks = async (page, source) => {
  return await page.evaluate((source) => {
    return Array.from(document.querySelectorAll("a[href]")).map((link) => ({
      source,
      href: link.href,
      text: link.innerText.trim().replaceAll(";", ":").replace(/\s+/g, " ") || "Brak",
    }));
  }, source);
};

const crawlFonts = async (page, source) => {
  return await page.evaluate((source) => {
    const elements = Array.from(document.querySelectorAll("*"));
    const fontData = [];

    elements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      fontData.push({
        source,
        element: el.tagName,
        "font family": computedStyle.fontFamily.replaceAll(",", " ") || "Brak",
        "font size": computedStyle.fontSize || "Brak",
        "font weight": computedStyle.fontWeight || "Brak",
        "color": computedStyle.color.replaceAll(",", "'") || "Brak",
      });
    });

    return fontData;
  }, source);
};

const takeScreenshots = async (page, path, url) => {
  const resolutions = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1920, height: 1080 }
  ];

  for (const resolution of resolutions) {
    try {
      await page.setViewport({ width: resolution.width, height: resolution.height });
      await page.goto(url, { waitUntil: "networkidle2" });
      await page.screenshot({
        path: `${path}-${resolution.name}.png`,
        fullPage: true,
      });
    } catch (err) {
      console.error(`Error taking screenshot for ${resolution.name}:`, err.message);
    }
  }
};