let currentModal = null;
let currentArch = null;
let last_command = '';

document.getElementById('unlock-btn').addEventListener('click', function() {
    const terminalOutput = document.getElementById('terminal-output');
    const scrollableArea = document.querySelector('.terminal-body');

    document.getElementById('unlock-btn').classList.add('hidden');
    document.getElementById('terminal').classList.remove('hidden');
    document.getElementById('terminal-input').focus();

    const audio = new Audio('sons/computer.mp3');
    console.log('Son joué');
    audio.play();

    // Afficher le texte lettre par lettre avec saut de ligne
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

    let messageIndex = 0;
    function showNextMessage() {
        if (messageIndex < messages.length) {
            typeMessage(messages[messageIndex], terminalOutput, showNextMessage);
            messageIndex++;
        }
    }
    showNextMessage();
});

document.getElementById('terminal-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const command = e.target.value.trim();
        const terminalOutput = document.getElementById('terminal-output');
        const scrollableArea = document.querySelector('.terminal-body');
        e.target.value = '';

        if (command.startsWith('log_')) {
            if (last_command.startsWith('log_')) {
                typeMessage(`Closing ${last_command}...`, terminalOutput);
            }
            last_command = command;
            typeMessage(`Opening ${command}...`, terminalOutput, () => {
                openLog(command);
            });
        } else {
            typeMessage(`ERROR [${command}]`, terminalOutput);
        }

        scrollableArea.scrollTop = scrollableArea.scrollHeight;
    }
});

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

        modal.querySelector('.close').addEventListener('click', function() {
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
    button.addEventListener('click', function() {
        const archiveId = this.getAttribute('data-archive');
        typeMessage(`Opening archive ${archiveId}...`, document.getElementById('terminal-output'), () => {
            OpenArch(archiveId);
        });
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

        Arch.querySelector('.close').addEventListener('click', function() {
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
    let charIndex = 0;
    const intervalId = setInterval(() => {
        if (charIndex < text.length) {
            outputElement.innerHTML += text.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(intervalId);
            outputElement.innerHTML += '<br>'; // Ajouter un saut de ligne après le message
            if (callback) callback();
        }
    }, 35); // Délai entre chaque caractère
}
