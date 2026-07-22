const Alumni = require("../models/Alumni");

exports.addAlumni = async (req, res) => {
  try {
    const { name, contact, email, linkedin, batch, location, organization, position } = req.body;
    if (!name || !contact || !email || !batch) {
      return res.status(400).json({ message: "Name, Contact, Email and Batch are required" });
    }
    const alumni = await Alumni.create({ name, contact, email, linkedin, batch, location, organization, position, added_by: req.user.id });
    res.json({ message: "Alumni member added successfully", alumni });
  } catch (error) {
    res.status(500).json({ message: "Failed to add alumni", error: error.message });
  }
};

exports.getAllAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find().sort({ createdAt: -1 });
    res.json(alumni);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch alumni", error: error.message });
  }
};

exports.updateAlumni = async (req, res) => {
  try {
    const { name, contact, email, linkedin, batch, location, organization, position } = req.body;
    const alumni = await Alumni.findByIdAndUpdate(req.params.id, { name, contact, email, linkedin, batch, location, organization, position }, { new: true });
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });
    res.json({ message: "Alumni updated successfully", alumni });
  } catch (error) {
    res.status(500).json({ message: "Failed to update alumni", error: error.message });
  }
};

exports.deleteAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.findByIdAndDelete(req.params.id);
    if (!alumni) return res.status(404).json({ message: "Alumni not found" });
    res.json({ message: "Alumni deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete alumni", error: error.message });
  }
};
