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
    'GED': [
        { name: "Alliance Technologique", effect: "Partage de brevets et innovations", with: "Complex" }
    ],
};

// Initialisation après le chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    const svgObject = document.getElementById('svgMap');
    const modal = document.getElementById('mapModal');
    const modalFlag = document.getElementById('modalFlag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDetails = document.getElementById('modalDetails');
    const modalLink = document.getElementById('modalLink');
    const modalAccordsTab = document.getElementById('modalAccordsTab');
    const modalAccordsContent = document.getElementById('modalAccordsContent');
    const openAccordsTab = document.getElementById('openAccordsTab');
    const closeAccordsTab = document.getElementById('closeAccordsTab');

    let tooltipVisible = false;
    let lastOpenedId = null;

    // Fermer la modal en cliquant ailleurs
    document.addEventListener('mousedown', function (e) {
        if (modal.style.display === 'flex' && !modal.contains(e.target)) {
            modal.classList.remove('open');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('side-left', 'side-right');
                lastOpenedId = null;
            }, 400);
        }
    });

    svgObject.addEventListener('load', function () {
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) {
            console.error('SVG contentDocument not accessible');
            return;
        }

        Object.keys(AREA_CONFIG).forEach(areaId => {
            const path = svgDoc.getElementById(areaId);
            if (path) {
                setupInteractiveArea(path, AREA_CONFIG[areaId]);
            }
        });
    });

    const LEFT_MODAL_AREAS = ['complex', 'GED', 'haremcia', 'URSS', 'capital_URSS', 'capital_GED', 'capital_haremcia', 'capital_complex', 'ZDM'];

    function showAccordsTab(areaId) {
        const accords = AREA_ACCORDS[areaId] || [];
        if (accords.length === 0) {
            modalAccordsContent.innerHTML = "<p>Aucun accord international.</p>";
        } else {
            modalAccordsContent.innerHTML = accords.map(acc =>
                `<div class="accord-item">
                    <b>${acc.name}</b><br>
                    <span>Effet : ${acc.effect}</span><br>
                    <span>Avec : ${acc.with}</span>
                </div>`
            ).join('');
        }
        modalAccordsTab.style.display = 'block';
    }

    openAccordsTab.addEventListener('click', function () {
        showAccordsTab(lastOpenedId);
        openAccordsTab.style.display = 'none';
    });
    closeAccordsTab.addEventListener('click', function () {
        modalAccordsTab.style.display = 'none';
        openAccordsTab.style.display = 'block';
    });

    function setupInteractiveArea(element, config) {
        element.classList.add('map-area');
        element.setAttribute('title', config.title);

        element.addEventListener('mouseover', function () {
            tooltipVisible = true;
            element.style.opacity = "0.5";
        });

        element.addEventListener('mouseout', function () {
            tooltipVisible = false;
            element.style.opacity = "0";
        });

        element.addEventListener('click', function (e) {
            e.preventDefault();

            // Si on clique sur le même pays, on ferme la modal
            if (lastOpenedId === element.id && modal.style.display === 'flex') {
                modal.classList.remove('open');
                setTimeout(() => {
                    modal.style.display = 'none';
                    modal.classList.remove('side-left', 'side-right');
                    lastOpenedId = null;
                }, 400);
                return;
            }

            // Toujours retirer les classes de côté et d'ouverture pour rejouer l'animation
            modal.classList.remove('open', 'side-left', 'side-right');
            void modal.offsetWidth; // Force reflow pour l'animation

            // Ajouter la bonne classe de côté
            if (LEFT_MODAL_AREAS.includes(element.id)) {
                modal.classList.add('side-left');
            } else {
                modal.classList.add('side-right');
            }

            modalFlag.src = config.flag;
            modalTitle.textContent = config.title;

            // Récupère le détail HTML correspondant au pays
            const detailsDiv = document.getElementById('modalDetails-' + element.id);
            let detailsHtml = detailsDiv ? detailsDiv.innerHTML : "Aucun détail disponible.";

            // 80% de chance de supprimer le span
            if (Math.random() < 0.80) {
                console.log('Haremcia: Span removed');
                detailsHtml = detailsHtml.replace(/<span[^>]*>.*?<\/span>/, '');
            }

            modalDetails.innerHTML = detailsHtml;

            // Gestion du bouton - ne pas l'afficher pour les capitales
            if (element.id.startsWith('capital_')) {
                modalLink.style.display = 'none';
            } else {
                modalLink.style.display = 'block';
                modalLink.onclick = () => { window.location.href = config.link; };
            }

            // Affiche le bouton "Voir les accords" si des accords existent
            if (AREA_ACCORDS[element.id] && AREA_ACCORDS[element.id].length > 0) {
                openAccordsTab.style.display = 'block';
            } else {
                openAccordsTab.style.display = 'none';
            }
            modalAccordsTab.style.display = 'none';

            modalLink.onclick = () => { window.location.href = config.link; };
            modal.style.display = 'flex';
            setTimeout(() => { modal.classList.add('open'); }, 10);

            lastOpenedId = element.id;
        });
    }
});