import axios from "axios";

export const mpesaAuth = async (req, res, next) => {
  try {
    const auth = Buffer.from(
      `${process.env.CONSUMER_KEY}:${process.env.CONSUMER_SECRET}`
    ).toString("base64");

    const mpesaBaseUrl = process.env.MPESA_BASE_URL; // Get base URL from environment variables

    const response = await axios.get(
      `${mpesaBaseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
      }
    );

    req.accessToken = response.data.access_token; // Attach M-Pesa token to request
    next();
  } catch (error) {
    return res.status(500).json({
      message: "M-Pesa Authorization failed",
      error: error.message,
    });
  }
};
