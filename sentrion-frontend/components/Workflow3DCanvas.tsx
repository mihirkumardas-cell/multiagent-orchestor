'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Database, Brain, Bell, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const WORKFLOW_STAGES = [
  {
    id: 'esp32',
    number: '01',
    title: 'ESP32 Sensing',
    subtitle: 'Hardware Motion Ingestion',
    color: 'from-cyan-500 to-blue-500',
    borderColor: 'border-cyan-500/40',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    accentColor: '#06b6d4',
    icon: Wifi,
    desc: 'PIR motion sensor detects late-entry activity. Microcontroller fires POST /event with timestamp.',
    payload: {
      timestamp: '23:47:10 IST',
      sensor_id: 'esp32_gate_01',
      event: 'MOTION_DETECTED',
    },
  },
  {
    id: 'retrieval',
    number: '02',
    title: 'Retrieval Agent',
    subtitle: 'RAG Vector Search',
    color: 'from-blue-500 to-indigo-500',
    borderColor: 'border-blue-500/40',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    accentColor: '#3b82f6',
    icon: Database,
    desc: 'Queries ChromaDB for access rules, shift schedules, and maintenance passes for current time window.',
    payload: {
      vector_query: 'Allowed access window 23:47',
      docs_found: 3,
      policy: 'Standard hours: 06:00-22:00',
    },
  },
  {
    id: 'decision',
    number: '03',
    title: 'Decision Agent',
    subtitle: 'Chain-of-Thought Reasoning',
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    accentColor: '#a855f7',
    icon: Brain,
    desc: 'GPT-4o runs structured reasoning over event + retrieved context to produce a typed verdict.',
    payload: {
      after_hours: true,
      maintenance_pass: false,
      verdict: 'VIOLATION_CONFIRMED',
    },
  },
  {
    id: 'alarm',
    number: '04',
    title: 'Alarm Agent',
    subtitle: 'Hardware + System Action',
    color: 'from-red-500 to-rose-600',
    borderColor: 'border-red-500/40',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    accentColor: '#ef4444',
    icon: Bell,
    desc: 'Guard condition fires: Signals ESP32 buzzer, logs incident to SQLite, and sounds browser siren.',
    payload: {
      esp32_buzzer: 'ACTIVE',
      sqlite_logged: true,
      siren_sound: 'TRIGGERED (10s)',
    },
  },
];

export default function Workflow3DCanvas() {
  const [activeStep, setActiveStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Auto-cycle through workflow stages
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % WORKFLOW_STAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const current = WORKFLOW_STAGES[activeStep];

  return (
    <div className="relative w-full rounded-3xl p-6 md:p-8 bg-navy-950/80 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl">
      {/* Background 3D grid effect */}
      <div className="absolute inset-0 dot-grid opacity-20 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700 blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle at ${25 * activeStep + 12.5}% 40%, ${current.glowColor}, transparent 60%)`,
        }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-blue-400" />
            <span className="text-xs font-mono tracking-widest text-blue-400 uppercase">Interactive 3D Pipeline</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Multi-Agent Orchestration Flow
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoPlay(!autoPlay)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              autoPlay
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
            }`}
          >
            {autoPlay ? '⏸ Pause Auto-Flow' : '▶ Play Auto-Flow'}
          </button>
        </div>
      </div>

      {/* 3D Isometric Workflow Stage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const isActive = idx === activeStep;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              onClick={() => {
                setActiveStep(idx);
                setAutoPlay(false);
              }}
              className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                isActive
                  ? `bg-white/8 ${stage.borderColor} shadow-xl`
                  : 'bg-white/3 border-white/5 hover:border-white/20 hover:bg-white/5'
              }`}
              style={{
                transform: isActive ? 'translateY(-4px) scale(1.02)' : 'none',
                boxShadow: isActive ? `0 12px 30px ${stage.glowColor}` : 'none',
              }}
              whileHover={{ y: -2 }}
            >
              {/* Step indicator tag */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isActive ? `${stage.borderColor} text-white` : 'border-white/10 text-white/40'
                  }`}
                >
                  STEP {stage.number}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="active-dot"
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: stage.accentColor, boxShadow: `0 0 10px ${stage.accentColor}` }}
                  />
                )}
              </div>

              {/* Icon with 3D glow */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 border transition-all ${
                  isActive ? `${stage.borderColor} bg-white/10` : 'border-white/10 bg-white/5'
                }`}
              >
                <Icon size={22} style={{ color: isActive ? stage.accentColor : 'rgba(255,255,255,0.5)' }} />
              </div>

              <h4 className="text-sm font-bold text-white mb-0.5">{stage.title}</h4>
              <p className="text-[11px] text-white/40 font-medium">{stage.subtitle}</p>

              {/* Laser Connector Arrow (between stages on desktop) */}
              {idx < WORKFLOW_STAGES.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      idx < activeStep ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-navy-900 border-white/10 text-white/20'
                    }`}
                  >
                    <ArrowRight size={10} />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Detail Inspector Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className={`relative z-10 rounded-2xl p-6 border ${current.borderColor} bg-white/4 backdrop-blur-md grid grid-cols-1 md:grid-cols-3 gap-6 items-center`}
        >
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: current.accentColor }} />
              <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: current.accentColor }}>
                Stage {current.number} Live Inspection
              </span>
            </div>
            <h4 className="text-lg font-bold text-white mb-2">{current.title} — {current.subtitle}</h4>
            <p className="text-xs text-white/60 leading-relaxed mb-4">{current.desc}</p>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/80">
                ⚡ Real-time Execution
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/80">
                🔒 Agent State Synchronized
              </span>
            </div>
          </div>

          {/* JSON Payload Inspector */}
          <div className="rounded-xl p-4 bg-navy-900/90 border border-white/10 font-mono text-xs">
            <div className="text-[10px] text-white/40 mb-2 uppercase tracking-widest border-b border-white/5 pb-1 flex justify-between">
              <span>State Payload</span>
              <span style={{ color: current.accentColor }}>JSON</span>
            </div>
            <pre className="text-white/80 overflow-x-auto whitespace-pre-wrap leading-relaxed text-[11px]">
              {JSON.stringify(current.payload, null, 2)}
            </pre>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
