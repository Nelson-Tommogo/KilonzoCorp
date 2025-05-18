import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import safImage from "./saf.png";
import paylineImage from "./payline.png";
import mpesaImage from "./mpesa.webp";
import paylineLogo from "./pay.png";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaArrowRight } from "react-icons/fa";
import "./checkout.css";
import axios from "axios";

const Checkout = () => {
  const navigate = useNavigate();
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
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentErrorDetails, setPaymentErrorDetails] = useState("");

  const USD_TO_KES_RATE = 130;

  const convertToKES = (amountUSD) => {
    return (amountUSD * USD_TO_KES_RATE).toFixed(2);
  };

  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    setShowForm(true);
    setErrorMessage("");
    setPaymentStatus(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPaymentMethod(null);
    setErrorMessage("");
    setPaymentStatus(null);
    setPaymentDetails({
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const safaricomNumberRegex = /^(?:\+2547\d{7}|07\d{8})$/;
      if (!safaricomNumberRegex.test(value)) {
        setErrorMessage("Invalid Safaricom number. Use +2547... or 07...");
      } else {
        setErrorMessage("");
      }
    }

    setPaymentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "plan") {
      let selectedAmountUSD = "";
      switch (value) {
        case "Basic":
          selectedAmountUSD = "1999";
          break;
        case "Pro":
          selectedAmountUSD = "3799";
          break;
        case "Enterprise":
          selectedAmountUSD = "5499";
          break;
        default:
          selectedAmountUSD = "";
      }
      setPaymentDetails((prev) => ({
        ...prev,
        amountUSD: selectedAmountUSD,
        amountKES: selectedAmountUSD ? convertToKES(selectedAmountUSD) : "",
      }));
    }
  };

  const handleMpesaPayment = async () => {
    let { phoneNumber, amountKES } = paymentDetails;

    if (!phoneNumber || !amountKES) {
      setErrorMessage("Please enter your phone number and select a plan.");
      return;
    }

    if (phoneNumber.startsWith("07") && phoneNumber.length === 10) {
      phoneNumber = "254" + phoneNumber.substring(1);
    } else if (phoneNumber.length !== 12 || !phoneNumber.startsWith("254")) {
      setErrorMessage("Invalid phone number format.");
      return;
    }

    const amount = parseFloat(amountKES);
    if (isNaN(amount)) {
      setErrorMessage("Invalid amount.");
      return;
    }

    try {
      setPaymentStatus("loading");
      setErrorMessage("");
      setPaymentErrorDetails("");

      const response = await axios.post("https://kilonzocorp-payments.onrender.com/api/stk", {
        phoneNumber,
        amount,
      });

      if (response.data && response.data.message) {
        setPaymentStatus("success");
      } else {
        throw new Error("Failed to initiate M-Pesa payment. Please try again.");
      }
    } catch (error) {
      setPaymentStatus("error");
      const errorMsg = error.response?.data?.error || 
                     error.response?.data?.message || 
                     error.message;
      setPaymentErrorDetails(errorMsg);
      setErrorMessage(`Payment Failed: ${errorMsg}`);
    }
  };

  const handleBrowsePackages = () => {
    setShowForm(false);
    setPaymentStatus(null);
    navigate("/pricing");
  };

  const handleSubmit = () => {
    alert("Payline is currently under maintenance. Please use Safaricom Paybill (M-Pesa).");
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case "loading":
        return (
          <div className="payment-status loading">
            <FaSpinner className="spinner-icon" />
            <p>Initiating payment request...</p>
          </div>
        );
      case "success":
        return (
          <div className="payment-status success">
            <FaCheckCircle className="success-icon" />
            <h4>Payment Request Successful!</h4>
            <p>Check your phone to complete the M-Pesa payment</p>
            <button 
              className="browse-button" 
              onClick={handleBrowsePackages}
            >
              Browse Packages <FaArrowRight className="arrow-icon" />
            </button>
            <p className="small-text">You can close this window</p>
          </div>
        );
      case "error":
        return (
          <div className="payment-status error">
            <FaTimesCircle className="error-icon" />
            <h4>Payment Failed</h4>
            <p>{paymentErrorDetails || "We couldn't initiate the payment"}</p>
            <button 
              className="retry-button" 
              onClick={() => setPaymentStatus(null)}
            >
              Try Again
            </button>
          </div>
        );
      default:
        return (
          <>
            <div className="form-field">
              <label htmlFor="plan">Plan:</label>
              <select id="plan" name="plan" value={paymentDetails.plan} onChange={handleInputChange}>
                <option value="">Select a plan</option>
                <option value="Basic">Basic - $1999</option>
                <option value="Pro">Pro - $3799</option>
                <option value="Enterprise">Enterprise - $5499</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="phone-number">Phone Number:</label>
              <input
                type="tel"
                id="phone-number"
                name="phoneNumber"
                placeholder="Enter your phone number"
                value={paymentDetails.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="amount-kes">Amount (KES):</label>
              <input type="text" id="amount-kes" name="amountKES" value={paymentDetails.amountKES} readOnly />
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="proceed-button" onClick={handleMpesaPayment}>
              Proceed
            </button>
            <button className="close-button" onClick={handleCloseForm}>
              Close
            </button>
          </>
        );
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

      {showForm && selectedPaymentMethod === "mpesa" && (
        <div className="popup-form">
          <div className="form-content">
            <img src={mpesaImage} alt="M-Pesa" className="form-image" />
            <h3>M-Pesa Payment</h3>
            {renderPaymentStatus()}
          </div>
        </div>
      )}

      {showForm && selectedPaymentMethod === "payline" && (
        <div className="popup-form">
          <div className="form-content">
            <img src={paylineLogo} alt="Payline" className="form-image" />
            <h3>Payline Payment</h3>
            <div className="form-field">
              <label htmlFor="plan">Select Plan:</label>
              <select id="plan" name="plan" value={paymentDetails.plan} onChange={handleInputChange}>
                <option value="">--Select a Plan--</option>
                <option value="Basic">Basic Plan - $1999 / project</option>
                <option value="Pro">Pro Plan - $3799 / project</option>
                <option value="Enterprise">Enterprise Plan - $5499 / project</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="name">Cardholder Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter your name"
                value={paymentDetails.name}
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
                value={paymentDetails.cardNumber}
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
                value={paymentDetails.expiryMonth}
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
                value={paymentDetails.expiryYear}
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
                value={paymentDetails.cvv}
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