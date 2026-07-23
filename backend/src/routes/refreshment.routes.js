const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/refreshment.controller");

router.get("/", controller.getAllRefreshmentItems);
router.post("/", auth, role("ADMIN"), controller.createRefreshmentItem);
router.put("/:id", auth, role("ADMIN"), controller.updateRefreshmentItem);
router.delete("/:id", auth, role("ADMIN"), controller.deleteRefreshmentItem);

module.exports = router;