# ACAConnect — NIRAL 2026 Event Management Platform

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)
![Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?logo=netlify&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

## About

ACAConnect is a full-stack event management platform built for **NIRAL 2026**, the annual technical symposium of the Department of Information Science and Technology (IST), College of Engineering Guindy (CEG), Anna University, Chennai.

It automates the complete event lifecycle — from proposal creation and multi-level approval to participant registration, payment processing, resource allocation, attendance tracking, and certificate generation — all powered by ML-driven recommendations and a RAG-based chatbot.

## Key Features

- **FSM-Based Event Workflow** — Multi-level approval pipeline (Event Team → Treasurer → Gen Sec → Chairperson)
- **Role-Based Dashboards** — 14 distinct roles with dedicated views and permissions
- **ML Event Recommendations** — Hybrid KNN + Collaborative Filtering trained on 10L+ dataset
- **Budget Prediction** — ML model estimates expense breakdown before event creation
- **RAG Chatbot** — AI assistant (Sentence Transformers + ChromaDB + LLM) for event queries
- **Payment Integration** — Razorpay for registration fees with verification workflow
- **Predicate-Based Routing** — Intelligent requirement distribution to departments
- **Scheduling & Conflict Detection** — Priority scoring and venue conflict resolution
- **Certificate Generation** — Auto-generated PDF certificates post-event
- **Real-time Notifications** — Role-based alerts on state transitions

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React — Netlify)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────────┐
│                   Backend (Express — Render)                      │
│  Auth │ Events │ FSM │ Budgets │ Registrations │ Notifications   │
└────┬─────────────────────┬──────────────────────────┬───────────┘
     │                     │                          │
     ▼                     ▼                          ▼
┌─────────┐    ┌───────────────────┐    ┌──────────────────────┐
│ MongoDB │    │ ML Service (Flask) │    │ Chatbot Service (Flask)│
│  Atlas  │    │ KNN + CF + Budget  │    │ RAG + ChromaDB + LLM  │
└─────────┘    └───────────────────┘    └──────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router 6, Axios |
| Backend | Node.js, Express, Mongoose, JWT |
| ML Service | Flask, scikit-learn, pandas, numpy |
| Chatbot | Flask, LangChain, ChromaDB, Sentence Transformers, Groq/Ollama |
| Database | MongoDB Atlas |
| Payments | Razorpay |
| Email | Nodemailer |
| Deployment | Netlify (frontend), Render (backend + services) |

## Project Structure

```
acaconnect/
├── frontend/          # React SPA (Netlify)
│   ├── src/
│   │   ├── api/           # Axios instance
│   │   ├── auth/          # Login, Signup, Forgot Password
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # Auth context provider
│   │   ├── dashboards/    # Role-specific dashboards (14 roles)
│   │   ├── pages/         # Route pages
│   │   └── utils/         # Role checks
│   └── public/
├── backend/           # Express API (Render)
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, FSM, Predicate, Role guards
│   │   ├── models/        # Mongoose schemas (22 models)
│   │   ├── routes/        # API route definitions
│   │   ├── services/      # FSM, Notifications, Scheduling, Analytics
│   │   └── utils/         # Constants, Logger
│   └── package.json
├── ml-service/        # ML Recommendation Engine (Render)
│   ├── model/             # KNN, CF, Budget models
│   ├── data/              # Training datasets
│   ├── app.py             # Flask API (port 5001)
│   └── requirements.txt
├── chatbot-service/   # RAG Chatbot (Render)
│   ├── data/              # Knowledge base, PDFs
│   ├── app.py             # Flask API (port 5002)
│   └── requirements.txt
└── reverse_engineering/   # Architecture & business docs
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.x
- MongoDB Atlas account
- Razorpay account (for payments)

### Environment Variables

Create `.env` files:

**Backend (.env)**
```env
PORT=5000
MONGODB_URI=<your_mongodb_atlas_uri>
JWT_SECRET=<your_jwt_secret>
RAZORPAY_KEY_ID=<your_razorpay_key>
RAZORPAY_KEY_SECRET=<your_razorpay_secret>
EMAIL_HOST=<smtp_host>
EMAIL_USER=<smtp_user>
EMAIL_PASS=<smtp_password>
ML_SERVICE_URL=http://localhost:5001
CHATBOT_SERVICE_URL=http://localhost:5002
```

**Chatbot Service (.env)**
```env
MONGODB_URI=<your_mongodb_atlas_uri>
GROQ_API_KEY=<your_groq_api_key>
```

### Installation & Running

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm start

# ML Service
cd ml-service
pip install -r requirements.txt
python app.py

# Chatbot Service
cd chatbot-service
pip install -r requirements.txt
python app.py
```

### Seeding Data

```bash
cd backend
npm run seed          # Seed roles
npm run seed-users    # Seed default users
npm run seed-event-types  # Seed event types
```

## User Roles

| Role | Access Level |
|---|---|
| Admin | Full system control |
| Event Team | Create & manage events |
| Treasurer | Budget review & financial analytics |
| General Secretary | Second-level approval |
| Chairperson | Final approval authority |
| Logistics | Procurement & expense management |
| Hospitality | Venue/room allocation |
| HR | Volunteer & judge allocation |
| Techops | Technical infra & attendance |
| Design | Design asset management |
| Marketing | Event promotion |
| Photography | Event photography |
| Alumni | Alumni engagement |
| Student/Participant | Browse, register, attend events |

## API Endpoints

| Prefix | Purpose |
|---|---|
| `POST /auth/login` | Staff authentication |
| `POST /participant-auth/signup` | Participant registration |
| `GET /events` | List events (filtered by role/status) |
| `POST /events` | Create new event |
| `PATCH /events/:id/status` | FSM state transition |
| `POST /registrations` | Register for event |
| `POST /ml/recommend-hybrid-cf` | Get ML recommendations |
| `POST /chatbot/chat` | Chatbot query |
| `GET /financial/analytics` | Financial dashboard data |
| `POST /certificates/generate` | Generate certificates |

## ML Models

### Event Recommendation (Hybrid)
- **KNN**: Pre-trained on 10L+ synthetic student-event interaction dataset
- **Collaborative Filtering**: Item-based CF using tag similarity matrix
- **Hybrid Score**: `0.6 × KNN + 0.4 × CF` (configurable)

### Budget Prediction
- **Model**: scikit-learn regressor
- **Input**: Event type, participants, duration, requirements flags
- **Output**: Predicted expense breakdown by category

## Documentation

Detailed documentation available in `reverse_engineering/`:
- [Business Logic](reverse_engineering/business-logic.md)
- [Architecture](reverse_engineering/architecture.md)
- [Tech Stack](reverse_engineering/tech-stack.md)

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Netlify | Deployed via Git push |
| Backend | Render | Auto-deploy from main branch |
| ML Service | Render | Auto-deploy from main branch |
| Chatbot | Render | Auto-deploy from main branch |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for NIRAL 2026 — Department of IST, CEG, Anna University
