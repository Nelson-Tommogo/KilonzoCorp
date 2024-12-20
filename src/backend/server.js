import express from 'express';
import axios from 'axios';
import moment from 'moment';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Helper function for caching token
let cachedToken = null;

// Middleware to get or refresh the token
const getToken = async (req, res, next) => {
  try {
    // Log current time and expiry time of cached token
    if (cachedToken) {
      console.log('Current time:', Date.now());
      console.log('Cached token expiry time:', cachedToken.expiryTime);
    }

    // Use cached token if valid
    if (cachedToken && Date.now() < cachedToken.expiryTime) {
      console.log('Using cached token:', cachedToken.access_token);
      req.token = cachedToken.access_token;
      return next();
    }

    // Generate a new token if no valid cached token
    const consumerKey = process.env.M_PESA_CONSUMER_KEY;
    const consumerSecret = process.env.M_PESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    console.log('Generating new token with credentials...');
    const response = await axios.get(
      'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );

    // Log the token response
    console.log('Token response received:', response.data);

    const { access_token, expires_in } = response.data;
    const expiryTime = Date.now() + expires_in * 1000;

    // Cache the new token
    cachedToken = { access_token, expiryTime };
    console.log('New token generated:', { access_token, expires_in, expiryTime });

    req.token = access_token; // Attach token to the request object
    next(); // Proceed to the next middleware or route
  } catch (error) {
    console.error('Error generating token:', error.message);
    res.status(500).json({
      error: 'Failed to authenticate with Safaricom API.',
      message: error.message,
    });
  }
};

// Routes

// Test server status
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Server is up and running!' });
});

// Test token generation
app.get('/test-token', getToken, (req, res) => {
  res.status(200).json({
    message: 'Token generated successfully',
    token: req.token,
  });
});

app.post('/stk', getToken, async (req, res) => {
  try {
    const token = req.token; // Use token from middleware
    console.log('Using token for STK Push:', token);

    let { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ error: 'Phone number and amount are required fields.' });
    }

    // Format phone number
    if (phoneNumber.startsWith('07') && phoneNumber.length === 10) {
      phoneNumber = '254' + phoneNumber.substring(1);
    } else if (phoneNumber.length !== 12 || !phoneNumber.startsWith('254')) {
      return res.status(400).json({ error: 'Invalid phone number format.' });
    }

    // Generate credentials for STK Push
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const businessShortCode = process.env.M_PESA_SHORT_CODE;
    const passKey = process.env.M_PESA_PASSKEY;
    const password = Buffer.from(`${businessShortCode}${passKey}${timestamp}`).toString('base64');

    const requestBody = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: businessShortCode,
      PhoneNumber: phoneNumber,
      CallBackURL: process.env.CALLBACK_URL,
      AccountReference: phoneNumber,
      TransactionDesc: 'Payment for goods/services',
    };

    // Log the request body
    console.log('Sending STK Push request:', requestBody);

    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestBody,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Log the response from Safaricom API
    console.log('STK Push Response:', response.data);

    if (response.data.ResponseCode === '0') {
      return res.status(200).json({
        message: 'STK push request sent successfully.',
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        responseDescription: response.data.ResponseDescription,
      });
    } else {
      return res.status(400).json({
        error: 'Failed to initiate STK push.',
        responseDescription: response.data.ResponseDescription,
      });
    }
  } catch (error) {
    console.error('Error during STK Push:', error.message);
    if (error.response) {
      console.error('Safaricom API Error:', error.response.data);
      return res.status(error.response.status).json({
        error: 'Safaricom API Error',
        message: error.response.data,
      });
    }
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error.message,
    });
  }
});




const handleCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log('Callback Data Received:', callbackData);

    // Check the result code to determine success or failure
    const result_code = callbackData.Body.stkCallback.ResultCode;
    if (result_code !== 0) {
      const error_message = callbackData.Body.stkCallback.ResultDesc;
      return res.status(400).json({
        ResultCode: result_code,
        ResultDesc: error_message,
      });
    }

    // Extract callback metadata (e.g., Amount, MpesaReceiptNumber, PhoneNumber)
    const body = callbackData.Body.stkCallback.CallbackMetadata;
    const amount = body.Item.find((obj) => obj.Name === "Amount").Value;
    const mpesaCode = body.Item.find((obj) => obj.Name === "MpesaReceiptNumber").Value;
    const phone = body.Item.find((obj) => obj.Name === "PhoneNumber").Value;

    // Log the transaction data (no DB saving)
    console.log('Transaction Data:', { amount, mpesaCode, phone });

    // Return success response
    return res.status(200).json({
      message: "Callback processed successfully.",
      transaction: { amount, mpesaCode, phone },
    });
  } catch (error) {
    console.error("Error processing callback:", error.message);
    return res.status(500).json({
      error: "An error occurred while processing the callback.",
    });
  }
};

// Define the /callback endpoint
app.post('/callback', handleCallback);

// 3. STK Query (Check payment status)
const stkQuery = async (req, res) => {
  try {
    const { checkoutRequestID } = req.body;
    if (!checkoutRequestID) {
      return res.status(400).json({ error: "CheckoutRequestID is required" });
    }

    // Generate timestamp in format YYYYMMDDHHMMSS
    const timestamp = moment().format("YYYYMMDDHHmmss");

    const password = Buffer.from(
      `${process.env.SHORTCODE}${process.env.PASSKEY}${timestamp}`
    ).toString("base64");

    const requestBody = {
      BusinessShortCode: process.env.SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const pollForStatus = async (
      attempt = 0,
      maxAttempts = 12,
      delay = 5000
    ) => {
      try {
        const response = await axios.post(
          `${process.env.BASE_URL}/mpesa/stkpushquery/v1/query`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${req.darajaToken}`,
            },
          }
        );

        const { ResultCode, ResultDesc } = response.data;

        if (ResultCode !== undefined) {
          if (ResultCode === "0") {
            // Success response
            return {
              status: "Success",
              message: "Payment successful",
              data: response.data,
            };
          } else {
            // Failure response (ResultCode !== 0)
            return {
              status: "Failure",
              message: ResultDesc,
              data: response.data,
            };
          }
        }

        // Still processing, retry if attempts are left
        if (attempt < maxAttempts) {
          console.log(
            `Transaction still processing. Retrying... Attempt ${
              attempt + 1
            }/${maxAttempts}`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return pollForStatus(attempt + 1);
        }

        // If retries exhausted
        return {
          status: "Timeout",
          message: "You took too long to pay. Please try again.",
        };
      } catch (error) {
        if (attempt < maxAttempts) {
          console.log("Payment is still processing");
          await new Promise((resolve) => setTimeout(resolve, delay));
          return pollForStatus(attempt + 1);
        }

        // If retries are exhausted, throw final error
        throw error;
      }
    };

    // Wait for the polling to finish and respond accordingly
    const result = await pollForStatus();

    return res.status(result.status === "Timeout" ? 408 : 200).json(result);
  } catch (error) {
    console.error("Error querying STK payment:", error.message);
    return res.status(500).json({
      error: "An error occurred while querying the STK payment status.",
      details: error.response?.data || error.message,
    });
  }
};
app.post('/stkquery', stkQuery);



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
