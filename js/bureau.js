let currentModal = null;
let currentArch = null;
let last_command = '';
let isTyping = false;
let messageQueue = [];
let typingSound = null;

document.getElementById('unlock-btn').addEventListener('click', function () {
    const terminalOutput = document.getElementById('terminal-output');
    const scrollableArea = document.querySelector('.terminal-body');
    const terminalInput = document.getElementById('terminal-input');

    document.getElementById('unlock-btn').classList.add('hidden');
    
    // Mise à jour de la structure du terminal
    const terminal = document.getElementById('terminal');
    terminal.classList.remove('hidden');
    terminal.innerHTML = `
        <div class="terminal-header">
            <span>[TERMINAL]</span>
            <span class="terminal-close">&times;</span>
        </div>
        <div class="terminal-body">
            <div id="terminal-output"></div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">&gt;</span>
                <input type="text" id="terminal-input" autofocus>
            </div>
        </div>
    `;

    // Récupérer les nouvelles références
    const newTerminalInput = document.getElementById('terminal-input');
    newTerminalInput.focus();

    // Ajouter l'événement de fermeture
    document.querySelector('.terminal-close').addEventListener('click', () => {
        terminal.classList.add('hidden');
        document.getElementById('unlock-btn').classList.remove('hidden');
    });

    // Création et configuration du son d'écriture
    typingSound = new Audio('sons/computer.mp3');
    typingSound.loop = true;

    const messages = [
        "Accessing Terminal.",
        "Accessing Terminal..",
        "Accessing Terminal...",
        "[User] : Director",
        "[Password] : ✲✲✲✲✲✲✲✲✲",
        "Connecting.",
        "Connecting..",
        "Connecting...",
        "[Access Granted]",
        "[LOG ACCESSIBLE]",
        "log_001 | log_002 | log_003 | log_004",
        "log_005 | log_006 | log_███ | log_███",
        "Please select a log :",
        "Type 'exit' to close terminal"
    ];

    messages.forEach(msg => messageQueue.push(msg));
    processMessageQueue();
});

// Modifier l'événement keydown pour inclure la commande exit
document.addEventListener('keydown', function (e) {
    if (e.target.id !== 'terminal-input') return;
    
    if (e.key === 'Enter' && !isTyping) {
        const command = e.target.value.trim();
        const terminalOutput = document.getElementById('terminal-output');
        const scrollableArea = document.querySelector('.terminal-body');
        e.target.value = '';

        if (command === 'exit') {
            document.getElementById('terminal').classList.add('hidden');
            document.getElementById('unlock-btn').classList.remove('hidden');
            return;
        }

        if (command.startsWith('log_')) {
            if (last_command.startsWith('log_')) {
                messageQueue.push(`Closing ${last_command}...`);
            }
            last_command = command;
            messageQueue.push(`Opening ${command}...`);
            messageQueue.push(() => openLog(command));
        } else {
            messageQueue.push(`ERROR [${command}]`);
        }

        processMessageQueue();
        scrollableArea.scrollTop = scrollableArea.scrollHeight;
    }
    
    if (isTyping) {
        e.preventDefault();
    }
});

function processMessageQueue() {
    if (isTyping || messageQueue.length === 0) {
        // Si la file est vide, arrêter le son
        if (messageQueue.length === 0 && typingSound) {
            typingSound.pause();
            typingSound.currentTime = 0;
        }
        return;
    }

    const next = messageQueue.shift();
    if (typeof next === 'function') {
        next();
        processMessageQueue();
    } else {
        typeMessage(next, document.getElementById('terminal-output'), () => {
            processMessageQueue();
        });
    }
}

function openLog(modalId) {
    const terminalOutput = document.getElementById('terminal-output');
    const scrollableArea = document.querySelector('.terminal-body');

    if (currentModal) {
        currentModal.classList.add('hidden'); // Fermer le modal actuel
    }

    const modal = document.getElementById(modalId);

    if (modal) {
        modal.classList.remove('hidden');
        currentModal = modal; // Mettre à jour le modal actuel

        modal.querySelector('.close').addEventListener('click', function () {
            modal.classList.add('hidden');
            currentModal = null; // Réinitialiser lorsque le modal est fermé
        });
    } else {
        typeMessage(`Aucun LOG trouvé pour : ${modalId}`, terminalOutput);
        last_command = '';
    }

    scrollableArea.scrollTop = scrollableArea.scrollHeight;
}

// Sélection des éléments
const openArchiveBtn = document.getElementById('openArchiveBtn');
const closeArchiveBtn = document.getElementById('closeArchiveBtn');
const archiveInterface = document.querySelector('.archiveInterface');
const folderButtons = document.querySelectorAll('.folder-btn');
const selectedArchiveDiv = document.getElementById('selectedArchive');
const archiveContentDiv = document.querySelector('.archive-content');
const closeContentBtn = document.querySelector('.archive-content .close');

