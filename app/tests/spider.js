
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

  await spider(options);
});



const spider = async (options) => {
  const urls = getUrls();
  console.log(options);

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
      await crawlAndSaveHeadings(page, `${reportPath}/headings_structure.csv`);
    }

    if (options.seoTag) {
      const seoTagsData = await crawlSeoTags(page);
      saveSeoTagsToCsv(seoTagsData, `${reportPath}/seo-tags.csv`);
    }

    if (options.log) {
      await listenConsoleLogs(page, `${reportPath}/console-logs.csv`)
    }

    if (options.image) {
      const images = await crawlImages(page);
      await saveToExcel(images, `${reportPath}/images.csv`);
    }

    if (options.link) {
      const links = await crawlLinks(page);
      await saveToExcel(links, `${reportPath}/links.csv`);
    }

    if (options.font) {
      const fonts = await crawlFonts(page);
      await saveToExcel(fonts, `${reportPath}/fonts.csv`);
    }

    if (options.screenshot) {
      await takeScreenshots(page, `${reportPath}/${parseURL(url)}`, url);
    }

    await browser.close();
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
      console.log(`Folder created: ${folderPath}`);
    }
  } catch (err) {
    console.error(`Error creating folder: ${err.message}`);
  }
};

const crawlAndSaveHeadings = async (page, outputPath) => {
  const headingsData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((heading) => ({
        level: `H${heading.tagName.substring(1)}`,
        text: heading.innerText.replace(/\s+/g, " ").trim(),
      }));

    let correctStructure = true;
    let previousLevel = 0;

    for (const heading of headings) {
      const currentLevel = parseInt(heading.level.substring(1));
      if (previousLevel && currentLevel > previousLevel + 1) {
        correctStructure = false;
        break;
      }
      previousLevel = currentLevel;
    }

    return { headings, correctStructure };
  });

  const { headings, correctStructure } = headingsData;

  const csvHeaders = "Level,Text\n";
  const csvRows = headings
    .map((heading) => `${heading.level},"${heading.text}"`)
    .join("\n");

  const structureRow = `Structure,"${correctStructure ? "Correct" : "Incorrect"}"`;
  const csvContent = csvHeaders + csvRows + "\n" + structureRow;

  try {
    fs.writeFileSync(outputPath, csvContent, "utf-8");
  } catch (err) {
    console.error("Error saving headings to CSV:", err);
  }
};

const crawlSeoTags = async (page) => {
  return await page.evaluate(() => {
    const title = document.title || "Brak";
    const metaDescription = document.querySelector("meta[name='description']")?.content || "Brak";
    const metaKeywords = document.querySelector("meta[name='keywords']")?.content || "Brak";
    const canonicalLink = document.querySelector("link[rel='canonical']")?.href || "Brak";
    const ogTitle = document.querySelector("meta[property='og:title']")?.content || "Brak";
    const ogDescription = document.querySelector("meta[property='og:description']")?.content || "Brak";

    return [
      { tag: "Title", content: title },
      { tag: "Meta Description", content: metaDescription },
      { tag: "Meta Keywords", content: metaKeywords },
      { tag: "Canonical Link", content: canonicalLink },
      { tag: "Open Graph Title", content: ogTitle },
      { tag: "Open Graph Description", content: ogDescription },
    ];
  });
};

const saveSeoTagsToCsv = (seoTagsData, outputPath) => {
  const folderPath = path.dirname(outputPath);
  createFolderIfNotExists(folderPath);

  const csvHeaders = "Tag,Content\n";
  const csvRows = seoTagsData
    .map((tag) => `${tag.tag},"${tag.content.replace(/\s+/g, " ").trim()}"`)
    .join("\n");

  const csvContent = csvHeaders + csvRows;

  try {
    fs.writeFileSync(outputPath, csvContent, "utf-8");
  } catch (err) {
    console.error("Error saving SEO tags to CSV:", err);
  }
};

const listenConsoleLogs = async (page, outputPath) => {
  const logs = [];
  page.on("console", (msg) => {
    logs.push({ type: msg.type(), message: msg.text() });
    console.log(`[Console ${msg.type()}]: ${msg.text()}`);
  });

  const saveLogsToCsv = () => {
    const folderPath = path.dirname(outputPath);
    createFolderIfNotExists(folderPath);

    const csvHeaders = "Type,Message\n";
    const csvRows = logs
      .map((log) => `${log.type},"${log.message.replace(/\s+/g, " ").trim()}"`)
      .join("\n");

    const csvContent = csvHeaders + csvRows;

    try {
      fs.writeFileSync(outputPath, csvContent, "utf-8");
      console.log(`Console logs saved to ${outputPath}`);
    } catch (err) {
      console.error("Error saving console logs to CSV:", err);
    }
  };

  page.on("close", saveLogsToCsv);
};

const takeScreenshots = async (page, path, url) => {
  const resolutions = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1920, height: 1080 }
  ];

  for (const resolution of resolutions) {
    try {
      console.log(`Taking screenshot for ${resolution.name} (${resolution.width}x${resolution.height})`);
      await page.setViewport({ width: resolution.width, height: resolution.height });

      await page.goto(url, { waitUntil: "networkidle2" });
      await page.screenshot({
        path: `${path}-${resolution.name}.png`,
        fullPage: true,
      });

      console.log(`Screenshot saved: ${path}-${resolution.name}.png`);
    } catch (err) {
      console.error(`Error taking screenshot for ${resolution.name}:`, err.message);
    }
  }
};


const crawlLinks = async (page) => {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href]")).map((link) => ({
      href: link.href,
      text: link.innerText.trim() || "Brak",
    }));
  });
};

const crawlImages = async (page) => {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).map((img) => ({
      src: img.src || "Brak",
      alt: img.alt || "Brak",
      width: img.width || "Brak",
      height: img.height || "Brak",
    }));
  });
};

const crawlFonts = async (page) => {
  return await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll("*"));
    const fontData = [];

    elements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      fontData.push({
        element: el.tagName,
        fontFamily: computedStyle.fontFamily || "Brak",
        fontSize: computedStyle.fontSize || "Brak",
        fontWeight: computedStyle.fontWeight || "Brak",
        color: computedStyle.color || "Brak",
      });
    });

    return fontData;
  });
};

const saveToExcel = async (data, outputPath) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Data");

  if (data.length > 0) {
    const keys = Object.keys(data[0]);
    sheet.columns = keys.map((key) => ({ header: key, key, width: 30 }));
    sheet.addRows(data);
  }

  const folderPath = path.dirname(outputPath);
  createFolderIfNotExists(folderPath);

  await workbook.xlsx.writeFile(outputPath);
  console.log(`Data saved to ${outputPath}`);
};