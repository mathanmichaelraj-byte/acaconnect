const Event = require('../models/Events');
const Registration = require('../models/Registration');
const Attendance = require('../models/Attendance');
const Participant = require('../models/Participant');
const Certificate = require('../models/Certificate');
const OnsiteRegistration = require('../models/OnsiteRegistration');
const path = require('path');
const fs = require('fs');
const NotificationService = require('../services/notification.service');
const ParticipantNotificationService = require('../services/participantNotification.service');



// Get all published events for techops team
const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'PUBLISHED' })
      .populate('created_by', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get participants for a specific event
const getEventParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;

    // Get all registrations for the event
    const registrations = await Registration.find({ 
      event_id: eventId,
      payment_status: 'COMPLETED'
    })
    .populate('event_id', 'title date time')
    .populate('participant_id', 'name email mobile college department')
    .sort({ registration_date: 1 });

    // Get existing attendance records
    const attendanceRecords = await Attendance.find({ event_id: eventId });
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.participant_id.toString()] = record;
    });

    // Combine registration and attendance data
    const participants = registrations.map(reg => ({
      registration_id: reg._id,
      participant_id: reg.participant_id._id,
      participant_name: reg.participant_id.name,
      participant_email: reg.participant_id.email,
      participant_mobile: reg.participant_id.mobile,
      participant_college: reg.participant_id.college,
      participant_department: reg.participant_id.department,
      registration_date: reg.registration_date,
      payment_status: reg.payment_status,
      attendance_status: attendanceMap[reg.participant_id._id.toString()]?.attendance_status || 'ABSENT',
      attendance_marked: !!attendanceMap[reg.participant_id._id.toString()],
      marked_at: attendanceMap[reg.participant_id._id.toString()]?.marked_at || null,
      notes: attendanceMap[reg.participant_id._id.toString()]?.notes || null
    }));

    res.json({
      success: true,
      participants,
      total_registered: participants.length,
      total_present: participants.filter(p => p.attendance_status === 'PRESENT').length
    });
  } catch (error) {
    console.error('Error fetching event participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event participants'
    });
  }
};

