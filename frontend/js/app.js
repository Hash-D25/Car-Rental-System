const API_URL = "https://car-rental-system-backend-9lih.onrender.com/api";

// DOM Elements
const carsGrid = document.getElementById("carsGrid");
const reservedCarsGrid = document.getElementById("reservedCarsGrid");
const rentedCarsGrid = document.getElementById("rentedCarsGrid");
const favoriteCarsGrid = document.getElementById("favoriteCarsGrid");
const paymentsList = document.getElementById("paymentsList");
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
let currentUser = null;

// Helper to get authorization headers
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// Authentication check
function checkAuth() {
  const token = localStorage.getItem("token");
  return !!token;
}

// Get current user
function getCurrentUser() {
  const userData = localStorage.getItem("user");
  if (userData) {
    currentUser = JSON.parse(userData);
  }
  return currentUser;
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("favoriteCars");
  window.location.href = "index.html";
}

// Update navigation with user info and logout
function updateNavigation() {
  const user = getCurrentUser();
  const navLinks = document.querySelector(".nav-links");
  const adminCarManagementLink = document.getElementById(
    "adminCarManagementLink"
  );
  const favoritesLink = document.getElementById("favoritesLink");
  const rentedLink = document.getElementById("rentedLink");

  if (user && navLinks) {
    if (user.role === "admin") {
      if (favoritesLink) favoritesLink.style.display = "none";
      if (rentedLink) rentedLink.style.display = "inline-block";
      if (adminCarManagementLink)
        adminCarManagementLink.style.display = "inline-block";
    } else {
      // For non-admin users
      if (adminCarManagementLink) adminCarManagementLink.style.display = "none";
      if (favoritesLink) favoritesLink.style.display = "inline-block";
      if (rentedLink) rentedLink.style.display = "inline-block";
    }
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();
  const protectedPages = ["reserved.html", "rented.html", "favorites.html", "payments.html", "profile.html"];

  if (protectedPages.includes(currentPage) && !checkAuth()) {
    window.location.href = "/login.html";
    return;
  }

  // Update navigation with user info
  updateNavigation();

  // Load content based on current page
  switch (currentPage) {
    case "index.html":
    case "":
      loadCars();
      setupFilters();
      setupModal();
      break;
    case "reserved.html":
      loadReservedCars();
      break;
    case "rented.html":
      loadRentedCars();
      break;
    case "favorites.html":
      loadFavoriteCars();
      break;
    case "payments.html":
      loadPayments();
      setupPaymentFilters();
      break;
  }
  updateNav();
  setupLogout();

  // Hamburger menu toggle for mobile nav
  const hamburger = document.getElementById("hamburgerMenu");
  const navLinks = document.querySelector(".nav-links");
  const authLinks = document.querySelector(".auth-links");
  if (hamburger && navLinks && authLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      authLinks.classList.toggle("active");
    });
  }
});

function updateNav() {
  const token = localStorage.getItem("token");
  const profileLink = document.getElementById("profileLink");
  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");

  if (token) {
    profileLink.style.display = "inline";
    logoutLink.style.display = "inline";
    loginLink.style.display = "none";
  } else {
    profileLink.style.display = "none";
    logoutLink.style.display = "none";
    loginLink.style.display = "inline";
  }
}

function setupLogout() {
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
}

// Load cars from API
async function loadCars() {
  try {
    const response = await fetch(`${API_URL}/cars`);
    if (!response.ok)
      throw new Error(
        `Failed to fetch cars: ${response.status} ${response.statusText}`
      );
    allCars = await response.json();
    displayCars(allCars, carsGrid);
  } catch (error) {
    console.error("Error loading cars:", error);
    showError("Failed to load cars. Please try again later.");
  }
}

