'use client';

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';

export default function DiscoverHubPage() {
  const categories = [
    {
      id: 'prophets',
      title: 'Stories of the Prophets',
      description: 'Journey through the lives of the Messengers, from Adam to Muhammad ﷺ.',
      href: '/quran/discover/prophets',
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      id: 'miracles',
      title: 'Miracles of the Quran',
      description: 'Explore the profound scientific and historical truths hidden in the verses.',
      href: '/quran/discover/miracles',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    },
    {
      id: 'parables',
      title: 'Parables & Lessons',
      description: 'Discover beautiful allegories and profound wisdom for daily life.',
      href: '/quran/discover/parables',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemAnim: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col relative transition-colors duration-500 bg-[var(--q-bg)] pb-24 overflow-x-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-40 right-1/4 w-72 h-72 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none -z-10 mix-blend-multiply dark:mix-blend-screen" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--q-bg)]/80 backdrop-blur-xl border-b border-[var(--q-border)] shadow-sm">
        <div className="max-w-md md:max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--q-text)] to-[var(--q-text-muted)] tracking-tight">Discover</h1>
            <p className="text-[11px] font-bold text-[var(--q-accent)] mt-1 uppercase tracking-[0.2em]">Educational Hub</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-8">
        
        {/* Premium Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 px-2 relative"
        >
          <div className="absolute -left-4 top-0 w-1 h-12 bg-gradient-to-b from-[var(--q-accent-bold)] to-transparent rounded-r-full" />
          <h2 className="text-4xl font-extrabold text-[var(--q-text)] mb-3 tracking-tight">Explore the Quran</h2>
          <p className="text-[var(--q-text-muted)] text-base font-medium leading-relaxed max-w-md">
            Dive deeper into the endless oceans of knowledge, history, and wisdom found within the Book of Allah.
          </p>
        </motion.div>

        {/* Bento Grid layout on md+, stacked on mobile */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {categories.map((category, index) => (
            <motion.div 
              key={category.id} 
              variants={itemAnim}
              className={index === 0 ? 'md:col-span-2' : 'md:col-span-1'}
            >
              <Link 
                href={category.href}
                className="block h-full bg-gradient-to-br from-[var(--q-card)] to-[var(--q-bg)] border border-[var(--q-border)] rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-[var(--q-border)]/50 hover:shadow-2xl hover:shadow-[var(--q-accent)]/20 hover:border-[var(--q-accent)]/50 transition-all duration-500 active:scale-[0.98] group overflow-hidden relative"
              >
                {/* Subtle Inner Border Glow */}
                <div className="absolute inset-0 rounded-[2rem] border border-white/10 dark:border-white/5 pointer-events-none" />
                
                {/* Deep Background Glow mapped to category color */}
                <div className={`absolute -right-16 -top-16 w-64 h-64 bg-gradient-to-br ${category.color} rounded-full blur-3xl opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 pointer-events-none`} />
                
                <div className={`flex ${index === 0 ? 'flex-col sm:flex-row items-start sm:items-center' : 'flex-col items-start'} gap-6 relative z-10 h-full`}>
                  
                  {/* Glassmorphic Icon Container */}
                  <div className={`shrink-0 w-16 h-16 rounded-2xl ${category.iconBg} ${category.iconColor} flex items-center justify-center shadow-inner backdrop-blur-sm transform group-hover:rotate-6 group-hover:scale-110 transition-transform duration-500 ring-1 ring-white/20 dark:ring-white/10`}>
                    {category.icon}
                  </div>
                  
                  <div className={`flex-1 flex flex-col justify-center ${index === 0 ? '' : 'h-full'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-[var(--q-text)] group-hover:text-[var(--q-accent-bold)] transition-colors tracking-tight">
                        {category.title}
                      </h3>
                      {index !== 0 && (
                        <div className="w-8 h-8 rounded-full bg-[var(--q-card-hover)] flex items-center justify-center text-[var(--q-text-muted)] group-hover:text-[var(--q-accent-bold)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" /></svg>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm sm:text-base text-[var(--q-text-subtle)] leading-relaxed font-medium">
                      {category.description}
                    </p>
                    
                    {index === 0 && (
                      <div className="mt-4 flex items-center text-sm font-bold text-[var(--q-accent)] group-hover:text-[var(--q-accent-bold)] transition-colors">
                        <span>Begin Journey</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
