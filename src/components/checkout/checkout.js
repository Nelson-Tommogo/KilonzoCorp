import React, { useState } from "react";
import safImage from "./saf.png";
import paylineImage from "./payline.png";
import mpesaImage from "./mpesa.webp";
import paylineLogo from "./pay.png";
import "./checkout.css";

const Checkout = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handlePaymentSelection = (method) => {
    setSelectedPaymentMethod(method);
    setShowForm(true); // Display the form when a payment method is selected
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      <h3>Select Your Payment Plan</h3>

      {/* Payment Options Section */}
      <div className="payment-options">
        {/* M-Pesa */}
        <div
          className="payment-card"
          onClick={() => handlePaymentSelection("mpesa")}
        >
          <img
            src={safImage}
            alt="M-Pesa"
            className="payment-image"
          />
          <h4>M-Pesa</h4>
        </div>

        {/* Payline */}
        <div
          className="payment-card"
          onClick={() => handlePaymentSelection("payline")}
        >
          <img
            src={paylineImage}
            alt="Payline"
            className="payment-image"
          />
          <h4>Payline</h4>
        </div>
      </div>

      {/* Pop-up Form */}
      {showForm && (
        <div className="popup-form">
          <div className="form-content">
            <img
              src={selectedPaymentMethod === "mpesa" ? mpesaImage : paylineLogo}
              alt={selectedPaymentMethod}
              className="form-image"
            />
            <h3>{selectedPaymentMethod === "mpesa" ? "M-Pesa" : "Payline"}</h3>

            {selectedPaymentMethod === "mpesa" && (
              <div className="form-field">
                <label htmlFor="phone-number">Phone Number:</label>
                <input
                  type="tel"
                  id="phone-number"
                  placeholder="Enter your phone number"
                />
              </div>
            )}

            <button className="proceed-button">Proceed</button>
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
