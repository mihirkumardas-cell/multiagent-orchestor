'use client';

import { motion } from 'framer-motion';
import { Database, Search, FileText, CheckCircle } from 'lucide-react';
import RadarCanvas from '@/components/RadarCanvas';

const steps = [
  {
    icon: Search,
    title: 'Motion Detected',
    desc: 'ESP32 fires POST /event with timestamp',
    color: 'text-blue-400',
    dot: 'bg-blue-400',
  },
  {
    icon: Database,
    title: 'Query Vector DB',
    desc: 'Chroma/FAISS retrieves access-policy docs and scheduled exceptions',
    color: 'text-cyan-400',
    dot: 'bg-cyan-400',
  },
  {
    icon: FileText,
    title: 'Context Retrieved',
    desc: 'Returns relevant policy chunks, maintenance windows, override tokens',
    color: 'text-indigo-400',
    dot: 'bg-indigo-400',
  },
  {
    icon: CheckCircle,
    title: 'Context Passed On',
    desc: 'Enriched shared state flows to Decision Agent',
    color: 'text-purple-400',
    dot: 'bg-purple-400',
  },
];

export default function RetrievalAgentSection() {
  return (
    <section id="retrieval" className="relative min-h-screen flex items-center py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-900" />
      <div className="absolute inset-0 dot-grid opacity-20" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Section label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-blue-500/50" />
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Agent 1 of 3
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Retrieval
            <br />
            <span className="text-gradient-blue">Agent</span>
          </h2>

          <p className="text-white/50 text-base leading-relaxed mb-8 max-w-lg">
            The moment motion is detected, the Retrieval Agent queries a Chroma vector database
            preloaded with your access-policy documents and scheduled maintenance windows.
            It surfaces the most relevant context — so the Decision Agent always has the full picture.
          </p>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                className="flex items-start gap-4 glass rounded-2xl p-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(59,130,246,0.04)' }}
              >
                <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500/10 border border-blue-500/20`}>
                  <step.icon size={15} className={step.color} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${step.dot}`} />
                    <span className="text-sm font-semibold text-white/80">{step.title}</span>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tech pill */}
          <div className="flex flex-wrap gap-2 mt-8">
            {['ChromaDB', 'FAISS', 'LangChain', 'OpenAI Embeddings', 'FastAPI'].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 glass-blue rounded-full text-xs font-medium text-blue-300 border border-blue-500/15"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right: 3D Radar */}
        <motion.div
          className="relative h-[480px] lg:h-[560px]"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glow behind canvas */}
          <div className="absolute inset-0 bg-blue-500/5 rounded-3xl blur-xl" />

          <div className="glass rounded-3xl h-full overflow-hidden border border-blue-500/10">
            <RadarCanvas />
          </div>

          {/* Overlay label */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 glass-blue px-4 py-2 rounded-full border border-blue-500/20">
            <span className="text-xs font-medium text-blue-300 flex items-center gap-2">
              <span className="status-online" />
              Radar Active — Scanning Policy Database
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
