# Sentrion Multi-Agent Workflow & Architecture Specification

```
                          SENTRION SYSTEM WORKFLOW
┌──────────────┐     POST      ┌──────────────────┐     RAG Search      ┌──────────────┐
│  ESP32 PIR   │ ────────────> │  Retrieval Agent │ ──────────────────> │   ChromaDB   │
│  Sensors     │  /event       │                  │ <────────────────── │ Vector Store │
└──────────────┘               └─────────┬────────┘    Context Chunks   └──────────────┘
                                         │
                                         ▼ (Enriched State)
┌──────────────┐     Trigger   ┌──────────────────┐     Structured      ┌──────────────┐
│ Alarm Buzzer │ <──────────── │   Alarm Agent    │ <────────────────── │Decision Agent│
│  + Alert SMS │   /trigger    │  (Guard Condition│   violation=True    │  (GPT-4o CoT)│
└──────────────┘               └──────────────────┘                     └──────────────┘
```

---

## 🔄 Multi-Agent Pipeline Stages

### 1. Motion Ingestion (Hardware Layer)
- **Source**: ESP32 microcontroller with PIR motion sensor / ultrasonic distance sensor.
- **Payload**:
  ```json
  {
    "timestamp": "2026-08-04T23:47:10.120Z",
    "sensor_id": "esp32_zone_north_gate",
    "location": "Main Server Room Entrance"
  }
  ```
- **Action**: Sends HTTP POST to `/event` endpoint on FastAPI orchestrator.

---

### 2. Retrieval Agent (`retrieval_agent`)
- **Objective**: Fetch access policies, allowed entry windows, and maintenance exceptions.
- **Process**:
  1. Computes vector embedding of current timestamp and location context.
  2. Queries ChromaDB vector store for top-`k` matching policy documents.
  3. Formats policy snippets (§2.1 hours, §3.4 exceptions, contractor passes).
- **State Output**:
  ```json
  {
    "retrieved_context": "Policy Doc §2.1: Allowed access window 06:00–22:00 IST. Exception Log: No maintenance scheduled for tonight."
  }
  ```

---

### 3. Decision Agent (`decision_agent`)
- **Objective**: Conduct chain-of-thought evaluation and determine if a violation occurred.
- **Model**: OpenAI GPT-4o with LangGraph structured output schema (`AgentDecision`).
- **Chain of Thought**:
  - *Check 1*: Is event timestamp within 06:00–22:00 window? **[NO — 23:47 IST]**
  - *Check 2*: Is there a scheduled maintenance exception? **[NO]**
  - *Check 3*: Is there a active digital override token? **[NO]**
  - *Verdict*: `violation = True`
- **State Output**:
  ```json
  {
    "violation": true,
    "reasoning": "Entry detected at 23:47 IST outside allowed window (06:00-22:00). No active maintenance pass or contractor override found.",
    "agent_chain": ["retrieval_agent", "decision_agent"]
  }
  ```

---

### 4. Alarm Trigger Agent (`alarm_agent`)
- **Guard Condition**: `if state.violation == True:`
- **Actions Executed Simultaneously**:
  1. **ESP32 Signal**: Sends HTTP POST `/trigger-alarm` to ESP32 to sound hardware buzzer.
  2. **Alert Dispatch**: Dispatches push/webhook alert notification to security dashboard & personnel.
  3. **SQLite Logging**: Writes immutable incident entry into SQLite database.
  4. **Frontend Siren**: Triggers Web Audio API 800Hz–1600Hz sweeping siren on live dashboard with 10s auto-reset.

---

## 🛠 Tech Stack Summary

| Component | Technology Used |
|---|---|
| **Orchestration** | LangGraph, LangChain |
| **LLM Engine** | OpenAI GPT-4o / CoT Structured Output |
| **Vector DB** | ChromaDB / FAISS Embeddings |
| **API Server** | FastAPI, Uvicorn, Pydantic v2 |
| **Hardware** | ESP32-WROOM-32, MicroPython, PIR Sensor |
| **Frontend UI** | Next.js 14, React 18, Framer Motion, Web Audio API, Canvas 3D |
