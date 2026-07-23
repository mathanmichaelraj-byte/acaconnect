const Budget = require("../models/Budget");
const Event = require("../models/Events");
const { EVENT_STATUS } = require("../utils/constants");
const aggregate = require("../services/budgetAggregation.service");

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
};

exports.getBudget = async (req, res) => {
  const budget = await Budget.findOne({
    where: { event_id: req.params.eventId }
  });
  res.json(budget);
};
