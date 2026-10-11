'use client';

import { motion } from 'framer-motion';
import { Bell, Wifi, FilePlus, AlertTriangle } from 'lucide-react';
import AlarmCanvas from '@/components/AlarmCanvas';

const actions = [
  {
    icon: Wifi,
    title: 'Signal ESP32',
    desc: 'POST /trigger-alarm to ESP32 endpoint — buzzer activates immediately',
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
  {
    icon: Bell,
    title: 'Push Notification',
    desc: 'Optional SMS/email/webhook alert dispatched to security personnel',
    color: 'text-orange-400',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
  },
  {
    icon: FilePlus,
    title: 'Incident Logged',
    desc: 'Full event — timestamp, reasoning, verdict — written to SQLite + dashboard',
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
  },
];

export default function AlarmTriggerSection() {
  return (
    <section id="alarm" className="relative min-h-screen flex items-center py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-900" />
      <div className="absolute inset-0" style={{
        backgroundImage: 'radial-gradient(rgba(239,68,68,0.06) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/4 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-red-500/50" />
            <span className="text-xs font-semibold tracking-widest text-red-400 uppercase">
              Agent 3 of 3
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Alarm-Trigger
            <br />
            <span className="text-red-400">Agent</span>
          </h2>

          <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg">
            Only when a <strong className="text-white/80">real violation</strong> is confirmed does
            the Alarm-Trigger Agent act. It simultaneously signals the ESP32 to sound the buzzer,
            dispatches alerts, and persists a full incident record — closing the hardware-software loop.
          </p>

          {/* Action cards */}
          <div className="space-y-3">
            {actions.map((action, i) => (
              <motion.div
                key={action.title}
                className={`flex items-start gap-4 rounded-2xl p-4 border ${action.border} ${action.bg} glass`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 + 0.2, duration: 0.5 }}
                whileHover={{ x: 4 }}
              >
                <div className={`mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center border ${action.border}`}>
                  <action.icon size={15} className={action.color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/80 mb-0.5">{action.title}</p>
                  <p className="text-xs text-white/40">{action.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Guard condition */}
          <motion.div
            className="mt-6 glass rounded-2xl p-4 border border-yellow-500/15 bg-yellow-500/3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400/80">Guard Condition</span>
            </div>
            <p className="text-xs text-white/35 leading-relaxed font-mono">
              if decision.violation == True:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;alarm_agent.fire()
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mt-6">
            {['ESP32 HTTP', 'SQLite', 'Twilio', 'Webhooks', 'Real-time'].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-xs font-medium text-red-300 border border-red-500/15 bg-red-500/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right: 3D Alarm */}
        <motion.div
          className="relative h-[480px] lg:h-[560px]"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-red-500/5 rounded-3xl blur-xl" />
          <div className="glass rounded-3xl h-full overflow-hidden border border-red-500/10">
            <AlarmCanvas />
          </div>

        </motion.div>
      </div>
    </section>
  );
}
