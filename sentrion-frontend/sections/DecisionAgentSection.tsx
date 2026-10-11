'use client';

import { motion } from 'framer-motion';
import { Brain, GitBranch, CheckCircle2, XCircle } from 'lucide-react';
import NeuralCanvas from '@/components/NeuralCanvas';

const criteria = [
  { label: 'After-hours timestamp?', yes: true },
  { label: 'Scheduled maintenance tonight?', yes: false },
  { label: 'Valid access override token?', yes: false },
  { label: 'Known contractor window?', yes: false },
];

export default function DecisionAgentSection() {
  return (
    <section
      id="decision"
      className="relative min-h-screen flex items-center py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-navy-800" />
      <div className="absolute inset-0 dot-grid opacity-15" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: 3D Neural */}
        <motion.div
          className="relative h-[480px] lg:h-[560px] order-2 lg:order-1"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-purple-500/5 rounded-3xl blur-xl" />
          {/* Canvas takes the top portion, leaving room for the badge below */}
          <div className="glass rounded-3xl overflow-hidden border border-purple-500/10" style={{ height: 'calc(100% - 52px)' }}>
            <NeuralCanvas />
          </div>
          <div className="mt-3 flex justify-center">
            <div className="glass px-4 py-2 rounded-full border border-purple-500/20 bg-purple-500/5">
              <span className="text-xs font-medium text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                Neural Decision Network — Reasoning
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right: Text */}
        <motion.div
          className="order-1 lg:order-2"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-purple-500/50" />
            <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">
              Agent 2 of 3
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Decision
            <br />
            <span className="text-gradient-neon">Agent</span>
          </h2>

          <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg">
            The Decision Agent combines the retrieved policy context with the event timestamp
            and runs structured chain-of-thought reasoning to produce a clear
            <strong className="text-white/80"> violation / no-violation</strong> verdict with
            full reasoning attached.
          </p>

          {/* Decision criteria card — EXAMPLE walkthrough */}
          <motion.div
            className="glass rounded-2xl p-5 mb-6 border border-purple-500/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-white/70">Decision Criteria Check</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider text-purple-400/70 border border-purple-500/20 bg-purple-500/8 uppercase">
                Example Scenario
              </span>
            </div>
            <div className="space-y-2.5">
              {criteria.map((c, i) => (
                <motion.div
                  key={c.label}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 + 0.4 }}
                >
                  <span className="text-xs text-white/50">{c.label}</span>
                  {c.yes ? (
                    <CheckCircle2 size={14} className="text-red-400" />
                  ) : (
                    <XCircle size={14} className="text-green-400" />
                  )}
                </motion.div>
              ))}
            </div>
            {/* Verdict */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-white/60">Example Verdict</span>
              <span className="px-3 py-1 bg-red-500/15 border border-red-500/30 rounded-full text-xs font-bold text-red-400">
                🔴 VIOLATION CONFIRMED
              </span>
            </div>
          </motion.div>

          {/* Reasoning output */}
          <motion.div
            className="glass rounded-2xl p-4 border border-purple-500/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <GitBranch size={14} className="text-purple-400" />
                <span className="text-xs font-semibold text-white/50">Agent Reasoning Output</span>
              </div>
              <span className="text-[10px] text-purple-400/50 font-mono tracking-wider">SIMULATED</span>
            </div>
            <p className="text-xs text-white/35 leading-relaxed font-mono">
              "Entry at 23:47 IST is outside the 06:00–22:00 allowed window.
              No scheduled maintenance found for tonight. No valid override token.
              Policy doc §3.2 applies. <span className="text-red-400 font-semibold">Escalating to Alarm Agent.</span>"
            </p>
          </motion.div>

          <div className="flex flex-wrap gap-2 mt-6">
            {['LangGraph', 'GPT-4o', 'Chain-of-Thought', 'Structured Output', 'LangChain'].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-xs font-medium text-purple-300 border border-purple-500/15 bg-purple-500/5"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
