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
    <div className="w-full min-h-[100dvh] flex flex-col relative transition-colors duration-500 bg-[var(--q-bg)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--q-bg)]/90 backdrop-blur-md border-b border-[var(--q-border)] shadow-sm">
        <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 flex items-center">
          <Link href={backLink} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--q-text)] hover:bg-[var(--q-card-hover)] transition-colors mr-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--q-text)] tracking-tight">{title}</h1>
            <p className="text-[10px] font-bold text-[var(--q-text-subtle)] mt-0.5 uppercase tracking-widest">{subtitle}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md md:max-w-xl mx-auto px-4 py-8">
        
        {/* Intro Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[var(--q-card)] to-[var(--q-bg)] border border-[var(--q-border)] rounded-3xl p-6 shadow-xl mb-10 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--q-accent)]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <h2 className="text-xl font-bold text-[var(--q-text)] mb-2">{title}</h2>
          <p className="text-[var(--q-text-subtle)] text-sm leading-relaxed mb-4">
            {description}
          </p>
          <div className="inline-flex items-center text-xs font-bold text-[var(--q-accent)] bg-[var(--q-card-hover)] px-3 py-1.5 rounded-full shadow-inner">
            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {badgeLabel}
          </div>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative pl-6 md:pl-8">
          {/* Vertical Line */}
          <div className="absolute left-[13px] md:left-[17px] top-4 bottom-10 w-0.5 bg-gradient-to-b from-[var(--q-accent)]/50 via-[var(--q-border)] to-transparent"></div>

          {/* Timeline Nodes */}
          {items.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative mb-10 last:mb-0"
            >
              {/* Node Dot */}
              <div className="absolute -left-[27px] md:-left-[31px] top-1.5 w-6 h-6 rounded-full bg-[var(--q-bg)] border-2 border-[var(--q-accent-bold)] flex items-center justify-center shadow-lg shadow-[var(--q-accent-bold)]/20">
                <div className="w-2 h-2 rounded-full bg-[var(--q-accent-bold)] animate-pulse"></div>
              </div>

              {/* Node Content */}
              <div 
                className="bg-[var(--q-card)] border border-[var(--q-border)] rounded-3xl p-5 shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="text-[10px] font-extrabold text-[var(--q-accent)] uppercase tracking-wider bg-[var(--q-accent)]/10 px-2 py-0.5 rounded-full mb-2 inline-block">
                      {item.period}
                    </span>
                    <h3 className="text-xl font-bold text-[var(--q-text)]">{item.name}</h3>
                  </div>
                  {item.arabicName && (
                    <span className="font-arabic text-2xl text-[var(--q-accent-bold)]" style={{ fontFamily: '"Amiri", serif' }}>
                      {item.arabicName}
                    </span>
                  )}
                </div>
                
                <h4 className="text-sm font-semibold text-[var(--q-text-muted)] mb-3">{item.title}</h4>
                
                <AnimatePresence>
                  {selectedItem === item.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-2 border-t border-[var(--q-border)] mt-2">
                        <p className="text-sm text-[var(--q-text-subtle)] leading-relaxed mb-4">
                          {item.description}
                        </p>
                        
                        <div className="mb-2 text-xs font-bold text-[var(--q-text-muted)] uppercase tracking-wider">
                          Key Surahs
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.surahs.map(surah => (
                            <Link 
                              key={surah.id} 
                              href={`/quran/${surah.id}`}
                              className="text-xs font-semibold bg-[var(--q-bg)] border border-[var(--q-border)] text-[var(--q-text)] px-3 py-1.5 rounded-full hover:bg-[var(--q-accent-bold)] hover:text-white transition-colors shadow-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {surah.id}. {surah.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Expand Hint */}
                <div className="mt-3 text-center">
                  <svg 
                    className={`w-5 h-5 mx-auto text-[var(--q-border)] transition-transform duration-300 ${selectedItem === item.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
