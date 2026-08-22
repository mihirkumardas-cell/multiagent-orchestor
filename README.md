# Sentrion — Intelligent Late-Entry Security Alarm System

> **"The Guardian That Never Sleeps."**
> An AI-powered, IoT-integrated security system that detects after-hours intrusions, reasons about access policies using a multi-agent LLM pipeline, and autonomously triggers physical alarms.

---

## 🏛️ Architecture Overview

```
PIR Sensor
    │
    ▼
ESP32 (WiFi)
    │  POST /event  { timestamp, sensor_id, location }
    ▼
FastAPI Backend  ──────────────────────────────────────────────
    │                                                          │
    │  Time-window check                                       │
    │  (before 10 PM → ignore)                                 │
    │  (after 10 PM → pipeline)                               │
    ▼                                                          │
LangGraph Orchestrator                                         │
    │                                                          │
    ├─► Retrieval Agent ──── Chroma/FAISS Vector DB            │
    │       (policies, exceptions)                             │
    │                                                          │
    ├─► Decision Agent ───── LLM (GPT-4o / rule-based)        │
    │       (violation? reasoning?)                            │
    │                                                          │
    └─► Alarm Agent                                            │
            │                                                  │
            ├─► POST /trigger-alarm → ESP32 buzzer             │
            └─► SQLite incident log                            │
                                                               │
Next.js Dashboard ◄────────────────────────────────────────────
    (live status, decisions, incident log)
```

---

## 🗂️ Project Structure

```
mul.agent orchestor/
├── sentrion-frontend/          # Next.js 14 + Tailwind + Three.js frontend
│   ├── app/
│   │   ├── layout.tsx          # Root layout + metadata
│   │   ├── page.tsx            # Landing page (all sections)
│   │   └── globals.css         # Design system CSS
│   ├── components/
│   │   ├── Logo.tsx            # Animated SVG eye-in-hexagon logo
│   │   ├── Navbar.tsx          # Glassmorphism sticky navbar
│   │   ├── Footer.tsx          # Footer with attribution
│   │   ├── RadarCanvas.tsx     # Three.js radar sweep (Retrieval Agent)
│   │   ├── NeuralCanvas.tsx    # Three.js neural network (Decision Agent)
│   │   └── AlarmCanvas.tsx     # Three.js pulsing rings (Alarm Agent)
│   ├── sections/
│   │   ├── HeroSection.tsx     # Main hero + pipeline visualization
│   │   ├── RetrievalAgentSection.tsx
│   │   ├── DecisionAgentSection.tsx
│   │   ├── AlarmTriggerSection.tsx
│   │   └── DashboardSection.tsx  # Live status + incident log
│   ├── lib/
│   │   ├── api.ts              # Typed FastAPI client (axios)
│   │   └── utils.ts            # cn(), formatTimestamp(), timeAgo()
│   ├── public/
│   │   └── favicon.svg
│   ├── .env.local              # NEXT_PUBLIC_API_URL
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── backend/                    # FastAPI + LangGraph backend
│   ├── main.py                 # API routes, time-check, alarm logic
│   ├── models.py               # Pydantic schemas
│   ├── agents/
│   │   └── orchestrator.py     # LangGraph graph (3 agent nodes)
│   ├── rag/
│   │   └── chroma_setup.py     # Chroma vector DB + policy seeding
│   ├── data/
│   │   ├── incidents.db        # SQLite (auto-created)
│   │   └── chroma_db/          # Chroma persist dir (auto-created)
│   ├── .env                    # Backend environment variables
│   └── requirements.txt
│
└── esp32/
    └── firmware.ino            # Arduino sketch for ESP32
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion, GSAP |
| 3D Animations | Three.js, @react-three/fiber, @react-three/drei |
| Backend | FastAPI, Python 3.11+, Uvicorn |
| Agent Orchestration | LangGraph, LangChain |
| LLM | OpenAI GPT-4o-mini (or rule-based fallback) |
| Vector DB | ChromaDB (or FAISS) |
| Embeddings | OpenAI text-embedding-3-small (or SentenceTransformer) |
| Incident DB | SQLite |
| Hardware | ESP32 DevKit, HC-SR501 PIR sensor, Active Buzzer |

---

## ⚡ Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Arduino IDE with ESP32 board package
- (Optional) OpenAI API key for LLM reasoning

---

### 1. Frontend Setup

```bash
cd sentrion-frontend

# Install dependencies
npm install

# Copy and edit environment variables
cp .env.local .env.local.example
# Edit .env.local → set NEXT_PUBLIC_API_URL to your backend URL

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env .env.example
# Edit .env → add your OPENAI_API_KEY, adjust time window and ESP32 IP

# Seed the vector database (first run only)
python -m rag.chroma_setup

# Start the backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at [http://localhost:8000](http://localhost:8000).  
Swagger docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. ESP32 Firmware

1. Open `esp32/firmware.ino` in Arduino IDE.
2. Install required libraries via Library Manager:
   - `ArduinoJson` (Benoit Blanchon)
