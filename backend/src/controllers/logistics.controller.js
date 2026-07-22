const Event = require("../models/Events");
const User = require("../models/User");
const NotificationService = require("../services/notification.service");
const { logAPICall } = require("../utils/logger");
const distributor = require('../services/requirementDistributor.service');
const { predicates } = require('../middleware/predicate.middleware');

console.log('=== LOGISTICS CONTROLLER LOADED ===');

exports.getEvents = async (req, res) => {
  try {
    console.log('=== LOGISTICS GET EVENTS CALLED ===');
    console.log('User:', req.user);
    console.log('User Role:', req.user?.role);
    
    const events = await Event.find({ status: 'PUBLISHED' })
      .populate('requirements.refreshment_items.item_id', 'name unit')
      .populate('requirements.stationary_items.item_id', 'name unit')
      .populate('requirements.technical_items.item_id', 'name unit')
      .populate('created_by', 'name email')
      .sort({ date: 1 });
    
    console.log('Found events count:', events.length);

    // Populate item names from populated references
    const eventsWithItemNames = events.map(event => {
      const eventObj = event.toObject();
      
      if (eventObj.requirements?.refreshment_items) {
        eventObj.requirements.refreshment_items = eventObj.requirements.refreshment_items.map(item => ({
          ...item,
          item_name: item.item_name || item.item_id?.name || 'Unknown Item'
        }));
      }
      
      if (eventObj.requirements?.stationary_items) {
        eventObj.requirements.stationary_items = eventObj.requirements.stationary_items.map(item => ({
          ...item,
          item_name: item.item_name || item.item_id?.name || 'Unknown Item'
        }));
      }
      
      if (eventObj.requirements?.technical_items) {
        eventObj.requirements.technical_items = eventObj.requirements.technical_items.map(item => ({
          ...item,
          item_name: item.item_name || item.item_id?.name || 'Unknown Item'
        }));
      }
      
      return eventObj;
    });

    // Apply predicate-based filtering and sorting
    const relevantEvents = await distributor.filterEventsByTeam('LOGISTICS', eventsWithItemNames);
    const sortedEvents = distributor.sortByPriority(relevantEvents);

    res.json(sortedEvents);
  } catch (error) {
    res.status(500).json({ message: "Failed to get events", error: error.message });
  }
};

exports.acknowledgeRequirements = async (req, res) => {
  try {
    logAPICall('/logistics/acknowledge/:eventId', 'POST', { eventId: req.params.eventId });
    console.log('=== ACKNOWLEDGE REQUIREMENTS CALLED ===');
    const { eventId } = req.params;
    const userId = req.user.id;

    console.log('Event ID:', eventId);
    console.log('User ID:', userId);

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        'logistics.requirements_acknowledged': true,
        'logistics.acknowledged_at': new Date(),
        'logistics.acknowledged_by': userId
      },
      { new: true }
    );

    if (!event) {
      console.log('Event not found for ID:', eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log('Event acknowledged, sending notification...');

    // Send notification to treasurer about acknowledgment
    await NotificationService.notifyRole(
      'TREASURER',
      `Logistics has acknowledged requirements for event "${event.title}"`
    );
    
    console.log('Notification sent to treasurer');
    
    res.json({ message: "Requirements acknowledged successfully", event });
  } catch (error) {
    console.error('Error in acknowledgeRequirements:', error);
    res.status(500).json({ message: "Failed to acknowledge requirements", error: error.message });
  }
};

exports.submitExpense = async (req, res) => {
  try {
    logAPICall('/logistics/expense/:eventId', 'POST', { eventId: req.params.eventId });
    console.log('=== EXPENSE SUBMISSION CALLED ===');
    const { eventId } = req.params;
    const { expense_breakdown, gst_number, gst_verified, no_gst_reason } = req.body;
    const billPath = req.file ? req.file.path : null;

    console.log('Event ID:', eventId);
    console.log('File received:', req.file ? 'Yes' : 'No');

    if (!expense_breakdown) {
      console.error('Missing expense_breakdown');
      return res.status(400).json({ message: "Expense breakdown is required" });
    }

    let expenseBreakdown;
    try {
      expenseBreakdown = JSON.parse(expense_breakdown);
    } catch (parseError) {
      console.error('Error parsing expense_breakdown:', parseError);
      return res.status(400).json({ message: "Invalid expense breakdown format" });
    }

    const totalExpense = Object.values(expenseBreakdown).reduce((sum, val) => sum + parseFloat(val || 0), 0);
    console.log('Total expense calculated:', totalExpense);

    const updateData = {
      'logistics.total_expense': totalExpense,
      'logistics.expense_breakdown': expenseBreakdown,
      'logistics.expense_submitted': true,
      'logistics.expense_submitted_at': new Date(),
      'logistics.bill_attachment': billPath,
      'logistics.gst_number': gst_number || '',
      'logistics.gst_verified': gst_verified === 'true' || gst_verified === true,
      'logistics.no_gst_reason': no_gst_reason || ''
    };
    console.log('Update data:', updateData);

    const event = await Event.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true }
    );

    if (!event) {
      console.log('Event not found for ID:', eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log('Event updated successfully, sending notification...');
    console.log('GST Data saved - Number:', event.logistics.gst_number, 'Verified:', event.logistics.gst_verified);
    
    // Enhanced notification with GST status
    const gstStatus = gst_verified === 'true' ? `GST: ${gst_number}` : 'No GST';
    await NotificationService.notifyRole(
      'TREASURER',
      `Logistics has submitted expenses for event "${event.title}" - Total: ₹${totalExpense} (${gstStatus})`
    );
    
    console.log('Notification sent to treasurer');
    
    res.json({ message: "Expense submitted successfully", event });
  } catch (error) {
    console.error('Error in submitExpense:', error);
    res.status(500).json({ message: "Failed to submit expense", error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    logAPICall('/logistics/expense/:eventId', 'DELETE', { eventId: req.params.eventId });
    console.log('=== DELETE EXPENSE CALLED ===');
    const { eventId } = req.params;

    console.log('Event ID:', eventId);

    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        $unset: {
          'logistics.total_expense': 1,
          'logistics.expense_breakdown': 1,
          'logistics.expense_submitted': 1,
          'logistics.expense_submitted_at': 1,
          'logistics.bill_attachment': 1,
          'logistics.gst_number': 1,
          'logistics.gst_verified': 1,
          'logistics.no_gst_reason': 1
        }
      },
      { new: true }
    );

    if (!event) {
      console.log('Event not found for ID:', eventId);
      return res.status(404).json({ message: "Event not found" });
    }

    console.log('Expense deleted successfully, sending notification...');
    
    // Send notification to treasurer about expense deletion
    await NotificationService.notifyRole(
      'TREASURER',
      `Logistics has deleted the expense submission for event "${event.title}"`
    );
    
    console.log('Notification sent to treasurer');
    
    res.json({ message: "Expense deleted successfully", event });
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

exports.getExpenseEvents = async (req, res) => {
  try {
    const events = await Event.find({
      'logistics.requirements_acknowledged': true
    })
    .populate('created_by', 'name email')
    .sort({ date: 1 });

    console.log(`Found ${events.length} expense events`);
    res.json(events);
  } catch (error) {
    console.error('Error in getExpenseEvents:', error);
    res.status(500).json({ message: "Failed to get expense events", error: error.message });
  }
};