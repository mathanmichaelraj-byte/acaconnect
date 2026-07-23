const EventRequirement = require("../models/EventRequirement");
const Event = require("../models/Events");
const { EVENT_STATUS } = require("../utils/constants");

exports.addRequirement = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status !== EVENT_STATUS.DRAFT && event.status !== EVENT_STATUS.SUBMITTED) {
      return res.status(400).json({ message: "Requirements not allowed in current event state" });
    }

    const { resource_name, quantity, estimated_cost, team_type } = req.body;

    const requirement = await EventRequirement.create({
      resource_name,
      quantity,
      estimated_cost,
      team_type,
      event_id: event._id,
      created_by: req.user.id
    });

    res.status(201).json(requirement);
  } catch (error) {
    res.status(500).json({ message: "Failed to add requirement", error: error.message });
  }
};

exports.getRequirements = async (req, res) => {
  try {
    const list = await EventRequirement.find({ event_id: req.params.eventId });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requirements", error: error.message });
  }
};
