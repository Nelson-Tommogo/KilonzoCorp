import express from "express";
import dotenv from "dotenv";
import { processPaylinePayment, checkPaymentStatus } from "./paymentService";

dotenv.config();
const app = express();
app.use(express.json());

app.post("/api/payline/payment", async (req, res) => {
  try {
    const paymentResponse = await processPaylinePayment(req.body);
    res.status(200).json(paymentResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/payline/status/:id", async (req, res) => {
  try {
    const status = await checkPaymentStatus(req.params.id);
    res.status(200).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
