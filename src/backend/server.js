import express, { json } from 'express';
import { config } from 'dotenv';
import authRoutes from './route/authRoutes.js';
import db from './config/db.js'; 

config();

const app = express();

// Middleware
app.use(json());

// Establish database connection
(async () => {
  try {
    await db(); 
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
})();

// Routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`KilonzoCorp Server is running on port ${process.env.PORT}`);
});
