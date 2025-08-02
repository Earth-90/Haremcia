// Configuration des zones interactives
const AREA_CONFIG = {
    'capital_haremcia': {
        title: 'Voluptua',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },
    'capital_holy_reich': {
        title: 'Auréline l\'immaculée',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },
    'capital_GED': {
        title: 'Capital City',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },
    'capital_GWE': {
        title: 'Sainte Bastille',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },
    'capital_URSS': {
        title: 'Frostobyl',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },
    'capital_SPO': {
        title: 'Utopia',
        flag: 'https://superwaifu.github.io/Holy-Reich/paysages/NewArk%202.png',
        link: ''
    },
    'capital_complex': {
        title: 'Main Hub',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },
    'capital_celeste': {
        title: 'Célestia',
        flag: 'images/map/capital/placeholder.png',
        link: ''
    },

    'montagne': {
        title: 'Grandes Montagnes',
        flag: 'images/map/flag/montagne.png',
        link: 'https://fr.wikipedia.org/wiki/Cha%C3%AEne_Saint-%C3%89lie'
    },
    'lac': {
        title: 'Le Lac Médissée',
        flag: 'images/map/flag/lac.png',
        link: 'https://fr.wikipedia.org/wiki/Lac_Ba%C3%AFkal'
    },
    'ZDM': {
        title: 'Zone Démilitarisée',
        flag: 'images/map/flag/ZDM.png',
        link: 'https://fr.wikipedia.org/wiki/Google%2B'
    },
    'complex': {
        title: 'État Indépendant du Complex',
        flag: 'images/map/flag/flag_complex.png',
        link: 'complex.html'
    },
    'haremcia': {
        title: 'Autocratie d\'Haremcia',
        flag: 'images/map/flag/flag_H.png',
        link: 'index.html'
    },
    'holy_reich': {
        title: 'Empire du Holy Reich',
        flag: 'images/map/flag/flag_HR.png',
        link: 'https://superwaifu.github.io/Holy-Reich/'
    },
    'GED': {
        title: 'Great East Domain',
        flag: 'images/map/flag/flag_GED.png',
        link: 'ged.html'
    },
    'GWE': {
        title: 'Great West Empire',
        flag: 'images/map/flag/flag_GWE.png',
        link: 'https://superwaifu.github.io/Holy-Reich/GWEmpire.html'
    },
    'celeste': {
        title: 'Royaume Céleste',
        flag: 'images/map/flag/flag_RC.png',
        link: 'https://superwaifu.github.io/Holy-Reich/RoyaumeCeleste.html'
    },
    'URSS': {
        title: 'United Radical South States',
        flag: 'images/map/flag/flag_URSS.png',
        link: 'urss.html'
    },
    'SPO': {
        title: 'Sultanat de la Poussière d’Or',
        flag: 'images/map/flag/flag_SPO.png',
        link: 'https://superwaifu.github.io/Holy-Reich/PoussiereDor.html'
    }
};

const AREA_ACCORDS = {
    'haremcia': [
        { name: "Pacte du Désert", effect: "Libre circulation des marchandises", with: "GED" },
        { name: "Accord de non-agression", effect: "Aucune attaque militaire", with: "Holy Reich" }
    ],
    'holy_reich': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" }
    ],
    'complex': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" },
        { name: "Accord de non-agression", effect: "Aucune attaque militaire", with: "Holy Reich" }
    ],
    'celeste': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" }
    ],
    'GED': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" },
        { name: "Accord de non-agression", effect: "Aucune attaque militaire", with: "Holy Reich" }
    ],
    'GWE': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" }
    ],
    'SPO': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" },
        { name: "Accord de non-agression", effect: "Aucune attaque militaire", with: "Holy Reich" },
        { name: "Accord de non-agression", effect: "Aucune attaque militaire", with: "Holy Reich" }
    ],
    'URSS': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" }
    ],

};


// Fonctions réutilisables
const ModalUtils = {
    closeAllModals: function (modal, accordsModal) {
        modal.classList.remove('open');
        accordsModal.classList.remove('open');

        setTimeout(() => {
            modal.style.display = 'none';
            accordsModal.style.display = 'none';
            modal.classList.remove('side-left', 'side-right');
            accordsModal.classList.remove('side-left', 'side-right');
        }, 400);
    },

    setModalPosition: function (modal, areaId) {
        const LEFT_MODAL_AREAS = ['complex', 'GED', 'haremcia', 'URSS', 'capital_URSS', 'capital_GED', 'capital_haremcia', 'capital_complex', 'ZDM'];
        modal.classList.remove('side-left', 'side-right');
        openAccordsButton.classList.remove('side-left', 'side-right');

        if (LEFT_MODAL_AREAS.includes(areaId)) {
            modal.classList.add('side-left');
            openAccordsButton.classList.add('side-left');
        } else {
            modal.classList.add('side-right');
            openAccordsButton.classList.add('side-right');
        }
    },

    prepareModalContent: function (config, elementId) {
        const detailsDiv = document.getElementById(`modalDetails-${elementId}`);
        let detailsHtml = detailsDiv ? detailsDiv.innerHTML : "Aucun détail disponible.";

        if (Math.random() < 0.80) {
            detailsHtml = detailsHtml.replace(/<span[^>]*>.*?<\/span>/g, '');
        }

        return detailsHtml;
    },

    setupAreaInteraction: function (element, config) {
        element.classList.add('map-area');
        element.setAttribute('title', config.title);

        element.addEventListener('mouseover', () => element.style.opacity = "0.5");
        element.addEventListener('mouseout', () => element.style.opacity = "0");
    }
};

