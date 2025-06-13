const Car = require("../models/Car");

// Get all cars
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cars by filters
exports.getFilteredCars = async (req, res) => {
  try {
    const { category, price, transmission } = req.query;
    let query = {};

    if (category) query.category = category;
    if (transmission) query.transmission = transmission;
    if (price) {
      const [min, max] = price.split('-');
      query.price = { $gte: Number(min), $lte: Number(max) };
    }

    const cars = await Car.find(query);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new car
exports.createCar = async (req, res) => {
  const car = new Car(req.body);
  try {
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Book a car
exports.bookCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    if (!car.available) {
      return res.status(400).json({ message: 'Car is not available for booking' });
    }

    car.available = false;
    await car.save();

    // Here you would typically create a booking record
    // For now, we'll just return a success message
    res.json({ 
      message: 'Car booked successfully',
      bookingDetails: {
        carId: car._id,
        carName: car.name,
        customerName: req.body.name,
        customerEmail: req.body.email,
        returnDate: req.body.returnDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update car availability
exports.updateCarAvailability = async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    car.available = req.body.available;
    await car.save();
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a car
exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await car.remove();
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a new car (for testing/initial setup)
exports.addCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    const newCar = await car.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Add multiple cars (for testing/initial setup)
exports.addMultipleCars = async (req, res) => {
  try {
    const cars = await Car.insertMany(req.body);
    res.status(201).json(cars);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get reserved cars
exports.getReservedCars = async (req, res) => {
  try {
    // In a real application, you would fetch reserved cars based on user ID or booking status
    const reservedCars = await Car.find({ available: false }); // Example: showing all unavailable cars as reserved
    res.json(reservedCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rented cars
exports.getRentedCars = async (req, res) => {
  try {
    // In a real application, you would fetch rented cars based on active rental agreements
    const rentedCars = await Car.find({ available: false }); // Example: showing all unavailable cars as rented
    res.json(rentedCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get favorite cars
exports.getFavoriteCars = async (req, res) => {
  try {
    // In a real application, you would fetch favorite cars based on user preferences
    const favoriteCars = []; // Placeholder for now
    res.json(favoriteCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
