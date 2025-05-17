// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const cookieParser = require('cookie-parser');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

// Load passport config
require('./config/passport')(passport);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Initialize passport
app.use(passport.initialize());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Mount routes
app.use('/api/auth', require('./routes/authRoutes'));

// Base route
app.get('/', (req, res) => {
  res.send('Travel App API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});