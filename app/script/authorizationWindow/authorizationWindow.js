const puppeteer = require("puppeteer");
const authorizationStartButton = document.querySelector(
  ".js-authorizationButton"
);

const getAuthorization = async () => {
  const authorizationUrl = document.querySelector(".js-authURI").value;

  try {
    const browser = await puppeteer.launch({
      headless: false,
      executablePath: pathChromeBrowser,
    });
    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
      document.addEventListener("click", (event) => {
        const element = event.target;
        const isLink = element.nodeName === "A";
        const opensInNewTab =
          element.target === "_blank" ||
          element.getAttribute("target") === "_blank";

        if (isLink && opensInNewTab) {
          event.preventDefault();
          const href = element.getAttribute("href");
          window.location.href = href;
        }
      });
    });

    page.on("console", async (msg) => {
      if (msg.text() === "saveSessionButtonIsClicked") {
        let cookies = await page.cookies();
        cookies = JSON.stringify(cookies, null, 4);

        if (!fs.existsSync(cookiesFolder)) {
          fs.mkdirSync(cookiesFolder);
        }

        fs.writeFile(
          path.join(cookiesFolder, "cookies.json"),
          cookies,
          (err) => {}
        );
      }
    });

    let newPageUrl;

    page.on("popup", async (popupPage) => {
      newPageUrl = await popupPage.url();

      await page.goto(newPageUrl);

      await popupPage.close();
    });

    page.on("domcontentloaded", async () => {
      await page.evaluate(() => {
        const saveSessionButton = document.createElement("button");
        saveSessionButton.innerText = "Save Session";
        saveSessionButton.id = "saveSessionButtonIsClicked";
        saveSessionButton.style.position = "fixed";
        saveSessionButton.style.top = "50px";
        saveSessionButton.style.right = "50px";
        saveSessionButton.style.backgroundColor = "red";
        saveSessionButton.style.color = "white";
        saveSessionButton.style.padding = "10px 20px";
        saveSessionButton.style.border = "none";
        saveSessionButton.style.borderRadius = "5px";
        saveSessionButton.style.zIndex = "9999";
        saveSessionButton.style.cursor = "pointer";
        document.body.appendChild(saveSessionButton);

        document
          .getElementById("saveSessionButtonIsClicked")
          .addEventListener("click", () => {
            saveSessionButton.innerText = "Session saved successfully";
            saveSessionButton.style.backgroundColor = "green";
            console.log("Kliknięto przycisk saveSessionButtonIsClicked");
            console.log("saveSessionButtonIsClicked");
          });
      });
    });

    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto(authorizationUrl);

    let cookies = await page.cookies();
    cookies = JSON.stringify(cookies, null, 4);

    if (!fs.existsSync(cookiesFolder)) {
      fs.mkdirSync(cookiesFolder);
    }

    fs.writeFile(path.join(cookiesFolder, "cookies.json"), cookies, (err) => {
      if (err) {
      } else {
        console.log("WINDOW-AUTH:Cookies have been saved successfully..");
      }
    });

    await page.waitForTimeout(1000000);

    await page.close();
    await browser.close();
  } catch (err) {}
};

authorizationStartButton.addEventListener("click", async () => {
  await getAuthorization();
});
