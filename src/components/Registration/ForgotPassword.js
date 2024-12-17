import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './ForgotPassword.module.css';
import axios from 'axios'; // Use axios for backend API calls
import Modal from 'react-modal';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      // Send reset password request to your backend
      await axios.post('https://your-backend-api.com/api/v1/auth/reset-password', {
        email,
        newPassword,
        confirmPassword,
      });
      setIsSuccessModalOpen(true);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An error occurred');
      setIsErrorModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsSuccessModalOpen(false);
    setIsErrorModalOpen(false);
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <h2 className={styles.title}>Reset Password</h2>
      <p className={styles.description}>
        Enter your email and new password below to reset your password.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.inputField}
        />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className={styles.inputField}
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={styles.inputField}
        />
        <button type="submit" className={styles.submitButton}>Reset Password</button>
      </form>

      <p className={styles.backLink}>
        Remembered your password? <NavLink to="/login" className={styles.link}>Log in</NavLink>
      </p>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onRequestClose={closeModal}
        contentLabel="Password Reset Success"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <FaCheckCircle className={styles.successIcon} />
          <h2>Password Successfully Reset</h2>
          <p>Your password has been reset successfully. You can now log in with your new password.</p>
          <button onClick={closeModal} className={styles.modalButton}>Close</button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={isErrorModalOpen}
        onRequestClose={closeModal}
        contentLabel="Error Resetting Password"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <div className={styles.modalContent}>
          <FaExclamationCircle className={styles.errorIcon} />
          <h2>Error Resetting Password</h2>
          <p>{errorMessage}</p>
          <button onClick={closeModal} className={styles.modalButton}>Close</button>
        </div>
      </Modal>
    </div>
  );
};

export default ForgotPassword;
