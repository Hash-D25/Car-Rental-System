const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Sedan", "SUV", "Luxury", "Electric", "Sports"],
    },
    transmission: {
      type: String,
      required: true,
      enum: ["Automatic", "Manual"],
    },
    seats: {
      type: Number,
      required: true,
    },
    fuelType: {
      type: String,
      required: true,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid"],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookingDetails: {
      bookedBy: String,
      bookingDate: Date,
      returnDate: Date,
      totalPrice: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Car", carSchema);
