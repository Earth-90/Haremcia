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
const loopBtn = document.getElementById('loop-btn');

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
let isLoopMode = false;

const INITIAL_TAPE_SIZE = 50; // Taille maximale de la bande en pixels
const MIN_TAPE_SIZE = 0;

const stack = document.getElementById("stack");
let folders = Array.from(document.querySelectorAll(".folder"));
let topIndex = Math.floor(Math.random() * folders.length);
let currentOpenFolder = null;

// Liste de positions possibles pour les post-its
function getRandomPosition() {
    return {
        x: Math.random() * (150 - 20) + 20,  // valeurs entre 20px et 150px
        y: Math.random() * (80 - 20) + 20,    // valeurs entre 20px et 80px
        angle: Math.random() * (40 - -40) + -40  // valeurs entre -50 et 50 degrés
    };
}
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
    const position = getRandomPosition();

    postit.style.left = `${position.x}px`;
    postit.style.top = `${position.y}px`;
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
async function playSystemSound(sound, loop = false) {
    if (sound.readyState >= 2) {
        sound.currentTime = 0;
        sound.loop = loop;  // Ajouter le mode loop
        try {
            await sound.play();
            if (!loop) {
                await new Promise(resolve => {
                    sound.onended = resolve;
                });
            }
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
    volumeLed.classList.remove('playing', 'paused');
    speedLed.classList.remove('playing', 'paused');

    // Réinitialiser la barre de progression et l'affichage du temps
    positionSlider.value = 0;
    currentTimeSpan.textContent = '00:00';
    totalTimeSpan.textContent = '00:00';

    // Charger le nouveau son
    audio.src = src;
    audio.load(); // Forcer le chargement
    casseteLoaded = true;

    // Initialiser la taille de la bande
    const leftWheel = document.querySelector('.wheel.left');
    const rightWheel = document.querySelector('.wheel.right');
    leftWheel.style.setProperty('--tape-size', `${INITIAL_TAPE_SIZE}px`);
    rightWheel.style.setProperty('--tape-size', `${MIN_TAPE_SIZE}px`);

    // Ajouter l'écouteur pour mettre à jour la bande
    audio.addEventListener('timeupdate', updateTapeSize);

    // Ajouter un gestionnaire d'erreur pour le chargement du son
    audio.onerror = () => {
        console.log("Erreur de chargement du son:", src);
        // Charger le son de backup
        audio.src = 'sons/sounds/damaged.mp3';
        audio.load();
        // Réinitialiser le gestionnaire d'erreur
        audio.onerror = null;
    };

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
        if (isLoopMode) {
            // On utilise startRewinding() et on ajoute un écouteur pour relancer la lecture
            const handleRewind = () => {
                if (audio.currentTime <= 0) {
                    // On arrête d'écouter cet événement
                    audio.removeEventListener('timeupdate', handleRewind);
                    // On arrête le rewind
                    stopRewinding();
                    // On relance la lecture
                    const playPromise = audio.play();
                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            wheels.forEach(wheel => wheel.classList.add('spinning'));
                        }).catch(error => {
                            console.log("Playback error:", error);
                        });
                    }
                }
            };

            // On ajoute l'écouteur pour surveiller le rewind
            audio.addEventListener('timeupdate', handleRewind);
            // On démarre le rewind
            startRewinding();
        } else {
            isPlaying = false;
            updateButtons(null);
            volumeLed.classList.remove('playing');
            speedLed.classList.remove('playing');
        }
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

// Modifier l'événement du bouton pause
pauseBtn.addEventListener('click', async () => {
    if (casseteLoaded) {
        await playSystemSound(clickSound);

        // Arrêter toutes les opérations en cours
        if (isRewinding) {
            stopRewinding();
        }
        if (isFastForwarding) {
            stopFastForwarding();
        }

        // Arrêter la lecture
        audio.pause();
        isPlaying = false;

        // Mettre à jour l'interface
        updateButtons(pauseBtn);
        updateWheels(null);
        volumeLed.classList.remove('playing');
        speedLed.classList.remove('playing');
        volumeLed.classList.add('paused');
        speedLed.classList.add('paused');
    }
});