// Display cars in the grid
function displayCars(carsToDisplay, container) {
  if (!container) {
    console.error("Container element not found!", container);
    return;
  }

  container.innerHTML = "";
  if (carsToDisplay.length === 0) {
    container.innerHTML =
      '<p class="no-cars">No cars found matching your criteria.</p>';
    console.log("No cars to display.");
    return;
  }

  const favoriteCars = JSON.parse(localStorage.getItem("favoriteCars")) || [];
  console.log("Favorite cars from localStorage:", favoriteCars);

  carsToDisplay.forEach((car) => {
    const isFavorite = favoriteCars.includes(car._id);
    const favoriteIconClass = isFavorite ? "fas" : "far"; // solid for favorited, regular for not

    const carCard = document.createElement("div");
    carCard.className = "car-card";
    carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}">
            <div class="car-details">
                <h3>${car.name}</h3>
                <p class="car-brand">${car.brand}</p>
                <div class="car-specs">
                    <span class="car-spec"><i class="fas fa-cog"></i> ${
                      car.transmission
                    }</span>
                    <span class="car-spec"><i class="fas fa-car"></i> ${
                      car.category
                    }</span>
                </div>
                <p class="car-price">$${car.price}/day</p>
                <div class="card-actions">
                    <button class="btn-book" onclick="openBookingModal('${
                      car._id
                    }')" ${car.isBooked ? "disabled" : ""}>
                        ${car.isBooked ? "Reserved" : "Book Now"}
                    </button>
                    <button class="favorite-btn" onclick="toggleFavorite('${
                      car._id
                    }')">
                        <i class="${favoriteIconClass} fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
    container.appendChild(carCard);

    if (container === reservedCarsGrid) {
      if (car.bookingDetails) {
        const startDate = new Date(
          car.bookingDetails.bookingDate
        ).toLocaleDateString();
        const endDate = new Date(
          car.bookingDetails.returnDate
        ).toLocaleDateString();
        const days = Math.max(
          1,
          Math.ceil(
            (new Date(car.bookingDetails.returnDate) -
              new Date(car.bookingDetails.bookingDate)) /
              (1000 * 60 * 60 * 24)
          )
        );
        const totalCost = car.price * days;

        carCard.innerHTML += `
                    <div class="booking-info">
                        <p><strong>Booked by:</strong> ${
                          car.bookingDetails.bookedBy
                        }</p>
                        <p><strong>From:</strong> ${startDate} <strong>To:</strong> ${endDate}</p>
                        <p><strong>Duration:</strong> ${days} day${
          days > 1 ? "s" : ""
        }</p>
                        <p><strong>Total Cost:</strong> $${totalCost.toFixed(
                          2
                        )}</p>
                    </div>
                `;
      }

      const payment = allPayments.find((p) => p.bookingId === car._id);
      const paymentActions = document.createElement("div");
      paymentActions.className = "payment-actions";
      const currentUser = getCurrentUser();

      const isOwner =
        currentUser &&
        car.bookingDetails &&
        currentUser._id === car.bookingDetails.userId;
      const isAdmin = currentUser && currentUser.role === "admin";

      if (isOwner) {
        if (payment) {
          if (payment.status === "Pending") {
            paymentActions.innerHTML = `
                            <button class="btn-primary" onclick='completePayment("${payment._id}")'>Complete Payment</button>
                            <button class="btn-danger" onclick='cancelBooking("${car._id}")'>Cancel</button>
                        `;
          } else if (payment.status === "Completed") {
            paymentActions.innerHTML = `<div class="payment-status completed">Payment Completed</div>`;
          }
        } else {
          paymentActions.innerHTML = `
                        <button class="btn-primary" onclick='payForCar(${JSON.stringify(
                          car
                        )})'>Pay Now</button>
                        <button class="btn-danger" onclick='cancelBooking("${
                          car._id
                        }")'>Cancel</button>
                    `;
        }
      } else if (isAdmin) {
        let statusText = payment ? payment.status : "Not Initiated";
        paymentActions.innerHTML = `<div class="payment-status">Payment: ${statusText}</div>`;
      }

      carCard.appendChild(paymentActions);
    }
  });
}

// Setup filter event listeners
function setupFilters() {
  [categoryFilter, priceFilter, transmissionFilter].forEach((filter) => {
    if (filter) {
      filter.addEventListener("change", applyFilters);
    }
  });

  // Clear Filters button logic
  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (categoryFilter) categoryFilter.value = "";
      if (priceFilter) priceFilter.value = "";
      if (transmissionFilter) transmissionFilter.value = "";
      applyFilters();
    });
  }
}

