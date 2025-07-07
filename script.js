// Variables globales
let currentFile = null;
let extractedData = {
    noteEcrite: null,
    noteOrale: null,
    coefEcrite: 5,
    coefOrale: 5,
    moyenne: null,
    toutesLesNotes: {},
    moyenneGenerale: null
};

// Définition des matières à détecter avec leurs coefficients
const matieres = {
    'francais-ecrit': {
        name: 'Français écrit',
        icon: 'fas fa-pen',
        color: 'blue',
        coefficient: 5,
        patterns: [
            /(?:francais|français)[\s\w]*?(?:ecrit|écrit)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi,
            /(?:ecrit|écrit)[\s\w]*?(?:francais|français)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'francais-oral': {
        name: 'Français oral',
        icon: 'fas fa-microphone',
        color: 'green',
        coefficient: 5,
        patterns: [
            /(?:francais|français)[\s\w]*?(?:oral|orale)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi,
            /(?:oral|orale)[\s\w]*?(?:francais|français)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'histoire-geo': {
        name: 'Histoire-Géographie',
        icon: 'fas fa-globe',
        color: 'yellow',
        coefficient: 3,
        patterns: [
            /(?:histoire|géographie|geographie|histoire[\s\-]*geographie|histoire[\s\-]*géographie)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'emc': {
        name: 'Enseignement moral et civique',
        icon: 'fas fa-balance-scale',
        color: 'purple',
        coefficient: 1,
        patterns: [
            /(?:enseignement[\s\w]*moral[\s\w]*civique|moral[\s\w]*civique|emc)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'anglais': {
        name: 'Langue vivante A - Anglais',
        icon: 'fas fa-language',
        color: 'red',
        coefficient: 3,
        patterns: [
            /(?:langue[\s\w]*vivante[\s\w]*a[\s\w]*anglais|anglais|langue[\s\w]*anglais)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'espagnol': {
        name: 'Langue vivante B - Espagnol',
        icon: 'fas fa-language',
        color: 'orange',
        coefficient: 3,
        patterns: [
            /(?:langue[\s\w]*vivante[\s\w]*b[\s\w]*espagnol|espagnol|langue[\s\w]*espagnol)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'sciences': {
        name: 'Enseignement scientifique',
        icon: 'fas fa-flask',
        color: 'teal',
        coefficient: 3,
        patterns: [
            /enseignement[\s\w]*scientifique[\s\w]*?(\d+(?:[,\.]\d+)?)/gi,
            /sciences[\s\w]*(?:physiques?|naturelles?)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    },
    'maths': {
        name: 'Mathématiques',
        icon: 'fas fa-calculator',
        color: 'indigo',
        coefficient: 8,
        patterns: [
            /(?:mathematiques|mathématiques|maths|math)[\s\w]*?(\d+(?:[,\.]\d+)?)/gi
        ]
    }
};

// Définition des couleurs pour les icônes
const iconColors = {
    blue: '#3B82F6',
    green: '#10B981', 
    yellow: '#F59E0B',
    purple: '#8B5CF6',
    red: '#EF4444',
    orange: '#F97316',
    teal: '#14B8A6',
    indigo: '#6366F1'
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

function initializeEventListeners() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const copyResultsBtn = document.getElementById('copy-results-btn');
    const newCalculationBtn = document.getElementById('new-calculation-btn');
    const retryBtn = document.getElementById('retry-btn');
    const modePdfBtn = document.getElementById('mode-pdf-btn');
    const modeManualBtn = document.getElementById('mode-manual-btn');
    const manualCalculateBtn = document.getElementById('manual-calculate-btn');

    // Upload events
    uploadArea.addEventListener('click', () => fileInput.click());
    selectFileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('dragleave', handleDragLeave);

    // Action buttons
    downloadPdfBtn.addEventListener('click', downloadRecapPDF);
    copyResultsBtn.addEventListener('click', copyResults);
    newCalculationBtn.addEventListener('click', () => resetApplication(true));
    retryBtn.addEventListener('click', () => {
        if (currentFile) {
            processFile(currentFile);
        }
    });

    // Mode toggle buttons
    modePdfBtn.addEventListener('click', showPdfMode);
    modeManualBtn.addEventListener('click', showManualMode);

    // Manual calculation button
    manualCalculateBtn.addEventListener('click', handleManualCalculate);

    // Initial setup
    populateManualForm();
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.classList.add('border-indigo-400', 'bg-indigo-50');
}

function handleDragLeave(e) {
    e.target.classList.remove('border-indigo-400', 'bg-indigo-50');
}

function handleDrop(e) {
    e.preventDefault();
    e.target.classList.remove('border-indigo-400', 'bg-indigo-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'application/pdf') {
        currentFile = files[0];
        processFile(files[0]);
    } else {
        showError('Veuillez sélectionner un fichier PDF valide.');
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        currentFile = file;
        processFile(file);
    } else {
        showError('Veuillez sélectionner un fichier PDF valide.');
    }
}

async function processFile(file) {
    hideError();
    hideResults();
    showProgress();
    
    try {
        updateProgress(20, 'Lecture du fichier PDF...');
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        
        updateProgress(40, 'Extraction du texte...');
        
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        // --- AJOUT POUR LE DEBUG ---
        console.log("--- Texte extrait du PDF ---");
        console.log(fullText);
        console.log("----------------------------");
        
        updateProgress(60, 'Analyse des notes...');
        
        // Extraction des notes
        const notes = extractNotesFromText(fullText);
        
        updateProgress(80, 'Calcul de la moyenne...');
        
        if (notes.noteEcrite !== null && notes.noteOrale !== null) {
            // Calcul de la moyenne générale pondérée
            const moyenneGenerale = calculateGeneralAverage(notes.toutesLesNotes);

            extractedData = {
                ...notes,
                moyenne: calculateAverage(notes.noteEcrite, notes.noteOrale, notes.coefEcrite, notes.coefOrale),
                moyenneGenerale: moyenneGenerale
            };
            
            updateProgress(100, 'Traitement terminé !');
            
            setTimeout(() => {
                hideProgress();
                displayResults();
            }, 500);
        } else if (Object.keys(notes.toutesLesNotes).length > 0) {
            // Si on a des notes mais pas spécifiquement français écrit ET oral
            const moyenneGenerale = calculateGeneralAverage(notes.toutesLesNotes);

            extractedData = {
                ...notes,
                moyenne: notes.noteEcrite && notes.noteOrale ? 
                    calculateAverage(notes.noteEcrite, notes.noteOrale, notes.coefEcrite, notes.coefOrale) : null,
                moyenneGenerale: moyenneGenerale
            };
            
            updateProgress(100, 'Traitement terminé !');
            
            setTimeout(() => {
                hideProgress();
                displayResults();
            }, 500);
        } else {
            throw new Error('Aucune note n\'a pu être détectée dans ce document.');
        }
        
    } catch (error) {
        console.error('Erreur lors du traitement:', error);
        hideProgress();
        showError(error.message || 'Erreur lors de la lecture du fichier PDF. Vérifiez que le document contient bien des notes de français.');
    }
}

function extractNotesFromText(text) {
    let noteEcrite = null;
    let noteOrale = null;
    let toutesLesNotes = {};

    const lines = text.split('\\n');

    for (const line of lines) {
        const normalizedLine = line.toLowerCase()
            .replace(/[àáâãäå]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/ç/g, 'c');

        // Itérer sur chaque matière définie pour trouver une correspondance
        for (const [key, matiere] of Object.entries(matieres)) {
            // Si on n'a pas encore trouvé la note pour cette matière
            if (!toutesLesNotes[key]) {
                const matiereWords = matiere.name.toLowerCase().split(/\\s|-/);
                const hasMatiere = matiereWords.every(word => normalizedLine.includes(word));
                
                // Si la ligne contient le nom de la matière, on cherche une note
                if (hasMatiere) {
                    // Regex pour trouver une note (un ou deux chiffres, suivis potentiellement d'une virgule/point et un ou deux chiffres)
                    const notePattern = /(\\d{1,2}(?:[,.]\\d{1,2})?)/;
                    const match = line.match(notePattern);

                    if (match) {
                        const note = parseFloat(match[1].replace(',', '.'));
                        // Validation simple de la note
                        if (note >= 0 && note <= 20) {
                            toutesLesNotes[key] = { ...matiere, note };
                            if (key === 'francais-ecrit') noteEcrite = note;
                            if (key === 'francais-oral') noteOrale = note;
                        }
                    }
                }
            }
        }
    }

    return { noteEcrite, noteOrale, coefEcrite: 5, coefOrale: 5, toutesLesNotes };
}

function calculateAverage(noteEcrite, noteOrale, coefEcrite, coefOrale) {
    const totalPoints = (noteEcrite * coefEcrite) + (noteOrale * coefOrale);
    const totalCoef = coefEcrite + coefOrale;
    return Math.round((totalPoints / totalCoef) * 100) / 100;
}

function calculateGeneralAverage(toutesLesNotes) {
    if (Object.keys(toutesLesNotes).length === 0) return null;
    
    let totalPoints = 0;
    let totalCoefficients = 0;
    
    Object.values(toutesLesNotes).forEach(matiere => {
        totalPoints += matiere.note * matiere.coefficient;
        totalCoefficients += matiere.coefficient;
    });
    
    return totalCoefficients > 0 ? 
        Math.round((totalPoints / totalCoefficients) * 100) / 100 : null;
}

function showProgress() {
    document.getElementById('progress-container').classList.remove('hidden');
}

function hideProgress() {
    document.getElementById('progress-container').classList.add('hidden');
}

function updateProgress(percentage, text) {
    document.getElementById('progress-bar').style.width = percentage + '%';
    document.getElementById('progress-text').textContent = text;
}

function displayResults() {
    // Affichage de toutes les notes
    displayAllNotes();
    
    // Affichage des notes de français spécifiques
    document.getElementById('note-ecrite').textContent = extractedData.noteEcrite ? extractedData.noteEcrite : '--';
    document.getElementById('note-orale').textContent = extractedData.noteOrale ? extractedData.noteOrale : '--';
    
    // Affichage de la moyenne française
    if (extractedData.moyenne) {
        document.getElementById('moyenne-finale').textContent = extractedData.moyenne;
        const calculDetail = `(${extractedData.noteEcrite} × ${extractedData.coefEcrite} + ${extractedData.noteOrale} × ${extractedData.coefOrale}) ÷ ${extractedData.coefEcrite + extractedData.coefOrale} = ${extractedData.moyenne}`;
        document.getElementById('calcul-detail').textContent = calculDetail;
    } else {
        document.getElementById('moyenne-finale').textContent = '--';
        document.getElementById('calcul-detail').textContent = 'Notes de français incomplètes';
    }
    
    // Affichage de la moyenne générale
    if (extractedData.moyenneGenerale) {
        document.getElementById('moyenne-generale').textContent = extractedData.moyenneGenerale;
        const nombreMatieres = Object.keys(extractedData.toutesLesNotes).length;
        const totalCoefficients = Object.values(extractedData.toutesLesNotes).reduce((sum, matiere) => sum + matiere.coefficient, 0);
        document.getElementById('nombre-matieres').textContent = `Moyenne pondérée • ${nombreMatieres} matière${nombreMatieres > 1 ? 's' : ''} • ${totalCoefficients} coefficients`;
    } else {
        document.getElementById('moyenne-generale').textContent = '--';
        document.getElementById('nombre-matieres').textContent = 'Aucune moyenne calculable';
    }
    
    document.getElementById('results-section').classList.remove('hidden');
}

function displayAllNotes() {
    const container = document.getElementById('all-notes-container');
    container.innerHTML = '';
    
    if (Object.keys(extractedData.toutesLesNotes).length === 0) {
        container.innerHTML = '<p class="text-gray-500 col-span-full text-center">Aucune note détectée</p>';
        return;
    }
    
    Object.entries(extractedData.toutesLesNotes).forEach(([key, matiere]) => {
        const noteCard = document.createElement('div');
        noteCard.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md hover:bg-gray-100';
        
        // Définition des couleurs pour les icônes
        const iconColors = {
            blue: '#3B82F6',
            green: '#10B981', 
            yellow: '#F59E0B',
            purple: '#8B5CF6',
            red: '#EF4444',
            orange: '#F97316',
            teal: '#14B8A6',
            indigo: '#6366F1'
        };
        
        noteCard.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center">
                    <i class="${matiere.icon} mr-2" style="color: ${iconColors[matiere.color] || '#6B7280'}"></i>
                    <h4 class="font-semibold text-gray-800 text-sm">${matiere.name}</h4>
                </div>
                <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">coef ${matiere.coefficient}</span>
            </div>
            <div class="text-2xl font-bold text-gray-700">
                ${matiere.note}/20
            </div>
        `;
        
        container.appendChild(noteCard);
    });
}

function hideResults() {
    document.getElementById('results-section').classList.add('hidden');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-section').classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-section').classList.add('hidden');
}

function downloadRecapPDF() {
    // Création du contenu pour toutes les notes
    let allNotesHtml = '';
    Object.entries(extractedData.toutesLesNotes).forEach(([key, matiere]) => {
        allNotesHtml += `<p><strong>${matiere.name}:</strong> ${matiere.note}/20 <span style="color: #666; font-size: 0.9em;">(coef ${matiere.coefficient})</span></p>`;
    });

    const recap = `
        <html>
        <head>
            <title>Récapitulatif Complet des Notes</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .moyenne { background-color: #f0f8ff; text-align: center; padding: 20px; font-size: 18px; }
                .generale { background-color: #f0fff0; text-align: center; padding: 20px; font-size: 18px; }
                .notes-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; }
                .note-item { background-color: #f9f9f9; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Récapitulatif Complet des Notes</h1>
                <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
            
            <div class="section">
                <h2>📚 Toutes les Notes Détectées</h2>
                <div class="notes-grid">
                    ${allNotesHtml}
                </div>
            </div>
            
            ${extractedData.moyenne ? `
            <div class="section">
                <h2>🎯 Focus Français</h2>
                <p><strong>Note Écrite:</strong> ${extractedData.noteEcrite}/20</p>
                <p><strong>Note Orale:</strong> ${extractedData.noteOrale}/20</p>
            </div>
            
            <div class="section moyenne">
                <h2>Moyenne Français</h2>
                <h3>${extractedData.moyenne}/20</h3>
                <p>Calcul: (${extractedData.noteEcrite} × ${extractedData.coefEcrite} + ${extractedData.noteOrale} × ${extractedData.coefOrale}) ÷ ${extractedData.coefEcrite + extractedData.coefOrale}</p>
            </div>
            ` : ''}
            
            ${extractedData.moyenneGenerale ? `
            <div class="section generale">
                <h2>Moyenne Générale (Pondérée)</h2>
                <h3>${extractedData.moyenneGenerale}/20</h3>
                <p>Basée sur ${Object.keys(extractedData.toutesLesNotes).length} matière(s) avec coefficients officiels</p>
                <p><strong>Total coefficients:</strong> ${Object.values(extractedData.toutesLesNotes).reduce((sum, m) => sum + m.coefficient, 0)}</p>
            </div>
            ` : ''}
        </body>
        </html>
    `;
    
    const blob = new Blob([recap], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recapitulatif_notes_complet.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function copyResults() {
    // Création du texte pour toutes les notes
    let allNotesText = '';
    Object.entries(extractedData.toutesLesNotes).forEach(([key, matiere]) => {
        allNotesText += `• ${matiere.name}: ${matiere.note}/20 (coef ${matiere.coefficient})\n`;
    });

    let resultText = `📚 RÉCAPITULATIF COMPLET DES NOTES
${'='.repeat(50)}

📋 TOUTES LES NOTES DÉTECTÉES:
${allNotesText}`;

    // Ajout section français si disponible
    if (extractedData.moyenne) {
        resultText += `
🎯 FOCUS FRANÇAIS:
• Note Écrite: ${extractedData.noteEcrite}/20
• Note Orale: ${extractedData.noteOrale}/20
• Moyenne Français: ${extractedData.moyenne}/20
• Calcul: (${extractedData.noteEcrite} × ${extractedData.coefEcrite} + ${extractedData.noteOrale} × ${extractedData.coefOrale}) ÷ ${extractedData.coefEcrite + extractedData.coefOrale}`;
    }

    // Ajout moyenne générale si disponible
    if (extractedData.moyenneGenerale) {
        const totalCoef = Object.values(extractedData.toutesLesNotes).reduce((sum, m) => sum + m.coefficient, 0);
        resultText += `

📊 MOYENNE GÉNÉRALE PONDÉRÉE: ${extractedData.moyenneGenerale}/20
Basée sur ${Object.keys(extractedData.toutesLesNotes).length} matière(s) • Total coefficients: ${totalCoef}`;
    }

    resultText += `

📅 Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`;

    const finalText = resultText.trim();

    navigator.clipboard.writeText(finalText).then(() => {
        // Feedback visuel
        const btn = document.getElementById('copy-results-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copié !';
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        btn.classList.add('bg-green-600');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-green-600');
            btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        }, 2000);
    }).catch(() => {
        alert('Erreur lors de la copie. Veuillez copier manuellement les résultats.');
    });
}

function resetApplication(resetUi = true) {
    currentFile = null;
    extractedData = {
        noteEcrite: null,
        noteOrale: null,
        coefEcrite: 5,
        coefOrale: 5,
        moyenne: null,
        toutesLesNotes: {},
        moyenneGenerale: null
    };
    
    if (resetUi) {
        document.getElementById('file-input').value = '';
        // Clear manual inputs
        const manualInputs = document.querySelectorAll('#manual-form input');
        manualInputs.forEach(input => {
            input.value = '';
            input.classList.remove('border-red-500');
        });

        hideResults();
        hideError();
        hideProgress();
        showPdfMode(); // Default to PDF mode
    }
}

function showPdfMode() {
    document.getElementById('pdf-section').classList.remove('hidden');
    document.getElementById('manual-section').classList.add('hidden');
    
    const pdfBtn = document.getElementById('mode-pdf-btn');
    const manualBtn = document.getElementById('mode-manual-btn');
    
    pdfBtn.classList.add('bg-indigo-600', 'text-white');
    pdfBtn.classList.remove('bg-white', 'text-indigo-600');
    
    manualBtn.classList.add('bg-white', 'text-indigo-600');
    manualBtn.classList.remove('bg-indigo-600', 'text-white');

    hideResults();
    hideError();
}

function showManualMode() {
    document.getElementById('pdf-section').classList.add('hidden');
    document.getElementById('manual-section').classList.remove('hidden');

    const pdfBtn = document.getElementById('mode-pdf-btn');
    const manualBtn = document.getElementById('mode-manual-btn');
    
    manualBtn.classList.add('bg-indigo-600', 'text-white');
    manualBtn.classList.remove('bg-white', 'text-indigo-600');
    
    pdfBtn.classList.add('bg-white', 'text-indigo-600');
    pdfBtn.classList.remove('bg-indigo-600', 'text-white');
    
    hideResults();
    hideError();
}

function handleManualCalculate(e) {
    e.preventDefault();
    resetApplication(false); // Reset data but not UI
    
    const inputs = document.querySelectorAll('#manual-form input');
    let newToutesLesNotes = {};
    let newNoteEcrite = null;
    let newNoteOrale = null;
    let hasValues = false;

    inputs.forEach(input => {
        // Reset border color
        input.classList.remove('border-red-500');

        if (input.value !== '') {
            hasValues = true;
            const key = input.dataset.key;
            const note = parseFloat(input.value.replace(',', '.'));

            if (!isNaN(note) && note >= 0 && note <= 20) {
                const matiere = matieres[key];
                newToutesLesNotes[key] = { ...matiere, note: note };
                if (key === 'francais-ecrit') newNoteEcrite = note;
                if (key === 'francais-oral') newNoteOrale = note;
            } else {
                input.classList.add('border-red-500');
            }
        }
    });

    if (document.querySelector('.border-red-500')) {
        showError('Veuillez corriger les notes invalides (elles doivent être entre 0 et 20).');
        return;
    }

    if (!hasValues) {
        showError('Veuillez saisir au moins une note.');
        return;
    }

    // Update global data
    extractedData.toutesLesNotes = newToutesLesNotes;
    extractedData.noteEcrite = newNoteEcrite;
    extractedData.noteOrale = newNoteOrale;

    // Perform calculations
    if (newNoteEcrite !== null && newNoteOrale !== null) {
        extractedData.moyenne = calculateAverage(newNoteEcrite, newNoteOrale, 5, 5);
    }
    extractedData.moyenneGenerale = calculateGeneralAverage(newToutesLesNotes);

    // Display
    displayResults();
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

function populateManualForm() {
    const form = document.getElementById('manual-form');
    form.innerHTML = ''; // Clear previous fields
    
    Object.entries(matieres).forEach(([key, matiere]) => {
        const field = document.createElement('div');
        field.className = 'flex flex-col';
        
        field.innerHTML = `
            <label for="note-${key}" class="mb-1 text-sm font-medium text-gray-700 flex items-center">
                <i class="${matiere.icon} mr-2" style="color: ${iconColors[matiere.color] || '#6B7280'}"></i>
                ${matiere.name} (coef ${matiere.coefficient})
            </label>
            <input type="number" id="note-${key}" name="note-${key}" data-key="${key}" 
                   min="0" max="20" step="0.01" 
                   class="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                   placeholder="ex: 12,5">
        `;
        form.appendChild(field);
    });
} 