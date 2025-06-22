document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://car-rental-system-backend-9lih.onrender.com/api/auth';
    
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegisterBtn = document.getElementById('showRegister');
        const showLoginBtn = document.getElementById('showLogin');

        if(loginForm) loginForm.addEventListener('submit', handleLogin);
        if(registerForm) registerForm.addEventListener('submit', handleRegister);

        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });

        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        setupPasswordToggle();
    } else if (currentPage === 'profile.html') {
        const profileForm = document.getElementById('profileForm');
        const passwordForm = document.getElementById('passwordForm');
        const editProfileBtn = document.getElementById('editProfileBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');

        if(profileForm) profileForm.addEventListener('submit', handleProfileUpdate);
        if(passwordForm) passwordForm.addEventListener('submit', handlePasswordChange);
        if(editProfileBtn) editProfileBtn.addEventListener('click', () => toggleProfileEdit(true));
        if(cancelEditBtn) cancelEditBtn.addEventListener('click', () => toggleProfileEdit(false));
        
        loadUserProfile();
        loadUserDashboardStats();
    }
});

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const address = document.getElementById('registerAddress').value;
    const licenseNumber = document.getElementById('registerLicense').value;

    const payload = { name, email, password, phone, address, licenseNumber };

    try {
        const response = await fetch(`https://car-rental-system-backend-9lih.onrender.com/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } else {
            alert(`Registration failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration.');
    }
}

function setupPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`https://car-rental-system-backend-9lih.onrender.com/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } else {
            alert(`Login failed: ${data.message}`);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loadUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('https://car-rental-system-backend-9lih.onrender.com/api/auth/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const user = data.user;
            
            // Populate view mode
            document.getElementById('view-name').textContent = user.name;
            document.getElementById('view-email').textContent = user.email;
            document.getElementById('view-phone').textContent = user.phone || 'N/A';
            document.getElementById('view-address').textContent = user.address || 'N/A';
            document.getElementById('view-licenseNumber').textContent = user.licenseNumber || 'N/A';

            // Populate edit form
            document.getElementById('name').value = user.name;
            document.getElementById('email').value = user.email;
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
            document.getElementById('licenseNumber').value = user.licenseNumber || '';
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const updatedUser = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        licenseNumber: document.getElementById('licenseNumber').value
    };

    try {
        const response = await fetch('https://car-rental-system-backend-9lih.onrender.com/api/auth/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedUser)
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Profile updated successfully!');
            loadUserProfile(); // Reload profile to show updated data
            toggleProfileEdit(false); // Switch back to view mode
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating profile.');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch('https://car-rental-system-backend-9lih.onrender.com/api/auth/change-password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Password changed successfully!');
            document.getElementById('passwordForm').reset();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('An error occurred while changing password.');
    }
}

function toggleProfileEdit(isEditing) {
    const viewMode = document.querySelector('.profile-details-view');
    const editMode = document.querySelector('.profile-details-edit');

    if (isEditing) {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
    } else {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
    }
}

async function loadUserDashboardStats() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://car-rental-system-backend-9lih.onrender.com/api/auth/profile/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const result = await response.json();
            const stats = result.data;
            document.getElementById('reservations-count').textContent = stats.reservationsCount;
            document.getElementById('rented-history-count').textContent = stats.rentedHistoryCount;
            document.getElementById('total-spent').textContent = `$${stats.totalSpent.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error fetching user stats:', error);
    }
} 