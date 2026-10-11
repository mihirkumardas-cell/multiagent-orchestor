'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Cpu, Zap, ChevronDown } from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: Shield, label: 'Retrieve', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Cpu, label: 'Decide', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: Zap, label: 'Alarm', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
];

// Deterministic seed-based pseudo-random to avoid hydration mismatch
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const PARTICLES = Array.from({ length: 30 }, (_, i) => ({
  left: seededRandom(i * 3) * 100,
  top: seededRandom(i * 3 + 1) * 100,
  duration: 3 + seededRandom(i * 3 + 2) * 4,
  delay: seededRandom(i * 7) * 5,
}));

function FloatingParticles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-blue-400/30"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default function HeroSection() {
  return (
    <section
      id="system"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 dot-grid opacity-30" />

      {/* Blue glow at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <FloatingParticles />

      {/* Animated scanner line */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 text-center">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 glass-blue rounded-full mb-8 text-xs font-medium text-blue-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="status-online" />
          AI-Powered Security · LangGraph + ESP32 · Multi-Agent Orchestration
        </motion.div>

        {/* Main headline */}
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.95]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-white">The Guardian</span>
          <br />
          <span className="text-gradient-neon">That Never Sleeps.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
        >
          Sentrion fuses ESP32 hardware sensing with a four-stage AI agent pipeline —
          retrieval, reasoning, action, and monitoring — to autonomously detect and respond
          to after-hours intrusions in real time.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.a
            href="#dashboard"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all duration-200 glow-blue text-sm"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Open Live Dashboard →
          </motion.a>
          <motion.a
            href="#retrieval"
            className="px-8 py-3.5 glass hover:bg-white/5 text-white/80 hover:text-white font-medium rounded-2xl transition-all duration-200 text-sm"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore the Pipeline
          </motion.a>
        </motion.div>

        {/* Pipeline flow */}
        <motion.div
          className="flex items-center justify-center gap-0 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* ESP32 Node */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 glass-blue rounded-2xl flex items-center justify-center border border-blue-500/20">
              <span className="text-xl">📡</span>
            </div>
            <span className="text-xs text-white/30 font-medium">ESP32</span>
          </div>

          {/* Arrow */}
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-blue-500/40 to-blue-500/40 relative"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"
              animate={{ x: [-40, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${step.bg}`}
                  whileHover={{ scale: 1.05, y: -3 }}
                  transition={{ duration: 0.2 }}
                >
                  <step.icon size={20} className={step.color} />
                </motion.div>
                <span className="text-xs text-white/30 font-medium">{step.label}</span>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <motion.div
                  className="w-12 h-px bg-gradient-to-r from-blue-500/40 to-purple-500/40"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              )}
            </div>
          ))}

          {/* Arrow to Dashboard */}
          <motion.div
            className="w-12 h-px bg-gradient-to-r from-purple-500/40 to-green-500/40"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
          />

          {/* Dashboard Node */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center border border-green-500/20 bg-green-500/5">
              <span className="text-xl">📊</span>
            </div>
            <span className="text-xs text-white/30 font-medium">Dashboard</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          {[
            { value: '<200ms', label: 'Event to Decision' },
            { value: '4 Agents', label: 'Pipeline Depth' },
            { value: '24/7', label: 'Always Watching' },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-2xl px-4 py-3">
              <div className="text-xl font-bold text-gradient-blue">{stat.value}</div>
              <div className="text-xs text-white/35 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/25"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} />
      </motion.div>
    </section>
  );
}
