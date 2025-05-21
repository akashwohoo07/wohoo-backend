// index.js - Vercel Serverless Entry Point
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Initialize app
const app = express();

// Set NODE_ENV if not set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Log environment for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('Client URL:', process.env.CLIENT_URL);

// Load passport config
require('./config/passport')(passport);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Initialize passport
app.use(passport.initialize());

// Connect to MongoDB - only connect if not already connected
const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(process.env.MONGO_URL);
      console.log('MongoDB connected');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      // Don't exit process in serverless environment
      // process.exit(1);
    }
  }
};

// Call connectDB but don't wait for it to complete (serverless optimization)
connectDB();

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Travel App API is running');
});

// Vercel specific: Export the Express app as the default module
module.exports = app;