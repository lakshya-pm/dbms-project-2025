// Script to initialize the database
const { initDatabase, testConnection } = require('../config/db');

async function init() {
  console.log('Initializing database...');
  
  try {
    // Check database connection
    const connected = await testConnection();
    
    if (!connected) {
      console.error('Failed to connect to the database.');
      console.log('Please check your MySQL server and credentials.');
      process.exit(1);
    }
    
    // Initialize database
    await initDatabase();
    
    console.log('Database initialized successfully!');
    console.log('\nYou can now start the server with:');
    console.log('npm start');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error.message);
    process.exit(1);
  }
}

// Run initialization
init(); 