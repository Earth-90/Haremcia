// Variables globales
const carouselContainer = document.getElementById('carousel-container');
const carouselInner = document.getElementById('carousel-inner');
const cassettes = document.querySelectorAll('.cassette');
const slot = document.getElementById('cassette-slot');
const door = document.getElementById('door');
const audio = document.getElementById('audio');

// Contrôles du lecteur
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const positionSlider = document.getElementById('position-slider');
const currentTimeSpan = document.getElementById('current-time');
const totalTimeSpan = document.getElementById('total-time');
const volumeKnob = document.getElementById('volume-knob');
const speedKnob = document.getElementById('speed-knob');
const volumeValue = document.getElementById('volume-value');
const speedValue = document.getElementById('speed-value');
const volumeLed = document.getElementById('volume-led');
const speedLed = document.getElementById('speed-led');

const clickSound = document.getElementById('click-sound');
const insertSound = document.getElementById('insert-sound');

// Variables d'état
let currentIndex = 3;
const cassetteWidth = 334;
let isScrolling = false;
let isPlaying = false;
let currentVolume = 0.5;
let currentSpeed = 1.0;
let isDraggingVolume = false;
let isDraggingSpeed = false;
let casseteLoaded = false;


// Fonction utilitaire pour gérer les sons système
async function playSystemSound(sound) {
    if (sound.readyState >= 2) {
        sound.currentTime = 0;
        try {
            await sound.play();
            await new Promise(resolve => {
                sound.onended = resolve;
            });
        } catch (error) {
            console.log("Playback error:", error);
        }
    }
}

// Remplacer la fonction playClickSound existante

function playClickSound() {
    playSystemSound(clickSound);
}


// Fonction pour mettre à jour la position du carrousel
function updateCarousel() {
    const offset = -currentIndex * cassetteWidth;
    carouselInner.style.transform = `translateX(${offset}px)`;

    // Mettre à jour les classes des cassettes et la capacité de drag
    cassettes.forEach((cassette, index) => {
        const isCenter = index === currentIndex;
        cassette.classList.toggle('center', isCenter);
        // Seule la cassette centrale est draggable
        cassette.draggable = isCenter;
    });
}

// Gestion du scroll avec la molette
carouselContainer.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (isScrolling) return;
    isScrolling = true;

    if (e.deltaY > 0) {
        currentIndex = Math.min(currentIndex + 1, cassettes.length - 1);
    } else {
        currentIndex = Math.max(currentIndex - 1, 0);
    }

    updateCarousel();

    setTimeout(() => {
        isScrolling = false;
    }, 300);
});

// Gestion du clic sur les cassettes
cassettes.forEach((cassette, index) => {
    cassette.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
    });
});

// Gestion du drag and drop
cassettes.forEach(cassette => {
    cassette.addEventListener('dragstart', e => {
        if (!cassette.classList.contains('center')) {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData('src', cassette.dataset.src);
        cassette.style.opacity = '0.5';
    });

    cassette.addEventListener('dragend', e => {
        if (cassette.classList.contains('center')) {
            cassette.style.opacity = '';
        }
    });
});

slot.addEventListener('dragover', e => {
    e.preventDefault();
});

slot.addEventListener('dragenter', (e) => {
    e.preventDefault();
    door.classList.add('open');
});

slot.addEventListener('dragleave', (e) => {
    if (!slot.contains(e.relatedTarget)) {
        door.classList.remove('open');
    }
});

slot.addEventListener('drop', e => {
    e.preventDefault();
    const src = e.dataTransfer.getData('src');
    door.classList.remove('open');

    if (src) {
        loadCassette(src);
    }
});

// Fonction pour charger une cassette
function loadCassette(src) {
    // Arrêter la lecture en cours si elle existe
    if (audio.src) {
        audio.pause();
        audio.currentTime = 0;
    }
    
    // Jouer le son d'insertion
    playSystemSound(insertSound);

    // Réinitialiser l'état
    isPlaying = false;
    playBtn.classList.remove('active');
    pauseBtn.classList.remove('active');
    stopBtn.classList.remove('active');
    volumeLed.classList.remove('playing', 'paused');
    speedLed.classList.remove('playing', 'paused');

    // Charger le nouveau son
    audio.src = src;
    audio.load(); // Forcer le chargement
    casseteLoaded = true;

    // Trouver l'image de la cassette correspondante
    const selectedCassette = Array.from(cassettes).find(cassette => cassette.dataset.src === src);
    const cassetteImage = selectedCassette.src;

    // Afficher la cassette dans le slot
    const insertedCassetteFront = document.getElementById('inserted-cassette-front');
    const insertedCassetteBack = document.getElementById('inserted-cassette-back');
    insertedCassetteFront.style.backgroundImage = `url(${cassetteImage})`;
    insertedCassetteFront.style.display = 'block';
    insertedCassetteBack.style.display = 'block';


    // Gérer les roues
    const wheels = document.querySelectorAll('.wheel');
    wheels.forEach(wheel => wheel.classList.remove('spinning'));
    wheels.forEach(wheel => wheel.style.display = 'block');

    audio.addEventListener('play', () => {
        wheels.forEach(wheel => wheel.classList.add('spinning'));
    });

    audio.addEventListener('pause', () => {
        wheels.forEach(wheel => wheel.classList.remove('spinning'));
    });

    audio.addEventListener('ended', () => {
        wheels.forEach(wheel => wheel.classList.remove('spinning'));
    });

    audio.addEventListener('loadedmetadata', () => {
        totalTimeSpan.textContent = formatTime(audio.duration);
        positionSlider.max = audio.duration;
    });
}
// Contrôles de lecture
playBtn.addEventListener('click', async () => {
    if (casseteLoaded && audio.src) {
        // D'abord jouer le son de clic
        await playSystemSound(clickSound);
        
        // Ensuite lancer la musique
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                playBtn.classList.add('active');
                pauseBtn.classList.remove('active');
                volumeLed.classList.remove('paused');
                speedLed.classList.remove('paused');
                volumeLed.classList.add('playing');
                speedLed.classList.add('playing');
            }).catch(error => {
                console.log("Playback error:", error);
            });
        }
    }
});

