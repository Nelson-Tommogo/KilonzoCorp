import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js'; // Correct import from db.js

// Define the Transaction model using Sequelize
const Transaction = sequelize.define('Transaction', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.01,
    },
  },
  checkoutId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  mpesaCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^254\d{9}$/, // Matches Kenyan phone numbers
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Pending',
    validate: {
      isIn: [['Pending', 'Completed', 'Failed']],
    },
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: sequelize.NOW,
  },
}, {
  // Adding timestamps (createdAt, updatedAt)
  timestamps: true,
});

// Export the model
export default Transaction;
