const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registration.controller');
const authenticate = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');

router.post('/events/:eventId/register', authenticate, registrationController.registerForEvent);
router.post('/:registrationId/pay', authenticate, registrationController.processMockPayment);
router.post('/:registrationId/upload-screenshot', authenticate, registrationController.uploadScreenshotMiddleware, registrationController.uploadPaymentScreenshot);
router.get('/my-registrations', authenticate, registrationController.getMyRegistrations);
router.get('/events/:eventId/check', authenticate, registrationController.checkRegistration);

// Treasurer routes
router.get('/pending-verifications', authenticate, requireRole('TREASURER', 'ADMIN'), registrationController.getPendingVerifications);
router.get('/verification-history', authenticate, requireRole('TREASURER', 'ADMIN'), registrationController.getVerificationHistory);
router.post('/:registrationId/verify', authenticate, requireRole('TREASURER', 'ADMIN'), registrationController.verifyPayment);

// Get participants by event (for all authorized roles)
router.get('/events/:eventId/participants', authenticate, requireRole('TREASURER', 'GENERAL_SECRETARY', 'CHAIRPERSON', 'EVENT_TEAM', 'ADMIN'), registrationController.getEventParticipants);

module.exports = router;