pauseBtn.addEventListener('click', async () => {
    if (casseteLoaded) {
        await playSystemSound(clickSound);
        audio.pause();
        isPlaying = false;
        pauseBtn.classList.add('active');
        playBtn.classList.remove('active');
        volumeLed.classList.remove('playing');
        speedLed.classList.remove('playing');
        volumeLed.classList.add('paused');
        speedLed.classList.add('paused');
    }
});

stopBtn.addEventListener('click', async () => {
    if (casseteLoaded) {
        await playSystemSound(clickSound);
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
        playBtn.classList.remove('active');
        pauseBtn.classList.remove('active');
        stopBtn.classList.add('active');
        volumeLed.classList.remove('playing', 'paused');
        speedLed.classList.remove('playing', 'paused');
        setTimeout(() => stopBtn.classList.remove('active'), 200);
    }
});

// Contrôle des boutons knob rotatifs
function setupKnob(knob, valueDisplay, minValue, maxValue, initialValue, suffix, callback) {
    let startAngle = 0;
    let currentValue = initialValue;
    let isDragging = false;

    // Position initiale du knob
    const initialRotation = ((currentValue - minValue) / (maxValue - minValue)) * 270 - 135;
    knob.style.transform = `rotate(${initialRotation}deg)`;

    knob.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = knob.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        document.body.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const rect = knob.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

        let angleDiff = currentAngle - startAngle;
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        const sensitivity = 0.17;
        const valueChange = angleDiff * sensitivity * (maxValue - minValue);
        currentValue = Math.max(minValue, Math.min(maxValue, currentValue + valueChange));

        const rotation = ((currentValue - minValue) / (maxValue - minValue)) * 270 - 135;
        knob.style.transform = `rotate(${rotation}deg)`;

        valueDisplay.textContent = currentValue.toFixed(suffix === '%' ? 0 : 1) + suffix;
        callback(currentValue);

        startAngle = currentAngle;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.cursor = 'default';
        }
    });
}

// Configuration des knobs
setupKnob(volumeKnob, volumeValue, 0, 100, 50, '%', (value) => {
    currentVolume = value / 100;
    audio.volume = currentVolume;
});

setupKnob(speedKnob, speedValue, 0.25, 2.0, 1.0, 'x', (value) => {
    currentSpeed = value;
    audio.playbackRate = currentSpeed;
});

// Slider de position
positionSlider.addEventListener('input', (e) => {
    if (casseteLoaded) {
        audio.currentTime = e.target.value;
    }
});

// Mise à jour du temps et de la position
audio.addEventListener('timeupdate', () => {
    if (casseteLoaded && !positionSlider.matches(':active')) {
        positionSlider.value = audio.currentTime;
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    }
});

// Fonction pour formater le temps
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Initialiser le carrousel
updateCarousel();

// Gestion tactile pour mobile
let startX = 0;
let isDragging = false;

carouselContainer.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
});

carouselContainer.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
});

carouselContainer.addEventListener('touchend', (e) => {
    if (!isDragging) return;
    isDragging = false;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
        if (diff > 0) {
            currentIndex = Math.min(currentIndex + 1, cassettes.length - 1);
        } else {
            currentIndex = Math.max(currentIndex - 1, 0);
        }
        updateCarousel();
    }
});