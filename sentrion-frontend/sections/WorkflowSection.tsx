'use client';

import { motion } from 'framer-motion';
import Workflow3DCanvas from '@/components/Workflow3DCanvas';
import { GitMerge, Layers, ShieldCheck } from 'lucide-react';

export default function WorkflowSection() {
  return (
    <section id="workflow" className="relative py-24 overflow-hidden bg-navy-950">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

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
              System Architecture
            </span>
            <div className="h-px w-12 bg-cyan-500/50" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            3D Agent{' '}
            <span className="text-gradient-neon">Workflow</span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Explore how hardware sensor triggers flow through LangGraph multi-agent retrieval, chain-of-thought reasoning, and autonomous hardware alarm responses in 3D.
          </p>
        </motion.div>

        {/* 3D Workflow Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Workflow3DCanvas />
        </motion.div>
      </div>
    </section>
  );
}
