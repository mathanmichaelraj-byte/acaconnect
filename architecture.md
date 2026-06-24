# System Architecture — ACAConnect

## System Overview

ACAConnect is a multi-service application with a React frontend, Node.js/Express backend, and two Python microservices for ML recommendations and chatbot functionality. All services communicate via REST APIs.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend (Netlify)"
        FE[React SPA<br/>React 18 + React Router]
    end

    subgraph "Backend (Render)"
        BE[Node.js/Express API<br/>Port 5000]
        DB[(MongoDB Atlas)]
        FS[File Storage<br/>uploads/]
    end

    subgraph "ML Service (Render)"
        ML[Flask API<br/>Port 5001]
        KNN[KNN Model<br/>10L dataset]
        CF[Collaborative Filtering]
        BM[Budget Predictor<br/>sklearn]
    end

    subgraph "Chatbot Service (Render)"
        CB[Flask API<br/>Port 5002]
        EMB[Sentence Transformers<br/>all-MiniLM-L6-v2]
        VDB[(ChromaDB<br/>Vector Store)]
        LLM[Groq/Ollama LLM]
    end

    subgraph "External Services"
        RZ[Razorpay<br/>Payments]
        NM[Nodemailer<br/>Email/SMTP]
    end

    FE -->|REST API| BE
    BE --> DB
    BE --> FS
    BE -->|/ml/*| ML
    BE -->|/chatbot/*| CB
    BE --> RZ
    BE --> NM
    CB --> DB
    CB --> VDB
    CB --> LLM
```

## Component Descriptions

### Frontend (React SPA)
- **Purpose**: User interface for all roles
- **Responsibilities**: Role-based dashboard routing, event browsing, registration, payment flows
- **Deployment**: Netlify (static build)
- **Key patterns**: Context-based auth, role-based component rendering

### Backend (Node.js/Express)
- **Purpose**: Core API server, business logic orchestration
- **Responsibilities**: Authentication, event CRUD, FSM workflow, requirement distribution, file uploads, notifications
- **Deployment**: Render
- **Database**: MongoDB (Mongoose ODM)
- **Key patterns**: MVC, FSM service, predicate-based routing, role middleware

### ML Service (Flask)
- **Purpose**: Event recommendation engine & budget prediction
- **Responsibilities**: KNN recommendations, collaborative filtering, hybrid scoring, budget estimation
- **Deployment**: Render
- **Key patterns**: Pre-trained model serving, cosine similarity scoring

### Chatbot Service (Flask)
- **Purpose**: RAG-based Q&A assistant for NIRAL
- **Responsibilities**: Intent detection, knowledge retrieval, LLM-powered response generation
- **Deployment**: Render
- **Key patterns**: RAG pipeline (retrieve → augment → generate), hybrid retrieval (JSON + PDF + DB)

## Data Flow

```mermaid
sequenceDiagram
    participant P as Participant
    participant FE as Frontend
    participant BE as Backend
    participant DB as MongoDB
    participant ML as ML Service
    participant RZ as Razorpay

    %% Event Recommendation Flow
    P->>FE: Browse Events
    FE->>BE: GET /events (published)
    BE->>DB: Query published events
    BE->>ML: POST /recommend-hybrid-cf (interests + events)
    ML-->>BE: Scored recommendations
    BE-->>FE: Events with scores
    FE-->>P: Personalized event list

    %% Registration + Payment Flow
    P->>FE: Register for paid event
    FE->>BE: POST /registrations
    BE->>RZ: Create payment order
    RZ-->>FE: Payment page
    P->>RZ: Complete payment
    RZ->>BE: Payment webhook/verification
    BE->>DB: Save registration (CONFIRMED)
    BE-->>FE: Registration success
```

## API Route Map

| Path | Service | Purpose |
|---|---|---|
| `/auth` | Backend | Staff login/auth (JWT) |
| `/participant-auth` | Backend | Participant signup/login |
| `/events` | Backend | Event CRUD + FSM transitions |
| `/registrations` | Backend | Participant event registration |
| `/budgets` | Backend | Budget management |
| `/notifications` | Backend | Role-based notifications |
| `/participant-notifications` | Backend | Participant notifications |
| `/admin` | Backend | Admin operations |
| `/ml` | Backend → ML | Proxy to ML service |
| `/chatbot` | Backend → Chatbot | Proxy to chatbot service |
| `/logistics` | Backend | Expense/procurement management |
| `/hospitality` | Backend | Venue allocation |
| `/hr` | Backend | Volunteer/judge allocation |
| `/techops` | Backend | Attendance management |
| `/certificates` | Backend | Certificate generation |
| `/financial` | Backend | Income/expense analytics |
| `/scheduling` | Backend | Event scheduling + conflicts |
| `/designs` | Backend | Design file uploads |
| `/photos` | Backend | Photo management |
| `/alumni` | Backend | Alumni features |
| `/onsite-registrations` | Backend | Walk-in registration |
| `/requirements` | Backend | Predicate-based requirement routing |
| `/stationery` | Backend | Stationery item management |
| `/technical` | Backend | Technical item management |
| `/refreshments` | Backend | Refreshment item management |

## Integration Points

- **Razorpay**: Payment gateway for event registration fees
- **MongoDB Atlas**: Primary data store (events, users, registrations, notifications)
- **ChromaDB**: Vector database for chatbot RAG retrieval
- **Groq/Ollama**: LLM provider for chatbot response generation
- **SMTP (Nodemailer)**: Email notifications

## Security

- JWT-based authentication (separate for staff and participants)
- Role middleware guards all protected routes
- FSM enforces state transition permissions per role
- CORS enabled for frontend origin
- File uploads via Multer with directory isolation
