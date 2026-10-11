'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Shield, Bell, Clock, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Wifi, WifiOff, Database
} from 'lucide-react';
import {
  getSystemStatus, getLastDecision, getIncidents,
  SystemStatus, AgentDecision, Incident,
} from '@/lib/api';
import { formatTimestamp, timeAgo, cn } from '@/lib/utils';

// ─── Sensor Status Card ───────────────────────────────────────────────────────

function SensorCard({ status }: { status: SystemStatus | null }) {
  const state = status?.sensor_state ?? 'idle';
  const configs = {
    active: { color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', dot: 'status-online', label: 'Active — Monitoring' },
    idle: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', dot: 'status-idle', label: 'Idle — Standby' },
    triggered: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', dot: 'status-alert', label: 'TRIGGERED — Motion Detected' },
  } as const;
  const cfg = configs[state as keyof typeof configs] ?? configs.idle;

  return (
    <motion.div
      className={`glass rounded-2xl p-5 border ${cfg.bg}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold tracking-wider uppercase">
          <Activity size={12} />
          Sensor State
        </div>
        <span className={cfg.dot} />
      </div>
      <p className={`text-lg font-bold ${cfg.color}`}>{cfg.label}</p>
      <p className="text-xs text-white/30 mt-1">
        Last event: {status?.last_event ? timeAgo(status.last_event) : 'None'}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <div className={`flex items-center gap-1.5 text-xs ${status?.system_armed ? 'text-green-400' : 'text-white/30'}`}>
          <Shield size={12} />
          {status?.system_armed ? 'Armed' : 'Disarmed'}
        </div>
        <div className={`flex items-center gap-1.5 text-xs ${status?.alarm_active ? 'text-red-400' : 'text-white/30'}`}>
          <Bell size={12} />
          {status?.alarm_active ? 'Alarm ON' : 'Alarm OFF'}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Decision Card ────────────────────────────────────────────────────────────

function DecisionCard({ decision }: { decision: AgentDecision | null }) {
  if (!decision) {
    return (
      <div className="glass rounded-2xl p-5 border border-white/5 flex flex-col items-center justify-center gap-3 min-h-[160px]">
        <Database size={24} className="text-white/20" />
        <p className="text-sm text-white/25">No decision yet</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`glass rounded-2xl p-5 border ${
        decision.violation
          ? 'border-red-500/20 bg-red-500/5'
          : 'border-green-500/20 bg-green-500/5'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={decision.timestamp}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold tracking-wider uppercase">
          <Shield size={12} />
          Last Decision
        </div>
        {decision.violation ? (
          <XCircle size={16} className="text-red-400" />
        ) : (
          <CheckCircle size={16} className="text-green-400" />
        )}
      </div>

      <div className={`text-base font-bold mb-2 ${decision.violation ? 'text-red-400' : 'text-green-400'}`}>
        {decision.violation ? '🔴 Violation Confirmed' : '🟢 No Violation'}
      </div>

      <p className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-2">
        {decision.reasoning}
      </p>

      <div className="flex items-center gap-3 text-xs text-white/25">
        <Clock size={10} />
        {timeAgo(decision.timestamp)}
        <span>·</span>
        <span>Event at {new Date(decision.event_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </motion.div>
  );
}

// ─── Agent Chain Visualization ────────────────────────────────────────────────

function AgentChain({ chain }: { chain: string[] }) {
  const agentColors: Record<string, string> = {
    retrieval_agent: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    decision_agent: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    alarm_agent: 'text-red-400 border-red-500/30 bg-red-500/10',
    start: 'text-white/40 border-white/10 bg-white/5',
    end: 'text-green-400 border-green-500/30 bg-green-500/10',
  };

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <div className="flex items-center gap-2 mb-4 text-white/50 text-xs font-semibold tracking-wider uppercase">
        <Activity size={12} />
        Last Agent Chain Run
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {chain.length === 0 ? (
          <p className="text-xs text-white/20">No run yet</p>
        ) : (
          chain.map((agent, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs font-medium border',
                  agentColors[agent] ?? 'text-white/40 border-white/10 bg-white/5'
                )}
              >
                {agent.replace(/_/g, ' ')}
              </span>
              {i < chain.length - 1 && (
                <span className="text-white/20 text-xs">→</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Incident Log ─────────────────────────────────────────────────────────────

function IncidentLog({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold tracking-wider uppercase">
          <AlertTriangle size={12} />
          Incident Log
        </div>
        <span className="text-xs text-white/25">{incidents.length} records</span>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle size={28} className="text-white/15" />
            <p className="text-sm text-white/20">No incidents recorded</p>
          </div>
        ) : (
          <AnimatePresence>
            {incidents.map((incident, i) => (
              <motion.div
                key={incident.id}
                className={cn(
                  'px-5 py-3.5 border-b border-white/3 flex items-start gap-3 hover:bg-white/2 transition-colors',
                  i === 0 && 'bg-white/1'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Violation badge */}
                <div className="mt-0.5 flex-shrink-0">
                  {incident.violation ? (
                    <XCircle size={14} className="text-red-400" />
                  ) : (
                    <CheckCircle size={14} className="text-green-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        incident.violation ? 'text-red-400' : 'text-green-400'
                      }`}
                    >
                      {incident.violation ? 'VIOLATION' : 'CLEARED'}
                    </span>
                    <span className="text-xs text-white/25 flex-shrink-0">
                      {timeAgo(incident.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5 truncate">{incident.reasoning}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={9} className="text-white/20" />
                    <span className="text-[10px] text-white/20">
                      {formatTimestamp(incident.event_time)}
                    </span>
                    {incident.alarm_triggered && (
                      <span className="text-[10px] text-red-400/60 flex items-center gap-1">
                        <Bell size={9} /> Alarm fired
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Main Dashboard Section ───────────────────────────────────────────────────

export default function DashboardSection() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [decision, setDecision] = useState<AgentDecision | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  // Demo/fallback data when backend not reachable
  const DEMO_STATUS: SystemStatus = {
    sensor_state: 'active',
    system_armed: true,
    last_event: new Date(Date.now() - 120000).toISOString(),
    alarm_active: false,
    uptime_seconds: 3600,
  };

  const DEMO_DECISION: AgentDecision = {
    event_time: new Date(Date.now() - 120000).toISOString(),
    violation: false,
    reasoning: 'Entry detected at 15:47 IST which is within the allowed 06:00–22:00 window. No violation.',
    retrieved_context: 'Access policy §2.1: Standard hours 06:00–22:00.',
    agent_chain: ['retrieval_agent', 'decision_agent'],
    timestamp: new Date(Date.now() - 120000).toISOString(),
  };

  const DEMO_INCIDENTS: Incident[] = [
    {
      id: '3',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      event_time: new Date(Date.now() - 300000).toISOString(),
      violation: false,
      reasoning: 'Within allowed hours.',
      alarm_triggered: false,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      event_time: new Date(Date.now() - 86400000).toISOString(),
      violation: true,
      reasoning: 'Entry at 23:12 IST — outside allowed window, no override found.',
      alarm_triggered: true,
    },
    {
      id: '1',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      event_time: new Date(Date.now() - 172800000).toISOString(),
      violation: false,
      reasoning: 'Scheduled maintenance night — exception applied.',
      alarm_triggered: false,
    },
  ];

  // ── fetchData (defined first so siren hooks can reference it) ─────────────
  const fetchDataRef = useRef<() => Promise<void>>(async () => {});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, d, i] = await Promise.all([
        getSystemStatus(),
        getLastDecision(),
        getIncidents(),
      ]);
      setStatus(s);
      setDecision(d);
      setIncidents(i);
      setConnected(true);
    } catch {
      // Use demo data when backend is offline
      setStatus(DEMO_STATUS);
      setDecision(DEMO_DECISION);
      setIncidents(DEMO_INCIDENTS);
      setConnected(false);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep ref in sync with latest fetchData
  useEffect(() => { fetchDataRef.current = fetchData; }, [fetchData]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Persistent AudioContext — unlocked by first user interaction ──────────
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioUnlocked = useRef(false);
  const [soundHint, setSoundHint] = useState(true); // show "click to enable" hint

  // Unlock AudioContext on first user gesture (browser policy)
  useEffect(() => {
    const unlock = () => {
      if (audioUnlocked.current) return;
      try {
        const AC = window.AudioContext || (window as any).webkitAudioContext;
        if (!AC) return;
        const ctx = new AC();
        audioCtxRef.current = ctx;
        // Resume if suspended
        if (ctx.state === 'suspended') ctx.resume();
        audioUnlocked.current = true;
        setSoundHint(false);
      } catch {}
    };
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  // ── Siren ────────────────────────────────────────────────────────────────
  const alarmSoundRef = useRef<{ stop: () => void } | null>(null);
  const alarmResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAlarmActive = useRef(false);

  const playSiren = useCallback(() => {
    // Stop any existing siren first
    alarmSoundRef.current?.stop();
    alarmSoundRef.current = null;

    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      // Reuse unlocked context or create new one
      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AC();
        audioCtxRef.current = ctx;
      }
      if (ctx.state === 'suspended') ctx.resume();

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.connect(ctx.destination);

      let stopped = false;
      let iteration = 0;

      function sweep() {
        if (stopped || !ctx || ctx.state === 'closed') return;
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        const t = ctx.currentTime + (iteration === 0 ? 0 : 0.02);
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.linearRampToValueAtTime(1600, t + 0.55);
        osc.frequency.linearRampToValueAtTime(800, t + 1.1);
        osc.connect(gain);
        osc.start(t);
        osc.stop(t + 1.12);
        iteration++;
        setTimeout(sweep, 1050);
      }
      sweep();

      alarmSoundRef.current = {
        stop: () => {
          stopped = true;
          try {
            gain.gain.setTargetAtTime(0, ctx!.currentTime, 0.08);
          } catch {}
        },
      };
    } catch {
      // Audio not available — silent fail
    }
  }, []);

  const stopSiren = useCallback(() => {
    alarmSoundRef.current?.stop();
    alarmSoundRef.current = null;
  }, []);

  // Watch alarm_active from polling; auto-trigger siren + 10s auto-reset
  useEffect(() => {
    const isActive = status?.alarm_active ?? false;

    if (isActive && !prevAlarmActive.current) {
      // Alarm just became active → play immediately
      playSiren();
      if (alarmResetTimerRef.current) clearTimeout(alarmResetTimerRef.current);
      alarmResetTimerRef.current = setTimeout(async () => {
        stopSiren();
        try {
          const { silenceAlarm } = await import('@/lib/api');
          await silenceAlarm().catch(() => null);
        } catch {}
        setStatus((prev) => (prev ? { ...prev, alarm_active: false, sensor_state: 'active' } : null));
        fetchDataRef.current();
      }, 10000);
    } else if (!isActive && prevAlarmActive.current) {
      // Alarm was silenced externally
      stopSiren();
      if (alarmResetTimerRef.current) {
        clearTimeout(alarmResetTimerRef.current);
        alarmResetTimerRef.current = null;
      }
    }
    prevAlarmActive.current = isActive;
  }, [status?.alarm_active, playSiren, stopSiren]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSiren();
      if (alarmResetTimerRef.current) clearTimeout(alarmResetTimerRef.current);
    };
  }, [stopSiren]);


  return (
    <section id="dashboard" className="relative min-h-screen py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-950" />
      <div className="absolute inset-0 dot-grid opacity-15" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/4 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-green-600/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Sound unlock hint */}
        <AnimatePresence>
          {soundHint && (
            <motion.div
              key="sound-hint"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs text-blue-300/70 border border-blue-500/15 bg-blue-500/5">
                <span>🔊</span>
                <span>Click anywhere to enable alarm sound</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alarm Active Banner */}
        <AnimatePresence>
          {status?.alarm_active && (
            <motion.div
              key="alarm-banner"
              initial={{ opacity: 0, y: -20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ duration: 0.4 }}
              className="mb-8 rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-4 flex items-center justify-between gap-4"
              style={{ boxShadow: '0 0 40px rgba(239,68,68,0.2), 0 0 80px rgba(239,68,68,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" style={{ animation: 'marker-flash 0.8s ease-in-out infinite' }}>🚨</span>
                <div>
                  <p className="text-sm font-bold text-red-400 tracking-wide uppercase">⚡ Alarm Active — Intrusion Detected</p>
                  <p className="text-xs text-red-300/60 mt-0.5">Siren is sounding · Auto-silencing in 10 seconds</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  stopSiren();
                  const { silenceAlarm } = await import('@/lib/api');
                  await silenceAlarm().catch(() => null);
                  fetchData();
                }}
                className="flex-shrink-0 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-300 text-xs font-semibold rounded-xl transition-all"
              >
                🔇 Silence Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-green-500/50" />
            <span className="text-xs font-semibold tracking-widest text-green-400 uppercase">
              Live System
            </span>
            <div className="h-px w-12 bg-green-500/50" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            Live{' '}
            <span className="text-gradient-blue">Dashboard</span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Real-time system status, the latest agent decision, and a running incident log —
            refreshing every 5 seconds.
          </p>

          {/* Connection status + refresh */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium ${
                connected ? 'text-green-400' : 'text-yellow-400'
              }`}
            >
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? 'Connected to backend' : 'Demo mode — backend offline'}
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 glass rounded-full text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <span className="text-xs text-white/20">
              Updated {timeAgo(lastRefresh.toISOString())}
            </span>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Sensor status */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <SensorCard status={status} />
          </motion.div>

          {/* Last decision */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <DecisionCard decision={decision} />
          </motion.div>

          {/* System uptime */}
          <motion.div
            className="glass rounded-2xl p-5 border border-white/5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4 text-white/50 text-xs font-semibold tracking-wider uppercase">
              <Clock size={12} />
              System Uptime
            </div>
            <p className="text-3xl font-bold text-gradient-blue">
              {status
                ? `${Math.floor((status.uptime_seconds ?? 0) / 3600)}h ${Math.floor(((status.uptime_seconds ?? 0) % 3600) / 60)}m`
                : '—'}
            </p>
            <p className="text-xs text-white/30 mt-2">Backend running since boot</p>

            <div className="mt-4 space-y-2">
              {[
                { label: 'Total Incidents', value: incidents.length.toString() },
                { label: 'Violations', value: incidents.filter((i) => i.violation).length.toString() },
                { label: 'Alarm Fires', value: incidents.filter((i) => i.alarm_triggered).length.toString() },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-white/35">{stat.label}</span>
                  <span className="text-xs font-semibold text-white/60">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Agent chain */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
          >
            <AgentChain chain={decision?.agent_chain ?? []} />
          </motion.div>

          {/* Quick actions */}
          <motion.div
            className="glass rounded-2xl p-5 border border-white/5"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-2 mb-3 text-white/50 text-xs font-semibold tracking-wider uppercase">
              <Bell size={12} />
              Simulation & Controls
            </div>
            <div className="space-y-2">
              <button
                className="w-full px-3 py-2 bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-900/30"
                onClick={async () => {
                  try {
                    const { postMotionEvent } = await import('@/lib/api');
                    await postMotionEvent({
                      timestamp: '2026-08-02T23:47:00+05:30',
                      sensor_id: 'pir_zone_north',
                      location: 'main_entrance',
                    });
                  } catch {}
                  playSiren();
                  setStatus((prev) =>
                    prev
                      ? { ...prev, alarm_active: true, sensor_state: 'triggered', last_event: '2026-08-02T23:47:00+05:30' }
                      : { sensor_state: 'triggered', system_armed: true, last_event: '2026-08-02T23:47:00+05:30', alarm_active: true, uptime_seconds: 3600 }
                  );
                  setDecision({
                    event_time: '2026-08-02T23:47:00+05:30',
                    violation: true,
                    reasoning: 'Entry at 23:47 IST outside allowed window (06:00-22:00). No active maintenance pass found in ChromaDB. Escalated to hardware buzzer.',
                    retrieved_context: 'Access policy §2.1: Standard hours 06:00–22:00. §3.2: Immediate alarm escalation required.',
                    agent_chain: ['retrieval_agent', 'decision_agent', 'alarm_agent'],
                    timestamp: new Date().toISOString(),
                  });
                  setIncidents((prev) => [
                    {
                      id: String(Date.now()),
                      timestamp: new Date().toISOString(),
                      event_time: '2026-08-02T23:47:00+05:30',
                      violation: true,
                      reasoning: 'Entry at 23:47 IST outside allowed window (06:00-22:00). Unauthorised access.',
                      alarm_triggered: true,
                    },
                    ...prev,
                  ]);
                  fetchDataRef.current();
                }}
              >
                <span>🚨</span>
                <span>Simulate Night Breach (23:47)</span>
              </button>

              <button
                className="w-full px-3 py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 border border-green-500/30 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                onClick={async () => {
                  stopSiren();
                  try {
                    const { postMotionEvent } = await import('@/lib/api');
                    await postMotionEvent({
                      timestamp: '2026-08-02T09:30:00+05:30',
                      sensor_id: 'pir_zone_north',
                      location: 'main_entrance',
                    });
                  } catch {}
                  setStatus((prev) => (prev ? { ...prev, alarm_active: false, sensor_state: 'active', last_event: '2026-08-02T09:30:00+05:30' } : null));
                  setDecision({
                    event_time: '2026-08-02T09:30:00+05:30',
                    violation: false,
                    reasoning: 'Entry at 09:30 AM is within permitted hours (06:00–22:00 IST). Access granted. No alarm fired.',
                    retrieved_context: 'Access policy §2.1: Standard hours 06:00–22:00 IST.',
                    agent_chain: ['retrieval_agent', 'decision_agent'],
                    timestamp: new Date().toISOString(),
                  });
                  setIncidents((prev) => [
                    {
                      id: String(Date.now()),
                      timestamp: new Date().toISOString(),
                      event_time: '2026-08-02T09:30:00+05:30',
                      violation: false,
                      reasoning: 'Daytime entry at 09:30 AM — within standard operating window.',
                      alarm_triggered: false,
                    },
                    ...prev,
                  ]);
                  fetchDataRef.current();
                }}
              >
                <span>☀️</span>
                <span>Simulate Day Entry (09:30)</span>
              </button>

              <button
                className="w-full px-3 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 border border-yellow-500/30 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                onClick={async () => {
                  stopSiren();
                  try {
                    const { postMotionEvent } = await import('@/lib/api');
                    await postMotionEvent({
                      timestamp: '2026-08-05T23:30:00+05:30',
                      sensor_id: 'pir_zone_north',
                      location: 'main_entrance',
                    });
                  } catch {}
                  setStatus((prev) => (prev ? { ...prev, alarm_active: false, sensor_state: 'active', last_event: '2026-08-05T23:30:00+05:30' } : null));
                  setDecision({
                    event_time: '2026-08-05T23:30:00+05:30',
                    violation: false,
                    reasoning: 'ChromaDB surfaced pre-approved maintenance exception for 2026-08-05 night (22:30-03:30). Access authorized.',
                    retrieved_context: 'Scheduled Exception 2026-08-05: Building maintenance night pre-approved.',
                    agent_chain: ['retrieval_agent', 'decision_agent'],
                    timestamp: new Date().toISOString(),
                  });
                  setIncidents((prev) => [
                    {
                      id: String(Date.now()),
                      timestamp: new Date().toISOString(),
                      event_time: '2026-08-05T23:30:00+05:30',
                      violation: false,
                      reasoning: 'Scheduled maintenance pass — exception verified via Chroma vector store.',
                      alarm_triggered: false,
                    },
                    ...prev,
                  ]);
                  fetchDataRef.current();
                }}
              >
                <span>🔧</span>
                <span>Simulate Maintenance Pass</span>
              </button>

              <button
                className="w-full px-3 py-2 glass hover:bg-white/5 text-white/60 hover:text-white text-xs font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                onClick={async () => {
                  stopSiren();
                  const { silenceAlarm } = await import('@/lib/api');
                  await silenceAlarm().catch(() => null);
                  setStatus((prev) => (prev ? { ...prev, alarm_active: false, sensor_state: 'active' } : null));
                  fetchDataRef.current();
                }}
              >
                <span>🔇</span>
                <span>Silence Alarm</span>
              </button>
            </div>
          </motion.div>

          {/* Incident log — full width */}
          <motion.div
            className="md:col-span-2 xl:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <IncidentLog incidents={incidents} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
