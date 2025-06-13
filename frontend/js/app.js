const API_URL = 'http://localhost:3000/api';

// DOM Elements
const carsGrid = document.getElementById('carsGrid');
const reservedCarsGrid = document.getElementById('reservedCarsGrid');
const rentedCarsGrid = document.getElementById('rentedCarsGrid');
const favoriteCarsGrid = document.getElementById('favoriteCarsGrid');
const paymentsList = document.getElementById('paymentsList');
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModal = document.querySelector(".close");
const categoryFilter = document.getElementById("category");
const priceFilter = document.getElementById("price");
const transmissionFilter = document.getElementById("transmission");
const bookingDetails = document.getElementById("bookingDetails");

let selectedCarId = null;
let cars = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load content based on current page
    const currentPage = window.location.pathname.split('/').pop();
    switch(currentPage) {
        case 'index.html':
        case '':
            loadCars();
            setupFilters();
            setupModal();
            break;
        case 'reserved.html':
            loadReservedCars();
            break;
        case 'rented.html':
            loadRentedCars();
            break;
        case 'favorites.html':
            loadFavoriteCars();
            break;
        case 'payments.html':
            loadPayments();
            setupPaymentFilters();
            break;
    }
});

// Load cars from API
async function loadCars(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/cars?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch cars');
        const cars = await response.json();
        displayCars(cars, carsGrid);
    } catch (error) {
        console.error('Error loading cars:', error);
        showError('Failed to load cars. Please try again later.');
    }
}

// Display cars in the grid
function displayCars(cars, container) {
    if (!container) return;
    
    container.innerHTML = '';
    if (cars.length === 0) {
        container.innerHTML = '<p class="no-cars">No cars found matching your criteria.</p>';
        return;
    }

    const favoriteCars = JSON.parse(localStorage.getItem('favoriteCars')) || [];

    cars.forEach(car => {
        const isFavorite = favoriteCars.includes(car._id);
        const favoriteIconClass = isFavorite ? 'fas' : 'far'; // solid for favorited, regular for not

        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}">
            <div class="car-details">
                <h3>${car.name}</h3>
                <p class="car-brand">${car.brand}</p>
                <div class="car-specs">
                    <span class="car-spec"><i class="fas fa-cog"></i> ${car.transmission}</span>
                    <span class="car-spec"><i class="fas fa-car"></i> ${car.category}</span>
                </div>
                <p class="car-price">$${car.price}/day</p>
                <div class="card-actions">
                    <button onclick="openBookingModal('${car._id}')" ${!car.available ? 'disabled' : ''}>
                        ${car.available ? 'Book Now' : 'Not Available'}
                    </button>
                    <button class="favorite-btn" onclick="toggleFavorite('${car._id}')">
                        <i class="${favoriteIconClass} fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(carCard);
    });
}

// Setup filter event listeners
function setupFilters() {
    const filters = ['category', 'price', 'transmission'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', () => {
                const filterValues = {
                    category: document.getElementById('category').value,
                    price: document.getElementById('price').value,
                    transmission: document.getElementById('transmission').value
                };
                loadCars(filterValues);
            });
        }
    });
}

// Modal handling
function setupModal() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.querySelector('.close');
    const form = document.getElementById('bookingForm');

    if (!modal || !closeBtn || !form) return;

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    form.onsubmit = async (e) => {
        e.preventDefault();
        const carId = form.dataset.carId;
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
                const result = await response.json();
                showSuccess(`Booking confirmed! Booking ID: ${result.id}`);
                modal.style.display = 'none';
                form.reset();
                loadCars(); // Refresh the car list
            } else {
                const error = await response.json();
                showError(error.message || 'Failed to book the car. Please try again.');
            }
        } catch (error) {
            console.error('Error booking car:', error);
            showError('Failed to book the car. Please try again.');
        }
    };
}

function openBookingModal(carId) {
    const modal = document.getElementById('bookingModal');
    const form = document.getElementById('bookingForm');
    if (!modal || !form) return;
    
    form.dataset.carId = carId;
    modal.style.display = 'block';
}

