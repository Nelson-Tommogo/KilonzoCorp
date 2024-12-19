import express from "express";
import paymentRouter from "./routes/payment";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

app.use("/api/v1/payment", paymentRouter);

// Test Route
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server is up and running!" });
});

// Example Endpoint: Dummy Users (hardcoded data)
app.get("/users", (req, res) => {
  const users = [
    { id: 1, name: "John Doe", email: "john@example.com" },
    { id: 2, name: "Jane Doe", email: "jane@example.com" },
  ];

  res.status(200).json(users);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
