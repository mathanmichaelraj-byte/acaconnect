const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/requirement.controller");

router.post(
  "/:eventId",
  auth,
  role("LOGISTICS", "HR", "HOSPITALITY"),
  controller.addRequirement
);

router.get(
  "/:eventId",
  auth,
  controller.getRequirements
);

module.exports = router;
