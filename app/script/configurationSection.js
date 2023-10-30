(() => {
  const authCheckboxButton = document.querySelector(".js-authCheckbox");
  const chooseAuthorizationContainer = document.querySelector(
    ".configurationSection__radioContainer"
  );
  const windowsAuthRadio = document.querySelector(".js-windowsAuthRadio");
  const cookieAuthRadio = document.querySelector(".js-cookieAuthRadio");
  const showCookieContainer = document.querySelector(".js-showCookieContainer");
  const authButton = document.querySelector(".js-authorizationButton");

  authCheckboxButton.addEventListener("change", () => {
    if (authCheckboxButton.checked) {
      chooseAuthorizationContainer.style.display = "block";
    } else {
      chooseAuthorizationContainer.style.display = "none";
    }
  });

  windowsAuthRadio.addEventListener("change", () => {
    if (windowsAuthRadio.checked) {
      showCookieContainer.style.display = "none";
      authButton.style.display = "block";
    }
  });

  cookieAuthRadio.addEventListener("change", () => {
    console.log("change");
    if (cookieAuthRadio.checked) {
      showCookieContainer.style.display = "block";
      authButton.style.display = "none";
    }
  });
})();
