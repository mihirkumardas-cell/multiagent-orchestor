'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Cpu, Database, Brain, Zap, Copy, Check, Terminal } from 'lucide-react';

interface CodeSnippet {
  id: string;
  title: string;
  subtitle: string;
  filename: string;
  language: string;
  icon: any;
  badge: string;
  badgeColor: string;
  code: string;
  highlights: string[];
}

const snippets: CodeSnippet[] = [
  {
    id: 'esp32',
    title: 'ESP32 Hardware Firmware',
    subtitle: 'PIR Sensor Ingestion & Hardware Siren Drive',
    filename: 'esp32/firmware.ino',
    language: 'cpp',
    icon: Cpu,
    badge: 'Hardware Layer',
    badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
    highlights: [
      'GPIO 14: HC-SR501 PIR sensor input',
      'GPIO 27: 5V Active buzzer alarm output',
      'WiFi HTTP POST to FastAPI /event',
      'Embedded WebServer listening on /trigger-alarm',
    ],
    code: `// Sentrion — ESP32 Firmware (C++ / Arduino)
#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const int PIR_PIN    = 14;   // HC-SR501 Sensor OUT
const int BUZZER_PIN = 27;   // Active Alarm Buzzer
const int LED_PIN    = 2;    // Onboard Status LED
const char* BACKEND_HOST = "http://192.168.1.50:8000";

WebServer server(80);
bool alarmActive = false;

void sendMotionEvent() {
  String timestamp = getISO8601Timestamp();
  StaticJsonDocument<256> doc;
  doc["timestamp"] = timestamp;
  doc["sensor_id"] = "esp32_main";
  doc["location"]  = "main_entrance";
  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  http.begin(String(BACKEND_HOST) + "/event");
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(payload);
  http.end();
}

void handleTriggerAlarm() {
  alarmActive = true;
  digitalWrite(BUZZER_PIN, HIGH);
  server.send(200, "application/json", "{\\"alarm\\":true}");
}

void loop() {
  server.handleClient();
  int pirValue = digitalRead(PIR_PIN);
  if (pirValue == HIGH && (millis() - lastEventMs > 5000)) {
    lastEventMs = millis();
    sendMotionEvent();
  }
}`,
  },
  {
    id: 'orchestrator',
    title: 'LangGraph Orchestrator',
    subtitle: 'Autonomous Multi-Agent StateGraph Pipeline',
    filename: 'backend/agents/orchestrator.py',
    language: 'python',
    icon: Brain,
    badge: 'Multi-Agent AI',
    badgeColor: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    highlights: [
      'TypedDict shared state across all agent nodes',
      'Chroma vector retrieval for security policies',
      'GPT-4o Chain-of-Thought access verification',
      'Guard condition on state.violation == True',
    ],
    code: `\"\"\"Sentrion — LangGraph Multi-Agent Orchestrator\"\"\"
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, List

class PipelineState(TypedDict):
    event_time: str
    sensor_id: str
    location: str
    violation: bool
    retrieved_context: str
    reasoning: str
    agent_chain: List[str]

def retrieval_agent(state: PipelineState) -> PipelineState:
    context = query_policy_db(state["event_time"])
    return {**state, "retrieved_context": context, "agent_chain": state["agent_chain"] + ["retrieval_agent"]}

def decision_agent(state: PipelineState) -> PipelineState:
    prompt = f\"\"\"Evaluate access policy:
Timestamp: {state['event_time']} | Location: {state['location']}
Policy Context: {state['retrieved_context']}
Verdict format: VERDICT: VIOLATION or VERDICT: NO VIOLATION\"\"\"
    response = call_llm(prompt)
    is_violation = "VERDICT: VIOLATION" in response.upper()
    return {**state, "violation": is_violation, "reasoning": response, "agent_chain": state["agent_chain"] + ["decision_agent"]}

def alarm_agent(state: PipelineState) -> PipelineState:
    if state["violation"]:
        print("[AlarmAgent] VIOLATION confirmed! Escalating to hardware siren.")
    return {**state, "agent_chain": state["agent_chain"] + ["alarm_agent"]}

# Construct LangGraph Execution DAG
builder = StateGraph(PipelineState)
builder.add_node("retrieval_agent", retrieval_agent)
builder.add_node("decision_agent",  decision_agent)
builder.add_node("alarm_agent",     alarm_agent)

builder.add_edge(START, "retrieval_agent")
builder.add_edge("retrieval_agent", "decision_agent")
builder.add_edge("decision_agent",  "alarm_agent")
builder.add_edge("alarm_agent",     END)
pipeline = builder.compile()`,
  },
  {
    id: 'chroma',
    title: 'ChromaDB Policy Vector Store',
    subtitle: 'RAG Retrieval for Facility Access Rules',
    filename: 'backend/rag/chroma_setup.py',
    language: 'python',
    icon: Database,
    badge: 'Vector RAG',
    badgeColor: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    highlights: [
      'Standard business hours policy: 06:00 - 22:00 IST',
      'Scheduled maintenance exception records',
      'Chroma persistent vector database query',
      'Graceful fallback for air-gapped demo runs',
    ],
    code: `\"\"\"Sentrion — Chroma Vector Store Setup\"\"\"
import chromadb
from chromadb.utils import embedding_functions

POLICIES = [
    {"id": "pol_1", "text": "Policy §2.1: Allowed access window is 06:00–22:00 IST."},
    {"id": "pol_2", "text": "Policy §3.2: Any unrecognised after-hours entry must trigger the alarm."},
    {"id": "exc_1", "text": "Scheduled Exception 2026-08-05: Maintenance window pre-approved 22:30–03:30."}
]

client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(name="security_policies")

def seed_policies():
    collection.add(
        documents=[p["text"] for p in POLICIES],
        ids=[p["id"] for p in POLICIES]
    )

def query_policy(event_timestamp: str) -> str:
    query = f"Access control rules for entry at {event_timestamp}"
    results = collection.query(query_texts=[query], n_results=2)
    return " \\n".join(results["documents"][0])`,
  },
  {
    id: 'fastapi',
    title: 'FastAPI Orchestration Server',
    subtitle: 'Hardware Webhook Ingestion & Alarm Dispatch',
    filename: 'backend/main.py',
    language: 'python',
    icon: Zap,
    badge: 'API Engine',
    badgeColor: 'text-green-400 border-green-500/30 bg-green-500/10',
    highlights: [
      'POST /event receives motion interrupts from ESP32',
      'Executes LangGraph run_pipeline asynchronously',
      'Dispatches POST /trigger-alarm to ESP32 buzzer',
      'Appends immutable audit entries to SQLite DB',
    ],
    code: `\"\"\"Sentrion — FastAPI Orchestration Server\"\"\"
from fastapi import FastAPI, status
from agents.orchestrator import run_pipeline

app = FastAPI(title="Sentrion Core Orchestrator")

@app.post("/event", status_code=status.HTTP_200_OK)
async def receive_event(event: MotionEvent):
    ts = datetime.fromisoformat(event.timestamp)
    
    # 1. Fast path: within permitted hours (06:00 - 22:00)?
    if not is_after_hours(ts):
        return {"status": "ok", "message": "Within permitted hours. Cleared."}
        
    # 2. After-hours: Execute Multi-Agent Graph
    decision = await run_pipeline(
        event_time=ts.isoformat(),
        sensor_id=event.sensor_id,
        location=event.location
    )
    
    # 3. Guard condition: Fire hardware siren & buzzer
    alarm_fired = False
    if decision.get("violation"):
        _state["alarm_active"] = True
        alarm_fired = signal_esp32_alarm()
        
    # 4. Record audit log
    log_incident(decision, alarm_fired)
    return {"status": "processed", "violation": decision["violation"], "alarm": alarm_fired}`,
  },
];

