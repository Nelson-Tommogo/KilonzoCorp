import { pool } from '../config/db.js'; // Use the existing pool from the db.js configuration

// Function to create a new payment entry in the database
export const createPayment = async (paymentData) => {
  const { amount, status, transactionId, phoneNumber, paymentMethod } = paymentData;
  const query = `
    INSERT INTO payments (amount, status, transactionId, phoneNumber, paymentMethod) 
    VALUES (?, ?, ?, ?, ?)
  `;
  const params = [amount, status, transactionId, phoneNumber, paymentMethod];

  try {
    const [result] = await pool.execute(query, params);
    return result; // Return the result of the insert operation
  } catch (error) {
    console.error('Error creating payment:', error.message);
    throw error;
  }
};

// Function to get a payment by transaction ID
export const getPaymentByTransactionId = async (transactionId) => {
  const query = 'SELECT * FROM payments WHERE transactionId = ?';
  try {
    const [results] = await pool.execute(query, [transactionId]);
    return results;
  } catch (error) {
    console.error('Error fetching payment by transactionId:', error.message);
    throw error;
  }
};

