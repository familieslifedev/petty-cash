// DOM Elements
const participantsContainer = document.getElementById('participants-container');
const itemsContainer = document.getElementById('items-container');
const customPercentagesDiv = document.getElementById('custom-percentages');
const customPercentagesContainer = document.getElementById('custom-percentages-container');
const splitMethodSelect = document.getElementById('split-method');
const calculateButton = document.getElementById('calculate-button');
const summaryContainer = document.getElementById('summary-container');
const themeToggleButton = document.getElementById('theme-toggle');

// Templates
const participantTemplate = document.getElementById('participant-template').content;
const itemTemplate = document.getElementById('item-template').content;

// Data
const participants = [];
const items = [];
const customPercentages = {};
let summary = {};

// Add Participant
document.getElementById('add-participant').addEventListener('click', () => {
    const participant = {id: participants.length, name: '', present: true};
    participants.push(participant);
    renderParticipants();
    if (splitMethodSelect.value === 'custom') {
        renderCustomPercentages();
    }
});

// Add Item
document.getElementById('add-item').addEventListener('click', () => {
    const item = {id: items.length, name: '', price: 0, assignedTo: []};
    items.push(item);
    renderItems();
});

// Attach Calculate Button Event
calculateButton.addEventListener('click', () => {
    if (validateInputs()) {
        const jsonData = serializeData(); // Call serializeData to generate JSON
        console.log('Serialized JSON:', jsonData); // Log the JSON to the console
        calculateSplit(); // Proceed with calculations
    }
});

// Theme Toggle Logic
// Check the current theme (light or dark) on page load
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggleButton.textContent = '☀️'; // Set to Light Mode indicator
} else {
    themeToggleButton.textContent = '🌙'; // Set to Dark Mode indicator
}

