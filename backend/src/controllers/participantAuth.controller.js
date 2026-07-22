const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Participant = require('../models/Participant');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'NIRAL 2026 - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #333;">Welcome to NIRAL 2026!</h2>
          <p style="color: #666; font-size: 16px;">Your OTP for email verification is:</p>
          <div style="background-color: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Signup - Step 1: Send OTP
exports.signup = async (req, res) => {
  try {
    const { name, email, password, mobile, college, department, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if participant already exists
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant && existingParticipant.isVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update participant
    if (existingParticipant) {
      existingParticipant.name = name;
      existingParticipant.password_hash = password_hash;
      existingParticipant.mobile = mobile;
      existingParticipant.college = college;
      existingParticipant.department = department;
      existingParticipant.year = year;
      existingParticipant.otp = otp;
      existingParticipant.otpExpiry = otpExpiry;
      await existingParticipant.save();
    } else {
      await Participant.create({
        name,
        email,
        password_hash,
        mobile,
        college,
        department,
        year,
        otp,
        otpExpiry
      });
    }

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent to your email',
      email 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
};

// Verify OTP - Step 2
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (participant.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > participant.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Mark as verified
    participant.isVerified = true;
    participant.otp = undefined;
    participant.otpExpiry = undefined;
    await participant.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: participant._id, email: participant.email, role: 'PARTICIPANT' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        role: 'PARTICIPANT'
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (participant.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    participant.otp = otp;
    participant.otpExpiry = otpExpiry;
    await participant.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP resent to your email' 
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (!participant.isVerified) {
      return res.status(400).json({ message: 'Email not verified. Please complete registration.' });
    }

    const isPasswordValid = await bcrypt.compare(password, participant.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: participant._id, email: participant.email, role: 'PARTICIPANT' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        role: 'PARTICIPANT'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    participant.otp = otp;
    participant.otpExpiry = otpExpiry;
    await participant.save();

    await sendOTPEmail(email, otp);

    res.json({ 
      success: true, 
      message: 'OTP sent to your email' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
};

// Reset Password - Verify OTP and Update Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const participant = await Participant.findOne({ email });
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    if (participant.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > participant.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    participant.password_hash = await bcrypt.hash(newPassword, 10);
    participant.otp = undefined;
    participant.otpExpiry = undefined;
    await participant.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};
