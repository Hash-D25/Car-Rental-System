document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:3000/api';
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('userData'));

    // DOM Elements
    const carModal = document.getElementById('carModal');
    const addCarBtn = document.getElementById('addCarBtn');
    const closeModalBtn = carModal.querySelector('.close-btn');
    const carForm = document.getElementById('carForm');
    const modalTitle = document.getElementById('modalTitle');
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Admin access check
    if (!user || user.role !== 'admin') {
        alert('Access Denied: Admins only.');
        window.location.href = '../index.html';
        return;
    }

    // Tab switching logic
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab-link.active').classList.remove('active');
            document.querySelector('.tab-content.active').classList.remove('active');
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
            loadTabData(tab.dataset.tab);
        });
    });

    // Load initial data for the first tab
    loadTabData('cars');

    function loadTabData(tabName) {
        switch (tabName) {
            case 'cars':
                loadCars();
                break;
            case 'bookings':
                loadBookings();
                break;
            case 'payments':
                loadPayments();
                break;
            case 'users':
                loadUsers();
                break;
        }
    }

    // Generic fetch function
    async function fetchData(endpoint) {
        const response = await fetch(`${API_URL}/admin/${endpoint}`, { headers });
        if (!response.ok) throw new Error('Failed to fetch data.');
        return response.json();
    }

    // Load and display cars
    async function loadCars() {
        const cars = await fetchData('cars');
        const columns = ['image', 'name', 'brand', 'price', 'category', 'isBooked', 'actions'];
        const data = cars.map(car => ({
            ...car,
            image: `<img src="${car.image}" alt="${car.name}" class="car-image-preview">`,
            isBooked: car.isBooked ? 'Yes' : 'No',
            actions: `
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-id="${car._id}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-id="${car._id}"><i class="fas fa-trash"></i></button>
                </div>
            `
        }));
        renderTable('carsTableContainer', columns, data);
    }
    
    // Load and display bookings
    async function loadBookings() {
        const bookings = await fetchData('bookings');
        const columns = ['name', 'brand', 'bookedBy', 'bookingDate', 'returnDate'];
        const data = bookings.map(b => ({
            ...b,
            bookedBy: b.bookingDetails?.bookedBy || 'N/A',
            bookingDate: new Date(b.bookingDetails?.bookingDate).toLocaleDateString(),
            returnDate: new Date(b.bookingDetails?.returnDate).toLocaleDateString(),
        }));
        renderTable('bookingsTableContainer', columns, data);
    }
    
    // Load and display payments
    async function loadPayments() {
        const payments = await fetchData('payments');
        const columns = ['carName', 'amount', 'status', 'date'];
        const data = payments.map(p => ({
            ...p,
            date: new Date(p.date).toLocaleString(),
        }));
        renderTable('paymentsTableContainer', columns, data);
    }
    
    // Load and display users
    async function loadUsers() {
        const users = await fetchData('users');
        renderTable('usersTableContainer', ['name', 'email', 'role', 'createdAt'], users.map(u=>({...u, createdAt: new Date(u.createdAt).toLocaleDateString()})));
    }

    // Generic table rendering function
    function renderTable(containerId, columns, data) {
        const container = document.getElementById(containerId);
        container.innerHTML = '<table><thead></thead><tbody></tbody></table>';
        const thead = container.querySelector('thead');
        const tbody = container.querySelector('tbody');
        
        thead.innerHTML = `<tr>${columns.map(c => `<th>${c.charAt(0).toUpperCase() + c.slice(1)}</th>`).join('')}</tr>`;
        
        tbody.innerHTML = data.map(row => 
            `<tr>${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}</tr>`
        ).join('');
    }

    // Modal Handling
    addCarBtn.onclick = () => {
        modalTitle.textContent = 'Add New Car';
        carForm.reset();
        document.getElementById('carId').value = '';
        carModal.style.display = 'block';
    };

    closeModalBtn.onclick = () => carModal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == carModal) {
            carModal.style.display = 'none';
        }
    };

    // Car Form Submission (Add/Edit)
    carForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('carId').value;
        const carData = {
            name: document.getElementById('name').value,
            brand: document.getElementById('brand').value,
            price: document.getElementById('price').value,
            image: document.getElementById('image').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            transmission: document.getElementById('transmission').value,
            seats: document.getElementById('seats').value,
            fuelType: document.getElementById('fuelType').value,
        };

        const url = id ? `${API_URL}/admin/cars/${id}` : `${API_URL}/admin/cars`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, { method, headers, body: JSON.stringify(carData) });

        if (response.ok) {
            carModal.style.display = 'none';
            loadCars();
        } else {
            alert('Failed to save car.');
        }
    });

    // Event delegation for Edit/Delete buttons
    document.querySelector('.admin-container').addEventListener('click', async (e) => {
        if (e.target.closest('.edit-btn')) {
            const id = e.target.closest('.edit-btn').dataset.id;
            const response = await fetch(`${API_URL}/cars/${id}`);
            const car = await response.json();
            
            modalTitle.textContent = 'Edit Car';
            Object.keys(car).forEach(key => {
                const el = document.getElementById(key);
                if(el) el.value = car[key];
            });
            document.getElementById('carId').value = car._id;
            carModal.style.display = 'block';
        }

        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            if (confirm('Are you sure you want to delete this car?')) {
                await fetch(`${API_URL}/admin/cars/${id}`, { method: 'DELETE', headers });
                loadCars();
            }
        }
    });
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../login.html';
    });
}); 