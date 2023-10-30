(() => {
  const showConsoleButton = document.querySelector(".js-showConsole");
  const expandableWindow = document.querySelector(".js-expandable-window");
  const arrowSide = document.querySelector(".js-changeArrow");
  let isExpanded = false;

  showConsoleButton.addEventListener("click", () => {
    if (isExpanded) {
      arrowSide.classList.remove("fa-angles-left");
      arrowSide.classList.add("fa-angles-right");
      expandableWindow.classList.remove("expandable-windowDisplay");
      expandableWindow.classList.add("expandable-windowHidden");
      showConsoleButton.classList.remove("close-buttonArrowDisplay");
      showConsoleButton.classList.add("close-buttonArrowHidden");
    } else {
      arrowSide.classList.add("fa-angles-left");
      arrowSide.classList.remove("fa-angles-right");
      expandableWindow.classList.remove("expandable-windowHidden");
      expandableWindow.classList.add("expandable-windowDisplay");
      showConsoleButton.classList.remove("close-buttonArrowHidden");
      showConsoleButton.classList.add("close-buttonArrowDisplay");
    }
    isExpanded = !isExpanded;
  });
})();
