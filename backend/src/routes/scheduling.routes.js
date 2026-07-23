const router = require('express').Router();
const schedulingController = require('../controllers/scheduling.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Generate optimal schedule (Authenticated users)
router.post('/generate', 
  auth, 
  schedulingController.generateSchedule
);

// Check conflicts for an event
router.get('/conflicts/:eventId', 
  auth, 
  schedulingController.checkConflicts
);

// Suggest alternative times
router.post('/suggest-times', 
  auth, 
  schedulingController.suggestTimes
);

// Get all available venues
router.get('/venues', 
  auth, 
  schedulingController.getVenues
);

// Accept AI venue suggestion (Hospitality only)
router.post('/accept-venue/:eventId', 
  auth, 
  role(['HOSPITALITY', 'ADMIN']), 
  schedulingController.acceptVenueSuggestion
);

// Override AI venue suggestion (Hospitality only)
router.post('/override-venue/:eventId', 
  auth, 
  role(['HOSPITALITY', 'ADMIN']), 
  schedulingController.overrideVenueSuggestion
);

// Optimize schedule (rearrange dates/times) - Temporarily no auth for testing
router.post('/optimize', 
  schedulingController.optimizeSchedule
);

// Apply optimized schedule - Temporarily no auth for testing
router.post('/apply-schedule', 
  schedulingController.applyOptimizedSchedule
);

// Auto-allocate volunteers (HR)
router.post('/auto-allocate-volunteers', 
  auth, 
  role('HR', 'ADMIN'), 
  schedulingController.autoAllocateVolunteers
);

// Get volunteer pool (HR)
router.get('/volunteer-pool', 
  auth, 
  role('HR', 'ADMIN'), 
  schedulingController.getVolunteerPool
);

// Add volunteer to pool (HR)
router.post('/volunteer-pool', 
  auth, 
  role('HR', 'ADMIN'), 
  schedulingController.addVolunteerToPool
);

// Remove volunteer from pool (HR)
router.delete('/volunteer-pool/:id', 
  auth, 
  role('HR', 'ADMIN'), 
  schedulingController.removeVolunteerFromPool
);

// NEW: Real-time conflict check (Event Team)
router.post('/check-conflict', 
  auth, 
  schedulingController.checkScheduleConflict
);

module.exports = router;
