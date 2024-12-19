import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config();

// Warn if required environment variables are missing
if (!process.env.DB_NAME || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST) {
  console.warn('Missing one or more required database environment variables.');
}

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'kilonzicorp.com', // Database host
  user: process.env.DB_USER || 'kilonzoc_kilonzocusers', // Database user
  password: process.env.DB_PASSWORD || 'Bu9{u}gW.5vC', // Database password
  database: process.env.DB_NAME || 'kilonzoc_users', // Database name
  waitForConnections: true,
  connectionLimit: 5, // Limit the number of connections in the pool
  queueLimit: 0,      // Limit the number of queries waiting for a connection
});

// Test the database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection has been established successfully.');
    connection.release();
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.error('Stack Trace:', error.stack);
    process.exit(1); // Exit if the connection fails
  }
};

// Call the testConnection function to verify
testConnection();

export default pool;
