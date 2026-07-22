const Registration = require('../models/Registration');
const Event = require('../models/Events');
const Participant = require('../models/Participant');
const ParticipantNotificationService = require('../services/participantNotification.service');
const NotificationService = require('../services/notification.service');
const multer = require('multer');
const path = require('path');

// Configure multer for screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment-screenshots/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'payment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

exports.uploadScreenshotMiddleware = upload.single('payment_screenshot');

// Register for event
exports.registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const participantId = req.user.id;

    // Get event details
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Event is not open for registration' });
    }

    if (event.registration_status === 'CLOSED') {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

    if (event.registration_status === 'PAUSED') {
      return res.status(400).json({ message: 'Registration is temporarily paused for this event' });
    }

    // Get participant details
    const participant = await Participant.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check if already registered with completed payment
    const existingRegistration = await Registration.findOne({
      event_id: eventId,
      participant_id: participantId,
      payment_status: 'COMPLETED'
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Create registration
    const registration = await Registration.create({
      event_id: eventId,
      participant_id: participantId,
      participant_name: participant.name,
      participant_email: participant.email,
      registration_fee: event.registration_fee || 0,
      payment_status: event.registration_fee > 0 ? 'PENDING' : 'COMPLETED',
      payment_method: event.registration_fee > 0 ? 'MOCK_PAYMENT' : 'FREE'
    });

    res.json({
      success: true,
      message: event.registration_fee > 0 
        ? 'Registration created. Please complete payment.' 
        : 'Successfully registered for free event!',
      registration,
      requiresPayment: event.registration_fee > 0
    });

    // Notify participant about registration
    try {
      const msg = event.registration_fee > 0
        ? `You have registered for "${event.title}". Please complete payment of ₹${event.registration_fee}.`
        : `You have successfully registered for "${event.title}" (Free event).`;
      await ParticipantNotificationService.notifyParticipant(participantId, msg, eventId, 'registration');
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Process mock payment
exports.processMockPayment = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (registration.payment_status === 'COMPLETED') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    // Simulate payment processing
    const paymentId = `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    registration.payment_status = 'COMPLETED';
    registration.payment_method = 'MOCK_PAYMENT';
    registration.payment_id = paymentId;
    registration.payment_date = new Date();
    await registration.save();

    res.json({
      success: true,
      message: 'Payment successful!',
      registration,
      paymentId
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

// Get participant registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const participantId = req.user.id;

    const registrations = await Registration.find({ participant_id: participantId })
      .populate('event_id')
      .sort({ registration_date: -1 });

    res.json({
      success: true,
      registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
  }
};

// Check registration status
exports.checkRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const participantId = req.user.id;

    const registration = await Registration.findOne({
      event_id: eventId,
      participant_id: participantId
    });

    res.json({
      success: true,
      isRegistered: !!registration,
      registration: registration || null
    });
  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({ message: 'Failed to check registration', error: error.message });
  }
};

// Upload payment screenshot
exports.uploadPaymentScreenshot = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Payment screenshot is required' });
    }

    registration.payment_screenshot = req.file.path;
    registration.verification_status = 'PENDING';
    await registration.save();

    res.json({
      success: true,
      message: 'Payment screenshot uploaded successfully. Awaiting treasurer verification.',
      registration
    });

    // Notify treasurer about pending verification
    try {
      const event = await Event.findById(registration.event_id);
      await NotificationService.notifyRole('TREASURER', `New payment screenshot uploaded for "${event?.title || 'an event'}" by ${registration.participant_name}. Please verify.`, registration.event_id);
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    console.error('Screenshot upload error:', error);
    res.status(500).json({ message: 'Failed to upload screenshot', error: error.message });
  }
};

// Get pending verifications (Treasurer)
exports.getPendingVerifications = async (req, res) => {
  try {
    const registrations = await Registration.find({
      payment_status: 'VERIFICATION_PENDING',
      verification_status: 'PENDING'
    })
      .populate('event_id')
      .populate('participant_id')
      .sort({ payment_date: -1 });

    res.json({
      success: true,
      registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);
    res.status(500).json({ message: 'Failed to fetch pending verifications', error: error.message });
  }
};

// Get verification history (Treasurer)
exports.getVerificationHistory = async (req, res) => {
  try {
    console.log('Verification history request received');
    
    // Get all events to determine which are free
    const events = await Event.find({});
    const freeEventIds = events.filter(event => event.registration_fee === 0).map(event => event._id);
    
    const registrations = await Registration.find({
      $or: [
        { event_id: { $in: freeEventIds }, payment_status: 'COMPLETED' }, // Free events that are completed
        { payment_id: { $exists: true, $ne: null, $ne: '' }, payment_status: 'COMPLETED' } // Only verified paid events
      ]
    })
      .populate('event_id')
      .populate('participant_id')
      .sort({ createdAt: -1 });

    console.log('Found registrations:', registrations.length);
    res.json({
      success: true,
      registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Get verification history error:', error);
    res.status(500).json({ message: 'Failed to fetch verification history', error: error.message });
  }
};

// Verify payment (Treasurer)
exports.verifyPayment = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { approved, comments } = req.body;

    const registration = await Registration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (approved) {
      registration.payment_status = 'COMPLETED';
      registration.verification_status = 'APPROVED';
    } else {
      registration.payment_status = 'FAILED';
      registration.verification_status = 'REJECTED';
    }

    registration.verified_by = req.user.id;
    registration.verification_date = new Date();
    registration.verification_comments = comments;
    await registration.save();

    res.json({
      success: true,
      message: approved ? 'Payment verified and registration completed' : 'Payment rejected',
      registration
    });

    // Notify participant about verification result
    try {
      const event = await Event.findById(registration.event_id);
      const msg = approved
        ? `Your payment for "${event?.title}" has been verified. Registration complete!`
        : `Your payment for "${event?.title}" has been rejected. ${comments ? 'Reason: ' + comments : 'Please contact support.'}`;
      await ParticipantNotificationService.notifyParticipant(registration.participant_id, msg, registration.event_id, 'registration');
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

// Get event participants
exports.getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    const registrations = await Registration.find({
      event_id: eventId,
      payment_status: 'COMPLETED'
    })
      .populate('participant_id', 'name email phone college')
      .sort({ registration_date: -1 });

    res.json({
      success: true,
      participants: registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Get event participants error:', error);
    res.status(500).json({ message: 'Failed to fetch participants', error: error.message });
  }
};
