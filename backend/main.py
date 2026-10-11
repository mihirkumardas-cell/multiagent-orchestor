"""
Sentrion — FastAPI Backend
Receives ESP32 motion events, runs LangGraph orchestration, and exposes dashboard endpoints.
"""
from __future__ import annotations

import os
import uuid
import time
import json
import sqlite3
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from agents.orchestrator import run_pipeline
from models import (
    MotionEvent, SystemStatus, AgentDecision,
    Incident, AlarmTriggerResponse,
)

load_dotenv()

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Sentrion API",
    description="Late-entry security alarm system backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory State ──────────────────────────────────────────────────────────

_state: dict = {
    "sensor_state": "idle",       # "active" | "idle" | "triggered"
    "system_armed": True,
    "last_event": None,
    "alarm_active": False,
    "boot_time": time.time(),
    "last_decision": None,
}

# ─── SQLite Incident DB ───────────────────────────────────────────────────────

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "incidents.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def init_db():
    con = sqlite3.connect(DB_PATH)
    con.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            event_time TEXT NOT NULL,
            violation INTEGER NOT NULL,
            reasoning TEXT,
            alarm_triggered INTEGER NOT NULL DEFAULT 0
        )
    """)
    con.commit()
    con.close()

init_db()

def log_incident(decision: dict, alarm_triggered: bool):
    con = sqlite3.connect(DB_PATH)
    con.execute(
        "INSERT INTO incidents VALUES (?,?,?,?,?,?)",
        (
            str(uuid.uuid4()),
            datetime.now(timezone.utc).isoformat(),
            decision["event_time"],
            int(decision["violation"]),
            decision["reasoning"],
            int(alarm_triggered),
        ),
    )
    con.commit()
    con.close()

def fetch_incidents(limit: int = 50) -> list[dict]:
    con = sqlite3.connect(DB_PATH)
    rows = con.execute(
        "SELECT id, timestamp, event_time, violation, reasoning, alarm_triggered "
        "FROM incidents ORDER BY timestamp DESC LIMIT ?",
        (limit,),
    ).fetchall()
    con.close()
    return [
        {
            "id": r[0], "timestamp": r[1], "event_time": r[2],
            "violation": bool(r[3]), "reasoning": r[4], "alarm_triggered": bool(r[5]),
        }
        for r in rows
    ]

# ─── ALLOWED HOURS ───────────────────────────────────────────────────────────

ALLOWED_HOUR_START = int(os.getenv("ALLOWED_HOUR_START", "6"))
ALLOWED_HOUR_END   = int(os.getenv("ALLOWED_HOUR_END",   "22"))   # 22:00 = 10 PM

def is_after_hours(ts: datetime) -> bool:
    """Return True if event falls outside the allowed window."""
    local_hour = ts.hour
    return not (ALLOWED_HOUR_START <= local_hour < ALLOWED_HOUR_END)

# ─── ESP32 Alarm Endpoint ─────────────────────────────────────────────────────

ESP32_ALARM_URL = os.getenv("ESP32_ALARM_URL", "http://192.168.1.100/trigger-alarm")

def signal_esp32_alarm() -> bool:
    """Send POST to ESP32 /trigger-alarm endpoint."""
    try:
        import requests
        resp = requests.post(ESP32_ALARM_URL, timeout=3)
        return resp.status_code == 200
    except Exception as e:
        print(f"[WARN] Could not reach ESP32: {e}")
        return False

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/event", status_code=status.HTTP_200_OK)
async def receive_event(event: MotionEvent):
    """
    Called by ESP32 on motion detection.
    Parses timestamp, checks allowed window, and runs the agent pipeline if after-hours.
    """
    ts = event.timestamp if isinstance(event.timestamp, datetime) else datetime.fromisoformat(event.timestamp)

    _state["sensor_state"] = "triggered"
    _state["last_event"] = ts.isoformat()

    if not is_after_hours(ts):
        _state["sensor_state"] = "active"
        return {"status": "ok", "message": "Within allowed hours. No action taken."}

    # ── After-hours: run agent pipeline ───────────────────────────────────────
    pipeline_result = await run_pipeline(
        event_time=ts.isoformat(),
        sensor_id=event.sensor_id or "esp32_main",
        location=event.location or "main_entrance",
    )

    _state["last_decision"] = pipeline_result
    alarm_triggered = False

    if pipeline_result.get("violation"):
        _state["alarm_active"] = True
        alarm_triggered = signal_esp32_alarm()

    log_incident(pipeline_result, alarm_triggered)
    _state["sensor_state"] = "active"

    return {
        "status": "processed",
        "violation": pipeline_result.get("violation"),
        "alarm_triggered": alarm_triggered,
        "reasoning": pipeline_result.get("reasoning"),
    }


@app.get("/status", response_model=SystemStatus)
def get_status():
    return SystemStatus(
        sensor_state=_state["sensor_state"],
        system_armed=_state["system_armed"],
        last_event=_state["last_event"],
        alarm_active=_state["alarm_active"],
        uptime_seconds=int(time.time() - _state["boot_time"]),
    )


@app.get("/decision")
def get_decision():
    d = _state.get("last_decision")
    if not d:
        return None
    return d


@app.get("/incidents", response_model=List[Incident])
def get_incidents():
    return fetch_incidents()


@app.post("/trigger-alarm", response_model=AlarmTriggerResponse)
def trigger_alarm_manually():
    """Manually trigger alarm (for testing / dashboard button)."""
    _state["alarm_active"] = True
    success = signal_esp32_alarm()
    return AlarmTriggerResponse(
        alarm_active=True,
        message="Alarm triggered" + (" and ESP32 signaled" if success else " (ESP32 unreachable)"),
    )


@app.post("/silence-alarm")
def silence_alarm():
    _state["alarm_active"] = False
    return {"status": "silenced"}


# ─── Dev entrypoint ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
