import express from "express";

import darajaAuthMiddleware from '../middleware/darajaAuthMiddleware.js';
import { sendStkPush, handleCallback, stkQuery } from "../controller/paymentController.js";
const router = express.Router();

// Route 1: Send STK Push (Initiate payment request)
router.post("/send-stk-push", darajaAuthMiddleware, sendStkPush);

// Route 2: Handle Callback from M-Pesa
router.post("/callback", handleCallback);

// Route 3: STK Query (Query the status of a payment)
router.post("/stk-query", darajaAuthMiddleware, stkQuery);

export default router;  
