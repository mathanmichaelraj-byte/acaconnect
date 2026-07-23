const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/technical.controller");

router.get("/", controller.getAllTechnicalItems);
router.post("/", auth, role("ADMIN"), controller.createTechnicalItem);
router.put("/:id", auth, role("ADMIN"), controller.updateTechnicalItem);
router.delete("/:id", auth, role("ADMIN"), controller.deleteTechnicalItem);

module.exports = router;