const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

module.exports = {
  // Database connection configuration
  db: {
    uri: process.env.MONGO_URI, // Replace with your database connection string
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_strong_jwt_secret', // Replace with a strong, unique secret
    expiresIn: '1h', // JWT token expiry time (e.g., '1h' for 1 hour)
  },

  // Server configuration (optional)
  server: {
    port: process.env.PORT || 5000, // Default server port
  },
};
