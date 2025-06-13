// DOM Elements
const carsGrid = document.getElementById("carsGrid");
const bookingModal = document.getElementById("bookingModal");
const bookingForm = document.getElementById("bookingForm");
const closeModal = document.querySelector(".close");
const categoryFilter = document.getElementById("category");
const priceFilter = document.getElementById("price");
const transmissionFilter = document.getElementById("transmission");
const bookingDetails = document.getElementById("bookingDetails");

let selectedCarId = null;
let cars = [];

// Fetch and display cars
async function fetchCars() {
  try {
    const response = await fetch("/api/cars");
    cars = await response.json();
    displayCars(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
  }
}

// Filter cars
function filterCars() {
  const category = categoryFilter.value;
  const price = priceFilter.value;
  const transmission = transmissionFilter.value;

  let filteredCars = [...cars];

  if (category) {
    filteredCars = filteredCars.filter((car) => car.category === category);
  }

  if (price) {
    const [min, max] = price.split("-").map(Number);
    if (max) {
      filteredCars = filteredCars.filter(
        (car) => car.price >= min && car.price <= max
      );
    } else {
      filteredCars = filteredCars.filter((car) => car.price >= min);
    }
  }

  if (transmission) {
    filteredCars = filteredCars.filter(
      (car) => car.transmission === transmission
    );
  }

  displayCars(filteredCars);
}

// Display cars in the grid
function displayCars(carsToDisplay) {
  carsGrid.innerHTML = "";
  carsToDisplay.forEach((car) => {
    const carCard = document.createElement("div");
    carCard.className = "car-card";
    carCard.innerHTML = `
            <img src="${car.image}" alt="${car.name}" class="car-image">
            <div class="car-details">
                <h3>${car.name}</h3>
                <p class="car-brand">${car.brand}</p>
                <div class="car-specs">
                    <span class="car-spec">
                        <i class="fas fa-cog"></i> ${car.transmission}
                    </span>
                    <span class="car-spec">
                        <i class="fas fa-gas-pump"></i> ${car.fuelType}
                    </span>
                    <span class="car-spec">
                        <i class="fas fa-chair"></i> ${car.seats} seats
                    </span>
                </div>
                <p class="car-price">$${car.price}/day</p>
                <button 
                    class="btn-book" 
                    ${car.isBooked ? "disabled" : ""}
                    onclick="openBookingModal('${car._id}')"
                >
                    ${car.isBooked ? "Booked" : "Book Now"}
                </button>
            </div>
        `;
    carsGrid.appendChild(carCard);
  });
}

// Open booking modal
function openBookingModal(carId) {
  selectedCarId = carId;
  const car = cars.find((c) => c._id === carId);

  // Update booking summary
  bookingDetails.innerHTML = `
        <p><strong>Car:</strong> ${car.name}</p>
        <p><strong>Brand:</strong> ${car.brand}</p>
        <p><strong>Price per day:</strong> $${car.price}</p>
    `;

  bookingModal.style.display = "block";
}

// Close booking modal
function closeBookingModal() {
  bookingModal.style.display = "none";
  bookingForm.reset();
  selectedCarId = null;
}

// Calculate total price
function calculateTotalPrice(startDate, endDate, pricePerDay) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days * pricePerDay;
}

// Handle booking form submission
async function handleBooking(event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const returnDate = document.getElementById("returnDate").value;

  const car = cars.find((c) => c._id === selectedCarId);
  const totalPrice = calculateTotalPrice(new Date(), returnDate, car.price);

  try {
    const response = await fetch(`/api/cars/${selectedCarId}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bookedBy: name,
        returnDate: returnDate,
        totalPrice: totalPrice,
      }),
    });

    if (response.ok) {
      alert("Booking successful!");
      closeBookingModal();
      fetchCars(); // Refresh the car list
    } else {
      const error = await response.json();
      alert(error.message || "Booking failed. Please try again.");
    }
  } catch (error) {
    console.error("Error booking car:", error);
    alert("An error occurred. Please try again.");
  }
}

// Event Listeners
closeModal.addEventListener("click", closeBookingModal);
bookingForm.addEventListener("submit", handleBooking);
window.addEventListener("click", (event) => {
  if (event.target === bookingModal) {
    closeBookingModal();
  }
});

// Filter event listeners
categoryFilter.addEventListener("change", filterCars);
priceFilter.addEventListener("change", filterCars);
transmissionFilter.addEventListener("change", filterCars);

// Set minimum date for return date input
const returnDateInput = document.getElementById("returnDate");
const today = new Date().toISOString().split("T")[0];
returnDateInput.min = today;

// Initial load
document.addEventListener("DOMContentLoaded", fetchCars);
