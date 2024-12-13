import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const paylineAPI = axios.create({
  baseURL: "https://api.payline.com",
  headers: {
    "Content-Type": "application/json",
  },
});

const generateAuthorizationHeader = (payload) => {
  const token = process.env.PAYLINE_API_TOKEN;
  const secretKey = process.env.PAYLINE_SECRET_KEY;

  if (!token || !secretKey) {
    throw new Error("Payline API token or secret key is missing.");
  }

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(payload))
    .digest("hex");

  return `Bearer ${token}:${hash}`;
};

export const postToPayline = async (endpoint, payload) => {
  const authorization = generateAuthorizationHeader(payload);
  try {
    const response = await paylineAPI.post(endpoint, payload, {
      headers: {
        Authorization: authorization,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error with Payline API");
  }
};
