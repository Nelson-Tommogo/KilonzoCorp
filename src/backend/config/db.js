import mysql from 'mysql2/promise'; // Import mysql2 package
import { config } from 'dotenv'; // Import dotenv to manage environment variables

// Load environment variables from .env file
config(); 

// Create a connection pool to the MySQL database using credentials from environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,     // Database host (e.g., localhost or IP address)
  user: process.env.DB_USER,     // Database username
  password: process.env.DB_PASSWORD, // Database password
  database: process.env.DB_NAME, // Database name
  waitForConnections: true,      // Enable waiting for available connections
  connectionLimit: 10,           // Maximum number of connections to create at a time
  queueLimit: 0                  // Unlimited queue size
});

// Function to execute queries using the pool
export const query = async (sql, params) => {
  try {
    // Executes the SQL query with the provided parameters
    const [results] = await pool.execute(sql, params);
    return results; // Return the query results
  } catch (error) {
    console.error('Database query error:', error.message); // Log any error
    throw error; // Rethrow error to be handled by the calling function
  }
};

// Default export the pool object, in case it needs to be accessed elsewhere
export default pool;
