require("dotenv").config();

// Validate critical environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('FATAL: JWT_SECRET is missing or too short (minimum 16 characters). Set it in .env');
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const participantAuthRoutes = require("./routes/participantAuth.routes");
const eventRoutes = require("./routes/event.routes");
const requirementRoutes = require("./routes/requirement.routes");
const budgetRoutes = require("./routes/budget.routes");
const notificationRoutes = require("./routes/notification.routes");
const participantNotificationRoutes = require("./routes/participantNotification.routes");
const adminRoutes = require("./routes/admin.routes");
const chatbotRoutes = require("./routes/chatbot.routes");
const registrationRoutes = require("./routes/registration.routes");
const stationeryRoutes = require("./routes/stationery.routes");
const technicalRoutes = require("./routes/technical.routes");
const refreshmentRoutes = require("./routes/refreshment.routes");
const logisticsRoutes = require("./routes/logistics.routes");
const hospitalityRoutes = require("./routes/hospitality.routes");
const hrRoutes = require("./routes/hr.routes");
const techopsRoutes = require("./routes/techops.routes");
const onsiteRegistrationRoutes = require("./routes/onsiteRegistration.routes");
const certificateRoutes = require("./routes/certificate.routes");
const predicateRequirementRoutes = require("./routes/predicateRequirement.routes");
const financialRoutes = require("./routes/financial.routes");
const schedulingRoutes = require("./routes/scheduling.routes");
const alumniRoutes = require("./routes/alumni.routes");
const designRoutes = require("./routes/design.routes");
const photoRoutes = require("./routes/photo.routes");

const app = express();
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// Ensure upload directories exist
const fs = require('fs');
const uploadDirs = ['uploads/events', 'uploads/bills', 'uploads/certificates', 'uploads/designs', 'uploads/photos', 'uploads/payment-screenshots'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

const authMiddleware = require("./middleware/auth.middleware");

// Protect upload directories with authentication for sensitive files
const sensitiveUploads = ['bills', 'certificates', 'payment-screenshots'];
sensitiveUploads.forEach(dir => {
  app.use(`/uploads/${dir}`, authMiddleware, express.static(path.join(__dirname, '..', 'uploads', dir)));
});

// Serve public upload directories (events, designs, photos) without auth
const publicUploads = ['events', 'designs', 'photos'];
publicUploads.forEach(dir => {
  app.use(`/uploads/${dir}`, express.static(path.join(__dirname, '..', 'uploads', dir)));
});

app.use("/auth", authRoutes);
app.use("/participant-auth", participantAuthRoutes);
app.use("/events", eventRoutes);
app.use("/requirements", requirementRoutes);
app.use("/budgets", budgetRoutes);
app.use("/notifications", notificationRoutes);
app.use("/participant-notifications", participantNotificationRoutes);
app.use("/admin", adminRoutes);
app.use("/chatbot", chatbotRoutes);
app.use("/registrations", registrationRoutes);
app.use("/stationery", stationeryRoutes);
app.use("/technical", technicalRoutes);
app.use("/refreshments", refreshmentRoutes);
app.use("/logistics", logisticsRoutes);
app.use("/hospitality", hospitalityRoutes);
app.use("/hr", hrRoutes);
app.use("/techops", techopsRoutes);
app.use("/onsite-registrations", onsiteRegistrationRoutes);
app.use("/certificates", certificateRoutes);
app.use("/requirements", predicateRequirementRoutes); // Predicate-based enhanced routes
app.use("/financial", financialRoutes);
app.use("/scheduling", schedulingRoutes);
app.use("/alumni", alumniRoutes);
app.use("/designs", designRoutes);
app.use("/photos", photoRoutes);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Chatbot Service URL:', process.env.CHATBOT_SERVICE_URL || 'http://localhost:5002');
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
