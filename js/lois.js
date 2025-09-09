// Ajoutez ceci au début du fichier
const tooltipExplanations = {
    'O': 'Autorisé',
    'N': 'Interdit',
    'C': 'Sous certaines circonstances',
    'Na': 'Non Applicable',
    'T': 'En théorie'
};

// Fonction pour déterminer la classe CSS basée sur la valeur
function getClassFromValue(value) {
    const valueMap = {
        'C': 'circonstance',
        'O': 'oui',
        'N': 'non',
        'Na': 'non-applicable',
        'T': 'theorie'
    };
    return valueMap[value] || '';
}

// Fonction pour charger le CSV et créer le tableau
async function loadAndCreateTable() {
    try {
        const response = await fetch('../data/lois.csv');
        const data = await response.text();
        
        // Parsing du CSV
        const rows = data.split('\n').map(row => row.split(','));
        const headers = rows[0];
        
        // Création du tableau HTML
        let tableHTML = '<table><thead><tr><th></th>';
        headers.slice(1).forEach(header => {
            tableHTML += `<th>${header.trim()}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        let currentCategory = '';
        rows.slice(1).forEach(row => {
            if (row[0].includes(':')) {
                // C'est une catégorie
                currentCategory = row[0].replace(':', '').trim();
                tableHTML += `<tr><td class="First-Law">[${currentCategory}]</td>`;
                row.slice(1).forEach(cell => {
                    const cellClass = getClassFromValue(cell.trim());
                    tableHTML += `<td class="${cellClass}"></td>`;
                });
                tableHTML += '</tr>';
            } else if (row[0].trim()) {
                // C'est une ligne normale
                tableHTML += '<tr><td>' + row[0].trim() + '</td>';
                row.slice(1).forEach(cell => {
                    const value = cell.trim();
                    const cellClass = getClassFromValue(value);
                    const explanation = tooltipExplanations[value] || '';
                    tableHTML += `<td class="${cellClass}" title="${explanation}"> ${value} </td>`;
                });
                tableHTML += '</tr>';
            }
        });

        tableHTML += '</tbody></table>';
        document.querySelector('.tableau').innerHTML = tableHTML;

    } catch (error) {
        console.error('Erreur lors du chargement du CSV:', error);
    }
}

// Chargement au démarrage de la page
document.addEventListener('DOMContentLoaded', loadAndCreateTable);