const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Lakshya@4321',
  database: 'income_tax_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    console.log('If you encounter authentication issues, you may need to run:');
    console.log("ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Shriram@2210';");
    console.log('FLUSH PRIVILEGES;');
    return false;
  }
}

// Initialize database
async function initDatabase() {
  try {
    // Check if database exists, create if not
    await pool.query('CREATE DATABASE IF NOT EXISTS income_tax_db');
    
    // Use the database
    await pool.query('USE income_tax_db');
    
    // Create tables from the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '..', 'database.sql');
    
    if (fs.existsSync(sqlPath)) {
      const sql = fs.readFileSync(sqlPath, 'utf8');
      const statements = sql.split(';').filter(statement => statement.trim() !== '');
      
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
        }
      }
      
      console.log('Database initialized successfully');
    } else {
      console.error('SQL file not found at:', sqlPath);
    }
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initDatabase
}; 