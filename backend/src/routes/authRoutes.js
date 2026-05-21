const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    forgotPassword,
    resetPassword,
    googleLogin,
    refresh,
    logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/refresh', refresh);
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', auth, getMe);
router.put('/update', auth, updateProfile);

module.exports = router;
