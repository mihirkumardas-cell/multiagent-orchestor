import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sentrion — Intelligent Late-Entry Security System',
  description:
    'Sentrion is an AI-powered late-entry security alarm system that uses multi-agent orchestration, RAG-based policy retrieval, and ESP32 hardware integration to provide intelligent access control and real-time incident monitoring.',
  keywords: [
    'security system',
    'AI agents',
    'LangGraph',
    'ESP32',
    'motion detection',
    'access control',
    'Sentrion',
  ],
  authors: [{ name: 'Mihir' }],
  openGraph: {
    title: 'Sentrion — Intelligent Late-Entry Security System',
    description: 'AI-powered security alarm with multi-agent orchestration and real-time monitoring.',
    type: 'website',
    locale: 'en_US',
  },
  themeColor: '#0a0e1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
