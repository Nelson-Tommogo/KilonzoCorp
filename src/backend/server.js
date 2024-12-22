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
        if (cachedToken && Date.now() < cachedToken.expiryTime) {
            req.token = cachedToken.access_token;
            return next();
        }

        const consumerKey = process.env.M_PESA_CONSUMER_KEY;
        const consumerSecret = process.env.M_PESA_CONSUMER_SECRET;
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const response = await axios.get(
            'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                },
            }
        );

        const { access_token, expires_in } = response.data;
        const expiryTime = Date.now() + expires_in * 1000;

        cachedToken = { access_token, expiryTime };
        req.token = access_token;
        next();
    } catch (error) {
        console.error('Error generating token:', error.message);
        res.status(500).json({
            error: 'Failed to authenticate with Safaricom API.',
            message: error.message,
        });
    }
};


// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Server is up and running!' });
});

app.get('/test-token', getToken, (req, res) => {
    res.status(200).json({
        message: 'Token generated successfully',
        token: req.token,
    });
});

app.post('/stk', getToken, async (req, res) => {
    try {
        const token = req.token;
        let { phoneNumber, amount } = req.body;

        if (!phoneNumber || !amount) {
            return res.status(400).json({ error: 'Phone number and amount are required fields.' });
        }

        if (phoneNumber.startsWith('07') && phoneNumber.length === 10) {
            phoneNumber = '254' + phoneNumber.substring(1);
        } else if (phoneNumber.length !== 12 || !phoneNumber.startsWith('254')) {
            return res.status(400).json({ error: 'Invalid phone number format.' });
        }

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

        const response = await axios.post(
            'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            requestBody,
            { headers: { Authorization: `Bearer ${token}` } }
        );

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


// STK Push Function
const stkPush = async (token, phoneNumber, amount) => {
    try {
      // Validate inputs
      if (!token || !phoneNumber || !amount) {
        throw new Error("Missing required parameters.");
      }
  
      // Generate timestamp in format YYYYMMDDHHMMSS
      const timestamp = moment().format("YYYYMMDDHHmmss");
  
      // Generate password for STK Push
      const businessShortCode = process.env.M_PESA_SHORT_CODE;
      const passKey = process.env.M_PESA_PASSKEY;
      const password = Buffer.from(`${businessShortCode}${passKey}${timestamp}`).toString("base64");
  
      // Prepare request body for STK Push
      const requestBody = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: process.env.CALLBACK_URL,
        AccountReference: phoneNumber,
        TransactionDesc: "Payment for goods/services",
      };
  
      console.log("Sending STK Push request:", requestBody);
  
      // Make the STK Push API call
      const response = await axios.post(
        "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log("STK Push Response:", response.data);
  
      // Handle response
      if (response.data.ResponseCode === "0") {
        return {
          success: true,
          message: "STK push initiated successfully.",
          data: response.data,
        };
      } else {
        return {
          success: false,
          message: "Failed to initiate STK push.",
          error: response.data.ResponseDescription,
        };
      }
    } catch (error) {
      console.error("Error during STK Push:", error.message);
      if (error.response) {
        console.error("Safaricom API Error:", error.response.data);
        return {
          success: false,
          message: "Safaricom API Error",
          error: error.response.data,
        };
      }
      return {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      };
    }
  };

// Callback handling function
const handleCallback = async (req, res) => {
    try {
        const callbackData = req.body;
        const result_code = callbackData.Body.stkCallback.ResultCode;
        if (result_code !== 0) {
            const error_message = callbackData.Body.stkCallback.ResultDesc;
            return res.status(400).json({
                ResultCode: result_code,
                ResultDesc: error_message,
            });
        }

        const body = callbackData.Body.stkCallback.CallbackMetadata;
        const amount = body.Item.find((obj) => obj.Name === "Amount").Value;
        const mpesaCode = body.Item.find((obj) => obj.Name === "MpesaReceiptNumber").Value;
        const phone = body.Item.find((obj) => obj.Name === "PhoneNumber").Value;

        return res.status(200).json({
            message: "Callback processed successfully.",
            transaction: { amount, mpesaCode, phone },
        });
    } catch (error) {
        return res.status(500).json({
            error: "An error occurred while processing the callback.",
        });
    }
};

// Define the /callback endpoint
app.post('/callback', handleCallback);

// STK Query (Check payment status)
const stkQuery = async (req, res) => {
    try {
        const { checkoutRequestID } = req.body;
        if (!checkoutRequestID) {
            return res.status(400).json({ error: "CheckoutRequestID is required" });
        }

        const timestamp = moment().format("YYYYMMDDHHmmss");
        const password = Buffer.from(
            `${process.env.M_PESA_SHORT_CODE}${process.env.M_PESA_PASSKEY}${timestamp}`
        ).toString("base64");

        const requestBody = {
            BusinessShortCode: process.env.M_PESA_SHORT_CODE,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestID,
        };

        const response = await axios.post(
            `${process.env.BASE_URL}/mpesa/stkpushquery/v1/query`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${req.token}`,
                },
            }
        );

        const { ResultCode, ResultDesc } = response.data;

        if (ResultCode === "0") {
            return res.status(200).json({
                status: "Success",
                message: "Payment successful",
                data: response.data,
            });
        } else {
            return res.status(400).json({
                status: "Failure",
                message: ResultDesc,
                data: response.data,
            });
        }
    } catch (error) {
        return res.status(500).json({
            error: "An error occurred while querying the STK payment status.",
            details: error.response?.data || error.message,
        });
    }
};

app.post('/stkquery', stkQuery);

// Exporting the server and relevant functions
export { app, PORT,stkPush, getToken, handleCallback, stkQuery };

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
