const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/logistics.controller");
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/bills/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.get("/events", auth, role("LOGISTICS"), controller.getEvents);
router.get("/expense-events", auth, role("TREASURER"), controller.getExpenseEvents);
router.post("/acknowledge/:eventId", auth, role("LOGISTICS"), controller.acknowledgeRequirements);
router.post("/expense/:eventId", auth, role("LOGISTICS"), upload.single('bill_attachment'), controller.submitExpense);
router.delete("/expense/:eventId", auth, role("LOGISTICS"), controller.deleteExpense);

module.exports = router;