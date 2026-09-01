'use client';

import Link from 'next/link';
import { useQuran } from './QuranContext';
import { surahNamesArabic } from '@/data/quran/arabicNames';

export default function LastReadCard() {
  const { lastRead } = useQuran();

  if (!lastRead) return null;

  return (
    <Link href={`/quran/${lastRead.surahId}`}>
      <div className="bg-[var(--q-card)] rounded-3xl p-5 mb-6 shadow-xl border border-[var(--q-border)] relative overflow-hidden flex items-center justify-between group">
        <div className="absolute right-0 top-0 h-full w-32 bg-[var(--q-accent-bold)]/10 rounded-l-full blur-xl group-hover:bg-[var(--q-accent-bold)]/20 transition-colors"></div>
        
        <div className="relative z-10 flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-[var(--q-accent)] text-xs font-semibold uppercase tracking-wider mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex items-center gap-1.5 flex-wrap">
              Last Read: 
              <span className="font-arabic text-lg leading-none ml-1 pt-1.5">{surahNamesArabic[lastRead.surahId]}</span>
              <strong className="tracking-normal normal-case text-[13px] opacity-80">{lastRead.surahName}</strong>
            </span>
          </div>
          
          <div className="flex space-x-3 text-[var(--q-text)] text-xs font-medium">
             <span>Surah {lastRead.surahId}</span>
             <span className="text-[var(--q-accent-bold)]">|</span>
             <span>Ayah {lastRead.verseId}</span>
          </div>
        </div>
        
        <div className="relative z-10 w-10 h-10 bg-[var(--q-card-hover)] rounded-full flex items-center justify-center text-[var(--q-text)] shadow-md cursor-pointer group-hover:bg-[var(--q-accent-bold)] transition-colors shrink-0">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </div>
      </div>
    </Link>
  );
}
