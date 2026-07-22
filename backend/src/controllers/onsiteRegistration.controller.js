const OnsiteRegistration = require('../models/OnsiteRegistration');
const Registration = require('../models/Registration');
const Participant = require('../models/Participant');

exports.getOnsiteRegistrations = async (req, res) => {
  try {
    const registrations = await OnsiteRegistration.find({})
      .populate('events.event_id', 'title date time venue')
      .populate('registered_by', 'name email')
      .populate('payment_confirmed_by', 'name email')
      .sort({ created_at: -1 });

    res.json({
      success: true,
      registrations,
      count: registrations.length
    });
  } catch (error) {
    console.error('Get onsite registrations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch onsite registrations', 
      error: error.message 
    });
  }
};

exports.getOnsiteStats = async (req, res) => {
  try {
    const totalRegistrations = await OnsiteRegistration.countDocuments();
    const pendingPayments = await OnsiteRegistration.countDocuments({ 
      status: 'PENDING_PAYMENT' 
    });
    const confirmedPayments = await OnsiteRegistration.countDocuments({ 
      status: 'PAYMENT_CONFIRMED' 
    });
    const rejectedPayments = await OnsiteRegistration.countDocuments({ 
      status: 'REJECTED' 
    });

    res.json({
      success: true,
      stats: {
        total: totalRegistrations,
        pending: pendingPayments,
        confirmed: confirmedPayments,
        rejected: rejectedPayments
      }
    });
  } catch (error) {
    console.error('Get onsite stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch onsite statistics', 
      error: error.message 
    });
  }
};

exports.getPendingOnsiteRegistrations = async (req, res) => {
  try {
    console.log('=== GET PENDING ONSITE REGISTRATIONS ===');
    console.log('User:', req.user);
    
    const pendingRegistrations = await OnsiteRegistration.find({ 
      status: 'PENDING_PAYMENT' 
    })
      .populate('events.event_id', 'title date time venue')
      .populate('registered_by', 'name email')
      .sort({ created_at: -1 });

    console.log('Found pending registrations:', pendingRegistrations.length);
    console.log('Registrations:', pendingRegistrations.map(r => ({ id: r._id, name: r.participant_details.name, status: r.status })));

    res.json({
      success: true,
      registrations: pendingRegistrations,
      count: pendingRegistrations.length
    });
  } catch (error) {
    console.error('Get pending onsite registrations error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch pending onsite registrations', 
      error: error.message 
    });
  }
};

exports.confirmOnsitePayment = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { approved, comments } = req.body;
    const userId = req.user.id;

    const registration = await OnsiteRegistration.findById(registrationId)
      .populate('events.event_id', 'title')
      .populate('registered_by', 'name email');
      
    if (!registration) {
      return res.status(404).json({ message: 'Onsite registration not found' });
    }

    if (registration.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ message: 'Registration is not pending payment confirmation' });
    }

    registration.status = approved ? 'PAYMENT_CONFIRMED' : 'REJECTED';
    registration.payment_confirmed_by = userId;
    registration.payment_confirmed_at = new Date();
    registration.verification_comments = comments || '';
    registration.updated_at = new Date();

    await registration.save();

    // If approved, create regular registrations for each event
    if (approved) {
      try {
        // First, check if participant exists, if not create one
        let participant = await Participant.findOne({ email: registration.participant_details.email });
        
        if (!participant) {
          participant = await Participant.create({
            name: registration.participant_details.name,
            email: registration.participant_details.email,
            mobile: registration.participant_details.phone,
            college: registration.participant_details.college,
            department: registration.participant_details.department,
            year: registration.participant_details.year,
            password_hash: 'onsite_' + Date.now() // Temporary password for onsite participants
          });
        }

        // Create regular registrations for each event
        for (const event of registration.events) {
          const existingReg = await Registration.findOne({
            event_id: event.event_id,
            participant_id: participant._id
          });

          if (!existingReg) {
            await Registration.create({
              event_id: event.event_id,
              participant_id: participant._id,
              participant_name: registration.participant_details.name,
              participant_email: registration.participant_details.email,
              registration_fee: event.registration_fee,
              payment_status: 'COMPLETED',
              payment_method: 'MOCK_PAYMENT',
              payment_id: `ONSITE_${registration._id}`,
              payment_date: new Date(),
              verification_status: 'APPROVED',
              verified_by: userId,
              verification_date: new Date(),
              verification_comments: 'Onsite registration - payment confirmed by treasurer'
            });
          }
        }
      } catch (error) {
        console.error('Error creating regular registrations for onsite participant:', error);
        // Don't fail the main operation, just log the error
      }
    }

    res.json({
      success: true,
      message: `Onsite registration ${approved ? 'approved' : 'rejected'} successfully`,
      registration
    });
  } catch (error) {
    console.error('Confirm onsite payment error:', error);
    res.status(500).json({ 
      message: 'Failed to confirm onsite payment', 
      error: error.message 
    });
  }
};

exports.updateOnsiteRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const VALID_STATUSES = ['PENDING_PAYMENT', 'PAYMENT_CONFIRMED', 'REJECTED', 'CANCELLED'];

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}` });
    }

    // Prevent techops from confirming payments - only allow rejection or other status updates
    if (status === 'PAYMENT_CONFIRMED') {
      return res.status(403).json({ 
        message: 'Only treasurer can confirm payments. Use the treasurer dashboard for payment confirmation.' 
      });
    }

    const registration = await OnsiteRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ message: 'Onsite registration not found' });
    }

    registration.status = status;
    registration.updated_at = new Date();

    await registration.save();

    res.json({
      success: true,
      message: `Registration status updated to ${status}`,
      registration
    });
  } catch (error) {
    console.error('Update onsite registration status error:', error);
    res.status(500).json({ 
      message: 'Failed to update registration status', 
      error: error.message 
    });
  }
};