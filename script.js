/**
 * DOM Elements
 */
const participantsContainer = document.getElementById('participants-container');
const itemsContainer = document.getElementById('items-container');
const customPercentagesDiv = document.getElementById('custom-percentages');
const customPercentagesContainer = document.getElementById('custom-percentages-container');
const splitMethodSelect = document.getElementById('split-method');
const calculateButton = document.getElementById('calculate-button');
const summaryContainer = document.getElementById('summary-container');
const themeToggleButton = document.getElementById('theme-toggle');

/**
 * Templates
 */
const participantTemplate = document.getElementById('participant-template').content;
const itemTemplate = document.getElementById('item-template').content;

/**
 * Data
 */
const participants = [];
const items = [];
const customPercentages = {};
let summary = {};

/**
 * Add Participant
 * Adds a new participant to the participants array and renders the participants.
 */
document.getElementById('add-participant').addEventListener('click', () => {
    const participant = {id: participants.length, name: '', present: true};
    participants.push(participant);
    renderParticipants();
    if (splitMethodSelect.value === 'custom') {
        renderCustomPercentages();
    }
});

/**
 * Add Item
 * Adds a new item to the items array and renders the items.
 */
document.getElementById('add-item').addEventListener('click', () => {
    const item = {id: items.length, name: '', price: 0, assignedTo: []};
    items.push(item);
    renderItems();
});

/**
 * Attach Calculate Button Event
 * Validates inputs, serializes data, and calculates the split when the calculate button is clicked.
 */
calculateButton.addEventListener('click', () => {
    if (validateInputs()) {
        const jsonData = serializeData(); // Call serializeData to generate JSON
        console.log('Serialized JSON:', jsonData); // Log the JSON to the console
        calculateSplit(); // Proceed with calculations
    }
});

/**
 * Theme Toggle Logic
 * Toggles between light and dark themes and updates the button text accordingly.
 */
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

/**
 * Render Participants
 * Renders the list of participants in the participants container.
 */
