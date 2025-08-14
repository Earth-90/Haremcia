const svg = document.getElementById('circleMap');
const tooltip = document.getElementById('tooltip');
const bubble = document.getElementById('bubble');
const modal = document.getElementById('circle-modal');
const modalContent = document.getElementById('circle-modalContent');

const cercles = [
    {
        nom: "Orgueil",
        couleur: "red",
        desc: "Le cercle de l'orgueil est là ou sont tous les pêcheurs. Il ne peuvent pas quitter ce cercle.",
        image: "images/paysage/hell_pride.png"
    },
    {
        nom: "Colère",
        couleur: "orange",
        desc: "Le cercle de la colère est un lieu ou les démons font leur propres justice et se livrent à des combats sans fin.",
        image: "images/paysage/hell_wrath.png"
    },
    {
        nom: "Gourmandise",
        couleur: "yellow",
        desc: "Le cercle de la gourmandise est un lieu de débauche où les démons se livrent à des festins sans fin.",
        image: "images/paysage/hell_gluttonery.png"
    },
    {
        nom: "Avarice",
        couleur: "lime",
        desc: "Le cercle de l'avarice est le cercle ou les enfers produisent toutes les ressources nécessaires à leur fonctionnement.",
        image: "images/paysage/hell_greed.png"
    },
    {
        nom: "Luxure",
        couleur: "cyan",
        desc: "Le cercle de la luxure est rempli de sexclub et nightclub en tous genres.",
        image: "images/paysage/hell_lust.png"
    },
    {
        nom: "Envie",
        couleur: "blue",
        desc: "Le cercle de l'envie est le seul cercle avec un océan.",
        image: "images/paysage/hell_envy.png"
    },
    {
        nom: "Paresse",
        couleur: "magenta",
        desc: "Le cercle de la paresse est l'endroit qui gère la population des enfers. Contenant hôpitaux et autres établissements.",
        image: "images/paysage/hell_sloth.png"
    }
];

const baseY = 100;
const spacing = 70;
const rx = 150, ry = 40;

let expandedIndex = null;

cercles.forEach((cercle, i) => {
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("data-index", i);
    group.setAttribute("data-label", "Cercle : " + cercle.nom);
    group.setAttribute("transform", `translate(200, ${baseY + i * spacing})`);

    const ellipse = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    ellipse.setAttribute("rx", rx);
    ellipse.setAttribute("ry", ry);
    ellipse.setAttribute("stroke", cercle.couleur);
    ellipse.classList.add("main");

    const hover = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    hover.setAttribute("rx", rx);
    hover.setAttribute("ry", ry);
    hover.classList.add("invisible-hover");

    group.appendChild(ellipse);
    group.appendChild(hover);
    svg.appendChild(group);
});

const groups = svg.querySelectorAll("g");

groups.forEach(group => {
    const index = parseInt(group.getAttribute("data-index"));
    const data = cercles[index];

    group.addEventListener("mouseover", () => {
        group.classList.add("hovered");
        tooltip.style.display = 'block';
        tooltip.textContent = data.nom;
        // Ajoute un drop-shadow de la couleur du cercle, moins large
        group.querySelector("ellipse.main").style.filter = `drop-shadow(0 0 7px ${data.couleur})`;
    });

    group.addEventListener("mousemove", (e) => {
        tooltip.style.left = (e.pageX + 10) + "px";
        tooltip.style.top = (e.pageY - 30) + "px";
    });

    group.addEventListener("mouseout", () => {
        group.classList.remove("hovered");
        tooltip.style.display = 'none';
        group.querySelector("ellipse.main").style.filter = "none";
    });

    group.addEventListener("click", (e) => {
        expandedIndex = (expandedIndex === index) ? null : index;
        updateLayout();
        showModal(e, index);
    });
});

function updateLayout() {
    groups.forEach((group, i) => {
        let y = baseY + i * spacing;
        let ExpandedSize = 40;

        if (expandedIndex !== null) {
            if (i < expandedIndex) y -= ExpandedSize;
            else if (i > expandedIndex) y += ExpandedSize;
        }

        group.setAttribute("transform", `translate(200, ${y})`);

        const ellipse = group.querySelector("ellipse.main");
        if (i === expandedIndex) {
            ellipse.setAttribute("transform", "scale(1.3)");
            ellipse.style.filter = `drop-shadow(0 0 7px ${cercles[i].couleur})`;
        } else {
            ellipse.setAttribute("transform", "scale(1)");
            ellipse.style.filter = "none";
        }
    });
}

function showModal(event, index) {
    if (expandedIndex === null) {
        groups.forEach(g => {
            g.querySelector('ellipse.main').classList.remove('selected');
        });
        modal.classList.add("hide");
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            modal.classList.remove("hide");
        }, 400);
        return;
    }

    const cercle = cercles[index];

    // Animation du cercle sélectionné
    groups.forEach((g, i) => {
        const ellipse = g.querySelector('ellipse.main');
        if (i === index) {
            ellipse.classList.add('selected');
        } else {
            ellipse.classList.remove('selected');
        }
    });

    // Contenu de la modal
    modalContent.innerHTML = `
        <img src="${cercle.image}" alt="${cercle.nom}" />
        <h3>${cercle.nom}</h3>
        <p>${cercle.desc}</p>
    `;

    // Calculer la position du cercle cliqué
    const svgRect = svg.getBoundingClientRect();
    const group = groups[index];
    const ellipse = group.querySelector('ellipse.main');
    const ellipseRect = ellipse.getBoundingClientRect();

    // Position verticale du centre du cercle dans la page
    const circleCenterY = ellipseRect.top + ellipseRect.height / 2 + window.scrollY;

    // Décalage pour centrer la modal sur le cercle (optionnel)
    let top = circleCenterY + 100 ;
    modal.style.top = top + "px";

    // Affiche la modal à gauche
    modal.style.display = "block";
    setTimeout(() => modal.classList.add("show"), 10);
}

// Fermer la modal avec ESC
window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) {
        expandedIndex = null;
        updateLayout();
        modal.classList.add("hide");
        modal.classList.remove("show");
        setTimeout(() => {
            modal.style.display = "none";
            modal.classList.remove("hide");
        }, 400);
    }
});