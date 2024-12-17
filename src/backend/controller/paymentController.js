import axios from "axios"; // Correct import for axios
import { createPayment, getPaymentByTransactionId } from "../models/Payment.js"; // Correct imports
import { pool } from "../config/db.js"; // Import the pool from db.js
require("dotenv").config();

// Generate timestamp
const generateTimestamp = () => {
  return new Date().toISOString().replace(/-|T|:|\.|Z/g, "");
};

// Send STK Push
const sendStkPush = async (req, res) => {
  const { phoneNumber, amount } = req.body;

  try {
    const timestamp = generateTimestamp();
    const password = Buffer.from(
      `${process.env.SHORT_CODE}${process.env.PASS_KEY}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: process.env.SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: process.env.SHORT_CODE,
      PhoneNumber: phoneNumber,
      CallBackURL: `${process.env.BASE_URL}/api/callback`,
      AccountReference: "MERNApp",
      TransactionDesc: "Payment via STK Push",
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );

    // Save payment to DB
    const payment = await createPayment({
      phoneNumber,
      amount,
      checkoutRequestId: response.data.CheckoutRequestID,
      status: "Pending",
    });

    res.status(200).json({
      message: "STK Push initiated successfully",
      paymentId: payment.insertId, // Use the correct field for the inserted payment ID
    });
  } catch (error) {
    res.status(500).json({ message: "STK Push failed", error: error.message });
  }
};

// Query Transaction Status
const queryTransactionStatus = async (req, res) => {
  const { checkoutRequestId } = req.body;

  try {
    const timestamp = generateTimestamp();
    const password = Buffer.from(
      `${process.env.SHORT_CODE}${process.env.PASS_KEY}${timestamp}`
    ).toString("base64");

    const payload = {
      BusinessShortCode: process.env.SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query",
      payload,
      {
        headers: {
          Authorization: `Bearer ${req.accessToken}`,
        },
      }
    );

    // Update payment status in DB
    const payment = await getPaymentByTransactionId(checkoutRequestId);

    if (!payment || payment.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update status based on query result
    payment.status = response.data.ResultCode === "0" ? "Completed" : "Failed";
    await updatePaymentStatus(payment);

    res.status(200).json({ message: "Transaction status retrieved", payment });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to query status", error: error.message });
  }
};

// Handle Callback
const handleCallback = async (req, res) => {
  const { Body } = req.body;
  const callbackData = Body.stkCallback;

  if (!callbackData)
    return res.status(400).json({ message: "Invalid callback data" });

  const { CheckoutRequestID, ResultCode, CallbackMetadata } = callbackData;

  try {
    const updates = {
      status: ResultCode === 0 ? "Completed" : "Failed",
      transactionId: CallbackMetadata?.Item?.find(
        (item) => item.Name === "MpesaReceiptNumber"
      )?.Value,
      receiptNumber: CallbackMetadata?.Item?.find(
        (item) => item.Name === "ReceiptNumber"
      )?.Value,
    };

    const payment = await getPaymentByTransactionId(CheckoutRequestID);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Update the payment status and other fields
    await updatePaymentStatus(payment, updates);

    res.status(200).json({ message: "Callback handled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to handle callback", error: error.message });
  }
};

// Helper function to update payment status
const updatePaymentStatus = async (payment, updates) => {
  const { checkoutRequestId, status, transactionId, receiptNumber } = updates;
  const query = `
    UPDATE payments
    SET status = ?, transactionId = ?, receiptNumber = ?
    WHERE checkoutRequestId = ?
  `;
  const params = [status, transactionId, receiptNumber, checkoutRequestId];

  try {
    // Execute the query with the pool
    await pool.execute(query, params);
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    throw error; // Propagate the error
  }
};

export default { sendStkPush, queryTransactionStatus, handleCallback };
