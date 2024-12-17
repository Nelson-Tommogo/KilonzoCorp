import mysql from 'mysql2/promise'; // Import mysql2 package
import { config } from 'dotenv'; // Import dotenv to manage environment variables

// Load environment variables from .env file
config();

// Create a connection pool to the MySQL database using credentials from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',    // Default to localhost if not set
  user: process.env.DB_USER || 'root',        // Default to root user if not set
  password: process.env.DB_PASSWORD || '',    // Default to empty password if not set
  database: process.env.DB_NAME || 'test_db', // Default to test_db if not set
  waitForConnections: true,      // Enable waiting for available connections
  connectionLimit: 10,           // Maximum number of connections to create at a time
  queueLimit: 0,                 // Unlimited queue size
  connectTimeout: 10000,         // Timeout in milliseconds for a connection attempt
});

// Function to execute queries using the pool
export const query = async (sql, params) => {
  try {
    // Executes the SQL query with the provided parameters
    const [results] = await pool.execute(sql, params);
    return results; // Return the query results
  } catch (error) {
    console.error('Database query error:', error.message); // Log any error
    console.error('Failed SQL query:', sql);               // Log the query that failed
    console.error('Parameters:', params);                  // Log the query parameters
    throw error; // Rethrow error to be handled by the calling function
  }
};

// Graceful shutdown of the pool
process.on('SIGINT', async () => {
  try {
    console.log('Closing database connection pool...');
    await pool.end();
    console.log('Database connection pool closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connection pool:', err.message);
    process.exit(1);
  }
});

// Test the database connection
const testDBConnection = async () => {
  try {
    console.log('Testing database connection...');
    const result = await query('SELECT 1 + 1 AS solution');
    console.log('Database connected successfully!');
    console.log('Query Result:', result[0].solution); // Should output 2
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
};

// Only test the connection if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDBConnection();
}

// Export the pool in case it needs to be accessed elsewhere
export { pool };
