# AI-Powered Adaptive Smart Learning Station

An enterprise-grade, full-stack personalized EdTech station and digital platform that continuously understands each student's competency level, isolates strengths and conceptual gaps, dynamically updates a Bayesian Knowledge Profile, and adapts the student's next learning activity through Computerized Adaptive Testing (CAT) and an AI Tutor powered by Gemini 3.8.

---

## 🌟 The Core Closed-Loop Learning Cycle

```
LOGIN
  ↓
SELECT EDUCATION LEVEL & STREAM
  ↓
SELECT SUBJECT & TOPIC
  ↓
ADAPTIVE ASSESSMENT (CAT)
  ↓
ANALYSE PERFORMANCE & TIME
  ↓
IDENTIFY WEAK TOPICS (<60% Mastery)
  ↓
UPDATE BAYESIAN KNOWLEDGE PROFILE
  ↓
RECOMMEND PERSONALIZED CONTENT
  ↓
AI TUTOR (Gemini 3.8 Flash Contextualized)
  ↓
PRACTICE & WORKED FORMULAS
  ↓
REASSESS & VALIDATE MASTERY
  ↓
PERSONALIZED NEXT ACTIVITY
```

Every student interaction is persisted in the database and actively shapes future recommendations.

---

## 🚀 Key Features

1. **Computerized Adaptive Testing (CAT)**
   - Evaluates response accuracy in real-time.
   - Streak of correct answers elevates question difficulty: **Easy → Medium → Hard**.
   - Incorrect answers trigger foundational checks: **Hard → Medium → Easy**.
   - Calculates weighted Item Response mastery scores and logs attempts.

2. **Bayesian Knowledge Profiling**
   - Continuously tracks competency nodes across:
     - **MASTERED** (≥80%)
     - **GOOD** (60-79%)
     - **NEEDS PRACTICE** (40-59%)
     - **NEEDS ATTENTION** (<40%)
   - Stores historical date-stamped progress to visualize improvement over time.

3. **Contextual AI Tutor (Gemini 3.8 Flash)**
   - Secure server-side `@google/genai` integration with zero browser API key exposure.
   - Automatically injects the student's grade level, topic mastery, and known weaknesses into the pedagogical prompt.
   - Step-by-step formula derivations and interactive checking questions.
   - Resilient rule-based educational fallback ensures zero downtime even without an external API key.

4. **Multi-Role Portals & RBAC**
   - **Student Dashboard**: Streak tracker, mastery rings, continue learning banner, weak topic remediation, and recent activities.
   - **Teacher Dashboard**: Aggregate class heatmaps, student roster, and Question Bank CRUD authoring.
   - **Parent Dashboard**: Real-time alerts (e.g., *"Alex scored 45% on Trigonometry"*), learning habit streak, and student linking code authorization.
   - **Admin Console**: User account management, system telemetry, and 1-click database seed reset.

5. **Raspberry Pi 5 Station Digital Twin**
   - Live hardware status simulator reflecting:
     - Raspberry Pi 5 Model B (8GB RAM, Quad-Core BCM2712)
     - 10.1" Multi-Touchscreen
     - Sony IMX708 Camera module (MTCNN FaceNet biometric prototype)
     - Microphone Array & Dual Speakers
     - PIR Motion Sensor & 0.96" I2C OLED display
     - RGB Status LED & Haptic Buzzer
   - Real-time WebSocket hardware pulse broadcasting CPU temperatures and utilization.

6. **Offline Mode & Resilient Sync**
   - Toggleable offline mode simulating low-connectivity classroom pods.
   - Local queuing of completed assessments and seamless sync with `/api/offline/sync`.

7. **Student Awareness & Wellbeing**
   - Environmental stewardship (E-waste, Circular tech, Carbon reduction)
   - Cyber safety (Phishing defense, Credential hygiene)
   - Health and ergonomics (The 20-20-20 visual rest rule)
   - Social responsibility & algorithmic literacy

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, WebSocket (`ws`), JWT Authentication, Bcrypt.js.
- **Database**: MongoDB Atlas client integration with a resilient, persistent embedded JSON database fallback (`./data/db.json`).
- **AI Engine**: `@google/genai` with `gemini-3.8-flash` and structured pedagogical system instructions.

---

## 🔑 Demo Accounts

Use any of these pre-seeded accounts or register a new one:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@example.com` | `password123` | Alex Rivera (Grade 10 STEM, Code: `STU-ALEX-9021`) |
| **Teacher** | `teacher@example.com` | `password123` | Dr. Evelyn Foster (Apex STEM Academy) |
| **Parent** | `parent@example.com` | `password123` | Marcus Rivera (Linked to Alex Rivera) |
| **Admin** | `admin@example.com` | `password123` | System Administrator |

*Tip: You can also use the 1-click demo buttons on the landing page or sign-in modal for immediate access.*

---

## ⚙️ Environment Variables

Defined in `.env.example`:

```env
# Gemini API Key (Server-side only)
GEMINI_API_KEY="your-gemini-api-key"

# JWT Signing Secret
JWT_SECRET="smart-station-super-secure-jwt-key-2026"

# Optional MongoDB Atlas Connection String
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart_station?retryWrites=true&w=majority"

# Port (defaults to 3000)
PORT=3000
```

---

## 🏃 Running the Application

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack development server
npm run dev

# 3. Build for production
npm run build

# 4. Start production server
npm start
```

---

## 📡 REST API Highlights

- `POST /api/auth/login` - Authenticate & obtain JWT
- `POST /api/auth/register` - Create student, teacher, or parent account
- `GET /api/students/dashboard` - Get mastery metrics & recommendations
- `POST /api/assessments/start` - Initialize adaptive assessment
- `POST /api/assessments/submit` - Process CAT submission, update profile & trigger recommendations
- `POST /api/ai/tutor` - Ask AI Tutor with contextual student mastery profile
- `POST /api/ai/explain` - Formula breakdown and derivation
- `GET /api/hardware/status` - Live Raspberry Pi 5 telemetry
- `POST /api/offline/sync` - Synchronize offline queued learning attempts
