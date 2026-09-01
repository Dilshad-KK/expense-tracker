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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full min-h-[100dvh] flex flex-col relative transition-colors duration-500 bg-[var(--q-bg)] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--q-bg)]/90 backdrop-blur-md border-b border-[var(--q-border)] shadow-sm">
        <div className="max-w-md md:max-w-xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--q-text)] tracking-tight">Discover</h1>
            <p className="text-xs font-medium text-[var(--q-text-subtle)] mt-1 uppercase tracking-widest">Educational Hub</p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md md:max-w-xl mx-auto px-4 py-6">
        
        <div className="mb-8 px-2">
          <h2 className="text-3xl font-bold text-[var(--q-text)] mb-2">Explore the Quran</h2>
          <p className="text-[var(--q-text-muted)] text-sm leading-relaxed">
            Dive deeper into the endless oceans of knowledge, history, and wisdom found within the Book of Allah.
          </p>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-5"
        >
          {categories.map((category) => (
            <motion.div key={category.id} variants={itemAnim}>
              <Link 
                href={category.href}
                className="block bg-[var(--q-card)] border border-[var(--q-border)] rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] group overflow-hidden relative"
              >
                {/* Background Glow */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[var(--q-accent)]/5 rounded-full blur-2xl group-hover:bg-[var(--q-accent)]/10 transition-colors duration-500"></div>
                
                <div className="flex items-center space-x-5 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--q-accent)]/10 flex items-center justify-center text-[var(--q-accent)] shadow-sm transform group-hover:rotate-6 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[var(--q-text)] mb-1 group-hover:text-[var(--q-accent)] transition-colors">{category.title}</h3>
                    <p className="text-sm text-[var(--q-text-subtle)] leading-relaxed line-clamp-2">
                      {category.description}
                    </p>
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
