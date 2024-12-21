const fs = require("fs");

const crawlAndSaveHeadings = async (page, outputPath) => {
  const headingsData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((heading) => ({
        level: `H${heading.tagName.substring(1)}`,
        text: heading.innerText.trim(),
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
    console.log(`Headings structure saved to ${outputPath}`);
  } catch (err) {
    console.error("Error saving headings to CSV:", err);
  }
};

module.exports = crawlAndSaveHeadings;