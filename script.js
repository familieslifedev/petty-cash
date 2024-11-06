// DOM Elements
const participantsContainer = document.getElementById('participants-container');
const itemsContainer = document.getElementById('items-container');
const summaryContainer = document.getElementById('summary-container');
const splitMethodSelect = document.getElementById('split-method');
const customPercentagesDiv = document.getElementById('custom-percentages');
const customPercentagesContainer = document.getElementById('custom-percentages-container');

// Data
const participants = [];
const items = [];
const customPercentages = {};

// Add Participant
document.getElementById('add-participant').addEventListener('click', () => {
  const participant = { id: participants.length, name: '', present: true };
  participants.push(participant);
  renderParticipants();
  updateCustomPercentages();
});

// Add Item
document.getElementById('add-item').addEventListener('click', () => {
  const item = { id: items.length, name: '', price: 0, assignedTo: [] };
  items.push(item);
  renderItems();
});

// Update Split Method
splitMethodSelect.addEventListener('change', () => {
  const isCustom = splitMethodSelect.value === 'custom';
  customPercentagesDiv.classList.toggle('hidden', !isCustom);
  calculateSplit();
});

// Render Participants
function renderParticipants() {
  participantsContainer.innerHTML = '';
  participants.forEach(participant => {
    const participantDiv = document.createElement('div');

    // Name Input
    const nameInput = document.createElement('input');
    nameInput.placeholder = 'Participant Name';
    nameInput.value = participant.name;
    nameInput.addEventListener('input', e => {
      participant.name = e.target.value;
      updateCustomPercentages();
    });

    // Present Toggle
    const toggleWrapper = document.createElement('label');
    toggleWrapper.classList.add('toggle');
    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = participant.present;
    toggleInput.addEventListener('change', e => {
      participant.present = e.target.checked;
    });
    const toggleSlider = document.createElement('span');
    toggleSlider.classList.add('toggle-slider');
    toggleWrapper.appendChild(toggleInput);
    toggleWrapper.appendChild(toggleSlider);

    // Append Elements
    participantDiv.appendChild(nameInput);
    participantDiv.appendChild(toggleWrapper);
    participantsContainer.appendChild(participantDiv);
  });
}

// Render Items
function renderItems() {
  itemsContainer.innerHTML = '';
  items.forEach(item => {
    const itemDiv = document.createElement('div');

    // Name Input
    const nameInput = document.createElement('input');
    nameInput.placeholder = 'Item Name';
    nameInput.value = item.name;
    nameInput.addEventListener('input', e => {
      item.name = e.target.value;
    });

    // Price Input
    const priceInput = document.createElement('input');
    priceInput.type = 'number';
    priceInput.placeholder = 'Price';
    priceInput.value = item.price;
    priceInput.addEventListener('input', e => {
      item.price = parseFloat(e.target.value) || 0;
    });

    // Append Elements
    itemDiv.appendChild(nameInput);
    itemDiv.appendChild(priceInput);
    itemsContainer.appendChild(itemDiv);
  });
}

// Update Custom Percentages
function updateCustomPercentages() {
  customPercentagesContainer.innerHTML = '';
  participants.forEach(participant => {
    if (!customPercentages[participant.name]) {
      customPercentages[participant.name] = 0;
    }

    const customDiv = document.createElement('div');
    const label = document.createElement('span');
    label.textContent = participant.name || 'Unnamed';

    const percentageInput = document.createElement('input');
    percentageInput.type = 'number';
    percentageInput.value = customPercentages[participant.name];
    percentageInput.addEventListener('input', e => {
      customPercentages[participant.name] = parseFloat(e.target.value) || 0;
      calculateSplit();
    });

    customDiv.appendChild(label);
    customDiv.appendChild(percentageInput);
    customPercentagesContainer.appendChild(customDiv);
  });
}

 // Calculate Split
function calculateSplit() {
  const method = splitMethodSelect.value;
  const summary = {};

  // Initialize summary for each participant
  participants.forEach(participant => {
    summary[participant.name] = 0;
  });

  if (method === 'itemized') {
    // Itemized Split
    items.forEach(item => {
      item.assignedTo.forEach(name => {
        summary[name] += item.price / item.assignedTo.length;
      });
    });
  } else if (method === 'dutch') {
    // Dutch Split
    const totalBill = items.reduce((sum, item) => sum + item.price, 0);
    const perPerson = totalBill / participants.length;
    participants.forEach(participant => {
      summary[participant.name] = perPerson;
    });
  } else if (method === 'attendance') {
    // Attendance-Based Split
    const presentParticipants = participants.filter(p => p.present).map(p => p.name);
    items.forEach(item => {
      const sharedAmong = item.assignedTo.filter(name => presentParticipants.includes(name));
      sharedAmong.forEach(name => {
        summary[name] += item.price / sharedAmong.length;
      });
    });
  } else if (method === 'custom') {
    // Custom Percentages Split
    const totalBill = items.reduce((sum, item) => sum + item.price, 0);
    const totalPercentage = Object.values(customPercentages).reduce((sum, perc) => sum + perc, 0);

    if (totalPercentage !== 100) {
      alert('Custom percentages must add up to 100%.');
      return;
    }

    participants.forEach(participant => {
      summary[participant.name] = (customPercentages[participant.name] / 100) * totalBill;
    });
  }

  renderSummary(summary);
}

// Render Summary
function renderSummary(summary) {
  summaryContainer.innerHTML = '';
  Object.entries(summary).forEach(([name, amount]) => {
    const summaryItem = document.createElement('li');
    summaryItem.textContent = `${name}: $${amount.toFixed(2)}`;
    summaryContainer.appendChild(summaryItem);
  });
}