// Load reserved cars
async function loadReservedCars() {
    try {
        const response = await fetch(`${API_URL}/cars/reserved`);
        if (!response.ok) throw new Error('Failed to fetch reserved cars');
        const cars = await response.json();
        displayCars(cars, reservedCarsGrid);
    } catch (error) {
        console.error('Error loading reserved cars:', error);
        showError('Failed to load reserved cars. Please try again later.');
    }
}

// Load rented cars
async function loadRentedCars() {
    try {
        const response = await fetch(`${API_URL}/cars/rented`);
        if (!response.ok) throw new Error('Failed to fetch rented cars');
        const cars = await response.json();
        displayCars(cars, rentedCarsGrid);
    } catch (error) {
        console.error('Error loading rented cars:', error);
        showError('Failed to load rented cars. Please try again later.');
    }
}

// Load favorite cars
async function loadFavoriteCars() {
    try {
        const favoriteCarIds = JSON.parse(localStorage.getItem('favoriteCars')) || [];
        if (favoriteCarIds.length === 0) {
            if (favoriteCarsGrid) {
                favoriteCarsGrid.innerHTML = '<p class="no-cars">You have no favorite cars yet.</p>';
            }
            return;
        }

        // Fetch each favorite car by its ID
        const fetchPromises = favoriteCarIds.map(id => fetch(`${API_URL}/cars/${id}`));
        const responses = await Promise.all(fetchPromises);
        const cars = await Promise.all(responses.map(res => res.json()));
        
        // Filter out any cars that might not have been found (e.g., deleted from DB)
        const validCars = cars.filter(car => car && !car.message); 

        displayCars(validCars, favoriteCarsGrid);
    } catch (error) {
        console.error('Error loading favorite cars:', error);
        showError('Failed to load favorite cars. Please try again later.');
    }
}

// Load payments
async function loadPayments(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/payments?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch payments');
        const payments = await response.json();
        displayPayments(payments);
    } catch (error) {
        console.error('Error loading payments:', error);
        showError('Failed to load payments. Please try again later.');
    }
}

// Display payments
function displayPayments(payments) {
    if (!paymentsList) return;
    
    paymentsList.innerHTML = '';
    if (payments.length === 0) {
        paymentsList.innerHTML = '<p class="no-payments">No payment history found.</p>';
        return;
    }

    payments.forEach(payment => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        paymentItem.innerHTML = `
            <div class="payment-info">
                <h3>${payment.carName}</h3>
                <p>Booking ID: ${payment.bookingId}</p>
                <p>Date: ${new Date(payment.date).toLocaleDateString()}</p>
                <p>Amount: $${payment.amount}</p>
                <span class="payment-status ${payment.status.toLowerCase()}">${payment.status}</span>
            </div>
        `;
        paymentsList.appendChild(paymentItem);
    });
}

// Setup payment filters
function setupPaymentFilters() {
    const filters = ['paymentStatus', 'paymentDate'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', () => {
                const filterValues = {
                    status: document.getElementById('paymentStatus').value,
                    dateRange: document.getElementById('paymentDate').value
                };
                loadPayments(filterValues);
            });
        }
    });
}

// Toggle favorite status
function toggleFavorite(carId) {
    let favoriteCars = JSON.parse(localStorage.getItem('favoriteCars')) || [];
    const index = favoriteCars.indexOf(carId);

    if (index > -1) {
        // Car is already a favorite, remove it
        favoriteCars.splice(index, 1);
        showSuccess('Removed from favorites!');
    } else {
        // Car is not a favorite, add it
        favoriteCars.push(carId);
        showSuccess('Added to favorites!');
    }

    localStorage.setItem('favoriteCars', JSON.stringify(favoriteCars));

    // Refresh the current view if it's the favorites page or the home page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'favorites.html') {
        loadFavoriteCars();
    } else if (currentPage === 'index.html' || currentPage === '') {
        loadCars(); // Reload cars to update favorite icons
    }
}

// Utility functions
function showError(message) {
    alert(message); // You can replace this with a better UI notification
}

function showSuccess(message) {
    alert(message); // You can replace this with a better UI notification
}
