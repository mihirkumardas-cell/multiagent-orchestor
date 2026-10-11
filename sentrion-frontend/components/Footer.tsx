'use client';

import { motion } from 'framer-motion';
import Logo from './Logo';
import { Github, Twitter, Linkedin, Mail, Shield } from 'lucide-react';

const footerLinks = {
  Product: ['Features', 'Documentation', 'API Reference', 'Changelog'],
  System: ['Hardware Setup', 'Backend Config', 'Agent Pipeline', 'RAG Setup'],
  Resources: ['GitHub', 'Architecture', 'Roadmap', 'Support'],
};

const socialIcons = [
  { icon: Github, label: 'GitHub', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
  { icon: Linkedin, label: 'LinkedIn', href: '#' },
  { icon: Mail, label: 'Email', href: 'mailto:mihir@sentrion.dev' },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-navy-950 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[220px] bg-blue-600/5 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 w-[300px] h-[120px] bg-purple-600/4 rounded-full blur-3xl" />

      {/* Top gradient line */}
      <div className="section-divider" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size={44} />
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Sentrion is an intelligent late-entry security system powered by multi-agent AI
              orchestration, RAG-based policy retrieval, and real-time hardware integration.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              {socialIcons.map(({ icon: Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center text-white/40 hover:text-blue-400 hover:border-blue-500/30 transition-all duration-200"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={16} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
                {section}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="section-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright — premium glow */}
          <motion.p
            className="text-xs font-medium"
            style={{
              background: 'linear-gradient(90deg, rgba(148,163,184,0.6) 0%, rgba(203,213,225,0.85) 50%, rgba(148,163,184,0.6) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 8px rgba(148,163,184,0.3))',
            }}
          >
            © 2026 Sentrion. All rights reserved.
          </motion.p>

          <div className="flex items-center gap-4 text-xs text-white/20">
            <a href="#" className="hover:text-white/50 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/50 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/50 transition-colors">Security</a>
          </div>
        </div>

        {/* Built by attribution — clean premium */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px flex-1 max-w-[120px]"
            style={{ background: 'linear-gradient(to right, transparent, rgba(59,130,246,0.3))' }} />

          <motion.div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 24px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          >
            {/* Shield icon */}
            <Shield size={12} style={{ color: 'rgba(96,165,250,0.7)' }} />

            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em' }}>
              Built with
            </span>

            {/* Beating heart */}
            <motion.span
              className="text-sm leading-none"
              animate={{
                scale: [1, 1.35, 0.95, 1.2, 1],
                filter: [
                  'drop-shadow(0 0 4px #ef4444)',
                  'drop-shadow(0 0 10px #ef4444) drop-shadow(0 0 20px #ef444460)',
                  'drop-shadow(0 0 3px #ef4444)',
                  'drop-shadow(0 0 8px #ef4444)',
                  'drop-shadow(0 0 4px #ef4444)',
                ],
              }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-label="love"
            >
              ❤️
            </motion.span>

            <span
              className="text-xs font-semibold"
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f0abfc 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.6))',
                letterSpacing: '0.06em',
              }}
            >
              by Mihir
            </span>
          </motion.div>

          <div className="h-px flex-1 max-w-[120px]"
            style={{ background: 'linear-gradient(to left, transparent, rgba(139,92,246,0.3))' }} />
        </div>
      </div>
    </footer>
  );
}
