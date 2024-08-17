let isDrawing = false;
let startPoint = { x: 0, y: 0 };
let drawnLines = [];

function showComponent(componentId) {
    // Hide all panels
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.add('hidden'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.nav-menu button');
    buttons.forEach(button => button.classList.remove('active'));

    // Show selected component
    document.getElementById(componentId).classList.remove('hidden');

    // Add active class to the clicked button
    document.querySelector(`.nav-menu button[onclick="showComponent('${componentId}')"]`).classList.add('active');

    // Initialize the canvas when the Stone Quote component is shown
    if (componentId === 'stoneQuote') {
        initDrawingCanvas();
    }
}

function fractionToDecimal(fraction) {
    if (fraction.includes('/')) {
        const parts = fraction.split(' ');
        if (parts.length === 2) {
            const whole = parseFloat(parts[0]);
            const frac = parts[1].split('/');
            return whole + (parseFloat(frac[0]) / parseFloat(frac[1]));
        } else {
            const frac = parts[0].split('/');
            return parseFloat(frac[0]) / parseFloat(frac[1]);
        }
    } else {
        return parseFloat(fraction);
    }
}

function calculateLinearFootage(cabWidth, numSpanners, cabHeight, numSides) {
    const cabinetType = document.getElementById('cabinetType').value;
    const toeKickHeight = parseFloat(document.getElementById('toeKickHeight').value);

    // Subtract toe kick height from cabinet height if applicable
    if (cabinetType !== 'Upper') {
        cabHeight -= toeKickHeight;
    }

    // Calculate total length of edges in inches
    const totalLengthInches = (cabWidth * numSpanners) + (cabHeight * numSides);
    
    // Convert to linear footage
    return totalLengthInches / 12;
}

function addCabinet() {
    const jobName = document.getElementById('jobName').value.trim();
    const roomName = document.getElementById('roomName').value.trim();
    const cabinetNumber = parseInt(document.getElementById('cabinetNumber').value);
    const cabinetType = document.getElementById('cabinetType').value;
    const cabWidth = fractionToDecimal(document.getElementById('cabWidth').value);
    const numSpanners = parseInt(document.getElementById('numSpanners').value);
    let cabHeight = fractionToDecimal(document.getElementById('cabHeight').value);
    const numSides = parseInt(document.getElementById('numSides').value);

    if (isNaN(cabinetNumber) || isNaN(cabWidth) || isNaN(numSpanners) || isNaN(cabHeight) || isNaN(numSides)) {
        alert("Please enter valid numbers in all fields.");
        return;
    }

    const linearFootage = calculateLinearFootage(cabWidth, numSpanners, cabHeight, numSides);
    totalLinearFootage += linearFootage;
    cabinetCount++;

    const cabinetList = document.getElementById('cabinetList');

    // Add Job Name and Room Name to the list only once
    if (cabinetCount === 1) {
        const jobRoomItem = document.createElement('div');
        jobRoomItem.className = 'cabinet-item';
        jobRoomItem.style.width = "100%"; // Ensure full-width for job/room info
        jobRoomItem.style.fontWeight = "bold"; // Make it stand out
        jobRoomItem.innerHTML = `Job: ${jobName} | Room: ${roomName}`;
        cabinetList.appendChild(jobRoomItem);
    }

    // Add the cabinet to the list
    const cabinetItem = document.createElement('div');
    cabinetItem.className = 'cabinet-item';
    cabinetItem.innerHTML = `Cabinet ${cabinetNumber} (${cabinetType}) - ${linearFootage.toFixed(2)} feet <button onclick="removeCabinet(this, ${linearFootage})">Delete</button>`;
    cabinetList.appendChild(cabinetItem);

    // Update the total linear footage and cabinet count display
    document.getElementById('totalResult').innerText = totalLinearFootage.toFixed(2);
    document.getElementById('cabinetCount').innerText = cabinetCount;

    // Clear the input fields and set focus back to cabinet number field
    document.getElementById('cabinetNumber').value = '';
    document.getElementById('cabinetType').value = 'Base';
    document.getElementById('cabWidth').value = '';
    document.getElementById('numSpanners').value = '';
    document.getElementById('cabHeight').value = '';
    document.getElementById('numSides').value = '';
    document.getElementById('cabinetNumber').focus();

    // Reset toe kick height dropdown to active
    document.getElementById('toeKickHeight').disabled = false;
}

function removeCabinet(button, linearFootage) {
    // Remove the cabinet's linear footage from the total
    totalLinearFootage -= linearFootage;
    cabinetCount--;

    // Remove the cabinet item from the list
    button.parentElement.remove();

    // Update the total linear footage and cabinet count display
    document.getElementById('totalResult').innerText = totalLinearFootage.toFixed(2);
    document.getElementById('cabinetCount').innerText = cabinetCount;
}

function toggleToeKick() {
    const cabinetType = document.getElementById('cabinetType').value;
    const toeKickHeight = document.getElementById('toeKickHeight');
    
    if (cabinetType === 'Upper') {
        toeKickHeight.disabled = true;
    } else {
        toeKickHeight.disabled = false;
    }
}

function initDrawingCanvas() {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions based on its CSS width/height
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Event listeners for mouse interactions
    canvas.addEventListener('mousedown', (event) => {
        const { offsetX, offsetY } = event;
        if (!isDrawing) {
            // Start drawing
            isDrawing = true;
            startPoint = { x: offsetX, y: offsetY };
            ctx.moveTo(offsetX, offsetY);
        }
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDrawing) {
            const { offsetX, offsetY } = event;

            // Clear the canvas before drawing the line
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Redraw all existing lines
            drawnLines.forEach(line => {
                ctx.beginPath();
                ctx.moveTo(line.start.x, line.start.y);
                ctx.lineTo(line.end.x, line.end.y);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // Draw the current line
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(offsetX, offsetY);
            ctx.strokeStyle = '#000'; // Set the line color
            ctx.lineWidth = 2; // Set the line width
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (isDrawing) {
            isDrawing = false;
            // Finalize the line
            const { offsetX, offsetY } = event;
            drawnLines.push({ start: startPoint, end: { x: offsetX, y: offsetY } });
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (isDrawing) {
            isDrawing = false;
        }
    });
}

// Initialize the canvas when the Stone Quote component is shown
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector(`.nav-menu button[onclick="showComponent('stoneQuote')"]`).addEventListener('click', () => {
        initDrawingCanvas();
    });
});
