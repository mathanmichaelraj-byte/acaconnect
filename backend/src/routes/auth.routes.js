const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const nodemailer = require('nodemailer');
const User = require("../models/User");
const Role = require("../models/Role");
const Participant = require("../models/Participant");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many requests, please try again later" } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: "Too many login attempts, please try again later" } });
const otpLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { message: "Too many OTP requests, please try again later" } });

const ALLOWED_STAFF_ROLES = ['ADMIN', 'EVENT_TEAM', 'TREASURER', 'GENERAL_SECRETARY', 'CHAIRPERSON', 'LOGISTICS', 'HR', 'HOSPITALITY', 'TECHOPS', 'DESIGN', 'MARKETING', 'PHOTOGRAPHY', 'ALUMNI'];

router.post("/register", authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!ALLOWED_STAFF_ROLES.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const roleObj = await Role.findOne({ name: role });
    if (!roleObj) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password_hash: await bcrypt.hash(password, 10),
      role_id: roleObj._id
    });

    res.json({ message: "User created successfully", user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Try to find in User collection first (staff)
    let user = await User.findOne({ email }).populate("role_id");
    
    if (user) {
      // Staff user found
      if (!(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role_id.name },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return res.json({ 
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role_id.name
        }
      });
    }

    // Try to find in Participant collection
    const participant = await Participant.findOne({ email });
    
    if (participant) {
      // Check if verified
      if (!participant.isVerified) {
        return res.status(400).json({ message: "Email not verified. Please complete registration." });
      }

      // Verify password
      if (!(await bcrypt.compare(password, participant.password_hash))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: participant._id, email: participant.email, role: 'PARTICIPANT' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: {
          id: participant._id,
          name: participant.name,
          email: participant.email,
          role: 'PARTICIPANT'
        }
      });
    }

    // No user found in either collection
    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

// Forgot Password - Send OTP
router.post("/forgot-password", otpLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Failed to send OTP", error: error.message });
  }
});

// Reset Password
router.post("/reset-password", otpLimiter, async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Failed to reset password", error: error.message });
  }
});

module.exports = router;
