const apiUrl = "https://car-rental-system-backend-9lih.onrender.com/api/cars";

document.addEventListener("DOMContentLoaded", () => {
  fetchCars();
});

async function fetchCars() {
  try {
    const response = await fetch(apiUrl);
    const cars = await response.json();
    displayCars(cars);
  } catch (error) {
    console.error("Error fetching car listings:", error);
  }
}

function displayCars(cars) {
  const carList = document.getElementById("car-list");
  carList.innerHTML = "";

  cars.forEach((car) => {
    const carItem = document.createElement("div");
    carItem.classList.add("car-item");
    carItem.innerHTML = `
            <img src="${car.image}" alt="${car.name}">
            <h3>${car.name}</h3>
            <p>Brand: ${car.brand}</p>
            <p>Price: $${car.price}</p>
            <button onclick="bookCar('${car._id}')">Book Now</button>
        `;
    carList.appendChild(carItem);
  });
}

async function bookCar(carId) {
  try {
    const response = await fetch(`${apiUrl}/${carId}/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const bookingConfirmation = await response.json();
      alert(`Booking confirmed! Booking ID: ${bookingConfirmation.id}`);
      fetchCars(); // Refresh car listings
    } else {
      alert("Failed to book the car. Please try again.");
    }
  } catch (error) {
    console.error("Error booking car:", error);
  }
}
