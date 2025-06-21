const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toggleForm = document.getElementById('toggleForm');
const toggleText = document.getElementById('toggleText');
const togglePasswordBtns = document.querySelectorAll('.toggle-password');

let isLoginMode = true;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Setup form toggling
    setupFormToggle();
    
    // Setup password visibility toggles
    setupPasswordToggles();
    
    // Setup form submissions
    setupFormSubmissions();
});

// Check if user is already authenticated
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // User is logged in, redirect to home page
        window.location.href = 'index.html';
    }
}

// Setup form toggle between login and register
function setupFormToggle() {
    toggleForm.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
}

// Toggle between login and register forms
function toggleForms() {
    isLoginMode = !isLoginMode;
    
    if (isLoginMode) {
        // Show login form
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        toggleText.innerHTML = "Don't have an account? <a href='#' id='toggleForm'>Sign up</a>";
        document.querySelector('.auth-header h2').textContent = 'Welcome Back';
        document.querySelector('.auth-header p').textContent = 'Sign in to your account to continue';
    } else {
        // Show register form
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        toggleText.innerHTML = "Already have an account? <a href='#' id='toggleForm'>Sign in</a>";
        document.querySelector('.auth-header h2').textContent = 'Create Account';
        document.querySelector('.auth-header p').textContent = 'Join us and start renting cars today';
    }
    
    // Re-attach event listener for the new toggle link
    document.getElementById('toggleForm').addEventListener('click', (e) => {
        e.preventDefault();
        toggleForms();
    });
}

// Setup password visibility toggles
function setupPasswordToggles() {
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                btn.classList.remove('fa-eye');
                btn.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                btn.classList.remove('fa-eye-slash');
                btn.classList.add('fa-eye');
            }
        });
    });
}

// Setup form submissions
function setupFormSubmissions() {
    // Login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    // Register form submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
}

// Handle login
async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const submitBtn = loginForm.querySelector('.btn-primary');
    
    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showError(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Network error. Please try again.');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Handle register
async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const phone = document.getElementById('registerPhone').value;
    const licenseNumber = document.getElementById('registerLicense').value;
    const submitBtn = registerForm.querySelector('.btn-primary');
    
    // Validate inputs
    if (!name || !email || !password) {
        showError('Please fill in all required fields');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                password,
                phone,
                licenseNumber
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            showSuccess('Registration successful! Redirecting...');
            
            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showError(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError('Network error. Please try again.');
    } finally {
        setLoadingState(submitBtn, false);
    }
}

// Set loading state for buttons
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        button.textContent = 'Loading...';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = isLoginMode ? 'Sign In' : 'Create Account';
    }
}

// Show error notification
function showError(message) {
    showNotification(message, 'error');
}

// Show success notification
function showSuccess(message) {
    showNotification(message, 'success');
}

// Show notification
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