// Afficher l'interface des archives au clic sur le bouton
openArchiveBtn.addEventListener('click', () => {
    archiveInterface.classList.remove('hidden');
    openArchiveBtn.classList.add('hidden');
});

// Fermer l'interface des archives au clic sur le bouton "Fermer"
closeArchiveBtn.addEventListener('click', () => {
    archiveInterface.classList.add('hidden');
    openArchiveBtn.classList.remove('hidden');
});

// Fonction pour afficher un texte lettre par lettre avec saut de ligne
function typeMessage(text, outputElement, callback) {
    isTyping = true;
    const terminalInput = document.getElementById('terminal-input');
    const scrollableArea = document.querySelector('.terminal-body');
    terminalInput.disabled = true;
    
    // Démarrer le son seulement s'il n'est pas déjà en cours
    if (typingSound && typingSound.paused) {
        typingSound.currentTime = 0;
        typingSound.play();
    }

    let charIndex = 0;
    const intervalId = setInterval(() => {
        if (charIndex < text.length) {
            outputElement.innerHTML += text.charAt(charIndex);
            // Faire défiler vers le bas à chaque nouveau caractère
            scrollableArea.scrollTop = scrollableArea.scrollHeight;
            charIndex++;
        } else {
            clearInterval(intervalId);
            outputElement.innerHTML += '<br>';
            isTyping = false;
            terminalInput.disabled = false;
            // Faire défiler une dernière fois après le saut de ligne
            scrollableArea.scrollTop = scrollableArea.scrollHeight;
            
            if (callback) callback();
        }
    }, 35);
}


const stack = document.getElementById("stack");
let folders = Array.from(document.querySelectorAll(".folder"));
let topIndex = Math.floor(Math.random() * folders.length);
let currentOpenFolder = null;

function renderStack() {
    folders.forEach((folder, i) => {
        const index = (i - topIndex + folders.length) % folders.length;
        const xOffset = index * -40;
        const rotation = index * -1;
        folder.style.zIndex = 10 - index;
        folder.dataset.baseX = xOffset;
        folder.dataset.baseRotation = rotation;
        updateFolderTransform(folder);
    });
}

function updateFolderTransform(folder) {
    const yOffset = folder.matches(':hover') ? -20 : 0;
    const xOffset = folder.matches(':hover') ? parseFloat(folder.dataset.baseX || 0) - 20 : parseFloat(folder.dataset.baseX || 0);
    const rotation = folder.matches(':hover') ? parseFloat(folder.dataset.baseRotation || 0) + 2 : parseFloat(folder.dataset.baseRotation || 0);
    folder.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px) rotateZ(${rotation}deg)`;
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
    const currentZIndex = folder.style.zIndex;
    folder.classList.remove('closing');
    folder.classList.add('opening');
    folder.style.zIndex = 100;
    folder.dataset.savedIndex = currentZIndex;
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
        folder.style.zIndex = folder.dataset.savedIndex || 15;
        delete folder.dataset.savedIndex;
        if (currentOpenFolder === folder) {
            currentOpenFolder = null;
        }
    }, 250);
}

const COFFEE_STAINS = [
    { image: 'coffee_stain1.png', chance: 50 },
    { image: 'coffee_stain2.png', chance: 5 },
    { image: 'coffee_stain3.png', chance: 20 },
    { image: 'coffee_stain4.png', chance: 25 }
];

function getRandomCoffeeStainProps() {
    const rand = Math.random() * 100;
    let cumulativeChance = 0;
    let selectedStain = COFFEE_STAINS[0].image;
    
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
        backgroundImage: `url('images/musique/${selectedStain}')`
    };
}

function addCoffeeStains(folder) {
    folder.querySelectorAll('.coffee-stain').forEach(stain => stain.remove());
    
    const contentContainers = folder.querySelectorAll('.folder-content');
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

// Initialisation et gestionnaires d'événements
renderStack();

stack.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (currentOpenFolder) {
        closeFolder(currentOpenFolder);
        setTimeout(() => {
            if (e.deltaY > 0) {
                cycleForward();
            } else {
                cycleBackward();
            }
        }, 800);
    } else {
        if (e.deltaY > 0) {
            cycleForward();
        } else {
            cycleBackward();
        }
    }
});

folders.forEach(folder => {
    folder.addEventListener("click", (e) => {
        if (currentOpenFolder && currentOpenFolder !== folder) {
            closeFolder(currentOpenFolder);
        }
        if (folder.classList.contains('opening')) {
            closeFolder(folder);
        } else {
            openFolder(folder);
        }
    });
});

document.addEventListener("click", (e) => {
    if (!e.target.closest('.folder') && currentOpenFolder) {
        closeFolder(currentOpenFolder);
    }
});