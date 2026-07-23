const User = require("../models/User");
const Event = require("../models/Events");
const Role = require("../models/Role");
const bcrypt = require("bcryptjs");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const activeUsers = await User.countDocuments();
    const pendingApprovals = await Event.countDocuments({
      status: { $in: ['BUDGET_PENDING', 'BUDGET_AGGREGATED', 'BUDGET_PREDICTED'] }
    });

    res.json({
      totalEvents,
      activeUsers,
      pendingApprovals
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get stats", error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate('role_id', 'name')
      .select('name email createdAt role_id');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get users", error: error.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to get events", error: error.message });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: "Failed to get roles", error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const roleObj = await Role.findOne({ name: role });
    if (!roleObj) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name,
      email,
      password_hash: hashedPassword,
      role_id: roleObj._id
    });
    
    res.json({ message: "User created successfully", user: { id: user._id, name, email, role } });
  } catch (error) {
    res.status(500).json({ message: "Failed to create user", error: error.message });
  }
};