// Wacht tot de volledige HTML-structuur is geladen voordat we JavaScript uitvoeren.
document.addEventListener('DOMContentLoaded', () => {

  // --- VARIABELEN EN ELEMENTEN ---
  let currentScene = 1;
  const userData = {
    path: '',
    lifestyle: '',
    sport: '',
    nutrition: '',
    height: 175,
    weight: 75
  };

  const scenes = document.querySelectorAll('.scene');
  const bgVideo = document.getElementById('bg-video'); // Verwijzing naar het video-element
  const chooseButton = document.getElementById('chooseButton');
  const video = document.getElementById('fenrirVideo');
  const heightSlider = document.getElementById('heightSlider');
  const weightSlider = document.getElementById('weightSlider');
  const heightVal = document.getElementById('heightVal');
  const weightVal = document.getElementById('weightVal');
  let videoReady = false;

  // --- FUNCTIES ---

  /**
   * Gaat naar de volgende scene door de huidige te verbergen en de volgende te tonen.
   */
  function nextScene() {
    if (currentScene >= scenes.length) return; // Voorkom fouten

    // Speciale actie bij de overgang van scene 1 naar 2
    if (currentScene === 1) {
      bgVideo.classList.add('fade-out'); // Laat de achtergrondvideo vervagen
    }

    scenes[currentScene - 1].classList.add('hidden');
    currentScene++;
    scenes[currentScene - 1].classList.remove('hidden');

    // Reset de video wanneer scene 3 wordt betreden
    if (currentScene === 3) {
      video.pause();
      video.currentTime = 0;
      updateFenrirVisual(); // Update visueel naar de startwaarden
    }
  }
  
  /**
   * Update de video van Fenrir op basis van de sliderwaarden (BMI).
   * Deze functie wordt alleen uitgevoerd als de video klaar is.
   */
  function updateFenrirVisual() {
    if (!videoReady) return; // Wacht tot de video is geladen

    const height = parseInt(heightSlider.value);
    const weight = parseInt(weightSlider.value);
    
    // Sla waarden op in het data-object
    userData.height = height;
    userData.weight = weight;
    
    // Update de tekstlabels
    heightVal.textContent = height;
    weightVal.textContent = weight;

    // Bereken BMI en pas de video aan
    const bmi = weight / Math.pow(height / 100, 2);
    const minBMI = 16; // Realistischere ondergrens
    const maxBMI = 40; // Realistischere bovengrens
    const clampedBMI = Math.min(Math.max(bmi, minBMI), maxBMI);
    const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
    
    video.currentTime = video.duration * percentage;
  }

  /**
   * Verzend de verzamelde gegevens.
   * Voert eerst een validatie uit.
   */
  function submitData() {
    const nameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const errorMsg = document.getElementById('form-error');

    // Validatie
    if (nameInput.value.trim() === '' || emailInput.value.trim() === '') {
      errorMsg.textContent = 'Vul alsjeblieft je naam en e-mailadres in.';
      nameInput.classList.toggle('input-error', nameInput.value.trim() === '');
      emailInput.classList.toggle('input-error', emailInput.value.trim() === '');
      return;
    }
     if (!/^\S+@\S+\.\S+$/.test(emailInput.value)) {
        errorMsg.textContent = 'Vul alsjeblieft een geldig e-mailadres in.';
        emailInput.classList.add('input-error');
        return;
    }

    // Foutmeldingen wissen als alles goed is
    errorMsg.textContent = '';
    nameInput.classList.remove('input-error');
    emailInput.classList.remove('input-error');

    // Toon het resultaat (placeholder voor daadwerkelijke verzending)
    const resultP = document.getElementById('result');
    resultP.innerHTML = `Jij bent een ${userData.path} Wolf in wording.<br>
      Lengte: ${userData.height}cm, Gewicht: ${userData.weight}kg.<br>
      Doel: ${userData.path}, Lifestyle: ${userData.lifestyle}, Sport: ${userData.sport}, Voeding: ${userData.nutrition}`;
    
    alert('Gegevens succesvol "verzonden"! Check de console voor de data.');
    console.log("Te verzenden data:", {
        naam: nameInput.value,
        email: emailInput.value,
        ...userData
    });
  }


  // --- SWIPER LOGICA ---
  const swiperWrapper = document.getElementById('swiperWrapper');
  const slides = swiperWrapper.querySelectorAll('.swiper-slide');
  let currentIndex = 0;
  let touchStartX = 0;

  function updateSlideStyles() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentIndex);
    });
    swiperWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
    
    const pathText = currentIndex === 0 ? 'MONSTER - Spiermassa en kracht' : 'ROOFDIER - Vetverlies en definitie';
    chooseButton.textContent = pathText;
    chooseButton.classList.remove('fade-in');
    void chooseButton.offsetWidth; // Forceer reflow voor animatie-reset
    chooseButton.classList.add('fade-in');
  }

  // Touch-events voor swipen
  swiperWrapper.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
  swiperWrapper.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) { // Swipe naar links
      currentIndex = 1;
    } else if (touchEndX - touchStartX > 50) { // Swipe naar rechts
      currentIndex = 0;
    }
    updateSlideStyles();
  });
  
  // Hover-event voor swipen op desktop
  slides.forEach((slide, index) => {
      slide.addEventListener('mouseenter', () => {
          if (window.innerWidth > 768) { // Alleen op desktop
              currentIndex = index;
              updateSlideStyles();
          }
      });
  });


  // --- EVENT LISTENERS ---

  // Startknop
  document.getElementById('start-button').addEventListener('click', nextScene);
  
  // Keuzeknop na swiper
  chooseButton.addEventListener('click', () => {
      userData.path = currentIndex === 0 ? 'Beast Mode' : 'Predator Mode';
      nextScene();
  });
  
  // Sliders voor lengte en gewicht
  heightSlider.addEventListener('input', updateFenrirVisual);
  weightSlider.addEventListener('input', updateFenrirVisual);

  // Volgende knop na sliders
  document.getElementById('scene3-next').addEventListener('click', nextScene);

  // Knoppen voor keuzes (nu afbeeldingen)
  document.querySelectorAll('.lifestyle-btn').forEach(btn => btn.addEventListener('click', (e) => {
      userData.lifestyle = e.target.dataset.value;
      nextScene();
  }));
  document.querySelectorAll('.sport-btn').forEach(btn => btn.addEventListener('click', (e) => {
      userData.sport = e.target.dataset.value;
      nextScene();
  }));
  document.querySelectorAll('.nutrition-btn').forEach(btn => btn.addEventListener('click', (e) => {
      userData.nutrition = e.target.dataset.value;
      nextScene();
  }));
  
  // Verzendknop
  document.getElementById('submit-button').addEventListener('click', submitData);

  // FIX VOOR IPHONE VIDEO: Wacht tot video-metadata geladen is.
  video.addEventListener('loadedmetadata', () => {
    videoReady = true;
    updateFenrirVisual(); // Update de video direct na het laden
  });

  // --- INITIALISATIE ---
  updateSlideStyles(); // Zet de swiper in de beginpositie
});
