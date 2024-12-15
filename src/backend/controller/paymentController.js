require("dotenv").config();
const axios = require("axios");
const Payment = require("../models/Payment");

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
    const payment = await Payment.create({
      phoneNumber,
      amount,
      checkoutRequestId: response.data.CheckoutRequestID,
      status: "Pending",
    });

    res.status(200).json({
      message: "STK Push initiated successfully",
      paymentId: payment._id,
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
    const payment = await Payment.findOneAndUpdate(
      { checkoutRequestId },
      { status: response.data.ResultCode === "0" ? "Completed" : "Failed" },
      { new: true }
    );

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

    await Payment.findOneAndUpdate(
      { checkoutRequestId: CheckoutRequestID },
      updates
    );

    res.status(200).json({ message: "Callback handled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to handle callback", error: error.message });
  }
};

module.exports = { sendStkPush, queryTransactionStatus, handleCallback };