function renderParticipants() {
    participantsContainer.innerHTML = ''; // Clear the container

    participants.forEach(participant => {
        const participantClone = document.importNode(participantTemplate, true);

        const nameInput = participantClone.querySelector('.participant-name');
        const presentToggle = participantClone.querySelector('.participant-present');
        const removeButton = participantClone.querySelector('.remove-button');
        const toggleLabel = participantClone.querySelector('label[for="participant-present-1"]');

        // Ensure unique IDs for the toggle input and its label
        const uniqueToggleId = `participant-present-${participant.id}`;
        presentToggle.id = uniqueToggleId;
        if (toggleLabel) toggleLabel.setAttribute('for', uniqueToggleId);

        // Set initial values
        nameInput.value = participant.name;
        presentToggle.checked = participant.present;

        // Attach event listeners
        nameInput.addEventListener('input', e => {
            participant.name = e.target.value;
            if (splitMethodSelect.value === 'custom') {
                renderCustomPercentages();
            }
        });

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

/**
 * Render Items
 * Renders the list of items in the items container.
 */
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

/**
 * Render Custom Percentages
 * Renders the custom percentages input fields for each participant.
 */
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

/**
 * Remove Participant
 * Removes a participant by their ID and re-renders the participants and custom percentages.
 * @param {number} id - The ID of the participant to remove.
 */
function removeParticipant(id) {
    participants.splice(id, 1);
    participants.forEach((p, index) => (p.id = index)); // Reassign IDs
    renderParticipants();
    if (splitMethodSelect.value === 'custom') {
        renderCustomPercentages();
    }
}

/**
 * Remove Item
 * Removes an item by their ID and re-renders the items.
 * @param {number} id - The ID of the item to remove.
 */
function removeItem(id) {
    items.splice(id, 1);
    items.forEach((item, index) => (item.id = index)); // Reassign IDs
    renderItems();
}

/**
 * Toggle Custom Percentages Visibility
 * Toggles the visibility of the custom percentages section based on the selected split method.
 */
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

/**
 * Input Validation
 * Validates the inputs for participants and items.
 * @returns {boolean} - Returns true if all inputs are valid, otherwise false.
 */
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

/**
 * Calculate Split
 * Orchestrates the calculation of the split based on the selected method.
 */
function calculateSplit() {
    if (!validateInputs()) return;

    // Initialize a local summary object
    let summary = participants.reduce((acc, p) => {
        acc[p.id] = 0;
        return acc;
    }, {});

    const method = splitMethodSelect.value;
    let presentTotal = 0;

    switch (method) {
        case 'itemized':
            summary = calculateItemizedSplit(summary);
            break;

        case 'dutch':
            summary = calculateDutchSplit(summary);
            break;

        case 'attendance':
            presentTotal = calculateAttendanceSplit(summary);
            break;

        case 'custom':
            if (!validateCustomPercentages()) return; // Validate custom percentages
            summary = calculateCustomSplit(summary);
            break;

        default:
            alert('Invalid split method selected.');
            return;
    }

    console.log("Final Summary Before Tax & Tip Distribution:", summary);

    // Calculate extras (tax and tip) and distribute
    const total = presentTotal || calculateTotal();
    const {tax, tip, totalExtras} = calculateExtras(total);
    distributeExtras(totalExtras, summary, method);

    console.log("Final Summary After Tax & Tip Distribution:", summary);

    // Final rounding and render
    finalizeSummary(summary);
    renderSummary(summary, getCurrency());
}

/**
 * Calculate Extras
 * Computes tax, tip, and combined extras.
 */
function calculateExtras(total) {
    if (isNaN(total) || total <= 0) {
        console.error("Invalid total for extras calculation:", total);
        return {tax: 0, tip: 0, totalExtras: 0};
    }

    const taxPercentage = parseFloat(document.getElementById('tax').value) || 0;
    const tipPercentage = parseFloat(document.getElementById('tip').value) || 0;

    const tax = total * (taxPercentage / 100);
    const tip = total * (tipPercentage / 100);

    console.log("Tax Percentage:", taxPercentage, "Tip Percentage:", tipPercentage);
    console.log("Tax:", tax, "Tip:", tip);

    return {tax, tip, totalExtras: tax + tip};
}

/**
 * Calculate Itemized Split
 * Handles splitting items based on assigned participants.
 */
function calculateItemizedSplit(summary) {
    items.forEach(item => {
        item.assignedTo.forEach(id => {
            summary[id] += item.price / item.assignedTo.length;
        });
    });
    return summary;
}

/**
 * Calculate Dutch Split
 * Evenly splits the total across all participants.
 */
function calculateDutchSplit(summary) {
    const total = calculateTotal();
    const perPerson = total / participants.length;

    participants.forEach(p => {
        summary[p.id] = perPerson;
    });

    return summary;
}

/**
 * Calculate Attendance Split
 * Splits costs among present participants.
 */
function calculateAttendanceSplit(summary) {
    let presentTotal = 0;

    items.forEach(item => {
        const assignedPresentParticipants = participants.filter(p => p.present && item.assignedTo.includes(p.id));

        if (assignedPresentParticipants.length > 0) {
            const splitAmount = item.price / assignedPresentParticipants.length;

            assignedPresentParticipants.forEach(p => {
                summary[p.id] += splitAmount;
            });

            presentTotal += item.price;
        }
    });

    console.log("Present Total (Base Costs):", presentTotal);
    return presentTotal;
}

/**
 * Calculate Custom Split
 * Distributes costs based on custom percentages.
 */
function calculateCustomSplit(summary) {
    const total = calculateTotal();

    participants.forEach(p => {
        summary[p.id] = (customPercentages[p.id] / 100) * total || 0;
    });

    return summary;
}

/**
 * Validate Custom Percentages
 * Ensures custom percentages add up to 100.
 */
function validateCustomPercentages() {
    const totalPercentage = Object.values(customPercentages).reduce((sum, perc) => sum + perc, 0);
    if (totalPercentage !== 100) {
        alert('Custom percentages must add up to 100%.');
        return false;
    }
    return true;
}

/**
 * Finalize Summary
 * Rounds all values to two decimal places.
 */
function finalizeSummary(summary) {
    Object.keys(summary).forEach(id => {
        summary[id] = Math.round(summary[id] * 100) / 100;
    });
}

/**
 * Distribute Extras Proportionally
 * Distributes the total extras (tax and tip) proportionally.
 */
function distributeExtras(totalExtras, summary, method) {
    switch (method) {
        case 'itemized':
            const totalShares = Object.values(summary).reduce((sum, value) => sum + value, 0);

            participants.forEach(p => {
                if (summary[p.id] > 0) {
                    const sharePercentage = summary[p.id] / totalShares;
                    summary[p.id] += totalExtras * sharePercentage;
                }
            });
            break;

        case 'dutch':
            const extrasPerPerson = totalExtras / participants.length;

            participants.forEach(p => {
                summary[p.id] += extrasPerPerson;
            });
            break;

        case 'attendance':
            const presentParticipants = participants.filter(p => p.present);
            const extrasPerPresent = totalExtras / presentParticipants.length;

            presentParticipants.forEach(p => {
                summary[p.id] += extrasPerPresent;
            });
            break;

        case 'custom':
            participants.forEach(p => {
                const percentage = customPercentages[p.id] / 100;
                summary[p.id] += totalExtras * percentage;
            });
            break;

        default:
            console.error("Unknown method for distributing extras.");
    }
}

/**
 * Calculate Total
 * Sums up the item prices.
 */
function calculateTotal() {
    return items.reduce((sum, item) => sum + item.price, 0);
}

/**
 * Get Currency
 * Retrieves the currently selected currency.
 */
function getCurrency() {
    return document.getElementById('currency').value;
}

/**
 * Render Summary
 * Renders the summary of the split amounts in the summary container.
 */
function renderSummary(summary, currency) {
    const currencySymbol = {
        'usd': '$',
        'gbp': '£',
        'eur': '€',
        'jpy': '¥'
    }[currency] || '£';

    summaryContainer.innerHTML = participants
        .map(p => {
            const amount = summary[p.id] || 0;
            return `<li>${p.name}: ${currencySymbol}${amount.toFixed(2)}</li>`;
        })
        .join('');
}

/**
 * Serialize Data for Backend Integration
 * Serializes the current state of participants, items, split method, and custom percentages into a JSON string.
 * @returns {string} - The serialized JSON string.
 */
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

/**
 * Export Functions
 * Exports the summary as a PDF or CSV file.
 */
document.getElementById('export-pdf').addEventListener('click', () => {
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.text("Payment Summary", 10, 10);

    // Add participants and their amounts
    const initialYOffset = 20; // Starting position for text
    const lineSpacing = 10; // Spacing between lines
    let yOffset = initialYOffset; // Start below the title
    participants.forEach((p) => {
        const amount = (summary[p.id] || 0).toFixed(2);
        doc.text(`${p.name}: ${amount}`, 10, yOffset);
        yOffset += lineSpacing; // Move down for the next line
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
