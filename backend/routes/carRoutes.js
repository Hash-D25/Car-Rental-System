const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");

// Get all cars
router.get("/", carController.getAllCars);

// Get cars by filters
router.get("/filter", carController.getFilteredCars);

// Create a new car
router.post("/", carController.createCar);

// Book a car
router.post("/:carId/book", carController.bookCar);

// Update car availability
router.patch("/:carId/availability", carController.updateCarAvailability);

// Delete a car
router.delete("/:carId", carController.deleteCar);

// Add multiple cars (for testing/initial setup)
router.post("/bulk", carController.addMultipleCars);

module.exports = router;
