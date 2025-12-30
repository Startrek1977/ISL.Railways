// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadSchedule();
    loadTrainOptions();
    setupEventListeners();
    setMinDate();
});

// Setup event listeners
function setupEventListeners() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Update active link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Update train options when stations change
    const fromStation = document.getElementById('fromStation');
    const toStation = document.getElementById('toStation');
    
    if (fromStation && toStation) {
        fromStation.addEventListener('change', loadTrainOptions);
        toStation.addEventListener('change', loadTrainOptions);
    }
}

// Set minimum date for travel date input
function setMinDate() {
    const travelDateInput = document.getElementById('travelDate');
    if (travelDateInput) {
        const today = new Date().toISOString().split('T')[0];
        travelDateInput.setAttribute('min', today);
        travelDateInput.value = today;
    }
}

// Load train schedule
async function loadSchedule() {
    try {
        const response = await fetch(`${API_BASE_URL}/schedule`);
        const trains = await response.json();
        displaySchedule(trains);
    } catch (error) {
        console.error('Error loading schedule:', error);
        displayScheduleError();
    }
}

// Display schedule in table
function displaySchedule(trains) {
    const scheduleBody = document.getElementById('scheduleBody');
    if (!scheduleBody) return;

    if (trains.length === 0) {
        scheduleBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No trains available</td></tr>';
        return;
    }

    scheduleBody.innerHTML = trains.map(train => `
        <tr>
            <td>${train.trainNumber}</td>
            <td>${train.trainName}</td>
            <td>${train.fromStation}</td>
            <td>${train.toStation}</td>
            <td>${train.departureTime}</td>
            <td>${train.arrivalTime}</td>
            <td><span class="status ${train.status.toLowerCase().replace(' ', '-')}">${train.status}</span></td>
        </tr>
    `).join('');
}

// Display error message for schedule
function displayScheduleError() {
    const scheduleBody = document.getElementById('scheduleBody');
    if (scheduleBody) {
        scheduleBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Error loading schedule. Please try again later.</td></tr>';
    }
}

// Search schedule
function searchSchedule() {
    const searchInput = document.getElementById('searchStation');
    const searchTerm = searchInput.value.toLowerCase();
    
    const rows = document.querySelectorAll('#scheduleBody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Load train options for booking form
async function loadTrainOptions() {
    const fromStation = document.getElementById('fromStation')?.value;
    const toStation = document.getElementById('toStation')?.value;
    const trainSelect = document.getElementById('trainNumber');
    
    if (!trainSelect) return;

    trainSelect.innerHTML = '<option value="">Select Train</option>';

    if (!fromStation || !toStation || fromStation === toStation) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/schedule?from=${fromStation}&to=${toStation}`);
        const trains = await response.json();
        
        trains.forEach(train => {
            const option = document.createElement('option');
            option.value = train.trainNumber;
            option.textContent = `${train.trainNumber} - ${train.trainName} (${train.departureTime})`;
            trainSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading train options:', error);
    }
}

// Handle booking form submission
async function handleBooking(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        passengerName: formData.get('passengerName'),
        email: formData.get('email'),
        fromStation: formData.get('fromStation'),
        toStation: formData.get('toStation'),
        travelDate: formData.get('travelDate'),
        trainNumber: formData.get('trainNumber'),
        passengers: parseInt(formData.get('passengers')),
        class: formData.get('class')
    };

    // Validation
    if (bookingData.fromStation === bookingData.toStation) {
        showBookingResult('error', 'From and To stations cannot be the same!');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
            showBookingResult('success', `
                <h3>Booking Successful! 🎉</h3>
                <p><strong>Booking ID:</strong> ${result.bookingId}</p>
                <p><strong>Passenger:</strong> ${bookingData.passengerName}</p>
                <p><strong>Route:</strong> ${bookingData.fromStation} → ${bookingData.toStation}</p>
                <p><strong>Train:</strong> ${bookingData.trainNumber}</p>
                <p><strong>Date:</strong> ${bookingData.travelDate}</p>
                <p><strong>Passengers:</strong> ${bookingData.passengers}</p>
                <p><strong>Class:</strong> ${bookingData.class}</p>
                <p>A confirmation email has been sent to ${bookingData.email}</p>
            `);
            e.target.reset();
            setMinDate();
        } else {
            showBookingResult('error', result.message || 'Booking failed. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting booking:', error);
        showBookingResult('error', 'An error occurred. Please try again later.');
    }
}

// Show booking result
function showBookingResult(type, message) {
    const resultDiv = document.getElementById('bookingResult');
    if (!resultDiv) return;

    resultDiv.className = `booking-result ${type}`;
    resultDiv.innerHTML = message;
    resultDiv.classList.remove('hidden');

    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Hide after 10 seconds
    setTimeout(() => {
        resultDiv.classList.add('hidden');
    }, 10000);
}

// Expose searchSchedule to global scope for onclick handler
window.searchSchedule = searchSchedule;
