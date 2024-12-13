import { verify } from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwtConfig';

// eslint-disable-next-line import/no-anonymous-default-export
export default (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Authorization: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided.' });
  }

  try {
    const decoded = verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
