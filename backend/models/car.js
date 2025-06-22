const mongoose = require("mongoose");
const Payment = require("./payment");

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
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
      },
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

carSchema.pre(
  "findOneAndDelete",
  { document: false, query: true },
  async function (next) {
    const car = await this.model.findOne(this.getFilter());
    if (car) {
      await Payment.deleteMany({ bookingId: car._id });
    }
    next();
  }
);

module.exports = mongoose.models.car || mongoose.model("car", carSchema);
