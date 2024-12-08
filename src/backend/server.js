import express, { json } from 'express';
import { config } from 'dotenv';
import authRoutes from './routes/autthRoutes';
import db from './config/db';

config();

const app = express();

// Middleware
app.use(json());

// Establish database connection
(async () => {
  await db();
})();

// Routes
app.use('/api/auth', authRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log(`KilonzoCorp Server is running on port ${process.env.PORT}`);
});