// Configuration et initialisation
document.addEventListener('DOMContentLoaded', function () {
    // Elements DOM
    const elements = {
        svgObject: document.getElementById('svgMap'),
        modal: document.getElementById('mapModal'),
        modalFlag: document.getElementById('modalFlag'),
        modalTitle: document.getElementById('modalTitle'),
        modalDetails: document.getElementById('modalDetails'),
        modalLink: document.getElementById('modalLink'),
        modalAccordsContent: document.getElementById('modalAccordsContent'),
        openAccordsButton: document.getElementById('openAccordsButton'),
        accordsModal: document.getElementById('accordsModal')
    };

    let lastOpenedId = null;

    // Fermeture modale externe
    document.addEventListener('mousedown', (e) => {
        if (elements.modal.style.display === 'flex' && !elements.modal.contains(e.target)) {
            ModalUtils.closeAllModals(elements.modal, elements.accordsModal);
            lastOpenedId = null;
        }
    });

    // Gestion des accords
    elements.openAccordsButton.addEventListener('click', function () {
        if (elements.accordsModal.classList.contains('open')) {
            elements.accordsModal.classList.remove('open');
            elements.openAccordsButton.classList.remove('open');
        } else {
            showAccordsModal(lastOpenedId);
            elements.openAccordsButton.classList.add('open');
        }
    });

    // Chargement SVG
    elements.svgObject.addEventListener('load', function () {
        const svgDoc = elements.svgObject.contentDocument;
        if (!svgDoc) return;

        Object.keys(AREA_CONFIG).forEach(areaId => {
            const path = svgDoc.getElementById(areaId);
            if (path) {
                ModalUtils.setupAreaInteraction(path, AREA_CONFIG[areaId]);
                path.addEventListener('click', (e) => handleAreaClick(e, path, areaId));
            }
        });
    });

    // Gestion du clic sur une zone
    function handleAreaClick(e, element, areaId) {
        e.preventDefault();
        const config = AREA_CONFIG[areaId];

        // Toggle de fermeture
        if (lastOpenedId === areaId && elements.modal.style.display === 'flex') {
            ModalUtils.closeAllModals(elements.modal, elements.accordsModal);
            lastOpenedId = null;
            return;
        }

        // Positionnement
        ModalUtils.setModalPosition(elements.modal, areaId);
        elements.modal.classList.remove('open');

        // Contenu
        elements.modalFlag.src = config.flag;
        elements.modalTitle.textContent = config.title;
        elements.modalDetails.innerHTML = ModalUtils.prepareModalContent(config, areaId);

        // Configuration du lien
        elements.modalLink.style.display = areaId.startsWith('capital_') ? 'none' : 'block';
        elements.modalLink.onclick = () => { window.location.href = config.link; };

        // Gestion des accords
        elements.openAccordsButton.style.display = (AREA_ACCORDS[areaId]?.length > 0)
            ? 'flex'
            : 'none';

        // Affichage
        elements.modal.style.display = 'flex';
        setTimeout(() => elements.modal.classList.add('open'), 10);
        lastOpenedId = areaId;
    }

    // Affichage des accords
    function showAccordsModal(areaId) {
        const accords = AREA_ACCORDS[areaId] || [];
        elements.modalAccordsContent.innerHTML = accords.length === 0
            ? "<p>Aucun accord international.</p>"
            : accords.map(acc => `
                <div class="accord-item">
                    <h4><b>${acc.name}</b></h4>
                    <p>Effet : ${acc.effect}</p>
                    <p>Avec : ${acc.with}</p>
                </div>`).join('');

        // Positionnement
        elements.accordsModal.classList.remove('side-left', 'side-right');
        elements.accordsModal.classList.add(
            elements.modal.classList.contains('side-left') ? 'side-left' : 'side-right'
        );

        elements.accordsModal.style.display = 'flex';
        setTimeout(() => elements.accordsModal.classList.add('open'), 10);
    }
});