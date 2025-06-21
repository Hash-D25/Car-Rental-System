const sampleCars = require('../utils/sampleCars');

// Function to add all cars at once using bulk endpoint
async function addCarsBulk() {
    const API_URL = 'http://localhost:3000/api/cars/bulk';
    
    console.log('🚗 Starting bulk car addition to the database...\n');
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sampleCars)
        });
        
        if (response.ok) {
            const addedCars = await response.json();
            console.log(`✅ Successfully added ${addedCars.length} cars to the database!\n`);
            
            // Display all added cars
            addedCars.forEach(car => {
                console.log(`   • ${car.name} (${car.brand}) - $${car.price}/day`);
            });
            
        } else {
            const error = await response.json();
            console.log(`❌ Failed to add cars: ${error.message}`);
        }
    } catch (error) {
        console.log(`❌ Error adding cars: ${error.message}`);
    }
    
    console.log('\n🎉 Bulk car addition completed!');
}

// Run the script
addCarsBulk().catch(console.error); 