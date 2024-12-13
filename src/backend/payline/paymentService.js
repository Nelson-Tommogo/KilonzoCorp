import { postToPayline } from "./paylineClient";

export const processPaylinePayment = async (paymentDetails) => {
  const { name, cardNumber, expiryMonth, expiryYear, cvv, amount, currency } = paymentDetails;

  if (!name || !cardNumber || !expiryMonth || !expiryYear || !cvv || !amount || !currency) {
    throw new Error("Missing required payment details.");
  }

  const payload = {
    card_holder_name: name,
    card_number: cardNumber,
    card_expiry_month: expiryMonth,
    card_expiry_year: expiryYear,
    cvv,
    amount,
    currency,
  };

  return await postToPayline("/payments", payload);
};

export const checkPaymentStatus = async (transactionId) => {
  if (!transactionId) {
    throw new Error("Transaction ID is required to check payment status.");
  }

  const payload = { transaction_id: transactionId };
  return await postToPayline("/payment-status", payload);
};
