# Car Database Management

This document provides commands to add cars to your Car Rental System database with high-quality Unsplash images.

## 🚗 Available Cars

The system now includes **20 cars** across all categories:
- **Sports Cars**: Porsche 911, Ferrari F8 Tributo, Lamborghini Huracán, Ford Mustang GT, Chevrolet Corvette, McLaren 720S
- **Luxury Cars**: Mercedes-Benz S-Class, Rolls-Royce Phantom, Bentley Continental GT, Aston Martin DB11
- **SUVs**: BMW X5, Honda CR-V, Range Rover Sport, Lexus RX
- **Sedans**: Audi A4, Toyota Camry, Volkswagen Golf GTI
- **Electric Cars**: Tesla Model 3, Tesla Model S, Nissan Leaf, Hyundai Kona Electric

## 📋 Prerequisites

1. Make sure your backend server is running:
   ```bash
   cd backend
   npm start
   ```

2. Ensure your MongoDB database is connected and running.

## 🛠️ Commands to Add Cars

### Option 1: Bulk Addition (Recommended)
Add all cars at once using the bulk endpoint:

```bash
cd backend
npm run add-cars-bulk
```

### Option 2: Individual Addition
Add cars one by one (useful for debugging):

```bash
cd backend
npm run add-cars
```

### Option 3: Using cURL Commands

#### Add a single car:
```bash
curl -X POST http://localhost:3000/api/cars \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Porsche 911",
    "brand": "Porsche",
    "price": 200,
    "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
    "description": "Iconic sports car with exceptional performance",
    "category": "Sports",
    "transmission": "Manual",
    "seats": 4,
    "fuelType": "Petrol"
  }'
```

#### Add multiple cars at once:
```bash
curl -X POST http://localhost:3000/api/cars/bulk \
  -H "Content-Type: application/json" \
  -d @utils/sampleCars.json
```

### Option 4: Using Postman or Similar Tools

1. **Single Car Addition**:
   - Method: `POST`
   - URL: `http://localhost:3000/api/cars`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
   ```json
   {
     "name": "Porsche 911",
     "brand": "Porsche",
     "price": 200,
     "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
     "description": "Iconic sports car with exceptional performance",
     "category": "Sports",
     "transmission": "Manual",
     "seats": 4,
     "fuelType": "Petrol"
   }
   ```

2. **Bulk Addition**:
   - Method: `POST`
   - URL: `http://localhost:3000/api/cars/bulk`
   - Headers: `Content-Type: application/json`
   - Body: Use the entire `sampleCars` array from `utils/sampleCars.js`

## 🖼️ Image Sources

All car images are sourced from Unsplash with high-quality URLs:
- **Sports Cars**: Dynamic, action shots
- **Luxury Cars**: Elegant, sophisticated styling
- **SUVs**: Rugged, outdoor scenes
- **Sedans**: Clean, professional looks
- **Electric Cars**: Modern, futuristic designs

## 📊 Car Categories and Pricing

| Category | Price Range | Examples |
|----------|-------------|----------|
| **Sports** | $110 - $450 | Porsche 911, Ferrari F8, Lamborghini |
| **Luxury** | $150 - $500 | Mercedes S-Class, Rolls-Royce, Bentley |
| **SUV** | $85 - $140 | BMW X5, Range Rover, Lexus RX |
| **Sedan** | $70 - $90 | Audi A4, Toyota Camry, VW Golf |
| **Electric** | $65 - $180 | Tesla Models, Nissan Leaf, Hyundai Kona |

## 🔧 Troubleshooting

### Common Issues:

1. **Server not running**:
   ```bash
   cd backend
   npm start
   ```

2. **Database connection issues**:
   - Check your MongoDB connection string in `.env`
   - Ensure MongoDB is running

3. **Duplicate cars**:
   - The system allows duplicate cars
   - Use the delete endpoint if needed: `DELETE /api/cars/:carId`

4. **Image loading issues**:
   - All images are from Unsplash CDN
   - Check your internet connection
   - Images are optimized for web delivery

### Verification Commands:

Check if cars were added successfully:
```bash
curl http://localhost:3000/api/cars
```

Get cars by category:
```bash
curl "http://localhost:3000/api/cars/filter?category=Sports"
```

## 🎯 Next Steps

After adding cars:
1. Visit your frontend at `http://localhost:5000` (or your frontend port)
2. Browse the cars in different categories
3. Test the booking and payment flow
4. Try the filters (category, price, transmission)

## 📝 Notes

- All cars start as available (not booked)
- Images are served from Unsplash CDN for optimal performance
- Car data includes all required fields for the rental system
- The bulk addition is faster and recommended for initial setup 