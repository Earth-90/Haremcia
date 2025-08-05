// Variables globales
const carouselContainer = document.getElementById('carousel-container');
const carouselInner = document.getElementById('carousel-inner');
const cassettes = document.querySelectorAll('.cassette');
const slot = document.getElementById('cassette-slot');
const door = document.getElementById('door');
const audio = document.getElementById('audio');
audio.volume = 0.3;

// Contrôles du lecteur
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const rewindBtn = document.getElementById('prev-btn');
const fforwardBtn = document.getElementById('next-btn');
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
const rewindSound = document.getElementById('rewind-sound');
const fforwardSound = document.getElementById('fforward-sound');

// Variables d'état
let currentIndex = Math.floor(Math.random() * cassettes.length);
const cassetteWidth = 334;
let isScrolling = false;
let isPlaying = false;
let currentVolume = 0.5;
let currentSpeed = 1.0;
let isDraggingVolume = false;
let isDraggingSpeed = false;
let casseteLoaded = false;
let isRewinding = false;
let isFastForwarding = false;
let rewindInterval = null;
let fastForwardInterval = null;

// Liste de positions possibles pour les post-its
const postitPositions = [
    { x: 10, y: 10, angle: -25 },
    { x: 50, y: 15, angle: 10 },
    { x: 13, y: 20, angle: -18 },
    { x: 25, y: 12, angle: 12 },
    { x: 40, y: 30, angle: 5 },
    { x: 10, y: 33, angle: 35 },
    { x: 11, y: 8, angle: -10 },
    { x: 20, y: 11, angle: -30 },
    { x: 33, y: 12, angle: -20 },
    { x: 22, y: 12, angle: 40 },
    { x: 8, y: 1, angle: 8 },
    { x: 12, y: 20, angle: -12 },
    { x: 31, y: 25, angle: -15 }
];

// Modifier la partie qui gère l'ajout des titres sur les cassettes
cassettes.forEach(cassette => {
    // Créer un conteneur pour chaque cassette
    const cassetteContainer = document.createElement('div');
    cassetteContainer.className = 'cassette-container';
    cassetteContainer.style.position = 'relative';

    // Obtenir le parent de la cassette
    const parent = cassette.parentElement;

    // Remplacer la cassette par le conteneur
    parent.insertBefore(cassetteContainer, cassette);
    cassetteContainer.appendChild(cassette);

    // Ajouter un post-it avec une position aléatoire
    const postit = document.createElement('div');
    postit.className = 'postit';

    // Choisir une position aléatoire
    const position = postitPositions[Math.floor(Math.random() * postitPositions.length)];

    postit.style.left = `${position.x}%`;
    postit.style.top = `${position.y}%`;
    postit.style.setProperty('--rotate-angle', `${position.angle}deg`);
    postit.style.transform = `rotate(${position.angle}deg)`;

    const postitText = document.createElement('div');
    postitText.className = 'postit-text';

    // Création de la structure du texte avec titre et auteur
    const title = document.createElement('span');
    title.textContent = cassette.dataset.title;

    const author = document.createElement('span');
    author.className = 'author';
    author.textContent = `(${cassette.dataset.author})`;

    postitText.appendChild(title);
    postitText.appendChild(author);

    postit.appendChild(postitText);
    cassetteContainer.appendChild(postit);
});

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

// Mettre à jour la fonction updateCarousel pour gérer les nouveaux conteneurs
function updateCarousel() {
    const offset = -currentIndex * cassetteWidth;
    carouselInner.style.transform = `translateX(${offset}px)`;

    cassettes.forEach((cassette, index) => {
        const isCenter = index === currentIndex;
        cassette.classList.toggle('center', isCenter);
        cassette.draggable = isCenter;

        // Mettre à jour l'échelle du post-it
        const container = cassette.parentElement;
        const postit = container.querySelector('.postit');

        if (isCenter) {
            postit.style.transform = `rotate(${postit.style.getPropertyValue('--rotate-angle')}) scale(1.2)`;
        } else {
            postit.style.transform = `rotate(${postit.style.getPropertyValue('--rotate-angle')}) scale(0.8)`;
        }
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
        stopAllOperations();
        await playSystemSound(clickSound);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                isPlaying = true;
                updateButtons(playBtn);
                updateWheels('spinning');
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
        updateButtons(pauseBtn);
        updateWheels(null);
        volumeLed.classList.remove('playing');
        speedLed.classList.remove('playing');
        volumeLed.classList.add('paused');
        speedLed.classList.add('paused');
    }
});

