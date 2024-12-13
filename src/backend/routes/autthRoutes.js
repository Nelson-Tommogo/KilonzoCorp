import { Router } from 'express';
import { signup, login, resetPassword, verifyUser } from '../controllers/authController';

const router = Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Password reset route
router.post('/resetpassword', resetPassword);

// Admin route to verify user
router.post('/verify/:email', verifyUser);

export default router;
