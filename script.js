const addPageBtn = document.getElementById('addPageBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const pageContainer = document.getElementById('pageContainer');
const resultText = document.getElementById('resultText');
let chartInstance = null; // Instance de Chart.js pour le graphique

// Fonction pour valider les champs requis
function validateInputs() {
  const pageNames = document.getElementsByName('pageName[]');
  for (let i = 0; i < pageNames.length; i++) {
    if (!pageNames[i].value.trim()) {
      alert('Tous les champs "Nom de la page" doivent être remplis.');
      return false;
    }
  }
  const startDateInput = document.getElementById('startDate');
  if (!startDateInput.value) {
    alert('Veuillez sélectionner une date de début.');
    return false;
  }
  return true;
}

// Ajouter une nouvelle ligne de formulaire
function addPageRow() {
  const pageRow = document.createElement('div');
  pageRow.classList.add('page-row');
  pageRow.innerHTML = `
    <input type="text" name="pageName[]" placeholder="Nom de la page" required>
    <select name="pageComplexity[]" class="complexity-select">
      <option value="simple">Simple</option>
      <option value="intermediate">Intermédiaire</option>
      <option value="advanced">Avancé</option>
      <option value="custom">Personnalisé</option>
    </select>
    <input type="number" name="durationValue[]" placeholder="Durée (en heures)" min="1" value="8" required>
    <button type="button" class="btn danger">✖</button>
  `;

  const complexitySelect = pageRow.querySelector('.complexity-select');
  const durationInput = pageRow.querySelector('input[name="durationValue[]"]');

  // Liaison : Complexité → Heures
  complexitySelect.addEventListener('change', () => {
    const complexity = complexitySelect.value;
    if (complexity === 'simple') durationInput.value = 8;
    else if (complexity === 'intermediate') durationInput.value = 12;
    else if (complexity === 'advanced') durationInput.value = 16;
  });

  // Liaison : Heures → Complexité
  durationInput.addEventListener('input', () => {
    const duration = parseInt(durationInput.value, 10);
    if (duration <= 8) complexitySelect.value = 'simple';
    else if (duration > 8 && duration <= 12) complexitySelect.value = 'intermediate';
    else if (duration > 12 && duration <= 16) complexitySelect.value = 'advanced';
    else complexitySelect.value = 'custom';
  });

  // Supprimer une ligne
  const deleteBtn = pageRow.querySelector('button');
  deleteBtn.addEventListener('click', () => pageRow.remove());

  pageContainer.appendChild(pageRow);
}

// Calculer les tâches avec exclusion des week-ends
function calculateProjectTime() {
  if (!validateInputs()) return;

  const pageNames = document.getElementsByName('pageName[]');
  const pageDurations = document.getElementsByName('durationValue[]');
  const startDateInput = document.getElementById('startDate').value;

  let ganttData = [];
  let currentDate = new Date(startDateInput);

  for (let i = 0; i < pageNames.length; i++) {
    const name = pageNames[i].value;
    const duration = parseInt(pageDurations[i].value, 10);
    const hoursPerDay = 8;
    let remainingHours = duration;

    const taskStartDate = new Date(currentDate);

    while (remainingHours > 0) {
      currentDate = skipWeekends(currentDate);
      remainingHours -= hoursPerDay;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    ganttData.push({
      name,
      startDate: taskStartDate.toDateString(),
      endDate: skipWeekends(new Date(currentDate)).toDateString(),
      duration,
    });
  }

  displayResults(ganttData);
  generateCalendarChart(ganttData);
}

// Fonction pour ignorer les week-ends
function skipWeekends(date) {
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

// Afficher les résultats
function displayResults(data) {
  const resultHTML = data.map(task => `
    <div>
      <strong>${task.name}</strong> - Début : ${task.startDate}, Fin : ${task.endDate}.
    </div>
  `).join('');
  resultText.innerHTML = resultHTML;
}

// Générer le graphique
function generateCalendarChart(data) {
  const ctx = document.getElementById('calendarChart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  const labels = data.map(task => task.name);
  const durations = data.map(task => task.duration);

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Durée (en heures)',
        data: durations,
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
    },
  });
}

// Réinitialiser le formulaire
resetBtn.addEventListener('click', () => {
  pageContainer.innerHTML = '';
  resultText.innerHTML = '<p>Remplissez le formulaire pour voir les résultats.</p>';
  if (chartInstance) chartInstance.destroy();
  document.getElementById('startDate').value = '';
  addPageRow();
});

// Fonction pour gérer l'export
async function exportResults(format) {
  const { jsPDF } = window.jspdf; // Import jsPDF
  const resultSection = document.querySelector('.result-section');
  const exportButtons = document.querySelector('.export-actions');

  // Ajouter la classe 'no-export' pour cacher les boutons
  exportButtons.classList.add('no-export');

  // Capturer l'image de la section résultats
  const canvas = await html2canvas(resultSection);

  // Supprimer la classe 'no-export' pour réafficher les boutons
  exportButtons.classList.remove('no-export');

  if (format === 'pdf') {
    const pdf = new jsPDF();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 10, 10, 190, 150);
    pdf.save('resultats.pdf');
  } else if (format === 'png') {
    const link = document.createElement('a');
    link.download = 'resultats.png';
    link.href = canvas.toDataURL();
    link.click();
  }
}

// Écouteurs pour les boutons d'export
document.getElementById('exportPDF').addEventListener('click', () => exportResults('pdf'));
document.getElementById('exportPNG').addEventListener('click', () => exportResults('png'));


// Initialisation
addPageBtn.addEventListener('click', addPageRow);
calculateBtn.addEventListener('click', calculateProjectTime);
addPageRow();
