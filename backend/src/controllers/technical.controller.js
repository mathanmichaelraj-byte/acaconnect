const TechnicalItem = require("../models/TechnicalItem");

exports.getAllTechnicalItems = async (req, res) => {
  try {
    const items = await TechnicalItem.find({ isActive: true }).sort({ name: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch technical items", error: error.message });
  }
};

exports.createTechnicalItem = async (req, res) => {
  try {
    const { name, description, unit } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });
    const item = await TechnicalItem.create({ name, description, unit });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create technical item", error: error.message });
  }
};

exports.updateTechnicalItem = async (req, res) => {
  try {
    const { name, description, unit } = req.body;
    const item = await TechnicalItem.findByIdAndUpdate(req.params.id, { name, description, unit }, { new: true });
    if (!item) return res.status(404).json({ message: "Technical item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to update technical item", error: error.message });
  }
};

exports.deleteTechnicalItem = async (req, res) => {
  try {
    await TechnicalItem.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: "Technical item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete technical item", error: error.message });
  }
};