stopBtn.addEventListener('click', async () => {
    if (casseteLoaded) {
        await playSystemSound(clickSound);
        stopAllOperations();
        audio.currentTime = 0;
        updateButtons(stopBtn);
        setTimeout(() => updateButtons(null), 200);
    }
});

// Ajouter ces fonctions utilitaires
function updateWheels(state) {
    if (!casseteLoaded) return;

    const wheels = document.querySelectorAll('.wheel');
    wheels.forEach(wheel => {
        // Capturer l'angle actuel avant de changer d'état
        const computedStyle = window.getComputedStyle(wheel);
        const matrix = new WebKitCSSMatrix(computedStyle.transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        wheel.style.setProperty('--start-angle', `${angle}deg`);

        // Appliquer le nouvel état
        wheel.classList.remove('spinning', 'reverse-spinning', 'fast-spinning');
        if (state) {
            wheel.classList.add(state);
        }
    });
}

function updateButtons(activeButton) {
    const buttons = [playBtn, pauseBtn, stopBtn, rewindBtn, fforwardBtn];
    buttons.forEach(button => button.classList.remove('active'));
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function stopAllOperations() {
    if (isRewinding) stopRewinding();
    if (isFastForwarding) stopFastForwarding();
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    }

    stopWheels();
    updateButtons(null);
    volumeLed.classList.remove('playing', 'paused');
    speedLed.classList.remove('playing', 'paused');
}


function setupKnob(knob, valueDisplay, minValue, maxValue, initialValue, suffix, callback) {
    let startAngle = 0;
    let currentValue = initialValue;
    let isDragging = false;

    // Position initiale du knob
    const initialRotation = ((currentValue - minValue) / (maxValue - minValue)) * 270 - 135;
    knob.style.transform = `rotate(${initialRotation}deg)`;
    valueDisplay.textContent = currentValue.toFixed(suffix === '%' ? 0 : 1) + suffix;

    const updateValue = (value) => {
        currentValue = value;
        const rotation = ((value - minValue) / (maxValue - minValue)) * 270 - 135;
        knob.style.transform = `rotate(${rotation}deg)`;
        valueDisplay.textContent = value.toFixed(suffix === '%' ? 0 : 1) + suffix;
        callback(value);

        // Mettre à jour la vitesse des roues si c'est le knob de vitesse
        if (knob === speedKnob) {
            document.documentElement.style.setProperty('--wheel-duration', `${2 / value}s`);
            const wheels = document.querySelectorAll('.wheel');
            wheels.forEach(wheel => {
                // Préserver l'animation actuelle
                const currentAnimation = wheel.classList.contains('spinning') ? 'spinning' :
                    wheel.classList.contains('reverse-spinning') ? 'reverse-spinning' :
                        wheel.classList.contains('fast-spinning') ? 'fast-spinning' : null;

                if (currentAnimation) {
                    // Au lieu de retirer et réajouter la classe, on met simplement à jour la durée CSS
                    wheel.style.animationDuration = `${2 / value}s`;
                }
            });
        }
    };

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
        const newValue = Math.max(minValue, Math.min(maxValue, currentValue + valueChange));

        updateValue(newValue);
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
setupKnob(volumeKnob, volumeValue, 0, 100, 30, '%', (value) => {
    currentVolume = value / 100;
    audio.volume = currentVolume;
});

setupKnob(speedKnob, speedValue, 0.1, 3.0, 1.0, 'x', (value) => {
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

// Ajouter les gestionnaires d'événements pour rewind
rewindBtn.addEventListener('click', async () => {
    if (!casseteLoaded) return;

    if (isRewinding) {
        // Arrêter le rewind
        stopRewinding();
    } else {
        // Démarrer le rewind
        startRewinding();
    }
});

// Ajouter les gestionnaires d'événements pour fast forward
fforwardBtn.addEventListener('click', async () => {
    if (!casseteLoaded) return;

    if (isFastForwarding) {
        // Arrêter le fast forward
        stopFastForwarding();
    } else {
        // Démarrer le fast forward
        startFastForwarding();
    }
});

// Fonctions pour le rewind
function startRewinding() {
    if (!casseteLoaded || audio.currentTime <= 0) return;

    stopAllOperations();
    isRewinding = true;
    updateButtons(rewindBtn);
    updateWheels('reverse-spinning');
    playSystemSound(rewindSound);

    const rewindSpeed = audio.duration / 3;
    const interval = 5;
    const step = rewindSpeed * (interval / 1000);

    rewindInterval = setInterval(() => {
        audio.currentTime = Math.max(0, audio.currentTime - step);
        if (audio.currentTime <= 0) {
            stopRewinding();
        }
    }, interval);
}

function stopRewinding() {
    isRewinding = false;
    rewindBtn.classList.remove('active');
    clearInterval(rewindInterval);
    rewindSound.pause();
    rewindSound.currentTime = 0;
    stopWheels();
}

// Fonctions pour le fast forward
function startFastForwarding() {
    if (!casseteLoaded || audio.currentTime >= audio.duration) return;

    stopAllOperations();
    isFastForwarding = true;
    updateButtons(fforwardBtn);
    updateWheels('fast-spinning');
    playSystemSound(fforwardSound);

    const ffSpeed = audio.duration / 3;
    const interval = 5;
    const step = ffSpeed * (interval / 1000);

    fastForwardInterval = setInterval(() => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
        if (audio.currentTime >= audio.duration) {
            stopFastForwarding();
        }
    }, interval);
}

function stopFastForwarding() {
    isFastForwarding = false;
    fforwardBtn.classList.remove('active');
    clearInterval(fastForwardInterval);
    fforwardSound.pause();
    fforwardSound.currentTime = 0;
    stopWheels();
}

// Ajouter cette fonction pour gérer l'arrêt des roues
function stopWheels() {
    const wheels = document.querySelectorAll('.wheel');
    wheels.forEach(wheel => {
        // Capturer l'angle actuel de rotation
        const computedStyle = window.getComputedStyle(wheel);
        const matrix = new WebKitCSSMatrix(computedStyle.transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);

        // Arrêter l'animation et maintenir la position
        wheel.style.setProperty('--start-angle', `${angle}deg`);
        wheel.classList.remove('spinning', 'reverse-spinning', 'fast-spinning');
    });
}

function updateWheelsSpeed(speed) {
    document.documentElement.style.setProperty('--wheel-duration', `${2 / speed}s`);
}

function updateWheels(state) {
    if (!casseteLoaded) return;

    const wheels = document.querySelectorAll('.wheel');
    wheels.forEach(wheel => {
        // Sauvegarder l'angle actuel avant de changer d'état
        if (!wheel.style.getPropertyValue('--wheel-angle')) {
            wheel.style.setProperty('--wheel-angle', '0deg');
        }

        if (!state) {
            // Si on arrête l'animation, capturer l'angle final
            const computedStyle = window.getComputedStyle(wheel);
            const matrix = new WebKitCSSMatrix(computedStyle.transform);
            const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
            wheel.style.setProperty('--wheel-angle', `${angle}deg`);
        }

        // Mettre à jour l'état
        wheel.classList.remove('spinning', 'reverse-spinning', 'fast-spinning');
        if (state) {
            wheel.classList.add(state);
        }
    });
}