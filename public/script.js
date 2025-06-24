// Wacht tot de volledige HTML-structuur is geladen voordat we JavaScript uitvoeren.
document.addEventListener('DOMContentLoaded', () => {

  // --- VARIABELEN EN ELEMENTEN ---
  let currentScene = 1;
  const userData = {
    path: '',
    lifestyle: '',
    sport: '',
    nutrition: '',
    height: 140, 
    weight: 40   
  };

  const scenes = document.querySelectorAll('.scene');
  const bgVideo = document.getElementById('bg-video'); 
  const chooseButton = document.getElementById('chooseButton');
  const fenrirVideo = document.getElementById('fenrirVideo');
  const heightSlider = document.getElementById('heightSlider');
  const weightSlider = document.getElementById('weightSlider');
  const heightVal = document.getElementById('heightVal');
  const weightVal = document.getElementById('weightVal');
  let fenrirVideoReady = false;

  // --- FUNCTIES ---

  /**
   * Gaat naar de volgende scene door de huidige te verbergen en de volgende te tonen.
   */
  function nextScene() {
    if (currentScene >= scenes.length) return; 

    if (currentScene === 1) {
      bgVideo.classList.add('fade-out');
    }

    scenes[currentScene - 1].classList.add('hidden');
    currentScene++;
    scenes[currentScene - 1].classList.remove('hidden');

    if (currentScene === 3) {
      fenrirVideo.pause();
      fenrirVideo.currentTime = 0;
      updateFenrirVisual(); 
    }
  }

  /**
   * Stelt het gekozen pad in op basis van de actieve slide en gaat verder.
   */
  function selectPathAndContinue() {
    userData.path = currentIndex === 0 ? 'Beast Mode' : 'Predator Mode';
    nextScene();
  }
  
  /**
   * Update de video van Fenrir op basis van de sliderwaarden (BMI).
   */
  function updateFenrirVisual() {
    const height = parseInt(heightSlider.value);
    const weight = parseInt(weightSlider.value);
    
    userData.height = height;
    userData.weight = weight;
    
    // Update de tekstlabels, dit werkt nu altijd.
    heightVal.textContent = height;
    weightVal.textContent = weight;

    // Voer de video-update alleen uit als de video klaar is.
    if (!fenrirVideoReady) {
        console.warn("Fenrir video not ready, skipping animation update.");
        return; 
    }

    const bmi = weight / Math.pow(height / 100, 2);
    const minBMI = 14; 
    const maxBMI = 40; 
    const clampedBMI = Math.min(Math.max(bmi, minBMI), maxBMI);
    const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
    
    fenrirVideo.currentTime = fenrirVideo.duration * percentage;
  }

  /**
   * Verzend de verzamelde gegevens.
   */
  function submitData() {
    const nameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const errorMsg = document.getElementById('form-error');

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

    errorMsg.textContent = '';
    nameInput.classList.remove('input-error');
    emailInput.classList.remove('input-error');

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

  swiperWrapper.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX);
  swiperWrapper.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) { 
      currentIndex = 1;
    } else if (touchEndX - touchStartX > 50) { 
      currentIndex = 0;
    }
    updateSlideStyles();
  });
  
  slides.forEach((slide, index) => {
      slide.addEventListener('mouseenter', () => {
          if (window.innerWidth > 768) { 
              currentIndex = index;
              updateSlideStyles();
          }
      });
  });


  // --- EVENT LISTENERS ---
  document.getElementById('start-button').addEventListener('click', nextScene);
  chooseButton.addEventListener('click', selectPathAndContinue);
  document.querySelectorAll('.path-image').forEach(img => {
    img.addEventListener('click', selectPathAndContinue);
  });
  heightSlider.addEventListener('input', updateFenrirVisual);
  weightSlider.addEventListener('input', updateFenrirVisual);
  document.getElementById('scene3-next').addEventListener('click', nextScene);
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
  document.getElementById('submit-button').addEventListener('click', submitData);

  fenrirVideo.addEventListener('loadedmetadata', () => {
    fenrirVideoReady = true;
    updateFenrirVisual(); 
  });

  // --- INITIALISATIE ---
  updateSlideStyles(); 

  heightSlider.value = userData.height;
  weightSlider.value = userData.weight;
  heightVal.textContent = userData.height;
  weightVal.textContent = userData.weight;

});
