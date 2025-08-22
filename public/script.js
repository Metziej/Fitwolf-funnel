document.addEventListener('DOMContentLoaded', () => {
    // --- SOUND ENGINE ---
    let soundsReady = false;
    const synth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.2 } }).toDestination();
    const clickSound = () => soundsReady && synth.triggerAttackRelease("C2", "8n");
    const transitionSound = () => soundsReady && new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0 } }).toDestination().triggerAttackRelease("16n");
    const successSound = () => soundsReady && synth.triggerAttackRelease("C4", "8n", Tone.now());

    // --- MUTE CONTROL ---
    const muteButton = document.getElementById('mute-button');
    const iconOn = document.getElementById('icon-sound-on');
    const iconOff = document.getElementById('icon-sound-off');
    
    muteButton.addEventListener('click', () => {
        soundsReady = !soundsReady;
        Tone.start();
        iconOn.classList.toggle('hidden');
        iconOff.classList.toggle('hidden');
    });

    // --- SCENE MANAGEMENT ---
    const scenes = document.querySelectorAll('.scene');
    const background = document.getElementById('background-container');
    const userData = { path: '', height: 175, weight: 75, lifestyle: '', sport: '', nutrition: '' };

    function showScene(index) {
        transitionSound();
        scenes.forEach((scene, i) => {
            scene.classList.toggle('hidden', i !== index);
        });
        // Fade out background after scene 1
        background.style.opacity = index > 0 ? '0' : '1';
    }

    // --- SWIPER LOGIC (SCENE 2) ---
    const swiperWrapper = document.getElementById('swiperWrapper');
    const slides = swiperWrapper.querySelectorAll('.swiper-slide');
    const chooseButton = document.getElementById('chooseButton');
    let currentIndex = 0;
    let touchStartX = 0;

    function updateSlideStyles() {
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === currentIndex);
        });
        swiperWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        const pathText = currentIndex === 0 ? 'Beast Mode' : 'Predator Mode';
        const pathDescription = currentIndex === 0 ? 'Spiermassa & Kracht' : 'Vetverlies & Definitie';
        chooseButton.innerHTML = `<span class="block text-2xl">${pathText}</span><span class="block text-sm font-normal">${pathDescription}</span>`;
    }

    swiperWrapper.addEventListener('touchstart', e => touchStartX = e.touches[0].clientX, { passive: true });
    swiperWrapper.addEventListener('touchend', e => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX - touchEndX > 50 && currentIndex < slides.length - 1) { 
            currentIndex++;
        } else if (touchEndX - touchStartX > 50 && currentIndex > 0) { 
            currentIndex--;
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
        slide.addEventListener('click', () => {
             if (window.innerWidth <= 768) { 
                currentIndex = index;
                updateSlideStyles();
            }
        });
    });

    chooseButton.addEventListener('click', () => {
        clickSound();
        userData.path = currentIndex === 0 ? 'Beast Mode' : 'Predator Mode';
        showScene(2);
    });

    // --- EVENT LISTENERS & LOGIC ---
    document.getElementById('start-button').addEventListener('click', () => {
        clickSound();
        showScene(1);
    });
    
    // Scene 3: Sliders
    const fenrirVideo = document.getElementById('fenrirVideo');
    const heightSlider = document.getElementById('heightSlider');
    const weightSlider = document.getElementById('weightSlider');
    
    function updateFenrirVisual() {
        userData.height = parseInt(heightSlider.value);
        userData.weight = parseInt(weightSlider.value);
        document.getElementById('heightVal').textContent = userData.height;
        document.getElementById('weightVal').textContent = userData.weight;

        if (fenrirVideo.readyState >= 2) {
            const bmi = userData.weight / Math.pow(userData.height / 100, 2);
            const minBMI = 14, maxBMI = 40;
            const clampedBMI = Math.max(minBMI, Math.min(bmi, maxBMI));
            const percentage = (clampedBMI - minBMI) / (maxBMI - minBMI);
            fenrirVideo.currentTime = fenrirVideo.duration * percentage;
        }
    }
    heightSlider.addEventListener('input', updateFenrirVisual);
    weightSlider.addEventListener('input', updateFenrirVisual);
    fenrirVideo.addEventListener('loadedmetadata', updateFenrirVisual);
    document.getElementById('scene3-next').addEventListener('click', () => {
        clickSound();
        showScene(3);
    });

    // Scenes 4, 5, 6
    document.querySelectorAll('.lifestyle-btn').forEach(btn => btn.addEventListener('click', e => {
        clickSound();
        userData.lifestyle = e.target.dataset.value;
        showScene(4);
    }));
    document.querySelectorAll('.sport-btn').forEach(btn => btn.addEventListener('click', e => {
        clickSound();
        userData.sport = e.target.dataset.value;
        showScene(5);
    }));
    document.querySelectorAll('.nutrition-btn').forEach(btn => btn.addEventListener('click', e => {
        clickSound();
        userData.nutrition = e.target.dataset.value;
        
        const resultP = document.getElementById('result');
        let analyseText = `Jouw pad is de ${userData.path}. `;
        analyseText += userData.path === 'Beast Mode' ? "We gaan ons focussen op het bouwen van pure spiermassa en kracht." : "We gaan ons focussen op het verbranden van vet en het onthullen van messcherpe definitie.";
        resultP.textContent = analyseText;
        showScene(6);
    }));

    // Scene 7: Submit
    document.getElementById('submit-button').addEventListener('click', () => {
        const nameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const errorMsg = document.getElementById('form-error');

        if (nameInput.value.trim() === '' || !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
            errorMsg.textContent = 'Vul een geldige naam en e-mailadres in.';
            return;
        }
        errorMsg.textContent = '';
        successSound();

        const emailBody = `
Nieuwe FitWolf Intake van: ${nameInput.value}
======================================
Pad Keuze: ${userData.path}
---------------------------------
Huidige Fysiek:
Lengte: ${userData.height} cm
Gewicht: ${userData.weight} kg
---------------------------------
Levensstijl & Gewoontes:
Werk: ${userData.lifestyle}
Sportfrequentie: ${userData.sport} per week
Voeding: ${userData.nutrition}
---------------------------------
Contactgegevens:
Naam: ${nameInput.value}
E-mail: ${emailInput.value}
        `.trim();

        const mailtoLink = `mailto:info@fitwolf.nl?subject=${encodeURIComponent(`Nieuwe FitWolf Intake van ${nameInput.value}`)}&body=${encodeURIComponent(emailBody)}`;
        
        alert('Perfect! Je persoonlijke analyse wordt nu voorbereid in je e-mailprogramma. Klik op \'Verzenden\' om je aanvraag te voltooien.');
        window.location.href = mailtoLink;
    });

    // Initialisatie
    updateSlideStyles();
});
