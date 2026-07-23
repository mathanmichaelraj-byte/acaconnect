const { FSMService } = require('../services/fsm.service');

const validateStateTransition = async (req, res, next) => {
  try {
    
    if (req.route.path.includes('-approve')) {
      return next();
    }

    const { eventId, status: targetState } = req.body;
    const userRole = req.user.role;

    if (!eventId || !targetState) {
      return next();
    }

    const Event = require('../models/Events');
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