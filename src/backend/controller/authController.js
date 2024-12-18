import bcrypt from 'bcryptjs'; // Import bcryptjs
import jwt from 'jsonwebtoken'; // Import jsonwebtoken
import jwtConfig from '../config/jwtConfig.js';
import User from '../models/User.js';  // Import the Sequelize User model
import { sendVerificationEmail } from '../utils/emailService.js';

// Password complexity check function
function isValidPassword(password) {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/; // Minimum 8 characters, at least one letter and one number
  return regex.test(password);
}

// **Signup**
export async function signup(req, res) {
  const { username, email, password } = req.body;

  // Check if the password is valid
  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long, contain letters and numbers' });
  }

  try {
    // Check if the email already exists using Sequelize's `findOne` method
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password before storing
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Create user record in the database using Sequelize's `create` method
    const newUser = await User.create({
      username,
      email,
      passwordHash: hashedPassword,
      isVerified: false, // Default value is false (not verified)
    });

    // Send verification email
    sendVerificationEmail(email);

    res.status(201).json({ message: 'User created successfully. Await admin verification.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating user' });
  }
}

// **Login**
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Check if email exists using Sequelize's `findOne` method
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Check if password is correct
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: 'User not verified by admin' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email, id: user.id }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    res.status(200).json({ message: 'Login successful', token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging in' });
  }
}

// **Password Reset**
export async function resetPassword(req, res) {
  const { email, newPassword } = req.body;

  // Check if password is valid
  if (!isValidPassword(newPassword)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long, contain letters and numbers' });
  }

  try {
    // Check if user exists using Sequelize's `findOne` method
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update password in the database using Sequelize's `update` method
    await User.update({ passwordHash: hashedPassword }, { where: { email } });

    res.status(200).json({ message: 'Password reset successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error resetting password' });
  }
}

// **User Verification (admin-only)**
export async function verifyUser(req, res) {
  const { email } = req.params;

  try {
    // Ensure the user exists using Sequelize's `findOne` method
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified' });
    }

    // Update the user as verified using Sequelize's `update` method
    await User.update({ isVerified: true }, { where: { email } });

    res.status(200).json({ message: 'User verified successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying user' });
  }
}
