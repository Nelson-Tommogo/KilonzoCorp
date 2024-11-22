import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import './checkout.css';  // Assuming you will save the CSS file as Checkout.css

const Checkout = () => {
  const location = useLocation();
  const { planName, price } = location.state || {};  // Accessing the planName and price from state

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);

  // Function to handle payment method selection
  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  // Function to handle the payment button click
  const handlePaymentClick = () => {
    if (selectedPaymentMethod === 'mpesa') {
      // Placeholder for M-Pesa integration
      alert('Redirecting to M-Pesa for payment...');
      // Implement the M-Pesa API integration here
    } else if (selectedPaymentMethod === 'payline') {
      // Placeholder for Payline integration
      alert('Redirecting to Payline for payment...');
      // Implement the Payline API integration here
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>

      {/* Display selected plan and price */}
      {planName && price ? (
        <div className="checkout-details">
          <h3>Your Selected Plan: {planName}</h3>
          <h4>Price: {price}</h4>
        </div>
      ) : (
        <p>No plan selected.</p>
      )}

      {/* Payment Method Selection */}
      <h3>Choose Your Payment Method</h3>

      {/* M-Pesa option */}
      <div className="payment-option">
        <input
          type="radio"
          id="mpesa"
          name="payment-method"
          value="mpesa"
          checked={selectedPaymentMethod === 'mpesa'}
          onChange={handlePaymentMethodChange}
        />
        <label htmlFor="mpesa">M-Pesa</label>
      </div>

      {/* Payline option */}
      <div className="payment-option">
        <input
          type="radio"
          id="payline"
          name="payment-method"
          value="payline"
          checked={selectedPaymentMethod === 'payline'}
          onChange={handlePaymentMethodChange}
        />
        <label htmlFor="payline">Payline</label>
      </div>

      {/* Proceed to Payment button */}
      <button
        className="payment-button"
        onClick={handlePaymentClick}
        disabled={!selectedPaymentMethod}
      >
        Proceed to Payment
      </button>

      <p className="info">Choose a payment method to continue the checkout process.</p>
    </div>
  );
};

export default Checkout;
