const schedulingService = require('../services/scheduling.service');
const Event = require('../models/Events');
const Venue = require('../models/Venue');

exports.generateSchedule = async (req, res) => {
  try {
    const { eventIds } = req.body;
    
    if (!eventIds || eventIds.length === 0) {
      return res.status(400).json({ message: 'Event IDs are required' });
    }
    
    const result = await schedulingService.generateOptimalSchedule(eventIds);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Scheduling error:', error);
    res.status(500).json({ message: 'Scheduling failed', error: error.message });
  }
};

exports.checkConflicts = async (req, res) => {
  try {
    const { eventId } = req.params;
    const result = await schedulingService.checkConflicts(eventId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Conflict check error:', error);
    res.status(500).json({ message: 'Conflict check failed', error: error.message });
  }
};

exports.suggestTimes = async (req, res) => {
  try {
    const { date, duration, eventType } = req.body;
    
    const suggestions = await schedulingService.suggestAlternativeTimes(date, duration, eventType);
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Time suggestion error:', error);
    res.status(500).json({ message: 'Time suggestion failed', error: error.message });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ isAvailable: true });
    
    res.json({
      success: true,
      venues
    });
  } catch (error) {
    console.error('Get venues error:', error);
    res.status(500).json({ message: 'Failed to fetch venues', error: error.message });
  }
};

exports.acceptVenueSuggestion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    
    if (!event.scheduling || !event.scheduling.suggested_venue) {
      return res.status(400).json({ message: 'No venue suggestion found' });
    }
    
    event.scheduling.assigned_venue = event.scheduling.suggested_venue;
    event.scheduling.is_auto_assigned = true;
    event.scheduling.assigned_by = req.user.id;
    event.scheduling.assigned_at = new Date();
    event.scheduling.hospitality_approved = true;
    
    await event.save();
    
    res.json({ 
      success: true, 
      message: 'Venue confirmed',
      venue: event.scheduling.assigned_venue 
    });
  } catch (error) {
    console.error('Accept venue error:', error);
    res.status(500).json({ message: 'Failed to accept venue', error: error.message });
  }
};

exports.overrideVenueSuggestion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { venueId, reason } = req.body;
    
    const event = await Event.findById(eventId);
    
    event.scheduling = event.scheduling || {};
    event.scheduling.assigned_venue = venueId;
    event.scheduling.is_auto_assigned = false;
    event.scheduling.override_reason = reason;
    event.scheduling.assigned_by = req.user.id;
    event.scheduling.assigned_at = new Date();
    event.scheduling.hospitality_approved = true;
    
    await event.save();
    
    res.json({ 
      success: true, 
      message: 'Venue override confirmed',
      venue: event.scheduling.assigned_venue 
    });
  } catch (error) {
    console.error('Override venue error:', error);
    res.status(500).json({ message: 'Failed to override venue', error: error.message });
  }
};

exports.optimizeSchedule = async (req, res) => {
  try {
    const { eventIds } = req.body;
    
    if (!eventIds || eventIds.length === 0) {
      return res.status(400).json({ message: 'Event IDs are required' });
    }
    
    const result = await schedulingService.optimizeSchedule(eventIds);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Schedule optimization error:', error);
    res.status(500).json({ message: 'Optimization failed', error: error.message });
  }
};

exports.applyOptimizedSchedule = async (req, res) => {
  try {
    const { scheduleChanges } = req.body;
    
    if (!scheduleChanges || scheduleChanges.length === 0) {
      return res.status(400).json({ message: 'Schedule changes are required' });
    }
    
    const updates = [];
    
    for (const change of scheduleChanges) {
      const event = await Event.findById(change.eventId);
      if (event) {
        event.date = change.suggestedDate;
        event.time = change.suggestedTime;
        event.scheduling = event.scheduling || {};
        event.scheduling.suggested_venue = change.venue;
        event.scheduling.priority_score = change.priority;
        await event.save();
        updates.push(event.title);
      }
    }
    
    res.json({ 
      success: true, 
      message: `Updated ${updates.length} events`,
      updatedEvents: updates
    });
  } catch (error) {
    console.error('Apply schedule error:', error);
    res.status(500).json({ message: 'Failed to apply schedule', error: error.message });
  }
};

// Auto-allocate volunteers using Interval Scheduling
exports.autoAllocateVolunteers = async (req, res) => {
  try {
    const { eventId } = req.body;
    
    if (!eventId) {
      return res.status(400).json({ message: 'Event ID is required' });
    }
    
    const result = await schedulingService.autoAllocateVolunteers(eventId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Auto-allocate volunteers error:', error);
    res.status(500).json({ message: error.message || 'Auto-allocation failed' });
  }
};

// Get volunteer pool
exports.getVolunteerPool = async (req, res) => {
  try {
    const Volunteer = require('../models/Volunteer');
    const volunteers = await Volunteer.find({ is_active: true }).sort({ name: 1 });
    res.json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch volunteers', error: error.message });
  }
};

// Get volunteer pool
exports.getVolunteerPool = async (req, res) => {
  try {
    const Volunteer = require('../models/Volunteer');
    const volunteers = await Volunteer.find({ is_active: true }).sort({ name: 1 });
    res.json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch volunteers', error: error.message });
  }
};

// Add volunteer to pool
exports.addVolunteerToPool = async (req, res) => {
  try {
    const Volunteer = require('../models/Volunteer');
    const { name, department, contact } = req.body;
    if (!name || !department) {
      return res.status(400).json({ message: 'Name and department are required' });
    }
    const volunteer = await Volunteer.create({ name, department, contact: contact || '' });
    res.json({ success: true, volunteer });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add volunteer', error: error.message });
  }
};

// Remove volunteer from pool
exports.removeVolunteerFromPool = async (req, res) => {
  try {
    const Volunteer = require('../models/Volunteer');
    await Volunteer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Volunteer removed' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove volunteer', error: error.message });
  }
};

// NEW: Real-time conflict check endpoint
exports.checkScheduleConflict = async (req, res) => {
  try {
    const eventData = req.body;
    
    if (!eventData.date || !eventData.time || !eventData.duration_hours) {
      return res.status(400).json({ message: 'Date, time, and duration are required' });
    }
    
    const result = await schedulingService.checkScheduleConflict(eventData);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Schedule conflict check error:', error);
    res.status(500).json({ message: 'Conflict check failed', error: error.message });
  }
};
