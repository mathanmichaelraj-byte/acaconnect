exports.EVENT_STATUS = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED", 
  UNDER_REVIEW: "UNDER_REVIEW",
  TREASURER_APPROVED: "TREASURER_APPROVED",
  GENSEC_APPROVED: "GENSEC_APPROVED",
  CHAIRPERSON_APPROVED: "CHAIRPERSON_APPROVED",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED"
};

// Legacy status mapping for backward compatibility
exports.LEGACY_STATUS_MAP = {
  CREATED: "DRAFT",
  PENDING_TREASURER: "UNDER_REVIEW",
  PENDING_GEN_SEC: "TREASURER_APPROVED",
  GEN_SEC_APPROVED: "GENSEC_APPROVED",
  PENDING_CHAIRPERSON: "GENSEC_APPROVED"
};

exports.EVENT_TYPES = [
  "Hackathon",
  "Technical Workshop",
  "Quiz Competition",
  "Cultural Event",
  "Sports Event",
  "Seminar",
  "Conference",
  "Other"
];

// FSM workflow rules: which roles can transition from which states
exports.WORKFLOW_RULES = {
  DRAFT: {
    allowedRoles: ["EVENT_TEAM", "ADMIN"],
    nextStates: ["SUBMITTED", "REJECTED"]
  },
  SUBMITTED: {
    allowedRoles: ["TREASURER", "ADMIN"],
    nextStates: ["UNDER_REVIEW", "REJECTED"]
  },
  UNDER_REVIEW: {
    allowedRoles: ["TREASURER", "ADMIN"],
    nextStates: ["TREASURER_APPROVED", "REJECTED"]
  },
  TREASURER_APPROVED: {
    allowedRoles: ["GENERAL_SECRETARY", "ADMIN"],
    nextStates: ["GENSEC_APPROVED", "REJECTED"]
  },
  GENSEC_APPROVED: {
    allowedRoles: ["CHAIRPERSON", "ADMIN"],
    nextStates: ["CHAIRPERSON_APPROVED", "REJECTED"]
  },
  CHAIRPERSON_APPROVED: {
    allowedRoles: ["ADMIN"],
    nextStates: ["PUBLISHED"]
  },
  PUBLISHED: {
    allowedRoles: ["CHAIRPERSON", "ADMIN"],
    nextStates: ["CANCELLED"]
  },
  REJECTED: {
    allowedRoles: ["ADMIN"],
    nextStates: ["DRAFT"]
  },
  CANCELLED: {
    allowedRoles: ["ADMIN"],
    nextStates: ["DRAFT"]
  }
};