export default function CodeSnippetsSection() {
  const [activeTab, setActiveTab] = useState(snippets[0].id);
  const [copied, setCopied] = useState(false);

  const activeSnippet = snippets.find((s) => s.id === activeTab) || snippets[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="code" className="relative py-24 overflow-hidden bg-navy-950">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-cyan-500/50" />
            <span className="text-xs font-semibold tracking-widest text-cyan-400 uppercase">
              Production Source Code
            </span>
            <div className="h-px w-12 bg-cyan-500/50" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            System <span className="text-gradient-blue">Codebase</span>
          </h2>
          <p className="text-white/40 text-base max-w-2xl mx-auto">
            Inspect the exact implementation across all 4 tiers: Embedded ESP32 C++ firmware,
            LangGraph agent state graph, ChromaDB vector store, and FastAPI backend.
          </p>
        </motion.div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {snippets.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === activeTab;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-500/10'
                    : 'glass text-white/50 border-white/5 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-cyan-400' : 'text-white/40'} />
                <span>{s.title}</span>
              </button>
            );
          })}
        </div>

        {/* Code Display Panel */}
        <div className="glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4 bg-navy-900/60">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              </div>
              <Terminal size={15} className="text-white/40" />
              <code className="text-xs font-mono text-cyan-300 font-semibold">{activeSnippet.filename}</code>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${activeSnippet.badgeColor}`}>
                {activeSnippet.badge}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/20"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Highlights bar */}
          <div className="px-6 py-3 bg-white/2 border-b border-white/5 flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Key Architecture:</span>
            {activeSnippet.highlights.map((h, i) => (
              <span key={i} className="text-xs text-white/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                {h}
              </span>
            ))}
          </div>

          {/* Code Body */}
          <div className="p-6 bg-[#0a0f1d] overflow-x-auto max-h-[520px]">
            <pre className="font-mono text-xs md:text-sm text-slate-200 leading-relaxed">
              <code>{activeSnippet.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
