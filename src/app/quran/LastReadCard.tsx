'use client';

import Link from 'next/link';
import { useQuran } from './QuranContext';
import { surahNamesArabic } from '@/data/quran/arabicNames';

export default function LastReadCard() {
  const { lastRead } = useQuran();

  if (!lastRead) return null;

  return (
    <Link href={`/quran/${lastRead.surahId}`}>
      <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--q-card)] to-[var(--q-card-hover)] p-6 mb-8 shadow-lg border border-[var(--q-border)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[var(--q-accent)]">
        {/* Background Decorative Elements */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--q-accent-bold)] opacity-10 blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[var(--q-accent)] opacity-10 blur-2xl transition-transform duration-700 group-hover:scale-110"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex flex-col space-y-4">
            {/* Tag */}
            <div className="flex items-center space-x-2 text-[var(--q-accent)] font-semibold text-xs tracking-widest uppercase bg-[var(--q-accent)]/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm border border-[var(--q-accent)]/20">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Continue Reading</span>
            </div>
            
            {/* Surah Name & Arabic */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-[var(--q-text)] tracking-tight group-hover:text-[var(--q-accent-bold)] transition-colors">
                  {lastRead.surahName}
                </h2>
                <span className="font-arabic text-3xl text-[var(--q-text)] opacity-80 group-hover:text-[var(--q-accent)] transition-colors mt-1">
                  {surahNamesArabic[lastRead.surahId]}
                </span>
              </div>
              
              <div className="flex items-center space-x-2.5 text-sm font-medium text-[var(--q-text)] opacity-70">
                <span className="bg-[var(--q-card-hover)] px-2.5 py-1 rounded-md border border-[var(--q-border)] shadow-sm">Surah {lastRead.surahId}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--q-accent)] opacity-60"></span>
                <span className="bg-[var(--q-card-hover)] px-2.5 py-1 rounded-md border border-[var(--q-border)] shadow-sm">Ayah {lastRead.verseId}</span>
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[var(--q-accent)] text-white shadow-lg shadow-[var(--q-accent)]/30 overflow-hidden group-hover:shadow-[var(--q-accent)]/50 group-hover:scale-105 transition-all duration-300 shrink-0 ml-4">
             <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
             <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
             </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
