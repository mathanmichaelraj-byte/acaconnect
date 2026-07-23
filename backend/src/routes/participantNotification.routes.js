const router = require("express").Router();
const participantAuth = require("../middleware/participantAuth.middleware");
const ParticipantNotification = require("../models/ParticipantNotification");
// Fix: use req.user.id instead of req.participant.id

// Get all notifications for the authenticated participant
router.get("/", participantAuth, async (req, res) => {
  try {
    const notifications = await ParticipantNotification.find({ 
      participant_id: req.user.id 
    })
    .populate('event_id', 'title date time')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error fetching participant notifications:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch notifications", 
      error: error.message 
    });
  }
});

// Mark notification as read
router.patch("/:notificationId/read", participantAuth, async (req, res) => {
  try {
    const notification = await ParticipantNotification.findOneAndUpdate(
      { 
        _id: req.params.notificationId, 
        participant_id: req.user.id 
      },
      { is_read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark notification as read", 
      error: error.message 
    });
  }
});

// Mark all notifications as read
router.patch("/mark-all-read", participantAuth, async (req, res) => {
  try {
    await ParticipantNotification.updateMany(
      { participant_id: req.user.id, is_read: false },
      { is_read: true }
    );
    
    res.json({
      success: true,
      message: "All notifications marked as read"
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark all notifications as read", 
      error: error.message 
    });
  }
});

// Get unread notification count
router.get("/unread-count", participantAuth, async (req, res) => {
  try {
    const count = await ParticipantNotification.countDocuments({ 
      participant_id: req.user.id,
      is_read: false 
    });
    
    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch unread notification count", 
      error: error.message 
    });
  }
});

module.exports = router;