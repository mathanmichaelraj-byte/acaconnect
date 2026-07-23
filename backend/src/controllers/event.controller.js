const Event = require("../models/Events");
const EventType = require("../models/EventType");
const { EVENT_STATUS } = require("../utils/constants");
const { FSMService } = require("../services/fsm.service");
const NotificationService = require("../services/notification.service");
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

exports.uploadMiddleware = upload.single('cover_photo');

exports.createEvent = async (req, res) => {
  try {
    console.log('=== EVENT CREATION START ===');
    console.log('User ID:', req.user?.id);
    console.log('File:', req.file);
    
    // Validate required fields
    if (!req.body.title) return res.status(400).json({ message: 'Title is required' });
    if (!req.body.type) return res.status(400).json({ message: 'Type is required' });
    if (!req.body.description) return res.status(400).json({ message: 'Description is required' });
    if (!req.body.date) return res.status(400).json({ message: 'Date is required' });
    if (!req.body.time) return res.status(400).json({ message: 'Time is required' });
    if (!req.body.duration_hours) return res.status(400).json({ message: 'Duration is required' });
    if (!req.body.expected_participants) return res.status(400).json({ message: 'Expected participants is required' });
    
    // Parse JSON fields safely
    let tags = [];
    let requirements = {};
    let stationery_items = [];
    
    try {
      tags = req.body.tags ? JSON.parse(req.body.tags) : [];
    } catch (e) {
      console.error('Error parsing tags:', req.body.tags, e.message);
    }
    
    try {
      requirements = req.body.requirements ? JSON.parse(req.body.requirements) : {};
    } catch (e) {
      console.error('Error parsing requirements:', req.body.requirements, e.message);
    }
    
    try {
      stationery_items = req.body.stationery_items ? JSON.parse(req.body.stationery_items) : [];
    } catch (e) {
      console.error('Error parsing stationery_items:', req.body.stationery_items, e.message);
    }
    
    const eventData = {
      title: req.body.title,
      type: req.body.type,
      description: req.body.description,
      cover_photo: req.file ? req.file.path : null,
      tags: tags,
      date: req.body.date,
      time: req.body.time,
      duration_hours: Number(req.body.duration_hours),
      venue: req.body.venue || '',
      expected_participants: Number(req.body.expected_participants),
      prize_pool: req.body.prize_pool ? Number(req.body.prize_pool) : 0,
      prize_pool_required: req.body.prize_pool_required === 'true' || req.body.prize_pool_required === true,
      registration_fee_required: req.body.registration_fee_required === 'true' || req.body.registration_fee_required === true,
      requirements: {
        volunteers_needed: requirements?.volunteers_needed ? Number(requirements.volunteers_needed) : 0,
        rooms_needed: requirements?.rooms_needed ? Number(requirements.rooms_needed) : 0,
        refreshments_needed: requirements?.refreshments_needed === 'true' || requirements?.refreshments_needed === true,
        stationary_needed: requirements?.stationary_needed === 'true' || requirements?.stationary_needed === true,
        stationary_items: stationery_items || [],
        goodies_needed: requirements?.goodies_needed === 'true' || requirements?.goodies_needed === true,
        physical_certificate: requirements?.physical_certificate === 'true' || requirements?.physical_certificate === true,
        trophies_needed: requirements?.trophies_needed === 'true' || requirements?.trophies_needed === true
      },
      created_by: req.user.id,
      status: EVENT_STATUS.DRAFT
    };
    
    // Calculate prize distribution
    if (eventData.prize_pool && eventData.prize_pool > 0) {
      eventData.prize_distribution = {
        first: eventData.prize_pool * 0.5,
        second: eventData.prize_pool * 0.3,
        third: eventData.prize_pool * 0.2
      };
    }
    
    console.log('Creating event with data:', eventData);
    const event = await Event.create(eventData);
    console.log('Event created successfully:', event._id);
    console.log('=== EVENT CREATION END ===');
    
    res.json(event);
  } catch (error) {
    console.error('=== EVENT CREATION ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== ERROR END ===');
    res.status(500).json({ message: "Event creation failed", error: error.message });
  }
};

