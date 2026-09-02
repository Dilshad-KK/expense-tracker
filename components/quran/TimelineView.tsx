'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export interface TimelineItem {
  id: string;
  name: string;
  arabicName?: string;
  title: string;
  period: string;
  description: string;
  surahs: { id: number; name: string }[];
  color?: string;
}

interface TimelineViewProps {
  title: string;
  subtitle: string;
  description: string;
  badgeLabel: string;
  items: TimelineItem[];
  backLink?: string;
}

export default function TimelineView({ 
  title, 
  subtitle, 
  description, 
  badgeLabel, 
  items,
  backLink = '/quran/discover' 
}: TimelineViewProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col relative transition-colors duration-500 bg-[var(--q-bg)] pb-24 overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-20 left-0 w-full h-96 bg-[var(--q-accent)]/5 blur-[120px] pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--q-bg)]/80 backdrop-blur-xl border-b border-[var(--q-border)] shadow-sm">
        <div className="max-w-md md:max-w-2xl mx-auto px-4 py-4 flex items-center">
          <Link href={backLink} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--q-text)] hover:bg-[var(--q-card-hover)] transition-colors mr-3 active:scale-95">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--q-text)] to-[var(--q-text-muted)] tracking-tight">{title}</h1>
            <p className="text-[10px] font-bold text-[var(--q-accent)] mt-0.5 uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-8">
        
        {/* Intro Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-br from-[var(--q-card)] to-[var(--q-bg)] border border-[var(--q-border)] rounded-[2rem] p-6 shadow-xl mb-12 overflow-hidden relative"
        >
          {/* Subtle Inner Border Glow */}
          <div className="absolute inset-0 rounded-[2rem] border border-white/10 dark:border-white/5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--q-accent)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all duration-700 hover:scale-110"></div>
          
          <h2 className="text-2xl font-bold text-[var(--q-text)] mb-3 tracking-tight">{title}</h2>
          <p className="text-[var(--q-text-subtle)] text-sm leading-relaxed mb-5 font-medium max-w-lg">
            {description}
          </p>
          <div className="inline-flex items-center text-xs font-bold text-[var(--q-accent)] bg-[var(--q-accent)]/10 px-4 py-2 rounded-full ring-1 ring-[var(--q-accent)]/30 backdrop-blur-sm">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {badgeLabel}
          </div>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative pl-6 md:pl-10">
          {/* Vertical Glowing Line */}
          <div className="absolute left-[13px] md:left-[21px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-[var(--q-accent)]/60 via-[var(--q-border)] to-transparent rounded-full"></div>

          {/* Timeline Nodes */}
          {items.map((item, index) => {
            const isSelected = selectedItem === item.id;
            
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="relative mb-8 last:mb-0"
              >
                {/* Node Orb */}
                <div 
                  className={`absolute -left-[31px] md:-left-[39px] top-6 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isSelected 
                      ? 'bg-[var(--q-accent)] shadow-lg shadow-[var(--q-accent)]/40 scale-110' 
                      : 'bg-[var(--q-bg)] border-2 border-[var(--q-accent)]/50 hover:border-[var(--q-accent)] shadow-md'
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${isSelected ? 'bg-white animate-pulse' : 'bg-[var(--q-accent)]'}`}></div>
                </div>

                {/* Node Content Card */}
                <div 
                  className={`relative bg-[var(--q-card)] border border-[var(--q-border)] rounded-[2rem] p-5 md:p-6 shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.99] group overflow-hidden ${
                    isSelected ? 'shadow-[var(--q-accent)]/10 border-[var(--q-accent)]/40 ring-1 ring-[var(--q-accent)]/20' : 'hover:shadow-xl hover:border-[var(--q-border)]/80'
                  }`}
                  onClick={() => setSelectedItem(isSelected ? null : item.id)}
                >
                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none" />
                  
                  <div className="flex justify-between items-start mb-2 relative z-10">
                    <div className="pr-4">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 inline-block transition-colors duration-300 ${
                        isSelected ? 'bg-[var(--q-accent)] text-white' : 'bg-[var(--q-accent)]/10 text-[var(--q-accent)]'
                      }`}>
                        {item.period}
                      </span>
                      <h3 className={`text-xl md:text-2xl font-bold transition-colors duration-300 tracking-tight ${isSelected ? 'text-[var(--q-accent-bold)]' : 'text-[var(--q-text)] group-hover:text-[var(--q-accent)]'}`}>
                        {item.name}
                      </h3>
                    </div>
                    {item.arabicName && (
                      <span className="font-arabic text-2xl md:text-3xl text-[var(--q-accent-bold)] opacity-80" style={{ fontFamily: '"Amiri", serif' }}>
                        {item.arabicName}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-semibold text-[var(--q-text-muted)] mb-3 relative z-10">{item.title}</h4>
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden relative z-10"
                      >
                        <div className="pt-4 border-t border-[var(--q-border)] mt-2">
                          <p className="text-[14px] text-[var(--q-text-subtle)] leading-relaxed mb-5 font-medium">
                            {item.description}
                          </p>
                          
                          <div className="mb-3 text-[10px] font-bold text-[var(--q-text-muted)] uppercase tracking-[0.15em]">
                            Key Surahs
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {item.surahs.map(surah => (
                              <Link 
                                key={surah.id} 
                                href={`/quran/${surah.id}`}
                                className="flex items-center text-xs font-semibold bg-[var(--q-bg)] border border-[var(--q-border)] text-[var(--q-text)] px-3.5 py-2 rounded-xl hover:bg-[var(--q-accent)] hover:text-white hover:border-[var(--q-accent)] transition-all duration-300 shadow-sm hover:shadow-md"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="opacity-60 mr-1.5">{surah.id}.</span> 
                                <span>{surah.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Expand Hint */}
                  <div className="mt-4 text-center relative z-10">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-[var(--q-accent)]/10 text-[var(--q-accent)]' : 'bg-transparent text-[var(--q-text-muted)] group-hover:bg-[var(--q-border)]'}`}>
                      <svg 
                        className={`w-4 h-4 transition-transform duration-500 ${isSelected ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
