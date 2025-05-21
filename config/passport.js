// backend/config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.NODE_ENV === 'production' 
          ? 'https://wohoo-backend.vercel.app/api/auth/google/callback'
          : 'http://localhost:5001/api/auth/google/callback',
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract email from profile
          const email = profile.emails[0].value;
          
          // Check if user already exists
          let user = await User.findOne({ email });
          
          if (user) {
            // Update user if they exist but don't have googleId yet
            if (!user.googleId) {
              user.googleId = profile.id;
              user.avatar = profile.photos[0].value;
              await user.save();
            }
            
            return done(null, user);
          }
          
          // Create new user if they don't exist
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email,
            avatar: profile.photos[0].value
          });
          
          return done(null, user);
        } catch (error) {
          console.error('Error in Google strategy:', error);
          return done(error, null);
        }
      }
    )
  );
  
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};