loopBtn.addEventListener('click', async () => {
    if (casseteLoaded) {
        await playSystemSound(clickSound);
        isLoopMode = !isLoopMode;
        loopBtn.classList.toggle('active', isLoopMode);
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
    const buttons = [playBtn, rewindBtn, fforwardBtn, pauseBtn];  // Ajouter pauseBtn à la liste
    buttons.forEach(button => button.classList.remove('active'));

    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function stopAllOperations() {
    if (isRewinding) {
        stopRewinding();
        rewindSound.pause();
        rewindSound.currentTime = 0;
    }
    if (isFastForwarding) {
        stopFastForwarding();
        fforwardSound.pause();
        fforwardSound.currentTime = 0;
    }

    isPlaying = false;
    audio.pause();

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
    playSystemSound(rewindSound, true);  // Ajouter true pour le mode loop

    const rewindSpeed = isLoopMode ? audio.duration / 2 : audio.duration / 3;
    const interval = 10;
    const step = rewindSpeed * (interval / 1000);

    rewindInterval = setInterval(() => {
        audio.currentTime = Math.max(0, audio.currentTime - step);
        updateTapeSize(); // Mettre à jour la bande
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

    // Précharger le son avant de le jouer
    const playFF = async () => {
        fforwardSound.currentTime = 0;
        fforwardSound.loop = true;
        try {
            await fforwardSound.play();
        } catch (error) {
            console.log("FF sound error:", error);
        }
    };
    playFF();

    const ffSpeed = audio.duration / 3;
    const interval = 5;
    const step = ffSpeed * (interval / 1000);

    fastForwardInterval = setInterval(() => {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + step);
        updateTapeSize(); // Mettre à jour la bande
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
        wheel.style.setProperty('--wheel-angle', `${angle}deg`);
        wheel.classList.remove('spinning', 'reverse-spinning', 'fast-spinning');
    });

    // Mettre à jour la taille de la bande
    updateTapeSize();
}

function updateWheelsSpeed(speed) {
    document.documentElement.style.setProperty('--wheel-duration', `${2 / speed}s`);
}

function updateTapeSize() {
    if (!casseteLoaded) return;

    const progress = audio.currentTime / audio.duration;
    const leftWheel = document.querySelector('.wheel.left');
    const rightWheel = document.querySelector('.wheel.right');

    // Calculer la taille de la bande pour chaque roue
    const leftSize = INITIAL_TAPE_SIZE * (1 - progress);
    const rightSize = INITIAL_TAPE_SIZE * progress;

    // Mettre à jour les tailles
    leftWheel.style.setProperty('--tape-size', `${leftSize}px`);
    rightWheel.style.setProperty('--tape-size', `${rightSize}px`);
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



function renderStack() {
    folders.forEach((folder, i) => {
        const index = (i - topIndex + folders.length) % folders.length;
        const xOffset = index * 0.1;
        const rotation = Math.random() * 10 - 5;
        folder.style.zIndex = 10 - index;
        folder.style.transform = `translateX(${xOffset}px) rotateZ(${rotation}deg)`;
    });
}

function cycleForward() {
    folders.unshift(folders.pop());
    renderStack();
}

function cycleBackward() {
    folders.push(folders.shift());
    renderStack();
}

function openFolder(folder) {
    if (currentOpenFolder && currentOpenFolder !== folder) {
        closeFolder(currentOpenFolder);
    }

    folder.classList.remove('closing');
    folder.classList.add('opening');
    folder.style.zIndex = 100;
    currentOpenFolder = folder;


    addCoffeeStains(folder);
}

function closeFolder(folder) {
    folder.classList.remove('opening');
    folder.classList.add('closing');

    setTimeout(() => {
        folder.querySelectorAll('.coffee-stain').forEach(stain => {
            stain.remove();
        });

    }, 400);

    setTimeout(() => {
        folder.classList.remove('closing');
        folder.style.zIndex = 15;

        if (currentOpenFolder === folder) {
            currentOpenFolder = null;
        }
    }, 800);
}

const COFFEE_STAINS = [
    { image: 'coffee_stain1.png', chance: 50 },
    { image: 'coffee_stain2.png', chance: 5 },
    { image: 'coffee_stain3.png', chance: 20 },
    { image: 'coffee_stain4.png', chance: 25 } 

];

function getRandomCoffeeStainProps() {
    // Obtenir un nombre aléatoire entre 0 et 100
    const rand = Math.random() * 100;
    let cumulativeChance = 0;

    // Sélectionner une image basée sur les pourcentages
    let selectedStain = COFFEE_STAINS[0].image; // Image par défaut
    for (const stain of COFFEE_STAINS) {
        cumulativeChance += stain.chance;
        if (rand <= cumulativeChance) {
            selectedStain = stain.image;
            break;
        }
    }

    return {
        top: Math.random() * 80 + '%',
        left: Math.random() * 50 + '%',
        rotation: Math.random() * 360,
        opacity: Math.random() * 0.5 + 0.4,
        scale: Math.random() * 0.6 + 0.5,
        backgroundImage: `url('../images/musique/${selectedStain}')`
    };
}

function addCoffeeStains(folder) {
    // Supprimer les anciennes taches s'il y en a
    folder.querySelectorAll('.coffee-stain').forEach(stain => stain.remove());

    // Sélectionner les conteneurs de contenu
    const contentContainers = folder.querySelectorAll('.folder-content');

    // Nombre aléatoire de taches (1 à 2) pour chaque conteneur
    contentContainers.forEach(container => {
        const numStains = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < numStains; i++) {
            const stain = document.createElement('div');
            stain.className = 'coffee-stain';

            const props = getRandomCoffeeStainProps();

            stain.style.top = props.top;
            stain.style.left = props.left;
            stain.style.transform = `rotate(${props.rotation}deg) scale(${props.scale})`;
            stain.style.opacity = props.opacity;
            stain.style.backgroundImage = props.backgroundImage;


            container.appendChild(stain);
        }
    });
}

renderStack()
stack.addEventListener("wheel", (e) => {
    e.preventDefault();

    // Si un dossier est ouvert, on le ferme d'abord
    if (currentOpenFolder) {
        closeFolder(currentOpenFolder);

        // On attend la fin de l'animation de fermeture avant de cycler
        setTimeout(() => {
            if (e.deltaY > 0) {
                cycleForward();
            } else {
                cycleBackward();
            }
        }, 800); // Correspond à la durée de l'animation dans le CSS
    } else {
        // Si aucun dossier n'est ouvert, on peut cycler directement
        if (e.deltaY > 0) {
            cycleForward();
        } else {
            cycleBackward();
        }
    }
});

folders.forEach(folder => {
    // Ajouter l'écouteur sur le folder entier au lieu du folder-cover
    folder.addEventListener("click", (e) => {
        // Si un dossier est déjà ouvert et que ce n'est pas celui-ci, on le ferme
        if (currentOpenFolder && currentOpenFolder !== folder) {
            closeFolder(currentOpenFolder);
        }

        // Si le dossier cliqué est déjà ouvert, on le ferme
        if (folder.classList.contains('opening')) {
            closeFolder(folder);
        } else {
            // Sinon on l'ouvre
            openFolder(folder);
        }
    });
});

// Fermer le dossier ouvert si on clique à côté
document.addEventListener("click", (e) => {
    if (!e.target.closest('.folder') && currentOpenFolder) {
        closeFolder(currentOpenFolder);
    }
});