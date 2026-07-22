const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/design.controller");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/designs/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post("/upload", auth, role("DESIGN", "ADMIN"), upload.array("files", 20), controller.uploadFiles);
router.get("/", auth, role("DESIGN", "MARKETING", "ADMIN"), controller.getAllFiles);
router.get("/event/:eventId", auth, role("DESIGN", "MARKETING", "ADMIN"), controller.getByEvent);
router.get("/general", auth, role("DESIGN", "MARKETING", "ADMIN"), controller.getGeneral);
router.delete("/:id", auth, role("DESIGN", "ADMIN"), controller.deleteFile);

module.exports = router;
