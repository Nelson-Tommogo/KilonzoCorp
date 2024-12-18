import React, { useState } from "react";
import safImage from "./saf.png"; // M-Pesa logo/image
import paylineImage from "./payline.png"; // Payline logo/image
import mpesaImage from "./mpesa.webp"; // M-Pesa logo for popup
import paylineLogo from "./pay.png"; // Payline logo for popup
import "./checkout.css"; // Importing CSS for styling

const Checkout = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    plan: "",
    amountUSD: "",
    amountKES: "",
    currency: "USD",
    name: "",
    phoneNumber: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const USD_TO_KES_RATE = 130; // Conversion rate

  // Convert USD to KES
  const convertToKES = (amountUSD) => {
    return (amountUSD * USD_TO_KES_RATE).toFixed(2);
  };

  // Handle payment method selection
  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    setShowForm(true);
    setErrorMessage("");
  };

  // Handle closing the payment form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPaymentMethod(null);
    setErrorMessage("");
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "plan") {
      let selectedAmountUSD = "";
      switch (value) {
        case "Basic":
          selectedAmountUSD = "1999.49";
          break;
        case "Pro":
          selectedAmountUSD = "3799.49";
          break;
        case "Enterprise":
          selectedAmountUSD = "5499.49";
          break;
        default:
          selectedAmountUSD = "";
      }
      setPaymentDetails((prev) => ({
        ...prev,
        plan: value,
        amountUSD: selectedAmountUSD,
        amountKES: selectedAmountUSD ? convertToKES(selectedAmountUSD) : "",
      }));
    } else {
      setPaymentDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle STK Push for M-Pesa
  const handleMpesaPayment = async () => {
    const { phoneNumber, amountKES } = paymentDetails;

    if (!phoneNumber || !amountKES) {
      setErrorMessage("Please enter your phone number and select a plan.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/payment/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          amount: amountKES,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process M-Pesa payment.");
      }

      const result = await response.json();
      alert(result.message);
      setShowForm(false);
    } catch (error) {
      setErrorMessage(`M-Pesa Payment Failed: ${error.message}`);
    }
  };

  // Handle Payline form submission
  const handleSubmit = async () => {
    const { plan, name, cardNumber, expiryMonth, expiryYear, cvv, amountUSD, currency } = paymentDetails;

    if (!plan || !name || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      setErrorMessage("Please fill out all fields before proceeding.");
      return;
    }

    try {
      const response = await fetch("https://api.payline.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cardNumber, expiryMonth, expiryYear, cvv, amount: amountUSD, currency }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An unexpected error occurred.");
      }

      const result = await response.json();
      alert(`Payment Success: ${result.message}. Our team will reach out to you shortly.`);
      setShowForm(false);
    } catch (error) {
      setErrorMessage(`Payline Payment Failed: ${error.message}`);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <h3>Select Your Payment Plan</h3>

      <div className="payment-options">
        <div className="payment-card" onClick={() => handlePaymentSelection("mpesa")}>
          <img src={safImage} alt="M-Pesa" className="payment-image" />
          <h4>M-Pesa</h4>
        </div>
        <div className="payment-card" onClick={() => handlePaymentSelection("payline")}>
          <img src={paylineImage} alt="Payline" className="payment-image" />
          <h4>Payline</h4>
        </div>
      </div>

      {/* M-Pesa Payment Form */}
      {showForm && selectedPaymentMethod === "mpesa" && (
        <div className="popup-form">
          <div className="form-content">
            <img src={mpesaImage} alt="M-Pesa" className="form-image" />
            <h3>M-Pesa Payment</h3>
            <div className="form-field">
              <label htmlFor="plan">Plan:</label>
              <select id="plan" name="plan" value={paymentDetails.plan || ""} onChange={handleInputChange}>
                <option value="">Select a plan</option>
                <option value="Basic">Basic - $1999.49</option>
                <option value="Pro">Pro - $3799.49</option>
                <option value="Enterprise">Enterprise - $5499.49</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="phone-number">Phone Number:</label>
              <input
                type="tel"
                id="phone-number"
                name="phoneNumber"
                placeholder="Enter your phone number"
                value={paymentDetails.phoneNumber || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="amount-kes">Amount (KES):</label>
              <input
                type="text"
                id="amount-kes"
                name="amountKES"
                value={paymentDetails.amountKES || ""}
                readOnly
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="proceed-button" onClick={handleMpesaPayment}>
              Proceed
            </button>
            <button className="close-button" onClick={handleCloseForm}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Payline Payment Form */}
      {showForm && selectedPaymentMethod === "payline" && (
        <div className="popup-form">
          <div className="form-content">
            <img src={paylineLogo} alt="Payline" className="form-image" />
            <h3>Payline Payment</h3>
            <div className="form-field">
              <label htmlFor="plan">Select Plan:</label>
              <select id="plan" name="plan" value={paymentDetails.plan} onChange={handleInputChange}>
                <option value="">--Select a Plan--</option>
                <option value="Basic">Basic Plan - $1999.49 / project</option>
                <option value="Pro">Pro Plan - $3799.49 / project</option>
                <option value="Enterprise">Enterprise Plan - $5499.49 / project</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="name">Cardholder Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={paymentDetails.name || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="cardNumber">Card Number:</label>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                placeholder="Enter your card number"
                value={paymentDetails.cardNumber || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="expiryMonth">Expiry Month:</label>
              <input
                type="text"
                id="expiryMonth"
                name="expiryMonth"
                placeholder="MM"
                value={paymentDetails.expiryMonth || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="expiryYear">Expiry Year:</label>
              <input
                type="text"
                id="expiryYear"
                name="expiryYear"
                placeholder="YYYY"
                value={paymentDetails.expiryYear || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="cvv">CVV:</label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                placeholder="Enter CVV"
                value={paymentDetails.cvv || ""}
                onChange={handleInputChange}
              />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="proceed-button" onClick={handleSubmit}>
              Proceed
            </button>
            <button className="close-button" onClick={handleCloseForm}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
