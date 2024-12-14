import dotenv from 'dotenv';

dotenv.config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'pophdlahsorbhsieohswancofros', 
  expiresIn: '1h',  
};

export default jwtConfig;
