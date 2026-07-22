const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  participant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
    required: true
  },
  participant_name: {
    type: String,
    required: true
  },
  participant_email: {
    type: String,
    required: true
  },
  registration_fee: {
    type: Number,
    required: true,
    default: 0
  },
  payment_status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'VERIFICATION_PENDING', 'VERIFIED'],
    default: 'PENDING'
  },
  payment_method: {
    type: String,
    enum: ['FREE', 'MOCK_PAYMENT', 'UPI', 'CARD'],
    default: 'FREE'
  },
  payment_id: {
    type: String,
    default: null
  },
  payment_date: {
    type: Date,
    default: null
  },
  payment_screenshot: {
    type: String,
    default: null
  },
  verification_status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verification_date: {
    type: Date,
    default: null
  },
  verification_comments: {
    type: String,
    default: null
  },
  registration_date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model("Registration", registrationSchema);
