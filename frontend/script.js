const API_URL = 'http://localhost:3000/api';

// DOM Elements
const carsGrid = document.getElementById('carsGrid');
const categoryFilter = document.getElementById('category');
const priceFilter = document.getElementById('price');
const transmissionFilter = document.getElementById('transmission');
const bookingModal = document.getElementById('bookingModal');
const bookingForm = document.getElementById('bookingForm');
const closeModal = document.querySelector('.close');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCars();
    setupFilters();
    setupModal();
});

// Load cars from API
async function loadCars(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/cars/filter?${queryParams}`);
        const cars = await response.json();
        displayCars(cars);
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Display cars in the grid
function displayCars(cars) {
    carsGrid.innerHTML = '';
    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}">
            <h3>${car.name}</h3>
            <p class="category">${car.category}</p>
            <p class="price">$${car.price}/day</p>
            <p class="transmission">${car.transmission}</p>
            <button onclick="openBookingModal('${car._id}')" ${!car.available ? 'disabled' : ''}>
                ${car.available ? 'Book Now' : 'Not Available'}
            </button>
        `;
        carsGrid.appendChild(carCard);
    });
}

// Setup filter event listeners
function setupFilters() {
    const filters = [categoryFilter, priceFilter, transmissionFilter];
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            const filterValues = {
                category: categoryFilter.value,
                price: priceFilter.value,
                transmission: transmissionFilter.value
            };
            loadCars(filterValues);
        });
    });
}

// Modal handling
function setupModal() {
    closeModal.onclick = () => {
        bookingModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === bookingModal) {
            bookingModal.style.display = 'none';
        }
    };
}

function openBookingModal(carId) {
    bookingModal.style.display = 'block';
    bookingForm.dataset.carId = carId;
}

// Handle booking form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const carId = bookingForm.dataset.carId;
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        returnDate: document.getElementById('returnDate').value
    };

    try {
        const response = await fetch(`${API_URL}/cars/${carId}/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Booking successful!');
            bookingModal.style.display = 'none';
            bookingForm.reset();
            loadCars(); // Refresh the car list
        } else {
            const error = await response.json();
            alert(`Booking failed: ${error.message}`);
        }
    } catch (error) {
        console.error('Error booking car:', error);
        alert('Failed to book car. Please try again.');
    }
});