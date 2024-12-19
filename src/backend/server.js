import express from 'express';
import pool from './config/db.js'; 

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Test Database Connection
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1'); // A simple test query
    res.status(200).json({ success: true, message: 'Database connection is working!', rows });
  } catch (error) {
    console.error('Database test failed:', error.message);
    res.status(500).json({ success: false, message: 'Database connection failed!', error: error.message });
  }
});

// Example Endpoint: Fetch Users
app.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT * FROM users');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`KilonzoCorp Server is running on port ${PORT}`);
});