// Toggle theme and update button text
themeToggleButton.addEventListener('click', () => {
    const isDarkMode = document.body.classList.toggle('dark-mode');

    // Update button text
    themeToggleButton.textContent = isDarkMode ? '☀️' : '🌙';

    // Save preference to localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
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
            checkbox.value = participant.id; // Use ID as the value
            checkbox.checked = item.assignedTo.includes(participant.id);

            // Add change event to track assignments
            checkbox.addEventListener('change', e => {
                if (e.target.checked) {
                    item.assignedTo.push(participant.id); // Use ID
                } else {
                    item.assignedTo = item.assignedTo.filter(id => id !== participant.id); // Filter by ID
                }
            });

            const label = document.createElement('label');
            label.textContent = participant.name || `Participant ${participant.id}`;

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

// Render Custom Percentages
function renderCustomPercentages() {
    customPercentagesDiv.classList.remove('hidden'); // Show the section
    customPercentagesContainer.innerHTML = ''; // Clear existing inputs

    participants.forEach(participant => {
        if (!customPercentages[participant.id]) { // Use ID
            customPercentages[participant.id] = 0;
        }

        const customDiv = document.createElement('div');
        customDiv.classList.add('custom-row');

        const label = document.createElement('span');
        label.textContent = participant.name || `Participant ${participant.id}`;

        const percentageInput = document.createElement('input');
        percentageInput.type = 'number';
        percentageInput.classList.add('custom-percentage');
        percentageInput.value = customPercentages[participant.id]; // Use ID
        percentageInput.addEventListener('input', e => {
            customPercentages[participant.id] = parseFloat(e.target.value) || 0; // Use ID
        });

        customDiv.appendChild(label);
        customDiv.appendChild(percentageInput);
        customPercentagesContainer.appendChild(customDiv);
    });
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

// Remove Item
function removeItem(id) {
    items.splice(id, 1);
    items.forEach((item, index) => (item.id = index)); // Reassign IDs
    renderItems();
}

// Toggle Custom Percentages Visibility
splitMethodSelect.addEventListener('change', () => {
    switch (splitMethodSelect.value) {
        case 'custom':
            renderCustomPercentages();
            break;
        default:
            customPercentagesDiv.classList.add('hidden'); // Hide when not custom
            break;
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

    summary = {}; // Reset summary
    participants.forEach(p => (summary[p.id] = 0)); // Initialize summary with IDs as keys

    const method = splitMethodSelect.value;
    const total = items.reduce((sum, item) => sum + item.price, 0);

    // Get tax, tip, and currency values
    const taxPercentage = parseFloat(document.getElementById('tax').value) || 0;
    const tipPercentage = parseFloat(document.getElementById('tip').value) || 0;
    const currency = document.getElementById('currency').value; // Get currency value

    // Calculate tax and tip
    const tax = total * (taxPercentage / 100);
    const tip = total * (tipPercentage / 100);
    const totalExtras = tax + tip; // Combined tax and tip

    // Split Calculations Based on Selected Method
    switch (method) {
        case 'itemized':
            items.forEach(item => {
                item.assignedTo.forEach(id => {
                    summary[id] += item.price / item.assignedTo.length;
                });
            });
            break;

        case 'dutch':
            const perPerson = total / participants.length; // Base split (items only)
            participants.forEach(p => (summary[p.id] = perPerson));
            break;

        case 'attendance':
            items.forEach(item => {
                const presentParticipants = participants.filter(p => p.present && item.assignedTo.includes(p.id));
                presentParticipants.forEach(p => {
                    summary[p.id] += item.price / presentParticipants.length;
                });
            });
            break;

        case 'custom':
            const totalPercentage = Object.values(customPercentages).reduce((sum, perc) => sum + perc, 0);
            if (totalPercentage !== 100) {
                alert('Custom percentages must add up to 100%.');
                return;
            }
            participants.forEach(p => {
                summary[p.id] = (customPercentages[p.id] / 100) * total || 0;
            });
            break;

        default:
            alert('Invalid split method selected.');
            return;
    }

    // Distribute Tax and Tip Proportionally
    distributeExtras(totalExtras, method);

    // Final Rounding
    Object.keys(summary).forEach(id => {
        summary[id] = Math.round(summary[id] * 100) / 100; // Round to 2 decimal places
    });

    renderSummary(summary, currency); // Pass currency explicitly
}

// Distribute Extras Proportionally
function distributeExtras(totalExtras, method) {
    switch (method) {
        case 'itemized':
            // Distribute extras proportionally based on each participant's share
            const totalShares = Object.values(summary).reduce((sum, value) => sum + value, 0);
            participants.forEach(p => {
                if (summary[p.id] > 0) {
                    const sharePercentage = summary[p.id] / totalShares;
                    summary[p.id] += totalExtras * sharePercentage;
                }
            });
            break;

        case 'dutch':
            // Split extras evenly
            const extrasPerPerson = totalExtras / participants.length;
            participants.forEach(p => {
                summary[p.id] += extrasPerPerson;
            });
            break;

        case 'attendance':
            // Distribute extras among present participants
            const presentParticipants = participants.filter(p => p.present);
            const extrasPerPresent = totalExtras / presentParticipants.length;
            presentParticipants.forEach(p => {
                summary[p.id] += extrasPerPresent;
            });
            break;

        case 'custom':
            // Distribute extras based on custom percentages
            participants.forEach(p => {
                if (customPercentages[p.id]) {
                    const percentage = customPercentages[p.id] / 100;
                    summary[p.id] += totalExtras * percentage;
                }
            });
            break;

        default:
            console.error('Unknown method for distributing extras.');
    }
}

// Render Summary
function renderSummary(summary, currency) {
    const currencySymbol = {
        'usd': '$',
        'gbp': '£',
        'eur': '€',
        'jpy': '¥' // Added JPY
    }[currency] || '$';

    summaryContainer.innerHTML = participants
        .map(p => `<li>${p.name}: ${currencySymbol}${(summary[p.id] || 0).toFixed(2)}</li>`)
        .join('');
}

// Serialize Data for Backend Integration
function serializeData() {
    return JSON.stringify({
        participants: participants.map(p => ({
            id: p.id,
            name: p.name,
            present: p.present
        })),
        items: items.map(i => ({
            name: i.name,
            price: i.price,
            assignedTo: i.assignedTo // IDs only
        })),
        splitMethod: splitMethodSelect.value,
        customPercentages
    });
}

// Export Functions
document.getElementById('export-pdf').addEventListener('click', () => {
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.text("Payment Summary", 10, 10);

    // Add participants and their amounts
    let yOffset = 20; // Start below the title
    participants.forEach((p) => {
        const amount = (summary[p.id] || 0).toFixed(2);
        doc.text(`${p.name}: ${amount}`, 10, yOffset);
        yOffset += 10; // Move down for the next line
    });

    // Save the PDF
    doc.save('split_summary.pdf');
});

document.getElementById('export-csv').addEventListener('click', () => {
    // Ensure calculations are up to date
    calculateSplit();

    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,Name,Amount\n";
    participants.forEach((p) => {
        const amount = (summary[p.id] || 0).toFixed(2);
        csvContent += `${p.name},${amount}\n`;
    });

    // Create a downloadable link and trigger it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'split_summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link); // Clean up the link element
});
