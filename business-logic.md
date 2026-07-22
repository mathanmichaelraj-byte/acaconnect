# Business Logic — ACAConnect (NIRAL 2026)

## Business Overview

ACAConnect is a college event management platform for **NIRAL 2026**, a technical symposium organized by the Department of Information Science and Technology (IST), College of Engineering Guindy (CEG), Anna University, Chennai. It automates end-to-end event lifecycle management — from proposal to execution — across multiple organizational roles.

## Core Business Transactions

### 1. Event Lifecycle (FSM-Based)

Events follow a strict Finite State Machine workflow:

```
DRAFT → SUBMITTED → UNDER_REVIEW → TREASURER_APPROVED → GENSEC_APPROVED → CHAIRPERSON_APPROVED → PUBLISHED
```

- **DRAFT**: Event Team creates event with details (title, type, date, budget, requirements)
- **SUBMITTED**: Event Team submits for review
- **UNDER_REVIEW**: Enters approval pipeline
- **TREASURER_APPROVED**: Treasurer reviews budget/financials
- **GENSEC_APPROVED**: General Secretary approves
- **CHAIRPERSON_APPROVED**: Final authority approves
- **PUBLISHED**: Event goes live for participant registration
- **REJECTED**: Can happen at any approval stage; event returns to SUBMITTED for rework
- **CANCELLED**: Published events can be cancelled by Admin/Chairperson

### 2. Requirement Distribution (Predicate-Based Routing)

Once an event is PUBLISHED, requirements are distributed to departments:

| Department | Responsibility |
|---|---|
| **HR** | Volunteer & judge allocation |
| **Logistics** | Procurement (refreshments, stationery, technical items), expense billing with GST |
| **Hospitality** | Venue/room/lab allocation |
| **Techops** | Technical infrastructure & attendance tracking |

Each department: Acknowledges requirements → Fulfills allocation → Marks complete.

### 3. Participant Registration & Payment

- Participants sign up, select interests (tags), and register for events
- Events can be free or paid (registration fee via QR code / UPI payment with screenshot verification)
- Registration status: OPEN / CLOSED / PAUSED
- Onsite registration supported

### 4. Budget & Financial Management

- Event Team proposes budget during event creation
- Treasurer reviews and approves
- Logistics submits actual expenses with bill attachments and GST details
- Financial analytics: income (registration fees) vs expenses, budget variance tracking

### 5. Chatbot (RAG-Based)

- NIRAL Assistant answers queries about events, rules, registration, history
- Uses RAG pipeline: Sentence Transformers embeddings + ChromaDB vector store + Groq/Ollama LLM
- Data sources: JSON knowledge base + PDF documents + live MongoDB event data

### 6. Certificate Generation

- Auto-generated certificates for event participants post-event
- Uses PDF templates with dynamic fields (participant name, event, date)
- Bulk generation supported

### 7. Attendance Tracking

- Techops marks attendance for registered participants
- Attendance data feeds into certificate eligibility

### 8. Notifications

- Role-based notifications triggered by FSM transitions
- Participant notifications for registration confirmations, event updates
- Email notifications via Nodemailer

### 9. Scheduling & Venue Conflict Resolution

- Priority scoring for events
- Automatic venue suggestion with conflict detection
- Hospitality approval workflow for venue assignments

## Business Rules

- Only EVENT_TEAM can create/submit events
- Multi-level approval is mandatory (no stage can be skipped)
- Rejected events can be resubmitted by Event Team
- Registration fee and prize pool are optional per event
- Events are tagged with domains (16 categories) for interest-based filtering
- Expense submission requires GST number or a no-GST reason
- Volunteers and judges are allocated from a pre-seeded pool

## User Roles

| Role | Access |
|---|---|
| ADMIN | Full system access |
| EVENT_TEAM | Create & manage events |
| TREASURER | Budget review & financial oversight |
| GENERAL_SECRETARY | Second-level approval |
| CHAIRPERSON | Final approval authority |
| LOGISTICS | Procurement & expense management |
| HOSPITALITY | Venue allocation |
| HR | Volunteer & judge allocation |
| TECHOPS | Technical infra & attendance |
| DESIGN | Design file management |
| MARKETING | Event marketing |
| PHOTOGRAPHY | Event photography |
| ALUMNI | Alumni engagement |
| STUDENT/PARTICIPANT | Browse events, register, view certificates |
