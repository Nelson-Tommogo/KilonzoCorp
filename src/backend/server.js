import express, { json } from 'express';
import { config } from 'dotenv';
import authRoutes from './route/authRoutes.js';
import paymentRoutes from './route/payment.js'; 
import './config/db.js'; 

// Load environment variables
config();

const app = express();

// Middleware to parse JSON requests
app.use(json());

// Use authentication routes
app.use("/api/auth", authRoutes);

// Use payment routes
app.use("/api/payments", paymentRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`KilonzoCorp Server is running on port ${port}`);
});
