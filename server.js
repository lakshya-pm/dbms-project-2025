const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection, initDatabase } = require('./config/db');

// Import routes
const userRoutes = require('./routes/userRoutes');
const taxProfileRoutes = require('./routes/taxProfileRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/tax-profiles', taxProfileRoutes);
app.use('/api/payments', paymentRoutes);

// Home route for testing
app.get('/api', (req, res) => {
  res.json({
    message: 'Income Tax Management System API',
    status: 'running'
  });
});

// Catch-all route to handle frontend routes (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Initialize database and start server
async function startServer() {
  // Test database connection
  const connected = await testConnection();
  
  if (connected) {
    // Initialize database (create tables, etc.)
    await initDatabase();
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
      console.log(`Frontend available at http://localhost:${PORT}`);
    });
  } else {
    console.error('Could not connect to database. Server not started.');
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
}); 