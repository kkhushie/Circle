const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

const register = async (req, res) => {
  try {
    const { username, email, password, name } = req.body;

    // Use name as username if username is not provided
    const finalUsername = username || name || email.split('@')[0];

    // Check if user exists
    const userExists = await User.findOne({
      $or: [{ email }, { username: finalUsername }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create user
    const user = await User.create({
      username: finalUsername,
      email,
      password,
      displayName: name || finalUsername,
      onlineStatus: {
        status: 'offline',
        lastSeen: new Date()
      }

  });
  await user.save();

    // Generate token
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send response
    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;

    // Check if identifier and password provided
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    // Find user by email or username and include password
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (isPasswordValid===false) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    user.onlineStatus.lastSeen = new Date();
    await user.save();
    // Send response
    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is already attached by auth middleware
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { displayName, profilePic, bio, preferences, privacy } = req.body;

    const user = req.user; // Attached by auth middleware

    if (displayName) user.displayName = displayName;
    if (profilePic) user.profilePic = profilePic;
    if (bio !== undefined) user.bio = bio;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (privacy) user.privacy = { ...user.privacy, ...privacy };

    await user.save();

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      // Return 404 securely or just return ok to prevent email scanning. We'll return 404 for UX.
      return res.status(404).json({ success: false, message: 'No user found with that email address.' });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token to save in DB
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 Hour

    // Save with validateBeforeSave false since some properties might be missing
    await user.save({ validateBeforeSave: false });

    // Create reset url
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}`;
    
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <div style="max-w-[600px] margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px;">
            <h1 style="color: #333333; margin-bottom: 20px;">Password Reset</h1>
            <p style="color: #666666; font-size: 16px; line-height: 1.5;">You requested a password reset. Click the button below to choose a new password. This link will expire in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; font-size: 16px;">Reset Password</a>
            <p style="color: #999999; font-size: 14px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Circle - Password Reset Token',
        message: message,
        html: htmlMessage,
      });

      res.status(200).json({ success: true, message: 'Email sent successfully. Please check your inbox or Ethereal terminal.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Email Dispatch Error:', err);
      return res.status(500).json({ success: false, message: 'The email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Hash token to compare with DB
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const axios = require('axios');

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // Fetch profile from Google using the access token
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { email, name, picture, sub } = googleResponse.data;

    
    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create a dynamic username
      const usernameBase = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      
      user = await User.create({
        username: usernameBase,
        email,
        displayName: name,
        profilePic: picture,
        authProvider: 'google',
        googleId: sub,
        onlineStatus: {
          status: 'online',
          lastSeen: new Date()
        }
      });
    } else {
      // Update any Google ID fields if they used normal login previously
      if (!user.googleId) {
        user.googleId = sub;
        if (user.authProvider === 'local') {
           user.authProvider = 'google';
        }
      }
      user.onlineStatus.status = 'online';
      user.onlineStatus.lastSeen = new Date();
      await user.save();
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const jwtToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: jwtToken,
      user
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate with Google'
    });
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.jwt;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Unauthorized. No refresh token provided.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Unauthorized. User not found or inactive.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token
    });
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Forbidden. Refresh token invalid or expired.' });
  }
};

const logout = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  googleLogin,
  refresh,
  logout
};