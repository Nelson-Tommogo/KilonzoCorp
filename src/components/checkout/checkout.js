import React, { useState } from "react";
import safImage from "./saf.png"; // M-Pesa logo/image
import paylineImage from "./payline.png"; // Payline logo/image
import mpesaImage from "./mpesa.webp"; // M-Pesa logo for popup
import paylineLogo from "./pay.png"; // Payline logo for popup
import "./checkout.css"; // Importing CSS for styling

const Checkout = () => {
  // State for managing selected payment method
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  // State for showing/hiding the payment form
  const [showForm, setShowForm] = useState(false);
  // State for holding payment details
  const [paymentDetails, setPaymentDetails] = useState({
    plan: "",
    amount: "",
    currency: "USD",
    name: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  // State for displaying error messages
  const [errorMessage, setErrorMessage] = useState("");

  // Handle payment method selection
  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    setShowForm(true); // Show the payment form when a method is selected
    setErrorMessage(""); // Clear any previous error messages
  };

  // Handle closing the payment form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPaymentMethod(null); // Reset payment method
    setErrorMessage(""); // Clear error messages
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // If the "plan" field changes, update the amount dynamically
    if (name === "plan") {
      let selectedAmount = "";
      switch (value) {
        case "Basic":
          selectedAmount = "1999.49";
          break;
        case "Pro":
          selectedAmount = "3799.49";
          break;
        case "Enterprise":
          selectedAmount = "5499.49";
          break;
        default:
          selectedAmount = "";
      }
      setPaymentDetails((prev) => ({
        ...prev,
        plan: value,
        amount: selectedAmount,
      }));
    } else {
      // Update other fields
      setPaymentDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle form submission for payment processing
  const handleSubmit = async () => {
    const { plan, name, cardNumber, expiryMonth, expiryYear, cvv, amount, currency } = paymentDetails;

    // Validate required fields
    if (!plan || !name || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      setErrorMessage("Please fill out all fields before proceeding.");
      return;
    }

    // Handle Payline payment method
    if (selectedPaymentMethod === "payline") {
      try {
        const response = await fetch("https://api.payline.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, cardNumber, expiryMonth, expiryYear, cvv, amount, currency }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "An unexpected error occurred.");
        }

        const result = await response.json();
        alert(`Payment Success: ${result.message}. Our team will reach out to you shortly.`);
        setShowForm(false); 
      } catch (error) {
        setErrorMessage(`Payline Payment Failed: ${error.message || "Unable to process payment. Please try again later."}`);
      }
    } else if (selectedPaymentMethod === "mpesa") {
      setErrorMessage("M-Pesa payments are currently under development.");
    }
  };

  const ErrorDialog = ({ message, onClose }) => (
    <div className="error-dialog">
      <div className="error-dialog-content">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <h3>Select Your Payment Plan</h3>

      {/* Payment method options */}
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

      {/* Payment form for Payline */}
      {showForm && selectedPaymentMethod === "payline" && (
        <div className="popup-form">
          <div className="form-content">
            <img src={paylineLogo} alt="Payline" className="form-image" />
            <h3>Payline Payment</h3>

            {/* Payment form fields */}
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
              <label htmlFor="amount">Amount:</label>
              <input type="text" id="amount" name="amount" value={paymentDetails.amount} readOnly />
            </div>
            <div className="form-field">
              <label htmlFor="currency">Currency:</label>
              <select id="currency" name="currency" value={paymentDetails.currency} onChange={handleInputChange}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="KES">KES</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="name">Cardholder Name:</label>
              <input type="text" id="name" name="name" value={paymentDetails.name} onChange={handleInputChange} />
            </div>
            <div className="form-field">
              <label htmlFor="cardNumber">Card Number:</label>
              <input type="text" id="cardNumber" name="cardNumber" value={paymentDetails.cardNumber} onChange={handleInputChange} />
            </div>
            <div className="form-field">
              <label htmlFor="expiryMonth">Expiry Month:</label>
              <input type="text" id="expiryMonth" name="expiryMonth" value={paymentDetails.expiryMonth} onChange={handleInputChange} />
            </div>
            <div className="form-field">
              <label htmlFor="expiryYear">Expiry Year:</label>
              <input type="text" id="expiryYear" name="expiryYear" value={paymentDetails.expiryYear} onChange={handleInputChange} />
            </div>
            <div className="form-field">
              <label htmlFor="cvv">CVV:</label>
              <input type="text" id="cvv" name="cvv" value={paymentDetails.cvv} onChange={handleInputChange} />
            </div>

            {/* Error message */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            <button className="proceed-button" onClick={handleSubmit}>Proceed</button>
            <button className="close-button" onClick={handleCloseForm}>Close</button>
          </div>
        </div>
      )}

      {/* Payment form for M-Pesa */}
      {showForm && selectedPaymentMethod === "mpesa" && (
        <div className="popup-form">
          <div className="form-content">
            <img src={mpesaImage} alt="M-Pesa" className="form-image" />
            <h3>M-Pesa Payment</h3>
            <div className="form-field">
              <label htmlFor="phone-number">Phone Number:</label>
              <input type="tel" id="phone-number" placeholder="Enter your phone number" />
            </div>
            <button className="proceed-button">Proceed</button>
            <button className="close-button" onClick={handleCloseForm}>Close</button>
          </div>
        </div>
      )}

      {/* Error dialog */}
      {errorMessage && <ErrorDialog message={errorMessage} onClose={() => setErrorMessage("")} />}
    </div>
  );
};

export default Checkout;