const addPageBtn = document.getElementById('addPageBtn');
const calculateBtn = document.getElementById('calculateBtn');
const pageContainer = document.getElementById('pageContainer');
const resultText = document.getElementById('resultText');

// Ajouter une ligne pour les tâches
function addPageRow() {
    const pageRow = document.createElement('div');
    pageRow.classList.add('page-row');
    pageRow.innerHTML = `
      <input type="text" name="pageName[]" placeholder="Nom de la page" required>
      <select name="pageComplexity[]" class="complexity-select">
        <option value="simple" selected>Simple</option>
        <option value="intermediate">Intermédiaire</option>
        <option value="advanced">Avancé</option>
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
      else if (complexity === 'advanced') durationInput.value = 20;
    });
  
    // Liaison : Heures → Complexité
    durationInput.addEventListener('input', () => {
      const duration = parseInt(durationInput.value, 10);
      if (duration <= 8) complexitySelect.value = 'simple';
      else if (duration > 8 && duration <= 12) complexitySelect.value = 'intermediate';
      else if (duration > 12) complexitySelect.value = 'advanced';
    });
  
    // Bouton de suppression
    const deleteBtn = pageRow.querySelector('button');
    deleteBtn.addEventListener('click', () => pageRow.remove());
  
    // Ajouter la ligne au conteneur
    pageContainer.appendChild(pageRow);
  }
  
// Calculer les durées
function calculateProjectTime() {
  const pageNames = document.getElementsByName('pageName[]');
  const pageDurations = document.getElementsByName('durationValue[]');
  const pageComplexities = document.getElementsByName('pageComplexity[]');
  const startDateInput = document.getElementById('startDate').value;

  let totalHours = 0;
  const ganttData = [];

  for (let i = 0; i < pageNames.length; i++) {
    const name = pageNames[i].value;
    const duration = parseInt(pageDurations[i].value);
    const complexity = pageComplexities[i].value;

    const hours = duration;
    const startDate = new Date(startDateInput);
    startDate.setDate(startDate.getDate() + totalHours / 8);
    totalHours += hours;

    ganttData.push({
      name,
      complexity,
      duration: hours,
      startDate: startDate.toISOString(),
    });
  }

  displayResults(ganttData, totalHours);
  generateGanttChart(ganttData);
}

// Afficher les résultats
function displayResults(data, totalHours) {
  const totalDays = Math.ceil(totalHours / 8);
  const resultHTML = `
    <ul>
      ${data.map(item => `
        <li>
          <strong>${item.name}</strong> (${item.complexity}) - ${item.duration}h (${Math.ceil(item.duration / 8)} jours)
          <br>Date de début : ${new Date(item.startDate).toDateString()}
        </li>
      `).join('')}
    </ul>
    <p><strong>Total :</strong> ${totalHours} heures (${totalDays} jours)</p>
  `;
  resultText.innerHTML = resultHTML;
}

// Générer le diagramme de Gantt
function generateGanttChart(data) {
  const ctx = document.getElementById('ganttChart').getContext('2d');

  const labels = data.map(item => item.name);
  const durations = data.map(item => item.duration);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Durées (en heures)',
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

// Écouteurs d'événements
addPageBtn.addEventListener('click', addPageRow);
calculateBtn.addEventListener('click', calculateProjectTime);

// Initialisation
addPageRow();
