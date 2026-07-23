const Budget = require("../models/Budget");
const Event = require("../models/Event");
const { EVENT_STATUS } = require("../utils/constants");

exports.treasurerApprove = async (req, res) => {
  const budget = await Budget.findOne({ where: { event_id: req.params.eventId }});
  const event = await Event.findByPk(req.params.eventId);

  budget.treasurer_status = "APPROVED";
  await budget.save();

  event.status = EVENT_STATUS.TREASURER_APPROVED;
  await event.save();

  res.json({ message: "Budget approved by Treasurer" });
};

exports.chairpersonApprove = async (req, res) => {
  const event = await Event.findByPk(req.params.eventId);

  event.status = EVENT_STATUS.CHAIRPERSON_APPROVED;
  await event.save();

  res.json({ message: "Event approved by Chairperson" });
};
