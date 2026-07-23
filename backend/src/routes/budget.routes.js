const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/budget.controller");

router.post(
  "/:eventId/generate",
  auth,
  role("TREASURER"),
  controller.generateBudget
);

router.get(
  "/:eventId",
  auth,
  controller.getBudget
);

module.exports = router;
