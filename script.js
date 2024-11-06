// Get DOM elements
const participantsDiv = document.getElementById('participants');
const itemsDiv = document.getElementById('items');
const summaryList = document.getElementById('summary');
const splitMethodSelect = document.getElementById('split-method');

// Data storage
let participants = [];
let items = [];

// Add Participant
document.getElementById('add-participant').addEventListener('click', () => {
  const id = Date.now();
  participants.push({ id, name: '', isPresent: true, customPercentage: 0 });
  renderParticipants();
});

// Remove Participant
function removeParticipant(id) {
  participants = participants.filter(p => p.id !== id);
  renderParticipants();
}

// Add Item
document.getElementById('add-item').addEventListener('click', () => {
  const id = Date.now();
  items.push({ id, name: '', price: 0 });
  renderItems();
});

// Remove Item
function removeItem(id) {
  items = items.filter(i => i.id !== id);
  renderItems();
}

// Render Participants
function renderParticipants() {
  participantsDiv.innerHTML = '';
  participants.forEach(participant => {
    const div = document.createElement('div');
    div.innerHTML = `
      <input 
        type="text" 
        placeholder="Name" 
        value="${participant.name}" 
        oninput="updateParticipantName(${participant.id}, this.value)">
      <label>
        <input 
          type="checkbox" 
          ${participant.isPresent ? 'checked' : ''} 
          onchange="toggleAttendance(${participant.id})">
        Present
      </label>
      <input 
        type="number" 
        placeholder="Custom %" 
        value="${participant.customPercentage}" 
        ${splitMethodSelect.value !== 'custom' ? 'disabled' : ''} 
        oninput="updateCustomPercentage(${participant.id}, this.value)">
      <button onclick="removeParticipant(${participant.id})">Remove</button>
    `;
    participantsDiv.appendChild(div);
  });
}

// Render Items
function renderItems() {
  itemsDiv.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.innerHTML = `
      <input 
        type="text" 
        placeholder="Item Name" 
        value="${item.name}" 
        oninput="updateItemName(${item.id}, this.value)">
      <input 
        type="number" 
        placeholder="Price" 
        value="${item.price}" 
        oninput="updateItemPrice(${item.id}, this.value)">
      <button onclick="removeItem(${item.id})">Remove</button>
    `;
    itemsDiv.appendChild(div);
  });
}

// Update Participant Name
function updateParticipantName(id, value) {
  participants = participants.map(p => p.id === id ? { ...p, name: value } : p);
}

// Toggle Attendance
function toggleAttendance(id) {
  participants = participants.map(p => p.id === id ? { ...p, isPresent: !p.isPresent } : p);
}

// Update Custom Percentage
function updateCustomPercentage(id, value) {
  participants = participants.map(p => p.id === id ? { ...p, customPercentage: +value } : p);
}

// Update Item Name
function updateItemName(id, value) {
  items = items.map(i => i.id === id ? { ...i, name: value } : i);
}

// Update Item Price
function updateItemPrice(id, value) {
  items = items.map(i => i.id === id ? { ...i, price: +value } : i);
}

// Calculate Totals
splitMethodSelect.addEventListener('change', updateSummary);

function updateSummary() {
  summaryList.innerHTML = '';
  const totalCost = items.reduce((sum, item) => sum + item.price, 0);

  participants.forEach(participant => {
    let amount = 0;

    if (splitMethodSelect.value === 'dutch') {
      amount = totalCost / participants.length;
    } else if (splitMethodSelect.value === 'attendance') {
      const presentCount = participants.filter(p => p.isPresent).length;
      amount = participant.isPresent ? totalCost / presentCount : 0;
    } else if (splitMethodSelect.value === 'custom') {
      const totalPercentage = participants.reduce((sum, p) => sum + p.customPercentage, 0);
      if (totalPercentage === 100) {
        amount = (totalCost * participant.customPercentage) / 100;
      }
    }

    const li = document.createElement('li');
    li.textContent = `${participant.name || 'Unnamed'}: $${amount.toFixed(2)}`;
    summaryList.appendChild(li);
  });
}
