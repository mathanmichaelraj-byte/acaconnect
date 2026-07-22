const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const role = require("../middleware/role.middleware");
const controller = require("../controllers/photo.controller");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/photos/");
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
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  }
});

router.post("/upload", auth, role("PHOTOGRAPHY", "ADMIN"), upload.array("photos", 50), controller.uploadPhotos);
router.get("/public", controller.getAllPhotos);
router.get("/", auth, controller.getAllPhotos);
router.get("/event/:eventId", auth, controller.getByEvent);
router.get("/category/:categoryId", auth, controller.getByCategory);
router.delete("/:id", auth, role("PHOTOGRAPHY", "ADMIN"), controller.deletePhoto);

// Category routes
router.post("/categories", auth, role("PHOTOGRAPHY", "ADMIN"), controller.createCategory);
router.get("/categories", auth, controller.getCategories);
router.delete("/categories/:id", auth, role("PHOTOGRAPHY", "ADMIN"), controller.deleteCategory);

module.exports = router;
