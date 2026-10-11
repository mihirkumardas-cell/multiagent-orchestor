'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/sections/HeroSection';
import RetrievalAgentSection from '@/sections/RetrievalAgentSection';
import DecisionAgentSection from '@/sections/DecisionAgentSection';
import AlarmTriggerSection from '@/sections/AlarmTriggerSection';
import DashboardSection from '@/sections/DashboardSection';
import CodeSnippetsSection from '@/sections/CodeSnippetsSection';
import DocsSection from '@/sections/DocsSection';
import WorkflowSection from '@/sections/WorkflowSection';

export default function HomePage() {
  // GSAP ScrollTrigger — load only client-side
  useEffect(() => {
    let ctx: any;

    const initGSAP = async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        // Parallax on section backgrounds
        gsap.utils.toArray<HTMLElement>('.parallax-bg').forEach((el) => {
          gsap.to(el, {
            yPercent: -20,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          });
        });

        // Fade + rise for content blocks
        gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // Section highlight on enter
        gsap.utils.toArray<HTMLElement>('section').forEach((section, i) => {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 60%',
            end: 'bottom 40%',
            onEnter: () => {
              const id = section.getAttribute('id');
              // Update active nav link
              document.querySelectorAll('nav a[href]').forEach((a) => {
                const href = a.getAttribute('href');
                if (href === `#${id}`) {
                  a.classList.add('text-white');
                  a.classList.remove('text-white/60');
                } else {
                  a.classList.remove('text-white');
                  a.classList.add('text-white/60');
                }
              });
            },
          });
        });
      });
    };

    initGSAP();

    return () => {
      ctx?.revert();
    };
  }, []);

  return (
    <main className="relative bg-navy-900 text-white overflow-x-hidden">
      <Navbar />

      {/* Page sections */}
      <HeroSection />

      {/* Section divider */}
      <div className="section-divider" />

      <RetrievalAgentSection />

      <div className="section-divider" />

      <DecisionAgentSection />

      <div className="section-divider" />

      <WorkflowSection />

      <div className="section-divider" />

      <AlarmTriggerSection />

      <div className="section-divider" />

      <DashboardSection />

      <div className="section-divider" />

      <CodeSnippetsSection />

      <div className="section-divider" />

      <DocsSection />

      <div className="section-divider" />

      <Footer />
    </main>
  );
}