// Mark attendance for participants
const markAttendance = async (req, res) => {
  try {
    console.log('=== MARK ATTENDANCE REQUEST ===');
    console.log('Event ID:', req.params.eventId);
    
    const { eventId } = req.params;
    const { participantId, attendanceStatus, notes } = req.body;
    const techopsUserId = req.user.id;

    // Check if event exists and is on the same day
    const event = await Event.findById(eventId);
    console.log('Found event:', event ? event.title : 'Not found');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if today is the event date
    const today = new Date();
    const eventDate = new Date(event.date);
    const isEventDay = today.toDateString() === eventDate.toDateString();
    
    console.log('Today:', today.toDateString());
    console.log('Event date:', eventDate.toDateString());
    console.log('Is event day:', isEventDay);

    if (!isEventDay) {
      return res.status(400).json({
        success: false,
        message: 'Attendance can only be marked on the event day'
      });
    }

    // Check if registration exists
    const registration = await Registration.findOne({
      event_id: eventId,
      participant_id: participantId,
      payment_status: 'COMPLETED'
    }).populate('participant_id', 'name email');
    
    console.log('Found registration:', registration ? 'Yes' : 'No');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Valid registration not found for this participant'
      });
    }

    // Update or create attendance record
    const attendanceData = {
      event_id: eventId,
      participant_id: participantId,
      registration_id: registration._id,
      participant_name: registration.participant_id.name,
      participant_email: registration.participant_id.email,
      attendance_status: attendanceStatus,
      marked_by: techopsUserId,
      marked_at: new Date(),
      notes: notes || null
    };
    
    console.log('Attendance data:', attendanceData);

    const attendance = await Attendance.findOneAndUpdate(
      { event_id: eventId, participant_id: participantId },
      attendanceData,
      { upsert: true, new: true }
    );
    
    console.log('Attendance saved:', attendance);

    // Send notification to participant
    try {
      await ParticipantNotificationService.notifyAttendanceMarked(
        participantId,
        event.title,
        attendanceStatus,
        eventId
      );
      console.log('Attendance notification sent to participant');
    } catch (notificationError) {
      console.error('Failed to send attendance notification:', notificationError);
      // Don't fail the attendance marking if notification fails
    }

    // Auto-generate certificate if attendance is PRESENT
    if (attendanceStatus === 'PRESENT') {
      console.log('=== STARTING AUTO CERTIFICATE GENERATION ===');
      try {
        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
          participant_id: participantId,
          event_id: eventId
        });
        console.log('Existing certificate check:', existingCertificate ? 'Found' : 'Not found');

        if (!existingCertificate) {
          console.log('Generating new certificate...');
          // Get participant details
          const participant = await Participant.findById(participantId);
          console.log('Participant found:', participant ? participant.name : 'Not found');
          if (participant) {
            // Use the PDF template
            const { PDFDocument } = require('pdf-lib');
            const templatePath = path.join(__dirname, '../../certificate-template.pdf');
            console.log('Template path:', templatePath);
            console.log('Template exists:', fs.existsSync(templatePath));
            
            if (fs.existsSync(templatePath)) {
              console.log('Using PDF template...');
              
              // Create certificates directory first
              const certificatesDir = path.join(__dirname, '../uploads/certificates');
              if (!fs.existsSync(certificatesDir)) {
                console.log('Creating certificates directory:', certificatesDir);
                fs.mkdirSync(certificatesDir, { recursive: true });
              }
              
              // Load and fill PDF template
              const templateBytes = fs.readFileSync(templatePath);
              const pdfDoc = await PDFDocument.load(templateBytes);
              const form = pdfDoc.getForm();
              
              console.log('Form fields available:', form.getFields().map(f => f.getName()));
              
              // Fill form fields with error handling
              try {
                const participantField = form.getTextField('participant_name');
                participantField.setText(participant.name);
                console.log('Set participant name:', participant.name);
              } catch (e) {
                console.log('Could not set participant_name field:', e.message);
              }
              
              try {
                const collegeField = form.getTextField('college_name');
                collegeField.setText(participant.college || 'N/A');
                console.log('Set college name:', participant.college);
              } catch (e) {
                console.log('Could not set college_name field:', e.message);
              }
              
              try {
                const eventField = form.getTextField('event_name');
                eventField.setText(event.title);
                console.log('Set event name:', event.title);
              } catch (e) {
                console.log('Could not set event_name field:', e.message);
              }
              
              try {
                const eventDate = new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                });
                const dateField = form.getTextField('event_date');
                dateField.setText(eventDate);
                console.log('Set event date:', eventDate);
              } catch (e) {
                console.log('Could not set event_date field:', e.message);
              }
              
              form.flatten();
              const finalPdfBytes = await pdfDoc.save();
              
              const filename = `certificate_${participantId}_${eventId}_${Date.now()}.pdf`;
              const certificatePath = path.join(certificatesDir, filename);
              
              fs.writeFileSync(certificatePath, finalPdfBytes);
              console.log('PDF written to:', certificatePath);
              
              // Create certificate record
              const certificate = new Certificate({
                participant_id: participantId,
                event_id: eventId,
                participant_name: participant.name,
                participant_college: participant.college || 'N/A',
                event_name: event.title,
                event_date: event.date,
                certificate_path: certificatePath
              });
              await certificate.save();
              console.log('✅ Certificate generated and saved for participant:', participant.name);
            } else {
              console.log('❌ PDF template not found at:', templatePath);
              throw new Error('Certificate template not found');
            }
          }
        } else {
          console.log('Certificate already exists, skipping generation');
        }
      } catch (certificateError) {
        console.error('❌ Failed to generate certificate:', certificateError.message);
        console.error('Certificate error stack:', certificateError.stack);
        console.error('Full error details:', {
          participantId,
          eventId,
          participantName: participant?.name,
          eventTitle: event?.title,
          templatePath: path.join(__dirname, '../../certificate-template.pdf'),
          certificatesDir: path.join(__dirname, '../uploads/certificates')
        });
        // Don't fail attendance marking if certificate creation fails
      }
      console.log('=== CERTIFICATE GENERATION COMPLETE ===');
    }

    res.json({
      success: true,
      message: `Attendance marked as ${attendanceStatus}`,
      attendance
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark attendance',
      error: error.message
    });
  }
};

