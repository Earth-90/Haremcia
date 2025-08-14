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
    document.getElementById('terminal').classList.remove('hidden');
    terminalInput.focus();

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
        "Please select a log :"
    ];

    messages.forEach(msg => messageQueue.push(msg));
    processMessageQueue();
});

document.getElementById('terminal-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !isTyping) {
        const command = e.target.value.trim();
        const terminalOutput = document.getElementById('terminal-output');
        const scrollableArea = document.querySelector('.terminal-body');
        e.target.value = '';

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
    // Empêcher la saisie pendant l'écriture
    if (isTyping) {
        e.preventDefault();
    }
});

function processMessageQueue() {
    if (isTyping || messageQueue.length === 0) return;

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

folderButtons.forEach(button => {
    button.addEventListener('click', function () {
        const archiveId = this.getAttribute('data-archive');
    });
});

function OpenArch(ArchId) {
    if (currentArch) {
        currentArch.classList.add('hidden'); // Fermer l'archive actuelle
    }

    const Arch = document.getElementById(ArchId);

    if (Arch) {
        Arch.classList.remove('hidden');
        currentArch = Arch; // Mettre à jour l'archive actuelle

        Arch.querySelector('.close').addEventListener('click', function () {
            Arch.classList.add('hidden');
            currentArch = null; // Réinitialiser lorsque l'archive est fermée
        });
    }
}

// Fermer l'affichage du contenu de l'archive au clic sur la croix
closeContentBtn.addEventListener('click', () => {
    selectedArchiveDiv.classList.add('hidden');
});

// Fonction pour afficher un texte lettre par lettre avec saut de ligne
function typeMessage(text, outputElement, callback) {
    isTyping = true;
    const terminalInput = document.getElementById('terminal-input');
    terminalInput.disabled = true;
    
    // Démarrer le son
    if (typingSound) {
        typingSound.currentTime = 0;
        typingSound.play();
        
        // Relancer le son quand il se termine si on est toujours en train d'écrire
        typingSound.addEventListener('ended', function() {
            if (isTyping) {
                typingSound.currentTime = 0;
                typingSound.play();
            }
        });
    }

    let charIndex = 0;
    const intervalId = setInterval(() => {
        if (charIndex < text.length) {
            outputElement.innerHTML += text.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(intervalId);
            outputElement.innerHTML += '<br>';
            isTyping = false;
            terminalInput.disabled = false;
            
            // Arrêter le son seulement s'il n'y a pas de callback
            if (!callback && typingSound) {
                typingSound.pause();
                typingSound.currentTime = 0;
            }
            
            if (callback) callback();
        }
    }, 35);
}
