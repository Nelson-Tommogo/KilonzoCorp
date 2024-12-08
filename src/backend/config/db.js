import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config(); 

const db = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('Database connected successfully!');
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    process.exit(1); 
  }
};

export default db;
