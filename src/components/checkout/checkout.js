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
    amount: "",
    currency: "USD",
    name: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
  });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pinCode, setPinCode] = useState(""); // Pin for M-Pesa STK push
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentStatus, setPaymentStatus] = useState(""); // Payment status message

  // Add a fixed exchange rate (for currency conversion)
  const exchangeRate = 129.5; 

  // Handle payment method selection
  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    setShowForm(true);
    setErrorMessage(""); // Clear any previous error messages
    setPaymentStatus(""); // Clear payment status message
  };

  // Handle closing the payment form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPaymentMethod(null);
    setErrorMessage("");
    setPaymentStatus(""); // Clear payment status message
  };

  // Handle input changes for form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
      setPaymentDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Handle M-Pesa phone number input change
  const handlePhoneNumberChange = (e) => {
    setPhoneNumber(e.target.value);
  };

  // Handle M-Pesa PIN input change
  const handlePinChange = (e) => {
    setPinCode(e.target.value);
  };

  // Handle Payline form submission
  const handlePaylineSubmit = async () => {
    const { plan, name, cardNumber, expiryMonth, expiryYear, cvv, amount, currency } = paymentDetails;

    // Validate required fields for Payline
    if (!plan || !name || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      setErrorMessage("Please fill out all fields before proceeding.");
      return;
    }

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
  };

  // Handle M-Pesa payment submission
  const handleMpesaSubmit = async () => {
    if (selectedPaymentMethod === "mpesa") {
      if (!phoneNumber || phoneNumber.length < 10) {
        setErrorMessage("Please enter a valid phone number.");
        return;
      }

      if (!pinCode || pinCode.length < 6) {
        setErrorMessage("Please enter a valid PIN.");
        return;
      }

      setPaymentStatus("Processing your payment...");

      // Here, you will call your backend API to process the payment
      // For now, we're just showing a success message once the PIN is entered
      setTimeout(() => {
        setPaymentStatus("Payment successful! Thank you for your payment.");
        alert("M-Pesa payment successful.");
      }, 3000);
    }
  };

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
              <input 
                type="text" 
                id="amount" 
                name="amount" 
                value={paymentDetails.amount} 
                readOnly 
              />
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

            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="proceed-button" onClick={handlePaylineSubmit}>Proceed</button>
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

            {/* Select Plan */}
            <div className="form-field">
              <label htmlFor="plan">Select Plan:</label>
              <select id="plan" name="plan" value={paymentDetails.plan} onChange={handleInputChange}>
                <option value="">--Select a Plan--</option>
                <option value="Basic">Basic Plan - $1999.49 / project</option>
                <option value="Pro">Pro Plan - $3799.49 / project</option>
                <option value="Enterprise">Enterprise Plan - $5499.49 / project</option>
              </select>
            </div>

            {/* Amount (converted to KSH) */}
            <div className="form-field">
              <label htmlFor="amount">Amount (KES):</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={paymentDetails.amount ? (parseFloat(paymentDetails.amount) * exchangeRate).toFixed(0) : ""}
                readOnly
              />
            </div>

            {/* Phone number input */}
            <div className="form-field">
              <label htmlFor="phone-number">Phone Number:</label>
              <input
                type="tel"
                id="phone-number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
              />
            </div>

            {/* Payment status */}
            <p>{paymentStatus}</p>

            {/* PIN input */}
            {paymentStatus === "Processing your payment..." && (
              <div className="form-field">
                <label htmlFor="pin-code">Enter PIN:</label>
                <input
                  type="password"
                  id="pin-code"
                  placeholder="Enter your PIN"
                  value={pinCode}
                  onChange={handlePinChange}
                />
              </div>
            )}

            {/* Buttons */}
            {paymentStatus !== "Processing your payment..." && (
              <button className="proceed-button" onClick={handleMpesaSubmit}>Proceed with Payment</button>
            )}
            <button className="close-button" onClick={handleCloseForm}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
