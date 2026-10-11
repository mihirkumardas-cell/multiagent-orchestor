'use client';

import { motion } from 'framer-motion';
import { BookOpen, Cpu, Wifi, Database, Zap, GitBranch, Terminal, ExternalLink } from 'lucide-react';

const architecture = [
  {
    step: '01',
    icon: Wifi,
    title: 'ESP32 Hardware',
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    desc: 'PIR/ultrasonic sensor triggers a POST request to the FastAPI backend with a Unix timestamp the moment motion is detected.',
    stack: ['ESP32-WROOM', 'MicroPython', 'HTTP POST', 'PIR Sensor'],
  },
  {
    step: '02',
    icon: Database,
    title: 'Retrieval Agent',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/5',
    desc: 'Queries a Chroma/FAISS vector DB pre-loaded with access-policy documents, maintenance schedules, and override tokens. Returns the top-k context chunks.',
    stack: ['ChromaDB', 'FAISS', 'LangChain', 'OpenAI Embeddings'],
  },
  {
    step: '03',
    icon: Cpu,
    title: 'Decision Agent',
    color: 'text-purple-400',
    border: 'border-purple-500/20',
    bg: 'bg-purple-500/5',
    desc: 'Feeds the timestamp + retrieved policy context into GPT-4o with structured chain-of-thought prompting. Outputs a typed JSON verdict: { violation: bool, reasoning: str }.',
    stack: ['LangGraph', 'GPT-4o', 'Chain-of-Thought', 'Pydantic'],
  },
  {
    step: '04',
    icon: Zap,
    title: 'Alarm-Trigger Agent',
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
    desc: 'Only fires when violation=True. Simultaneously POSTs to the ESP32 buzzer endpoint, dispatches SMS/webhook alerts, and writes a full incident record to SQLite.',
    stack: ['ESP32 HTTP', 'Twilio', 'SQLite', 'Webhooks'],
  },
];

const apiEndpoints = [
  { method: 'POST', path: '/event', desc: 'Ingest a sensor event and run the full agent pipeline' },
  { method: 'GET', path: '/status', desc: 'Current system status, armed state, and alarm flag' },
  { method: 'GET', path: '/decision', desc: 'Latest agent decision with full reasoning' },
  { method: 'GET', path: '/incidents', desc: 'Paginated incident log from SQLite' },
  { method: 'POST', path: '/trigger-alarm', desc: 'Manually fire a test alarm' },
  { method: 'POST', path: '/silence-alarm', desc: 'Silence the active alarm' },
  { method: 'GET', path: '/health', desc: 'Backend liveness check' },
];

const methodColors: Record<string, string> = {
  GET: 'text-green-400 bg-green-500/10 border-green-500/20',
  POST: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

export default function DocsSection() {
  return (
    <section id="docs" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-900" />
      <div className="absolute inset-0 dot-grid opacity-10" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-blue-600/4 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-purple-600/4 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-12 bg-blue-500/50" />
            <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
              Documentation
            </span>
            <div className="h-px w-12 bg-blue-500/50" />
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
            How It{' '}
            <span className="text-gradient-blue">Works</span>
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            End-to-end architecture — from hardware sensor to AI decision to hardware response.
          </p>
        </motion.div>

        {/* Architecture Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
          {architecture.map((item, i) => (
            <motion.div
              key={item.step}
              className={`glass rounded-2xl p-6 border ${item.border} ${item.bg} group hover:scale-[1.01] transition-transform duration-300`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${item.border}`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold font-mono ${item.color} opacity-60`}>{item.step}</span>
                    <h3 className="text-sm font-bold text-white/90">{item.title}</h3>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed mb-3">{item.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.stack.map((tech) => (
                      <span
                        key={tech}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${item.border} ${item.color}`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline flow diagram */}
        <motion.div
          className="glass rounded-2xl p-6 border border-white/5 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <GitBranch size={14} className="text-blue-400" />
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">LangGraph Pipeline Flow</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            {[
              { label: 'ESP32 Event', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/8' },
              { arrow: true },
              { label: 'retrieval_agent', color: 'text-blue-400 border-blue-500/30 bg-blue-500/8' },
              { arrow: true },
              { label: 'decision_agent', color: 'text-purple-400 border-purple-500/30 bg-purple-500/8' },
              { arrow: true },
              { label: 'alarm_agent (if violation)', color: 'text-red-400 border-red-500/30 bg-red-500/8' },
              { arrow: true },
              { label: 'END', color: 'text-green-400 border-green-500/30 bg-green-500/8' },
            ].map((item, i) =>
              'arrow' in item ? (
                <span key={i} className="text-white/20">→</span>
              ) : (
                <span key={i} className={`px-2.5 py-1 rounded-lg border ${item.color}`}>
                  {item.label}
                </span>
              )
            )}
          </div>
        </motion.div>

        {/* API Reference */}
        <motion.div
          className="glass rounded-2xl border border-white/5 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-white/40" />
              <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">FastAPI Endpoints</span>
            </div>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              <ExternalLink size={10} />
              Open Swagger UI
            </a>
          </div>
          <div className="divide-y divide-white/3">
            {apiEndpoints.map((ep, i) => (
              <motion.div
                key={ep.path}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/1 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 + 0.4 }}
              >
                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${methodColors[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-xs text-blue-300 font-mono flex-shrink-0">{ep.path}</code>
                <span className="text-xs text-white/35 min-w-0">{ep.desc}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
