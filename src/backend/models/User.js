import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';  // Import the sequelize instance

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,  // Default is false (unverified)
  },
}, {
  timestamps: true,  // Automatically adds 'createdAt' and 'updatedAt' columns
});

export default User;
