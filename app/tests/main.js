const lighthouseReportsFile = 'Lighthouse - Reports';
const axeReportsFile = 'Axe - Reports';
const spiderReportsFile = 'Spider - Reports';


const getUrls = () => {
    let noTrimmedUrls = document.querySelector('#textarea__urls').value;
    let urlsList = noTrimmedUrls.split('\n').map(link => link.trim()).filter(link => link.startsWith("https://"));
    if (urlsList.length === 0) {
        let content = `
                  <div class="popup_contentBox">
            <img class="popup_xImage" src="./images/16083479.webp" alt="X icon">
            <span>Sprawdź czy lista linków jest poprawnie zdefiniowana.</span>
          </div>
        `
        showPopup(content);
        console.log('empty list, please add https:// to urls.');
    }

    return urlsList;
}

const getHeadless = () => {
    const headlessValue = document.querySelector('.js-headless');
    if (headlessValue.checked) {
        return true;
    }

    return false
}

const getAuthorization = () => {
    const authValue = document.querySelector('.js-authorizeSwitch');
    if (authValue.checked) {
        return true;
    }

    return false
}

const getCurrentDate = () => {
    const currentDate = new Date();
    const unixTimestampInSec = Math.floor(currentDate.getTime() / 1000);
    return unixTimestampInSec;
}

const createTestFolders = (folderNames) => {
    folderNames.forEach(folderName => {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
    });
}

const foldersToCreate = [lighthouseReportsFile, axeReportsFile, spiderReportsFile];

createTestFolders(foldersToCreate);

