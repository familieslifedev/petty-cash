// DOM Elements
const participantsContainer = document.getElementById('participants-container');
const itemsContainer = document.getElementById('items-container');
const customPercentagesDiv = document.getElementById('custom-percentages');
const customPercentagesContainer = document.getElementById('custom-percentages-container');
const splitMethodSelect = document.getElementById('split-method');
const calculateButton = document.getElementById('calculate-button');
const summaryContainer = document.getElementById('summary-container');

// Templates
const participantTemplate = document.getElementById('participant-template').content;
const itemTemplate = document.getElementById('item-template').content;

// Data
const participants = [];
const items = [];
const customPercentages = {};

// Add Participant
document.getElementById('add-participant').addEventListener('click', () => {
    const participant = { id: participants.length, name: '', present: true };
    participants.push(participant);
    renderParticipants();
    if (splitMethodSelect.value === 'custom') {
        renderCustomPercentages();
    }
});

// Add Item
document.getElementById('add-item').addEventListener('click', () => {
    const item = { id: items.length, name: '', price: 0, assignedTo: [] };
    items.push(item);
    renderItems();
});

// Render Participants
function renderParticipants() {
    participantsContainer.innerHTML = ''; // Clear container
    participants.forEach(participant => {
        const participantClone = document.importNode(participantTemplate, true);
        const nameInput = participantClone.querySelector('.participant-name');
        const presentToggle = participantClone.querySelector('.participant-present');
        const removeButton = participantClone.querySelector('.remove-button');

        // Set initial values and event listeners
        nameInput.value = participant.name;
        nameInput.addEventListener('input', e => {
            participant.name = e.target.value;
            if (splitMethodSelect.value === 'custom') {
                renderCustomPercentages();
            }
        });

        presentToggle.checked = participant.present;
        presentToggle.addEventListener('change', e => {
            participant.present = e.target.checked;
        });

        removeButton.addEventListener('click', () => {
            removeParticipant(participant.id);
        });

        participantsContainer.appendChild(participantClone);
    });

    // Re-render items to ensure participant changes are reflected
    renderItems();
}

// Remove Participant
function removeParticipant(id) {
    participants.splice(id, 1);
    participants.forEach((p, index) => (p.id = index)); // Reassign IDs
    renderParticipants();
    if (splitMethodSelect.value === 'custom') {
        renderCustomPercentages();
    }
}

// Render Items
function renderItems() {
    itemsContainer.innerHTML = ''; // Clear container
    items.forEach(item => {
        const itemClone = document.importNode(itemTemplate, true);
        const nameInput = itemClone.querySelector('.item-name');
        const priceInput = itemClone.querySelector('.item-price');
        const assignContainer = itemClone.querySelector('.assign-container');
        const removeButton = itemClone.querySelector('.remove-button');

        // Set initial values and event listeners
        nameInput.value = item.name;
        nameInput.addEventListener('input', e => {
            item.name = e.target.value;
        });

        priceInput.value = item.price;
        priceInput.addEventListener('input', e => {
            item.price = parseFloat(e.target.value) || 0;
        });

        // Populate assignment checkboxes dynamically
        assignContainer.innerHTML = '<span>Assign to:</span>';
        participants.forEach(participant => {
            const checkboxRow = document.createElement('div');
            checkboxRow.classList.add('checkbox-row');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.classList.add('item-assigned');
            checkbox.value = participant.name;
            checkbox.checked = item.assignedTo.includes(participant.name);

            // Add change event to track assignments
            checkbox.addEventListener('change', e => {
                if (e.target.checked) {
                    item.assignedTo.push(participant.name);
                } else {
                    item.assignedTo = item.assignedTo.filter(name => name !== participant.name);
                }
            });

            const label = document.createElement('label');
            label.textContent = participant.name;

            checkboxRow.appendChild(checkbox);
            checkboxRow.appendChild(label);
            assignContainer.appendChild(checkboxRow);
        });

        // Handle item removal
        removeButton.addEventListener('click', () => {
            removeItem(item.id);
        });

        itemsContainer.appendChild(itemClone);
    });
}

// Remove Item
function removeItem(id) {
    items.splice(id, 1);
    items.forEach((item, index) => (item.id = index)); // Reassign IDs
    renderItems();
}

