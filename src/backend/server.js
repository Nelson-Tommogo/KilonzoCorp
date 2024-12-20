import express from 'express';
import axios from 'axios';
import moment from 'moment';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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
      console.log('Current time:', new Date().toLocaleString());
      console.log('Cached token expiry time:', new Date(cachedToken.expiryTime).toLocaleString());
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
      CallBackURL: 'https//mydomain.com',
      AccountReference: phoneNumber,
      TransactionDesc: 'Payment for goods/services',
    };

    console.log('Sending STK Push request:', requestBody);

    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      requestBody,
      { headers: { Authorization: `Bearer ${token}` } }
    );

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

app.post('/callback', (req, res) => {
  try {
    const callbackData = req.body;
    console.log('Received Callback Data:', callbackData);

    const result_code = callbackData.Body?.stkCallback?.ResultCode;

    if (result_code !== 0) {
      const error_message = callbackData.Body?.stkCallback?.ResultDesc;
      return res.status(400).json({
        ResultCode: result_code,
        ResultDesc: error_message,
      });
    }

    const items = callbackData.Body?.stkCallback?.CallbackMetadata?.Item || [];
    const amount = items.find((obj) => obj.Name === 'Amount')?.Value || null;
    const mpesaCode = items.find((obj) => obj.Name === 'MpesaReceiptNumber')?.Value || null;
    const phone = items.find((obj) => obj.Name === 'PhoneNumber')?.Value || null;

    console.log('Processed Callback Data:', { amount, mpesaCode, phone });

    return res.status(200).json({
      message: 'Callback processed successfully.',
      transaction: { amount, mpesaCode, phone },
    });
  } catch (error) {
    console.error('Error processing callback:', error.message);
    return res.status(500).json({
      error: 'An error occurred while processing the callback.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
