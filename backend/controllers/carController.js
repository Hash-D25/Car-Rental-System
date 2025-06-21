const Car = require("../models/Car");
const Payment = require("../models/Payment");

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

    if (car.isBooked) {
      return res.status(400).json({ message: 'Car is already reserved' });
    }

    // Validate startDate and returnDate
    const { startDate, returnDate } = req.body;
    if (!startDate || !returnDate) {
      return res.status(400).json({ message: 'Start date and return date are required.' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDate);
    const end = new Date(returnDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be before today.' });
    }
    if (end < today) {
      return res.status(400).json({ message: 'Return date cannot be before today.' });
    }
    if (end < start) {
      return res.status(400).json({ message: 'Return date cannot be before start date.' });
    }

    car.isBooked = true;
    car.bookingDetails = {
      bookedBy: req.body.name,
      bookingDate: start,
      returnDate: end,
      totalPrice: null // You can calculate this if needed
    };
    await car.save();

    res.json({
      message: 'Car booked successfully',
      bookingDetails: {
        carId: car._id,
        carName: car.name,
        customerName: req.body.name,
        customerEmail: req.body.email,
        startDate,
        returnDate
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

    car.isBooked = req.body.isBooked;
    if (req.body.bookingDetails) {
      car.bookingDetails = req.body.bookingDetails;
    }
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
    const reservedCars = await Car.find({ isBooked: true });
    res.json(reservedCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rented cars
exports.getRentedCars = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for date-only comparison
    // Find all cars that are booked and in the rental period
    const cars = await Car.find({
      isBooked: true,
      'bookingDetails.bookingDate': { $lte: today },
      'bookingDetails.returnDate': { $gte: today }
    });
    // Find all completed payments for these cars
    const carIds = cars.map(car => car._id.toString());
    const payments = await Payment.find({
      bookingId: { $in: carIds },
      status: 'Completed'
    });
    const paidCarIds = new Set(payments.map(p => p.bookingId));
    // Only return cars whose payment is completed
    const rentedCars = cars.filter(car => paidCarIds.has(car._id.toString()));
    res.json(rentedCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get favorite cars
exports.getFavoriteCars = async (req, res) => {
  try {
    // In a real application, you would fetch favorite cars based on user preferences
    // For now, this will return an empty array if no specific logic is added
    const favoriteCarIds = req.query.ids ? req.query.ids.split(',') : [];
    const favoriteCars = await Car.find({ '_id': { $in: favoriteCarIds } });
    res.json(favoriteCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get car by ID (used by frontend for favorites page)
exports.getCarById = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