function applyFilters() {
  let filteredCars = [...allCars];

  const category = categoryFilter.value;
  if (category) {
    filteredCars = filteredCars.filter((car) => car.category === category);
  }

  const priceRange = priceFilter.value;
  if (priceRange) {
    if (priceRange === "151+") {
      filteredCars = filteredCars.filter((car) => car.price >= 151);
    } else {
      const [min, max] = priceRange.split("-").map(Number);
      filteredCars = filteredCars.filter(
        (car) => car.price >= min && car.price <= max
      );
    }
  }

  const transmission = transmissionFilter.value;
  if (transmission) {
    filteredCars = filteredCars.filter(
      (car) => car.transmission === transmission
    );
  }

  displayCars(filteredCars, carsGrid);
}

// Modal handling
function setupModal() {
  const modal = document.getElementById("bookingModal");
  const closeBtn = document.querySelector(".close");
  const form = document.getElementById("bookingForm");

  if (!modal || !closeBtn || !form) return;

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Set minimum date for startDate and returnDate input to today
  const startDateInput = document.getElementById("startDate");
  const returnDateInput = document.getElementById("returnDate");
  if (startDateInput && returnDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const minDate = `${yyyy}-${mm}-${dd}`;
    startDateInput.setAttribute("min", minDate);
    returnDateInput.setAttribute("min", minDate);

    // When start date changes, update return date's min
    startDateInput.addEventListener("change", () => {
      returnDateInput.setAttribute("min", startDateInput.value);
      // If return date is before new start date, reset it
      if (returnDateInput.value < startDateInput.value) {
        returnDateInput.value = startDateInput.value;
      }
      updateBookingSummary();
    });

    // When return date changes, update booking summary
    returnDateInput.addEventListener("change", () => {
      updateBookingSummary();
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!selectedCarId) {
        showError("No car selected for booking.");
        return;
      }

      const bookingData = {
        carId: selectedCarId,
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        startDate: document.getElementById("startDate").value,
        returnDate: document.getElementById("returnDate").value,
      };

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_URL}/cars/${bookingData.carId}/book`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(bookingData),
          }
        );

        if (response.ok) {
          showSuccess("Car booked successfully!");
          bookingModal.style.display = "none";
          loadCars(); // Refresh car list
        } else {
          const errorData = await response.json();
          showError(errorData.message || "Failed to book car.");
        }
      } catch (error) {
        console.error("Booking error:", error);
        showError("An error occurred while booking the car.");
      }
    });
  }
}

function openBookingModal(carId) {
  if (!checkAuth()) {
    window.location.href = "/login.html";
    return;
  }

  const car = allCars.find((c) => c._id === carId);
  if (!car) {
    console.error("Car not found for booking");
    return;
  }
  selectedCarId = carId;

  // Pre-fill form with user data if available
  const currentUser = getCurrentUser();
  if (currentUser) {
    document.getElementById("name").value = currentUser.name;
    document.getElementById("email").value = currentUser.email;
  }

  updateBookingSummary();
  bookingModal.style.display = "block";
}

// Update booking summary with total cost
function updateBookingSummary() {
  const startDateInput = document.getElementById("startDate");
  const returnDateInput = document.getElementById("returnDate");
  const carId = document.getElementById("bookingForm").dataset.carId;
  const summary = document.getElementById("bookingDetails");

  if (!startDateInput || !returnDateInput || !carId || !summary) return;

  const startDate = startDateInput.value;
  const returnDate = returnDateInput.value;

  if (!startDate || !returnDate) {
    summary.innerHTML =
      "<p>Please select start and return dates to see total cost.</p>";
    return;
  }

  const car = allCars.find((c) => c._id === carId);
  if (!car) {
    summary.innerHTML = "<p>Car information not available.</p>";
    return;
  }

  const start = new Date(startDate);
  const end = new Date(returnDate);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  const totalCost = car.price * days;

  summary.innerHTML = `
        <p><strong>Car:</strong> ${car.name}</p>
        <p><strong>Daily Rate:</strong> $${car.price}</p>
        <p><strong>Duration:</strong> ${days} day${days > 1 ? "s" : ""}</p>
        <p><strong>Total Cost:</strong> $${totalCost.toFixed(2)}</p>
        <p><em>Note: This is a reservation. Payment will be handled separately after booking.</em></p>
    `;
}

// Load reserved cars
async function loadReservedCars() {
  try {
    const user = getCurrentUser();
    const carsUrl =
      user.role === "admin"
        ? `${API_URL}/admin/cars/reserved`
        : `${API_URL}/cars/reserved`;
    const paymentsUrl =
      user.role === "admin"
        ? `${API_URL}/admin/payments`
        : `${API_URL}/payments`;
    const headers = getAuthHeaders();

    const [carsResponse, paymentsResponse] = await Promise.all([
      fetch(carsUrl, { headers }),
      fetch(paymentsUrl, { headers }),
    ]);

    if (!carsResponse.ok) throw new Error("Failed to fetch reserved cars");
    if (!paymentsResponse.ok) throw new Error("Failed to fetch payments");

    const cars = await carsResponse.json();
    allPayments = await paymentsResponse.json();
    displayCars(cars, reservedCarsGrid);
  } catch (error) {
    console.error("Error loading reserved cars:", error);
  }
}

// Load rented cars
async function loadRentedCars() {
  try {
    const user = getCurrentUser();
    const url =
      user.role === "admin"
        ? `${API_URL}/admin/cars/rented`
        : `${API_URL}/cars/rented`;
    const headers = getAuthHeaders();
    const response = await fetch(url, { headers });

    if (!response.ok) throw new Error("Failed to fetch rented cars");

    const cars = await response.json();
    displayCars(cars, rentedCarsGrid);
  } catch (error) {
    console.error("Error loading rented cars:", error);
  }
}

// Load favorite cars
async function loadFavoriteCars() {
  try {
    const favoriteCarIds =
      JSON.parse(localStorage.getItem("favoriteCars")) || [];
    if (favoriteCarIds.length === 0) {
      if (favoriteCarsGrid) {
        favoriteCarsGrid.innerHTML =
          '<p class="no-cars">You have no favorite cars yet.</p>';
      }
      return;
    }

    // Fetch each favorite car by its ID
    const fetchPromises = favoriteCarIds.map((id) =>
      fetch(`${API_URL}/cars/${id}`, { headers: getAuthHeaders() })
    );
    const responses = await Promise.all(fetchPromises);
    const cars = await Promise.all(responses.map((res) => res.json()));

    // Filter out any cars that might not have been found (e.g., deleted from DB)
    const validCars = cars.filter((car) => car && !car.message);

    displayCars(validCars, favoriteCarsGrid);
  } catch (error) {
    console.error("Error loading favorite cars:", error);
    showError("Failed to load favorite cars. Please try again later.");
  }
}

// Load payments
async function loadPayments(filters = {}) {
  try {
    const user = getCurrentUser();
    const url =
      user.role === "admin"
        ? `${API_URL}/admin/payments`
        : `${API_URL}/payments`;
    const queryParams = new URLSearchParams(filters).toString();
    const fullUrl = `${url}?${queryParams}`;

    const headers = getAuthHeaders();
    const response = await fetch(fullUrl, { headers });

    if (!response.ok) throw new Error("Failed to fetch payments");

    const payments = await response.json();
    displayPayments(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
  }
}

// Display payments
function displayPayments(payments) {
  if (!paymentsList) return;

  paymentsList.innerHTML = "";
  if (payments.length === 0) {
    paymentsList.innerHTML =
      '<p class="no-payments">No payment history found.</p>';
    return;
  }

  payments.forEach((payment) => {
    const paymentItem = document.createElement("div");
    paymentItem.className = "payment-item";
    paymentItem.innerHTML = `
            <div class="payment-info">
                <h3>${payment.carName}</h3>
                <p>Booking ID: ${payment.bookingId}</p>
                <p>Date: ${new Date(payment.date).toLocaleDateString()}</p>
                <p>Amount: $${payment.amount}</p>
                <span class="payment-status ${payment.status.toLowerCase()}">${
      payment.status
    }</span>
            </div>
        `;
    paymentsList.appendChild(paymentItem);
  });
}

// Setup payment filters
function setupPaymentFilters() {
  const filters = ["paymentStatus", "paymentDate"];
  filters.forEach((filterId) => {
    const element = document.getElementById(filterId);
    if (element) {
      element.addEventListener("change", () => {
        const filterValues = {
          status: document.getElementById("paymentStatus").value,
          dateRange: document.getElementById("paymentDate").value,
        };
        loadPayments(filterValues);
      });
    }
  });
}

// Toggle favorite status
function toggleFavorite(carId) {
  let favoriteCars = JSON.parse(localStorage.getItem("favoriteCars")) || [];
  const index = favoriteCars.indexOf(carId);

  if (index > -1) {
    // Car is already a favorite, remove it
    favoriteCars.splice(index, 1);
    showSuccess("Removed from favorites!");
  } else {
    // Car is not a favorite, add it
    favoriteCars.push(carId);
    showSuccess("Added to favorites!");
  }

  localStorage.setItem("favoriteCars", JSON.stringify(favoriteCars));

  // Refresh the current view if it's the favorites page or the home page
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage === "favorites.html") {
    loadFavoriteCars();
  } else if (currentPage === "index.html" || currentPage === "") {
    loadCars(); // Reload cars to update favorite icons
  }
}

// Utility functions
function showError(message) {
  showNotification(message, "error");
}

function showSuccess(message) {
  showNotification(message, "success");
}

function showNotification(message, type) {
  // Remove any existing notifications
  const existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement("div");
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
        ${
          type === "error"
            ? "background-color: #e74c3c;"
            : "background-color: #27ae60;"
        }
    `;

  // Style the notification content
  const notificationContent = notification.querySelector(
    ".notification-content"
  );
  notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;

  // Style the close button
  const closeBtn = notification.querySelector(".notification-close");
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

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.backgroundColor = "rgba(255,255,255,0.2)";
  });

  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.backgroundColor = "transparent";
  });

  // Add to page
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 5000);

  // Close button functionality
  closeBtn.addEventListener("click", () => {
    notification.style.transform = "translateX(100%)";
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
    if (
      car.bookingDetails &&
      car.bookingDetails.returnDate &&
      car.bookingDetails.bookingDate
    ) {
      const start = new Date(car.bookingDetails.bookingDate);
      const end = new Date(car.bookingDetails.returnDate);
      const days = Math.max(
        1,
        Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      );
      amount = car.price * days;
    }

    const response = await fetch(`${API_URL}/payments/booking`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        carId: car._id,
        carName: car.name,
        amount,
      }),
    });

    if (response.ok) {
      showSuccess("Payment initiated! Please complete your payment.");
      loadReservedCars(); // Refresh the reserved cars list
    } else {
      const error = await response.json();
      showError(error.message || "Payment failed. Please try again.");
    }
  } catch (error) {
    console.error("Payment error:", error);
    showError("Payment failed. Please try again.");
  }
}

// Add completePayment function
async function completePayment(paymentId) {
  try {
    const response = await fetch(`${API_URL}/payments/${paymentId}/complete`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      showSuccess(
        "Payment completed successfully! Your car is now ready for pickup."
      );
      loadReservedCars(); // Refresh the reserved cars list
    } else {
      const error = await response.json();
      showError(
        error.message || "Failed to complete payment. Please try again."
      );
    }
  } catch (error) {
    console.error("Complete payment error:", error);
    showError("Failed to complete payment. Please try again.");
  }
}

// Cancel a booking
async function cancelBooking(carId) {
  if (!confirm("Are you sure you want to cancel this booking?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cars/${carId}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      showSuccess("Booking canceled successfully!");
      loadReservedCars(); // Refresh the list of reserved cars
    } else {
      const error = await response.json();
      showError(error.message || "Failed to cancel the booking.");
    }
  } catch (error) {
    console.error("Error canceling booking:", error);
    showError("An error occurred while canceling the booking.");
  }
}
