const apiUrl = "http://localhost:3000/api/cars";

document.addEventListener("DOMContentLoaded", () => {
  fetchCars();
  setupFilters();
  setupModal();
});

async function fetchCars(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${apiUrl}?${queryParams}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cars = await response.json();
    displayCars(cars);
  } catch (error) {
    console.error("Error fetching car listings:", error);
    showError("Failed to load cars. Please try again later.");
  }
}

function displayCars(cars) {
  const carsGrid = document.getElementById("carsGrid");
  carsGrid.innerHTML = "";

  if (cars.length === 0) {
    carsGrid.innerHTML = "<p class='no-cars'>No cars found matching your criteria.</p>";
    return;
  }

  cars.forEach((car) => {
    const carItem = document.createElement("div");
    carItem.classList.add("car-item");
    carItem.innerHTML = `
      <img src="${car.image}" alt="${car.name}">
      <h3>${car.name}</h3>
      <p>Brand: ${car.brand}</p>
      <p>Price: $${car.price}/day</p>
      <p>Category: ${car.category}</p>
      <p>Transmission: ${car.transmission}</p>
      <button onclick="openBookingModal('${car._id}')" ${!car.available ? 'disabled' : ''}>
        ${car.available ? 'Book Now' : 'Not Available'}
      </button>
    `;
    carsGrid.appendChild(carItem);
  });
}

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
        fetchCars(filterValues);
      });
    }
  });
}

function setupModal() {
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.querySelector('.close');
  const form = document.getElementById('bookingForm');

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
      const response = await fetch(`${apiUrl}/${carId}/book`, {
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
        fetchCars(); // Refresh the car list
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
  form.dataset.carId = carId;
  modal.style.display = 'block';
}

function showError(message) {
  alert(message); // You can replace this with a better UI notification
}

function showSuccess(message) {
  alert(message); // You can replace this with a better UI notification
}
