function showPopup(content) {
    const popupOverlay = document.getElementById('popup-overlay');
    const popupContent = document.getElementById('popup-content');
    
    if (content) {
      popupContent.innerHTML = content;
    }

    popupOverlay.classList.remove('hidden');
  }

  function closePopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    popupOverlay.classList.add('hidden');
  }
