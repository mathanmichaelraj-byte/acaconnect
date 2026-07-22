const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const participantAuthController = require('../controllers/participantAuth.controller');

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many requests, please try again later" } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: "Too many login attempts, please try again later" } });
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { message: "Too many OTP requests, please try again later" } });

router.post('/signup', authLimiter, participantAuthController.signup);
router.post('/verify-otp', otpLimiter, participantAuthController.verifyOTP);
router.post('/resend-otp', otpLimiter, participantAuthController.resendOTP);
router.post('/login', loginLimiter, participantAuthController.login);
router.post('/forgot-password', otpLimiter, participantAuthController.forgotPassword);
router.post('/reset-password', otpLimiter, participantAuthController.resetPassword);

module.exports = router;
