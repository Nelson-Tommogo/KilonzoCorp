import express, { json } from 'express';
import { config } from 'dotenv';
import authRoutes from './route/authRoutes.js'; // Import routes
import { query } from './config/db.js'; // Import the query function to execute database queries

// Load environment variables
config();

const app = express();

// Middleware to parse JSON requests
app.use(json());

// Test database connection with a simple query
(async () => {
  try {
    // Verify the connection by running a simple query
    await query('SELECT 1');
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
})();

// Use authentication routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`KilonzoCorp Server is running on port ${process.env.PORT}`);
});
