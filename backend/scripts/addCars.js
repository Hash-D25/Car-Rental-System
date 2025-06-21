const sampleCars = require('../utils/sampleCars');

// Function to add cars to the database
async function addCarsToDatabase() {
    const API_URL = 'http://localhost:3000/api/cars';
    
    console.log('🚗 Starting to add cars to the database...\n');
    
    for (let i = 0; i < sampleCars.length; i++) {
        const car = sampleCars[i];
        
        try {
            const response = await fetch(`${API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(car)
            });
            
            if (response.ok) {
                const addedCar = await response.json();
                console.log(`✅ Added: ${car.name} (${car.brand}) - $${car.price}/day`);
            } else {
                const error = await response.json();
                console.log(`❌ Failed to add ${car.name}: ${error.message}`);
            }
        } catch (error) {
            console.log(`❌ Error adding ${car.name}: ${error.message}`);
        }
        
        // Add a small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Finished adding cars to the database!');
}

// Run the script
addCarsToDatabase().catch(console.error); 