// Bulk mark attendance
const bulkMarkAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { attendanceData } = req.body; // Array of { participantId, attendanceStatus, notes }
    const techopsUserId = req.user.id;

    // Check if event exists and is on the same day
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const today = new Date();
    const eventDate = new Date(event.date);
    const isEventDay = today.toDateString() === eventDate.toDateString();

    if (!isEventDay) {
      return res.status(400).json({
        success: false,
        message: 'Attendance can only be marked on the event day'
      });
    }

    const results = [];
    
    for (const data of attendanceData) {
      try {
        const registration = await Registration.findOne({
          event_id: eventId,
          participant_id: data.participantId,
          payment_status: 'COMPLETED'
        }).populate('participant_id', 'name email');

        if (registration) {
          const attendanceRecord = {
            event_id: eventId,
            participant_id: data.participantId,
            registration_id: registration._id,
            participant_name: registration.participant_id.name,
            participant_email: registration.participant_id.email,
            attendance_status: data.attendanceStatus,
            marked_by: techopsUserId,
            marked_at: new Date(),
            notes: data.notes || null
          };

          await Attendance.findOneAndUpdate(
            { event_id: eventId, participant_id: data.participantId },
            attendanceRecord,
            { upsert: true, new: true }
          );

          // Send notification to participant
          try {
            await ParticipantNotificationService.notifyAttendanceMarked(
              data.participantId,
              event.title,
              data.attendanceStatus,
              eventId
            );
          } catch (notificationError) {
            console.error('Failed to send attendance notification:', notificationError);
            // Don't fail the attendance marking if notification fails
          }

          results.push({
            participantId: data.participantId,
            success: true,
            status: data.attendanceStatus
          });
        } else {
          results.push({
            participantId: data.participantId,
            success: false,
            error: 'Registration not found'
          });
        }
      } catch (error) {
        results.push({
          participantId: data.participantId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Bulk attendance marking completed',
      results
    });
  } catch (error) {
    console.error('Error in bulk attendance marking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark bulk attendance'
    });
  }
};

// Onsite registration
const onsiteRegistration = async (req, res) => {
  try {
    console.log('=== ONSITE REGISTRATION REQUEST ===');
    console.log('User ID:', req.user?.id);
    
    const { participantDetails, eventIds } = req.body;
    const techopsUserId = req.user.id;

    if (!participantDetails || !eventIds || eventIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create onsite participant record
    const onsiteParticipant = {
      name: participantDetails.name,
      email: participantDetails.email,
      phone: participantDetails.phone,
      college: participantDetails.college || 'Walk-in',
      department: participantDetails.department || 'N/A',
      year: participantDetails.year || 'N/A',
      is_onsite: true,
      registered_by: techopsUserId,
      registration_date: new Date()
    };

    console.log('Onsite participant:', onsiteParticipant);

    // Get selected events
    const events = await Event.find({ _id: { $in: eventIds } });
    console.log('Found events:', events.length);
    
    const totalFee = events.reduce((sum, event) => sum + (event.registration_fee || 0), 0);
    console.log('Total fee:', totalFee);

    // Create onsite registration record
    const onsiteRegistration = {
      participant_details: onsiteParticipant,
      events: events.map(event => ({
        event_id: event._id,
        event_title: event.title,
        registration_fee: event.registration_fee || 0
      })),
      total_fee: totalFee,
      status: 'PENDING_PAYMENT',
      registered_by: techopsUserId,
      created_at: new Date()
    };

    console.log('Onsite registration data:', onsiteRegistration);

    // Save to a temporary collection for treasurer approval
    const savedRegistration = await OnsiteRegistration.create(onsiteRegistration);
    console.log('Saved registration:', savedRegistration._id);

    // Notify treasurer
    try {
      await NotificationService.notifyOnsiteRegistration(savedRegistration._id, participantDetails.name, totalFee);
      console.log('Notification sent to treasurer');
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
      // Don't fail the registration if notification fails
    }

    res.json({
      success: true,
      message: 'Onsite registration submitted successfully',
      registration_id: savedRegistration._id,
      total_fee: totalFee
    });
  } catch (error) {
    console.error('Error in onsite registration:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to submit onsite registration',
      error: error.message
    });
  }
};

// Get onsite registrations history
const getOnsiteRegistrations = async (req, res) => {
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
      success: false,
      message: 'Failed to fetch onsite registrations', 
      error: error.message 
    });
  }
};

// Get onsite registration statistics
const getOnsiteStats = async (req, res) => {
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
      success: false,
      message: 'Failed to fetch onsite statistics', 
      error: error.message 
    });
  }
};

// Update onsite registration status
const updateOnsiteRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const registration = await OnsiteRegistration.findById(registrationId);
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: 'Onsite registration not found' 
      });
    }

    registration.status = status;
    if (status === 'PAYMENT_CONFIRMED') {
      registration.payment_confirmed_by = userId;
      registration.payment_confirmed_at = new Date();
    }
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
      success: false,
      message: 'Failed to update registration status', 
      error: error.message 
    });
  }
};

module.exports = {
  getEvents,
  getEventParticipants,
  markAttendance,
  bulkMarkAttendance,
  onsiteRegistration,
  getOnsiteRegistrations,
  getOnsiteStats,
  updateOnsiteRegistrationStatus
};