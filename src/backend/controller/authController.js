// controllers/authController.js
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { query } from '../config/db';
import { JWT_SECRET } from '../config/jwtConfig';
import { sendVerificationEmail } from '../utils/emailService';

// **Signup**
export function signup(req, res) {
  const { username, email, password } = req.body;

  // Check if the email already exists
  query('SELECT * FROM Users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before storing
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    // Create user record in database
    const createdAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

    query(
      'INSERT INTO Users (username, email, passwordHash, isVerified, createdAt) VALUES (?, ?, ?, 0, ?)',
      [username, email, hashedPassword, createdAt],
      (err, _result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Send verification email
        sendVerificationEmail(email);

        res.status(201).json({ message: 'User created successfully. Await admin verification.' });
      }
    );
  });
}

// **Login**
export function login(req, res) {
  const { email, password } = req.body;

  // Check if email exists
  query('SELECT * FROM Users WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    if (result.length === 0) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const user = result[0];

    // Check if password is correct
    if (!compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Check if user is verified
    if (user.isVerified === 0) {
      return res.status(400).json({ message: 'User not verified by admin' });
    }

    // Generate JWT token
    const token = sign({ email: user.email, id: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  });
}

// **Password Reset**
export function resetPassword(req, res) {
  const { email, newPassword } = req.body;

  // Hash the new password
  const salt = genSaltSync(10);
  const hashedPassword = hashSync(newPassword, salt);

  // Update password in the database
  query('UPDATE Users SET passwordHash = ? WHERE email = ?', [hashedPassword, email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(200).json({ message: 'Password reset successful' });
  });
}

// **User Verification (admin-only)**
export function verifyUser(req, res) {
  const { email } = req.params;

  // Update the user as verified
  query('UPDATE Users SET isVerified = 1 WHERE email = ?', [email], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(200).json({ message: 'User verified successfully' });
  });
}
