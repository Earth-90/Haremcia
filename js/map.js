// Configuration des zones interactives
const AREA_CONFIG = {
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

// Initialisation après le chargement du DOM
document.addEventListener('DOMContentLoaded', function () {
    const svgObject = document.getElementById('svgMap');
    const modal = document.getElementById('mapModal');
    const modalFlag = document.getElementById('modalFlag');
    const modalTitle = document.getElementById('modalTitle');
    const modalDetails = document.getElementById('modalDetails');
    const modalLink = document.getElementById('modalLink');

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

    const LEFT_MODAL_AREAS = ['complex', 'GED', 'haremcia', 'URSS', 'ZDM'];

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

            // Pour Haremcia : chance de masquer le <span>
            if (element.id === 'haremcia') {
                // 50% de chance de supprimer le span
                if (Math.random() < 0.5) {
                    detailsHtml = detailsHtml.replace(/<span[^>]*>.*?<\/span>/, '');
                }
            }

            modalDetails.innerHTML = detailsHtml;

            modalLink.onclick = () => { window.location.href = config.link; };
            modal.style.display = 'flex';
            setTimeout(() => { modal.classList.add('open'); }, 10);

            lastOpenedId = element.id;
        });
    }
});