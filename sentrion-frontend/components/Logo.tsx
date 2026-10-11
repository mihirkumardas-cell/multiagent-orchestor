'use client';

import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = '' }: LogoProps) {
  return (
    <motion.div
      className={`flex items-center gap-3 ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* SVG Eye-in-Hexagon Shield */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
          <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#00d4ff" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="outerGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer hexagon shield */}
        <path
          d="M40 6L70 21V55L40 74L10 55V21L40 6Z"
          fill="url(#logoGrad)"
          opacity="0.9"
          filter="url(#outerGlow)"
        />

        {/* Inner hexagon */}
        <path
          d="M40 16L62 27V50L40 65L18 50V27L40 16Z"
          fill="rgba(10, 14, 26, 0.7)"
          stroke="url(#innerGrad)"
          strokeWidth="1"
        />

        {/* Eye shape */}
        <path
          d="M24 40C24 40 30 30 40 30C50 30 56 40 56 40C56 40 50 50 40 50C30 50 24 40 24 40Z"
          fill="none"
          stroke="url(#innerGrad)"
          strokeWidth="1.5"
          filter="url(#glow)"
        />

        {/* Iris */}
        <circle cx="40" cy="40" r="6" fill="url(#innerGrad)" filter="url(#glow)" />

        {/* Pupil */}
        <circle cx="40" cy="40" r="2.5" fill="#0a0e1a" />

        {/* Corner scan lines */}
        <line x1="18" y1="27" x2="24" y2="30" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
        <line x1="62" y1="27" x2="56" y2="30" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
        <line x1="18" y1="50" x2="24" y2="47" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
        <line x1="62" y1="50" x2="56" y2="47" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
      </motion.svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="text-xl font-bold tracking-tight text-gradient-blue"
            style={{ letterSpacing: '-0.03em' }}
          >
            SENTRION
          </span>
          <span className="text-[9px] font-medium tracking-[0.25em] text-blue-400/60 uppercase">
            Intelligent Guardian
          </span>
        </div>
      )}
    </motion.div>
  );
}
