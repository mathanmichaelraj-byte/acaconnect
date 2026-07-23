const EventRequirement = require("../models/EventRequirement");

exports.aggregateBudget = async (eventId) => {
  const requirements = await EventRequirement.findAll({
    where: { event_id: eventId }
  });

  // MAP
  const mapped = requirements.map(r => Number(r.estimated_cost || 0));

  // REDUCE
  const total = mapped.reduce((sum, cost) => sum + cost, 0);

  return total;
};
