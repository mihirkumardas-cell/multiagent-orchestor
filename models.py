"""Pydantic models shared across the Sentrion backend."""
from __future__ import annotations

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class MotionEvent(BaseModel):
    timestamp: str           # ISO-8601 string from ESP32
    sensor_id: Optional[str] = "esp32_main"
    location: Optional[str] = "main_entrance"


class SystemStatus(BaseModel):
    sensor_state: str        # "active" | "idle" | "triggered"
    system_armed: bool
    last_event: Optional[str]
    alarm_active: bool
    uptime_seconds: int


class AgentDecision(BaseModel):
    event_time: str
    violation: bool
    reasoning: str
    retrieved_context: str
    agent_chain: List[str]
    timestamp: str


class Incident(BaseModel):
    id: str
    timestamp: str
    event_time: str
    violation: bool
    reasoning: Optional[str]
    alarm_triggered: bool


class AlarmTriggerResponse(BaseModel):
    alarm_active: bool
    message: str
