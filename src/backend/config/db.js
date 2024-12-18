import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

// Load environment variables from the .env file
config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'your_database',  // Database name
  process.env.DB_USER || 'root',           // Username
  process.env.DB_PASSWORD || '',           // Password
  {
    host: process.env.DB_HOST || 'localhost',  // Host
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development',  // Enable query logging in development
    pool: {
      max: 5, // Maximum number of connections
      min: 0, // Minimum number of connections
      acquire: 30000, // Maximum time (ms) to try getting a connection
      idle: 10000, // Maximum time (ms) a connection can be idle before release
    },
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    process.exit(1); // Exit if the connection fails
  }
};

// Call the testConnection function
testConnection();

export default sequelize;
