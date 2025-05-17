// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res) => {
  try {
    // If authentication was successful, the user object is in req.user
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }

    // Generate JWT
    const token = req.user.getSignedJwtToken();

    // Encode user data for URL
    const userData = encodeURIComponent(JSON.stringify({
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar
    }));

    // Redirect to frontend with token and user data
    res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}&user=${userData}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  // Passport logout function
  if (req.logout) {
    req.logout();
  }
  
  res.status(200).json({ success: true, message: 'Successfully logged out' });
};