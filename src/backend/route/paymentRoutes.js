import express from "express";
import { mpesaAuth } from "../middleware/mpesaAuthMiddleware.js";
import { getPayments } from '../controller/paymentController.js';  // Importing getPayments
import { sendStkPush, queryTransaction, handleCallback } from '../controller/paymentController.js';


const router = express.Router();

// Route for fetching payments
router.get("/payments", getPayments);  // New route using getPayments

// Route for sending STK Push
router.post("/stkpush", mpesaAuth, sendStkPush);

// Route for querying transaction status
router.get("/status/:transactionId", mpesaAuth, queryTransaction);

// Route to handle M-Pesa callback
router.post("/callback", handleCallback);

export default router;