exports.submitForApproval = async (req, res) => {
  try {
    const event = await FSMService.transitionEvent(
      req.event._id, 
      'SUBMITTED', 
      req.user.role, 
      'Event submitted for approval'
    );
    
    res.json({ message: "Event submitted for treasurer approval", event });

    // Notify treasurer about new submission
    try {
      await NotificationService.notifyRole('TREASURER', `New event "${event.title}" submitted for approval`, event._id);
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    res.status(500).json({ message: "Submission failed", error: error.message });
  }
};

exports.treasurerApprove = async (req, res) => {
  try {
    const { approved, comments, prize_pool, total_budget, registration_fee } = req.body;
    const targetState = approved ? 'TREASURER_APPROVED' : 'REJECTED';
    
    // Update budget information if approved
    if (approved) {
      if (prize_pool) req.event.prize_pool = prize_pool;
      if (total_budget) req.event.total_budget = total_budget;
      if (registration_fee !== undefined) req.event.registration_fee = registration_fee;
    }
    
    req.event.treasurer_comments = comments;
    await req.event.save();
    
    const event = await FSMService.transitionEvent(
      req.event._id, 
      targetState, 
      req.user.role, 
      comments
    );
    
    res.json({ message: approved ? "Approved and sent to General Secretary" : "Rejected", event });

    // Notify event creator and next approver
    try {
      if (approved) {
        await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been approved by Treasurer and sent to General Secretary`, req.event._id);
        await NotificationService.notifyRole('GENERAL_SECRETARY', `Event "${req.event.title}" approved by Treasurer, awaiting your review`, req.event._id);
      } else {
        await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been rejected by Treasurer. Comments: ${comments || 'None'}`, req.event._id);
      }
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

exports.genSecApprove = async (req, res) => {
  try {
    const { approved, comments, updates } = req.body;
    const targetState = approved ? 'GENSEC_APPROVED' : 'REJECTED';
    
    if (updates) {
      const allowedFields = ['title', 'description', 'venue', 'date', 'time', 'duration_hours', 'expected_participants', 'tags'];
      const sanitized = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) sanitized[key] = updates[key];
      }
      Object.assign(req.event, sanitized);
    }
    req.event.gen_sec_comments = comments;
    await req.event.save();
    
    const event = await FSMService.transitionEvent(
      req.event._id, 
      targetState, 
      req.user.role, 
      comments
    );
    
    res.json({ message: approved ? "Approved and sent to Chairperson" : "Rejected", event });

    // Notify event creator and next approver
    try {
      if (approved) {
        await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been approved by General Secretary and sent to Chairperson`, req.event._id);
        await NotificationService.notifyRole('CHAIRPERSON', `Event "${req.event.title}" approved by General Secretary, awaiting your review`, req.event._id);
      } else {
        await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been rejected by General Secretary. Comments: ${comments || 'None'}`, req.event._id);
      }
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

exports.chairpersonApprove = async (req, res) => {
  try {
    const { approved, comments, updates } = req.body;
    
    if (updates) {
      const allowedFields = ['title', 'description', 'venue', 'date', 'time', 'duration_hours', 'expected_participants', 'tags'];
      const sanitized = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) sanitized[key] = updates[key];
      }
      Object.assign(req.event, sanitized);
    }
    req.event.chairperson_comments = comments;
    await req.event.save();
    
    if (approved) {
      const event = await FSMService.transitionEvent(
        req.event._id, 
        'CHAIRPERSON_APPROVED', 
        req.user.role, 
        comments
      );
      
      res.json({ message: "Event approved by Chairperson. Awaiting admin publication.", event });

      // Notify event creator and all participants about publish
      try {
        await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been approved and published by Chairperson!`, req.event._id);
        const ParticipantNotificationService = require('../services/participantNotification.service');
        await ParticipantNotificationService.notifyAllParticipants(`New event published: "${req.event.title}" - Check it out!`, req.event._id, 'event_update');
      } catch (e) { console.error('Notification error:', e); }
    } else {
      const event = await FSMService.transitionEvent(
        req.event._id, 
        'REJECTED', 
        req.user.role, 
        comments
      );
      
      res.json({ message: "Event rejected", event });

      // Notify event creator about rejection
      try {
        await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been rejected by Chairperson. Comments: ${comments || 'None'}`, req.event._id);
      } catch (e) { console.error('Notification error:', e); }
    }
  } catch (error) {
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

exports.publishEvent = async (req, res) => {
  try {
    const event = await FSMService.transitionEvent(
      req.event._id, 
      'PUBLISHED', 
      req.user.role, 
      'Event published'
    );
    res.json({ message: "Event published successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Publishing failed", error: error.message });
  }
};

exports.getPublishedEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: EVENT_STATUS.PUBLISHED })
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch published events", error: error.message });
  }
};

exports.getPublishedEventsWithRegistration = async (req, res) => {
  try {
    const Registration = require('../models/Registration');
    const events = await Event.find({ status: EVENT_STATUS.PUBLISHED })
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });
    
    // Check registration status for each event
    const eventsWithRegistration = await Promise.all(
      events.map(async (event) => {
        const registration = await Registration.findOne({
          event_id: event._id,
          participant_id: req.user.id
        });
        
        return {
          ...event.toObject(),
          isRegistered: registration && registration.payment_status === 'COMPLETED'
        };
      })
    );
    
    res.json(eventsWithRegistration);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch published events", error: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate('created_by', 'name email').sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('created_by', 'name email');
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
};

