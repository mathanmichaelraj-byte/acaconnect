const { WORKFLOW_RULES } = require("../utils/constants");

module.exports = (nextStatus) => {
  return (req, res, next) => {
    const currentStatus = req.event.status;
    const allowedNext = WORKFLOW_RULES[currentStatus] || [];

    if (!allowedNext.includes(nextStatus)) {
      return res.status(400).json({
        message: `Invalid transition from ${currentStatus} to ${nextStatus}`
      });
    }
    next();
  };
};
