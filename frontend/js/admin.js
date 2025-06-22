document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://car-rental-system-backend-9lih.onrender.com/api';
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user || user.role !== 'admin') {
        alert('Access Denied. Admins only.');
        window.location.href = '../index.html';
        return;
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const carForm = document.getElementById('carForm');
    const carIdField = document.getElementById('carId');
    const formTitle = document.getElementById('formTitle');
    const clearFormBtn = document.getElementById('clearForm');

    // Tab switching logic
    const tabs = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- DATA LOADING FUNCTIONS ---
    
    // Load dashboard stats
    async function getDashboardStats() {
        try {
            const response = await fetch(`${API_URL}/admin/stats`, { headers });
            const stats = await response.json();
            document.getElementById('total-cars').textContent = stats.totalCars;
            document.getElementById('rented-cars').textContent = stats.rentedCars;
            document.getElementById('total-users').textContent = stats.totalUsers;
            document.getElementById('total-revenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    // Load all cars
    async function getCars() {
        try {
            const response = await fetch(`${API_URL}/admin/cars`, { headers });
            const cars = await response.json();
            const carList = document.getElementById('carList');
            carList.innerHTML = '';
            cars.forEach(car => {
                const carItem = document.createElement('div');
                carItem.className = 'car-item';
                carItem.innerHTML = `
                    <h4>${car.name}</h4>
                    <p>${car.brand} - ${car.category}</p>
                    <p><strong>Price:</strong> $${car.price}/day</p>
                    <p><strong>Status:</strong> ${car.isBooked ? 'Rented' : 'Available'}</p>
                    <div class="car-item-actions">
                        <button class="btn-secondary edit-btn" data-id="${car._id}">Edit</button>
                        <button class="btn-danger delete-btn" data-id="${car._id}">Delete</button>
                    </div>
                `;
                carList.appendChild(carItem);
            });
        } catch (error) {
            console.error('Error fetching cars:', error);
        }
    }

    // Load all users
    async function getUsers() {
        try {
            const response = await fetch(`${API_URL}/admin/users`, { headers });
            const users = await response.json();
            const userList = document.getElementById('userList');
            userList.innerHTML = `
                <table class="list-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.phone || 'N/A'}</td>
                                <td class="${user.role === 'admin' ? 'role-admin' : ''}">${user.role}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Load all reservations
    async function getReservations() {
        try {
            const response = await fetch(`${API_URL}/admin/cars/reserved`, { headers });
            const reservedCars = await response.json();
            const reservedCarsList = document.getElementById('reservedCarsList');
            if (reservedCars.length === 0) {
                reservedCarsList.innerHTML = '<p>No active reservations.</p>';
                return;
            }
            reservedCarsList.innerHTML = `
                <table class="list-table">
                    <thead>
                        <tr>
                            <th>Car</th>
                            <th>Booked By</th>
                            <th>Start Date</th>
                            <th>Return Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reservedCars.map(car => `
                            <tr>
                                <td>${car.name}</td>
                                <td>${car.bookingDetails.bookedBy}</td>
                                <td>${new Date(car.bookingDetails.bookingDate).toLocaleDateString()}</td>
                                <td>${new Date(car.bookingDetails.returnDate).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    }

    // Load all payments
    async function getPayments() {
         try {
            const response = await fetch(`${API_URL}/admin/payments`, { headers });
            const payments = await response.json();
            const paymentsList = document.getElementById('paymentsList');
            if (payments.length === 0) {
                paymentsList.innerHTML = '<p>No payments found.</p>';
                return;
            }
            paymentsList.innerHTML = `
                <table class="list-table">
                    <thead>
                        <tr>
                            <th>Car Name</th>
                            <th>User Email</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payments.map(payment => `
                            <tr>
                                <td>${payment.carName}</td>
                                <td>${payment.userEmail}</td>
                                <td>$${payment.amount.toFixed(2)}</td>
                                <td>${payment.status}</td>
                                <td>${new Date(payment.paymentDate).toLocaleDateString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    }

    // --- FORM AND EVENT HANDLERS ---
    
    // Handle Add/Update Car
    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const carId = carIdField.value;
        const method = carId ? 'PUT' : 'POST';
        const url = carId ? `${API_URL}/admin/cars/${carId}` : `${API_URL}/admin/cars`;
        const carData = {
            name: document.getElementById('name').value,
            brand: document.getElementById('brand').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            transmission: document.getElementById('transmission').value,
            seats: document.getElementById('seats').value,
            fuelType: document.getElementById('fuelType').value,
            image: document.getElementById('image').value,
        };

        try {
            const response = await fetch(url, { method, headers, body: JSON.stringify(carData) });
            if (response.ok) {
                clearForm();
                getCars();
                getDashboardStats(); // Refresh stats after adding/updating car
            } else {
                const errorData = await response.json();
                alert(`Error: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error saving car:', error);
        }
    });

    // Handle Edit/Delete Buttons
    document.getElementById('carList').addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const carId = e.target.dataset.id;
            const response = await fetch(`${API_URL}/cars/${carId}`);
            const car = await response.json();
            
            formTitle.textContent = 'Edit Car';
            carIdField.value = car._id;
            document.getElementById('name').value = car.name;
            document.getElementById('brand').value = car.brand;
            document.getElementById('description').value = car.description;
            document.getElementById('category').value = car.category;
            document.getElementById('price').value = car.price;
            document.getElementById('transmission').value = car.transmission;
            document.getElementById('seats').value = car.seats;
            document.getElementById('fuelType').value = car.fuelType;
            document.getElementById('image').value = car.image;
            
            window.scrollTo(0, 0); // Scroll to top to see the form
        }

        if (e.target.classList.contains('delete-btn')) {
            const carId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this car?')) {
                try {
                    const response = await fetch(`${API_URL}/admin/cars/${carId}`, { method: 'DELETE', headers });
                    if(response.ok) {
                        getCars();
                        getDashboardStats(); // Refresh stats
                    } else {
                        alert('Failed to delete car.');
                    }
                } catch (error) {
                    console.error('Error deleting car:', error);
                }
            }
        }
    });

    function clearForm() {
        formTitle.textContent = 'Add a New Car';
        carForm.reset();
        carIdField.value = '';
    }

    if(clearFormBtn) {
        clearFormBtn.addEventListener('click', clearForm);
    }

    // --- INITIALIZATION ---
    function initializeDashboard() {
        getDashboardStats();
        getCars();
        getUsers();
        getReservations();
        getPayments();
    }

    initializeDashboard();
}); 