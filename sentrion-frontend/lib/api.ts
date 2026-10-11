import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MotionEvent {
  timestamp: string;        // ISO-8601
  sensor_id?: string;
  location?: string;
}

export interface SystemStatus {
  sensor_state: 'active' | 'idle' | 'triggered';
  system_armed: boolean;
  last_event: string | null;
  alarm_active: boolean;
  uptime_seconds: number;
}

export interface AgentDecision {
  event_time: string;
  violation: boolean;
  reasoning: string;
  retrieved_context: string;
  agent_chain: string[];
  timestamp: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  event_time: string;
  violation: boolean;
  reasoning: string;
  alarm_triggered: boolean;
}

export interface AlarmTrigger {
  alarm_active: boolean;
  message: string;
}

// ─── API Calls ───────────────────────────────────────────────────────────────

/** POST /event — send a motion detection event */
export async function postMotionEvent(event: MotionEvent): Promise<{ status: string; message: string }> {
  const res = await api.post('/event', event);
  return res.data;
}

/** GET /status — current system status */
export async function getSystemStatus(): Promise<SystemStatus> {
  const res = await api.get('/status');
  return res.data;
}

/** GET /decision — most recent agent decision */
export async function getLastDecision(): Promise<AgentDecision | null> {
  const res = await api.get('/decision');
  return res.data;
}

/** GET /incidents — incident log */
export async function getIncidents(): Promise<Incident[]> {
  const res = await api.get('/incidents');
  return res.data;
}

/** POST /trigger-alarm — manually trigger alarm */
export async function triggerAlarm(): Promise<AlarmTrigger> {
  const res = await api.post('/trigger-alarm');
  return res.data;
}

/** POST /silence-alarm — silence active alarm */
export async function silenceAlarm(): Promise<{ status: string }> {
  const res = await api.post('/silence-alarm');
  return res.data;
}

/** GET /health — backend health check */
export async function healthCheck(): Promise<{ status: string }> {
  const res = await api.get('/health');
  return res.data;
}

export default api;
