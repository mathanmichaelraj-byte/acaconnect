const EventRequirement = require("../models/EventRequirement");
const Event = require("../models/Events");
const { EVENT_STATUS } = require("../utils/constants");

exports.addRequirement = async (req, res) => {
  const event = await Event.findByPk(req.params.eventId);

  if (event.status !== EVENT_STATUS.BUDGET_PENDING) {
    return res.status(400).json({ message: "Requirements not allowed now" });
  }

  const { name, quantity, unit, priority, notes } = req.body;

  const requirement = await EventRequirement.create({
    name,
    quantity,
    unit,
    priority,
    notes,
    event_id: event.id,
    created_by: req.user.id
  });

  res.json(requirement);
};

exports.getRequirements = async (req, res) => {
  const list = await EventRequirement.findAll({
    where: { event_id: req.params.eventId }
  });
  res.json(list);
};
