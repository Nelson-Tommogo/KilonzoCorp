import express from "express";
import darajaAuthMiddleware from '../middleware/darajaAuthMiddleware.js';
// Import the default export (paymentController) and then destructure the functions
import paymentController from "../controller/paymentController.js";

const router = express.Router();

// Route 1: Send STK Push (Initiate payment request)
router.post("/send-stk-push", darajaAuthMiddleware, paymentController.sendStkPush);

// Route 2: Handle Callback from M-Pesa
router.post("/callback", paymentController.handleCallback);

// Route 3: STK Query (Query the status of a payment)
router.post("/stk-query", darajaAuthMiddleware, paymentController.stkQuery);

export default router;
