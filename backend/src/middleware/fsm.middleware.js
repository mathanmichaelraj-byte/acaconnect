const { FSMService } = require('../services/fsm.service');
const Event = require('../models/Events');

const validateStateTransition = async (req, res, next) => {
  try {
    const userRole = req.user.role;

    // For approval routes, validate the event is in a valid state for this role
    if (req.route.path.includes('-approve')) {
      const eventId = req.params.id || req.params.eventId;
      if (eventId) {
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }

        // Determine target state from route path
        let targetState;
        if (req.route.path.includes('treasurer-approve')) {
          targetState = req.body.status || (req.body.approved !== false ? 'TREASURER_APPROVED' : 'REJECTED');
        } else if (req.route.path.includes('gen-sec-approve')) {
          targetState = req.body.status || (req.body.approved !== false ? 'GENSEC_APPROVED' : 'REJECTED');
        } else if (req.route.path.includes('chairperson-approve')) {
          targetState = req.body.status || (req.body.approved !== false ? 'CHAIRPERSON_APPROVED' : 'REJECTED');
        }

        if (targetState) {
          const canTransition = FSMService.canTransition(event.status, targetState, userRole);
          if (!canTransition) {
            return res.status(403).json({
              message: `Cannot transition from ${event.status} to ${targetState} with role ${userRole}`,
              currentStatus: event.status,
              validTransitions: FSMService.getValidTransitions(event.status, userRole)
            });
          }
        }
      }
      return next();
    }

    const { eventId, status: targetState } = req.body;

    if (!eventId || !targetState) {
      return next();
    }

    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const canTransition = FSMService.canTransition(event.status, targetState, userRole);
    
    if (!canTransition) {
      return res.status(403).json({ 
        message: `Invalid state transition from ${event.status} to ${targetState} for role ${userRole}`,
        validTransitions: FSMService.getValidTransitions(event.status, userRole)
      });
    }

    req.fsmValidated = true;
    next();
  } catch (error) {
    res.status(500).json({ message: 'FSM validation error', error: error.message });
  }
};

const attachValidTransitions = async (req, res, next) => {
  try {
    if (req.method === 'GET' && req.user) {
      req.getValidTransitions = (currentState) => {
        return FSMService.getValidTransitions(currentState, req.user.role);
      };
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { validateStateTransition, attachValidTransitions };