exports.getEventTypes = async (req, res) => {
  try {
    const types = await EventType.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event types", error: error.message });
  }
};

exports.createEventType = async (req, res) => {
  try {
    const { name, description, default_requirements } = req.body;
    const eventType = await EventType.create({ name, description, default_requirements });
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event type", error: error.message });
  }
};

exports.updateEventType = async (req, res) => {
  try {
    const { name, description, default_requirements } = req.body;
    const eventType = await EventType.findByIdAndUpdate(req.params.id, { name, description, default_requirements }, { new: true });
    if (!eventType) return res.status(404).json({ message: "Event type not found" });
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event type", error: error.message });
  }
};

exports.getValidTransitions = async (req, res) => {
  try {
    const { currentState } = req.params;
    const validTransitions = FSMService.getValidTransitions(currentState, req.user.role);
    res.json({ validTransitions, currentState, userRole: req.user.role });
  } catch (error) {
    res.status(500).json({ message: "Failed to get valid transitions", error: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = req.event;
    const userRole = req.user.role;
    
    // Check permissions: Event Team can delete non-published, Chairperson can delete any
    if (event.status === 'PUBLISHED' && userRole !== 'CHAIRPERSON' && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Only Chairperson can delete published events' });
    }
    
    // Event Team can only delete their own events (except published)
    if (userRole === 'EVENT_TEAM' && event.created_by.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own events' });
    }
    
    await Event.findByIdAndDelete(event._id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
};

exports.getMyRegistrations = async (req, res) => {
  try {
    const Registration = require('../models/Registration');
    const registrations = await Registration.find({ participant_id: req.user.id })
      .populate('event_id')
      .sort({ registration_date: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch registrations", error: error.message });
  }
};

exports.getEventHistory = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).select('statusHistory');
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event.statusHistory || []);
  } catch (error) {
    res.status(500).json({ message: "Failed to get event history", error: error.message });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { registration_status } = req.body;
    if (!['OPEN', 'CLOSED', 'PAUSED'].includes(registration_status)) {
      return res.status(400).json({ message: 'Invalid registration status' });
    }
    req.event.registration_status = registration_status;
    await req.event.save();
    res.json({ message: `Registration ${registration_status.toLowerCase()}`, event: req.event });

    // Notify registered participants about status change
    try {
      const ParticipantNotificationService = require('../services/participantNotification.service');
      await ParticipantNotificationService.notifyEventParticipants(req.event._id, `Registration for "${req.event.title}" is now ${registration_status}`, 'event_update');
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update registration status', error: error.message });
  }
};

exports.updateEventPrice = async (req, res) => {
  try {
    const { registration_fee } = req.body;
    if (registration_fee === undefined || registration_fee < 0) {
      return res.status(400).json({ message: 'Valid registration fee is required' });
    }
    if (req.event.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Can only change price of published events' });
    }
    const oldFee = req.event.registration_fee;
    req.event.registration_fee = registration_fee;
    req.event.registration_fee_required = registration_fee > 0;
    await req.event.save();
    res.json({ message: `Registration fee updated from ₹${oldFee} to ₹${registration_fee}`, event: req.event });

    // Notify registered participants about price change
    try {
      const ParticipantNotificationService = require('../services/participantNotification.service');
      await ParticipantNotificationService.notifyEventParticipants(req.event._id, `Registration fee for "${req.event.title}" has been updated from ₹${oldFee} to ₹${registration_fee}`, 'event_update');
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event price', error: error.message });
  }
};

exports.markEventFinished = async (req, res) => {
  try {
    if (req.event.status !== 'PUBLISHED') {
      return res.status(400).json({ message: 'Only published events can be marked as finished' });
    }
    req.event.event_finished = true;
    req.event.finished_at = new Date();
    req.event.registration_status = 'CLOSED';
    await req.event.save();
    res.json({ message: 'Event marked as finished. All resources freed.', event: req.event });

    // Notify event creator and participants
    try {
      await NotificationService.notifyEventCreator(req.event.created_by, `Your event "${req.event.title}" has been marked as finished`, req.event._id);
      const ParticipantNotificationService = require('../services/participantNotification.service');
      await ParticipantNotificationService.notifyEventParticipants(req.event._id, `Event "${req.event.title}" has concluded. Thank you for participating!`, 'event_update');
    } catch (e) { console.error('Notification error:', e); }
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark event as finished', error: error.message });
  }
};
