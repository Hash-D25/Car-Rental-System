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
let allCars = []; // To store all cars fetched from the server
let allPayments = [];

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
async function loadCars() {
    try {
        const response = await fetch(`${API_URL}/cars`);
        if (!response.ok) throw new Error(`Failed to fetch cars: ${response.status} ${response.statusText}`);
        allCars = await response.json();
        displayCars(allCars, carsGrid);
    } catch (error) {
        console.error('Error loading cars:', error);
        showError('Failed to load cars. Please try again later.');
    }
}

// Display cars in the grid
function displayCars(carsToDisplay, container) {
    if (!container) {
        console.error('Container element not found!', container);
        return;
    }
    
    container.innerHTML = '';
    if (carsToDisplay.length === 0) {
        container.innerHTML = '<p class="no-cars">No cars found matching your criteria.</p>';
        console.log('No cars to display.');
        return;
    }

    const favoriteCars = JSON.parse(localStorage.getItem('favoriteCars')) || [];
    console.log('Favorite cars from localStorage:', favoriteCars);

    carsToDisplay.forEach(car => {
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
                    <button onclick="openBookingModal('${car._id}')" ${car.isBooked ? 'disabled' : ''}>
                        ${car.isBooked ? 'Reserved' : 'Book Now'}
                    </button>
                    <button class="favorite-btn" onclick="toggleFavorite('${car._id}')">
                        <i class="${favoriteIconClass} fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(carCard);

        if (container === reservedCarsGrid) {
            // Add booking details for reserved cars
            if (car.bookingDetails) {
                const startDate = new Date(car.bookingDetails.bookingDate).toLocaleDateString();
                const endDate = new Date(car.bookingDetails.returnDate).toLocaleDateString();
                const days = Math.max(1, Math.ceil((new Date(car.bookingDetails.returnDate) - new Date(car.bookingDetails.bookingDate)) / (1000 * 60 * 60 * 24)));
                const totalCost = car.price * days;
                
                carCard.innerHTML += `
                    <div class="booking-info">
                        <p><strong>Booked by:</strong> ${car.bookingDetails.bookedBy}</p>
                        <p><strong>From:</strong> ${startDate} <strong>To:</strong> ${endDate}</p>
                        <p><strong>Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
                        <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
                    </div>
                `;
            }
            
            const payment = allPayments.find(p => p.bookingId === car._id);
            if (!payment) {
                carCard.innerHTML += `<button class="btn-primary" onclick='payForCar(${JSON.stringify(car)})'>Pay Now</button>`;
                carCard.innerHTML += `<button class="btn-danger" onclick='cancelBooking("${car._id}")'>Cancel</button>`;
            } else if (payment.status === 'Pending') {
                carCard.innerHTML += `<div class="payment-status pending">Payment Pending</div>`;
                carCard.innerHTML += `<button class="btn-primary" onclick='completePayment("${payment._id}")'>Complete Payment</button>`;
                carCard.innerHTML += `<button class="btn-danger" onclick='cancelBooking("${car._id}")'>Cancel</button>`;
            } else if (payment.status === 'Completed') {
                carCard.innerHTML += `<div class="payment-status completed">Payment Completed</div>`;
            }
        }
    });
}

// Setup filter event listeners
function setupFilters() {
    [categoryFilter, priceFilter, transmissionFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });

    // Clear Filters button logic
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (categoryFilter) categoryFilter.value = '';
            if (priceFilter) priceFilter.value = '';
            if (transmissionFilter) transmissionFilter.value = '';
            applyFilters();
        });
    }
}

