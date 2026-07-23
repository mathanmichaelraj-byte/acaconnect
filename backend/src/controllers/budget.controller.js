const Budget = require("../models/Budget");
const Event = require("../models/Events");

exports.generateBudget = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if budget already exists
    let budget = await Budget.findOne({ event_id: event._id });

    if (budget) {
      // Update existing budget
      const total = await calculateBudget(event._id);
      budget.aggregated_amount = total;
      await budget.save();
    } else {
      // Create new budget
      const total = await calculateBudget(event._id);
      budget = await Budget.create({
        event_id: event._id,
        aggregated_amount: total
      });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate budget", error: error.message });
  }
};

exports.getBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ event_id: req.params.eventId });
    if (!budget) {
      return res.status(404).json({ message: "Budget not found" });
    }
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch budget", error: error.message });
  }
};

async function calculateBudget(eventId) {
  try {
    const EventRequirement = require("../models/EventRequirement");
    const requirements = await EventRequirement.find({ event_id: eventId });
    return requirements.reduce((total, req) => {
      return total + (req.estimated_cost || 0) * (req.quantity || 1);
    }, 0);
  } catch (error) {
    console.error("Budget calculation error:", error);
    return 0;
  }
}
