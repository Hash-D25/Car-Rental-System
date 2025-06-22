const Car = require("../models/car.js");
const Payment = require("../models/payment.js");
const User = require("../models/user.js");

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

    // Get user from the verified token
    const user = await User.findById(req.userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      userId: req.userId,
      bookedBy: user.name,
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
        customerName: user.name,
        customerEmail: user.email,
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
    const carId = req.params.carId;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Delete the car
    await Car.findByIdAndDelete(carId);

    res.json({ message: "Car and associated payments deleted successfully" });
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
    // Only find cars booked by the logged-in user
    const reservedCars = await Car.find({ 'bookingDetails.userId': req.userId, isBooked: true });
    res.json(reservedCars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get rented cars
exports.getRentedCars = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find cars booked by the current user and in the rental period
    const cars = await Car.find({
      'bookingDetails.userId': req.userId,
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

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (!car.isBooked) {
      return res.status(400).json({ message: "Car is not booked" });
    }

    // Security check: only the user who booked can cancel
    if (car.bookingDetails.userId.toString() !== req.userId) {
        return res.status(403).json({ message: "You are not authorized to cancel this booking." });
    }

    car.isBooked = false;
    car.bookingDetails = undefined;
    await car.save();

    // Find and delete any pending payment associated with this booking
    await Payment.deleteOne({ bookingId: req.params.carId, status: "Pending" });

    res.json({ message: "Booking canceled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Function to automatically free up cars after rental period
exports.freeUpCars = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const carsToFree = await Car.find({
      isBooked: true,
      "bookingDetails.returnDate": { $lt: today },
    });

    if (carsToFree.length === 0) {
      // No cars with past return date found, so we can exit early.
      return;
    }

    for (const car of carsToFree) {
      // Check if there is a completed payment for this booking
      const payment = await Payment.findOne({
        bookingId: car._id.toString(),
        status: "Completed",
      });

      if (payment) {
        car.isBooked = false;
        car.bookingDetails = undefined;
        await car.save();
        console.log(`Freed up car: ${car.name}`);
      } else {
        // If no payment is found and the booking date has passed, we should also free the car
        const bookingDate = new Date(car.bookingDetails.bookingDate);
        if (bookingDate < today) {
          car.isBooked = false;
          car.bookingDetails = undefined;
          await car.save();
          console.log(
            `Freed up unpaid car with past booking date: ${car.name}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error freeing up cars:", error);
  }
};

// Admin: Get all reserved cars
exports.getAllReservedCars = async (req, res) => {
    try {
        const reservedCars = await Car.find({ isBooked: true });
        res.json(reservedCars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all rented cars
exports.getAllRentedCars = async (req, res) => {
    try {
        const rentedCars = await Car.find({ isBooked: true }); // Simplified for admin
        res.json(rentedCars);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Update a car
exports.updateCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndUpdate(req.params.carId, req.body, { new: true });
        if (!car) {
            return res.status(404).json({ message: 'Car not found' });
        }
        res.json(car);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