function applyFilters() {
    let filteredCars = [...allCars];

    const category = categoryFilter.value;
    if (category) {
        filteredCars = filteredCars.filter(car => car.category === category);
    }

    const priceRange = priceFilter.value;
    if (priceRange) {
        if (priceRange === '151+') {
            filteredCars = filteredCars.filter(car => car.price >= 151);
        } else {
            const [min, max] = priceRange.split('-').map(Number);
            filteredCars = filteredCars.filter(car => car.price >= min && car.price <= max);
        }
    }

    const transmission = transmissionFilter.value;
    if (transmission) {
        filteredCars = filteredCars.filter(car => car.transmission === transmission);
    }

    displayCars(filteredCars, carsGrid);
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

    // Set minimum date for startDate and returnDate input to today
    const startDateInput = document.getElementById('startDate');
    const returnDateInput = document.getElementById('returnDate');
    if (startDateInput && returnDateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const minDate = `${yyyy}-${mm}-${dd}`;
        startDateInput.setAttribute('min', minDate);
        returnDateInput.setAttribute('min', minDate);

        // When start date changes, update return date's min
        startDateInput.addEventListener('change', () => {
            returnDateInput.setAttribute('min', startDateInput.value);
            // If return date is before new start date, reset it
            if (returnDateInput.value < startDateInput.value) {
                returnDateInput.value = startDateInput.value;
            }
            updateBookingSummary();
        });

        // When return date changes, update booking summary
        returnDateInput.addEventListener('change', () => {
            updateBookingSummary();
        });
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const carId = form.dataset.carId;
        
        // Get form values
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const startDate = document.getElementById('startDate').value;
        const returnDate = document.getElementById('returnDate').value;

        // Validate dates
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        const end = new Date(returnDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        if (start < today) {
            showError('Start date cannot be in the past.');
            return;
        }

        if (end < today) {
            showError('Return date cannot be in the past.');
            return;
        }

        if (end < start) {
            showError('Return date cannot be before start date.');
            return;
        }

        const formData = {
            name,
            email,
            startDate,
            returnDate
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
                showSuccess(`Car reserved successfully! You can now pay for your booking in the Reserved section.`);
                modal.style.display = 'none';
                form.reset();
                window.location.href = 'pages/reserved.html'; // Redirect to reserved page
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
    
    // Update booking summary when modal opens
    updateBookingSummary();
}

// Update booking summary with total cost
function updateBookingSummary() {
    const startDateInput = document.getElementById('startDate');
    const returnDateInput = document.getElementById('returnDate');
    const carId = document.getElementById('bookingForm').dataset.carId;
    const summary = document.getElementById('bookingDetails');

    if (!startDateInput || !returnDateInput || !carId || !summary) return;

    const startDate = startDateInput.value;
    const returnDate = returnDateInput.value;

    if (!startDate || !returnDate) {
        summary.innerHTML = '<p>Please select start and return dates to see total cost.</p>';
        return;
    }

    const car = allCars.find(c => c._id === carId);
    if (!car) {
        summary.innerHTML = '<p>Car information not available.</p>';
        return;
    }

    const start = new Date(startDate);
    const end = new Date(returnDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const totalCost = car.price * days;

    summary.innerHTML = `
        <p><strong>Car:</strong> ${car.name}</p>
        <p><strong>Daily Rate:</strong> $${car.price}</p>
        <p><strong>Duration:</strong> ${days} day${days > 1 ? 's' : ''}</p>
        <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
        <p><em>Note: This is a reservation. Payment will be handled separately after booking.</em></p>
    `;
}

// Load reserved cars
async function loadReservedCars() {
    try {
        const [carsResponse, paymentsResponse] = await Promise.all([
            fetch(`${API_URL}/cars/reserved`),
            fetch(`${API_URL}/payments`)
        ]);
        if (!carsResponse.ok) throw new Error('Failed to fetch reserved cars');
        if (!paymentsResponse.ok) throw new Error('Failed to fetch payments');
        const cars = await carsResponse.json();
        allPayments = await paymentsResponse.json();
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
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type) {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        ${type === 'error' ? 'background-color: #e74c3c;' : 'background-color: #27ae60;'}
    `;

    // Style the notification content
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;

    // Style the close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    `;

    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });

    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = 'transparent';
    });

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);

    // Close button functionality
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// Add payForCar function
async function payForCar(car) {
    try {
        // Calculate amount based on actual booking dates
        let amount = car.price;
        if (car.bookingDetails && car.bookingDetails.returnDate && car.bookingDetails.bookingDate) {
            const start = new Date(car.bookingDetails.bookingDate);
            const end = new Date(car.bookingDetails.returnDate);
            const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
            amount = car.price * days;
        }
        
        const response = await fetch(`${API_URL}/payments/booking`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bookingId: car._id, // Use car._id as bookingId
                carId: car._id,
                carName: car.name,
                amount,
                status: 'Pending'
            })
        });
        
        if (response.ok) {
            showSuccess('Payment initiated! Please complete your payment.');
            loadReservedCars(); // Refresh the reserved cars list
        } else {
            const error = await response.json();
            showError(error.message || 'Payment failed. Please try again.');
        }
    } catch (error) {
        console.error('Payment error:', error);
        showError('Payment failed. Please try again.');
    }
}

// Add completePayment function
async function completePayment(paymentId) {
    try {
        const response = await fetch(`${API_URL}/payments/${paymentId}/complete`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            showSuccess('Payment completed successfully! Your car is now ready for pickup.');
            loadReservedCars(); // Refresh the reserved cars list
        } else {
            const error = await response.json();
            showError(error.message || 'Failed to complete payment. Please try again.');
        }
    } catch (error) {
        console.error('Complete payment error:', error);
        showError('Failed to complete payment. Please try again.');
    }
}

// Cancel a booking
async function cancelBooking(carId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cars/${carId}/cancel`, {
            method: 'POST',
        });

        if (response.ok) {
            showSuccess('Booking canceled successfully!');
            loadReservedCars(); // Refresh the list of reserved cars
        } else {
            const error = await response.json();
            showError(error.message || 'Failed to cancel the booking.');
        }
    } catch (error) {
        console.error('Error canceling booking:', error);
        showError('An error occurred while canceling the booking.');
    }
}
