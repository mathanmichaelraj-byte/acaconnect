const Event = require("../models/Events");
const { EVENT_STATUS } = require("../utils/constants");

exports.treasurerApprove = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = EVENT_STATUS.TREASURER_APPROVED;
    event.treasurer_comments = req.body.comments || '';
    await event.save();

    res.json({ message: "Budget approved by Treasurer", event });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

exports.chairpersonApprove = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    event.status = EVENT_STATUS.CHAIRPERSON_APPROVED;
    event.chairperson_comments = req.body.comments || '';
    await event.save();

    res.json({ message: "Event approved by Chairperson", event });
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};
