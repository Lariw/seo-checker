const getUrls = () => {
    let noTrimmedUrls = document.querySelector('#textarea__urls').value;
    let urlsList = noTrimmedUrls.split('\n').map(link => link.trim()).filter(link => link.startsWith("https://"));

    if (urlsList.length === 0) {
        console.log('empty list, please add https:// to urls.')
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

function createTestFolders(folderNames) {
    folderNames.forEach(folderName => {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName);
        }
    });
}

const foldersToCreate = ['Lighthouse - Reports', 'Spider - Reports', 'Axe - Reports'];

createTestFolders(foldersToCreate);