3. Set your credentials at the top of the file:
   ```cpp
   const char* WIFI_SSID     = "YOUR_WIFI_SSID";
   const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
   const char* BACKEND_HOST  = "http://192.168.1.50:8000";
   ```
4. **Wiring:**
   | Component | GPIO |
   |---|---|
   | PIR HC-SR501 OUT | GPIO 14 |
   | Buzzer (+) | GPIO 27 |
   | Buzzer (−) | GND |
   | PIR VCC | 5V |
   | PIR GND | GND |

5. Upload at 115200 baud and open Serial Monitor.

---

## 🔧 Environment Variables

### Frontend (`sentrion-frontend/.env.local`)

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI backend base URL |

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | *(required for LLM)* | OpenAI key for reasoning |
| `ALLOWED_HOUR_START` | `6` | Start of allowed entry window (24h) |
| `ALLOWED_HOUR_END` | `22` | End of allowed entry window (24h) |
| `ESP32_ALARM_URL` | `http://192.168.1.100/trigger-alarm` | ESP32 alarm endpoint |

---

## 📡 API Endpoints

### FastAPI Backend

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Backend health check |
| `POST` | `/event` | Receive ESP32 motion event |
| `GET` | `/status` | Current system + sensor status |
| `GET` | `/decision` | Last agent decision |
| `GET` | `/incidents` | Incident log (last 50) |
| `POST` | `/trigger-alarm` | Manually trigger alarm |
| `POST` | `/silence-alarm` | Silence active alarm |

### ESP32 Endpoints (called by backend)

| Method | Path | Description |
|---|---|---|
| `POST` | `/trigger-alarm` | Activate buzzer |
| `POST` | `/silence-alarm` | Silence buzzer |
| `GET` | `/status` | Sensor status |

---

## 🧪 Testing Guide

### Layer 1 — Hardware Alone
```bash
# Check PIR + ESP32 via Serial Monitor (Arduino IDE → 115200 baud)
# On motion: should print "[EVENT] Motion detected at: 2026-..."
# Use webhook.site as BACKEND_HOST for quick HTTP capture
```

### Layer 2 — Backend Endpoint Alone
```bash
# Health check
curl http://localhost:8000/health

# Fake motion event (within hours — should do nothing)
curl -X POST http://localhost:8000/event \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2026-08-02T15:00:00+05:30","sensor_id":"test","location":"main_entrance"}'

# Fake after-hours event (should trigger pipeline)
curl -X POST http://localhost:8000/event \
  -H "Content-Type: application/json" \
  -d '{"timestamp":"2026-08-02T23:47:00+05:30","sensor_id":"test","location":"main_entrance"}'
```

### Layer 3 — Time-Check Logic
```bash
# Simulate morning (no action expected)
curl -X POST http://localhost:8000/event \
  -d '{"timestamp":"2026-08-02T09:30:00+05:30"}' \
  -H "Content-Type: application/json"

# Simulate midnight (violation expected)
curl -X POST http://localhost:8000/event \
  -d '{"timestamp":"2026-08-02T00:15:00+05:30"}' \
  -H "Content-Type: application/json"
```

### Layer 4 — RAG Retrieval
```bash
cd backend
python -c "
from rag.chroma_setup import query_policy
print(query_policy('2026-08-02T23:00:00+05:30'))
"
```

### Layer 5 — Full Agent Chain (no hardware)
```bash
cd backend
python -c "
import asyncio
from agents.orchestrator import run_pipeline

result = asyncio.run(run_pipeline(
    event_time='2026-08-02T23:47:00+05:30',
    sensor_id='test',
    location='main_entrance'
))
print(result)
"
```

### Layer 6 — Full End-to-End
- Power on ESP32 with real PIR sensor
- Ensure backend is running
- Walk in front of sensor after 22:00
- Watch Serial Monitor → backend log → dashboard update

---

## 🎨 Frontend Details

The Sentrion frontend is a premium, cinematic landing page featuring:

- **Font**: Apple SF Pro Display / Inter (system-ui fallback) — same stack Apple uses
- **Logo**: Geometric eye-in-hexagon SVG with navy → electric-blue gradient + glow filter
- **3D Animations**: Self-contained Three.js scenes via @react-three/fiber
  - Retrieval Agent: Rotating radar sweep with blip dots
  - Decision Agent: Live neural node graph with animated connections
  - Alarm Agent: Pulsing concentric alert rings
- **Scroll Experience**: GSAP ScrollTrigger with parallax, fade-up animations, active nav highlighting
- **Glassmorphism**: `backdrop-filter: blur(20px)` cards throughout
- **Dashboard**: Real-time polling every 5s with demo fallback data when backend is offline
- **Responsive**: Full mobile ↔ desktop support

---

## 🔒 Security Considerations

- Restrict CORS `allow_origins` in production to your frontend domain
- Store `OPENAI_API_KEY` only in `.env` (never commit)
- Use HTTPS between ESP32 and backend in production
- Rate-limit the `/event` endpoint in high-traffic deployments

---

## 📄 License

MIT © 2026 Sentrion

---

*Built with ♥️ by Mihir*