// Render Custom Percentages
function renderCustomPercentages() {
    customPercentagesDiv.classList.remove('hidden'); // Show the section
    customPercentagesContainer.innerHTML = ''; // Clear existing inputs

    participants.forEach(participant => {
        if (!customPercentages[participant.name]) {
            customPercentages[participant.name] = 0;
        }

        const customDiv = document.createElement('div');
        customDiv.classList.add('custom-row');

        const label = document.createElement('span');
        label.textContent = participant.name || 'Unnamed';

        const percentageInput = document.createElement('input');
        percentageInput.type = 'number';
        percentageInput.classList.add('custom-percentage');
        percentageInput.value = customPercentages[participant.name];
        percentageInput.addEventListener('input', e => {
            customPercentages[participant.name] = parseFloat(e.target.value) || 0;
        });

        customDiv.appendChild(label);
        customDiv.appendChild(percentageInput);
        customPercentagesContainer.appendChild(customDiv);
    });
}

// Toggle Custom Percentages Visibility
splitMethodSelect.addEventListener('change', () => {
    const isCustom = splitMethodSelect.value === 'custom';
    if (isCustom) {
        renderCustomPercentages();
    } else {
        customPercentagesDiv.classList.add('hidden'); // Hide when not custom
    }
});

// Input Validation
function validateInputs() {
    let isValid = true;
    let errorMessages = [];

    // Validate participant names
    participants.forEach((participant, index) => {
        if (!participant.name.trim()) {
            isValid = false;
            errorMessages.push(`Participant #${index + 1} is missing a name.`);
        }
    });

    // Validate items
    items.forEach((item, index) => {
        if (!item.name.trim()) {
            isValid = false;
            errorMessages.push(`Item #${index + 1} is missing a name.`);
        }
        if (item.price <= 0) {
            isValid = false;
            errorMessages.push(`Item #${index + 1} must have a price greater than 0.`);
        }
    });

    // Show error messages if validation fails
    if (!isValid) {
        alert(errorMessages.join('\n'));
    }

    return isValid;
}

// Calculate Split
function calculateSplit() {
    if (!validateInputs()) {
        return; // Stop if inputs are invalid
    }

    const summary = {};
    participants.forEach(p => (summary[p.name] = 0)); // Initialize summary

    const method = splitMethodSelect.value;
    const total = items.reduce((sum, item) => sum + item.price, 0);

    if (method === 'itemized') {
        // Itemized Split
        items.forEach(item => {
            item.assignedTo.forEach(name => {
                summary[name] += item.price / item.assignedTo.length;
            });
        });
    } else if (method === 'dutch') {
        // Dutch Split
        const perPerson = total / participants.length;
        participants.forEach(p => (summary[p.name] = perPerson));
    } else if (method === 'attendance') {
        // Attendance-Based Split
        items.forEach(item => {
            const presentParticipants = participants.filter(p => p.present && item.assignedTo.includes(p.name));
            presentParticipants.forEach(p => {
                summary[p.name] += item.price / presentParticipants.length;
            });
        });
    } else if (method === 'custom') {
        // Custom Percentages
        const totalPercentage = Object.values(customPercentages).reduce((sum, perc) => sum + perc, 0);
        if (totalPercentage !== 100) {
            alert('Custom percentages must add up to 100%.');
            return;
        }
        participants.forEach(p => {
            summary[p.name] = (customPercentages[p.name] / 100) * total || 0;
        });
    }

    renderSummary(summary);
}

// Render Summary
function renderSummary(summary) {
    summaryContainer.innerHTML = Object.entries(summary)
        .map(([name, amount]) => `<li>${name}: $${amount.toFixed(2)}</li>`)
        .join('');
}

// Serialize Data for Backend Integration
function serializeData() {
    return JSON.stringify({
        participants: participants.map(p => ({
            name: p.name,
            present: p.present
        })),
        items: items.map(i => ({
            name: i.name,
            price: i.price,
            assignedTo: i.assignedTo
        })),
        splitMethod: splitMethodSelect.value,
        customPercentages
    });
}

// Attach Calculate Button Event
calculateButton.addEventListener('click', () => {
    if (validateInputs()) {
        const jsonData = serializeData(); // Call serializeData to generate JSON
        console.log('Serialized JSON:', jsonData); // Log the JSON to the console
        calculateSplit(); // Proceed with calculations
    }
});
