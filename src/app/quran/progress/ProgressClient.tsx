'use client';

import { useQuran } from '../QuranContext';
import Link from 'next/link';

interface Surah {
  id: number;
  name: string;
  englishName: string;
  versesCount: number;
}

export default function ProgressClient({ surahs }: { surahs: Surah[] }) {
  const { memorizationProgress } = useQuran();

  const totalVerses = 6236;
  let memorizedCount = 0;
  let learningCount = 0;

  const surahProgress = surahs.map(surah => {
    const progress = memorizationProgress[surah.id] || {};
    let sMem = 0;
    let sLearn = 0;
    
    for (const v in progress) {
      if (progress[v] === 'memorized') {
        sMem++;
        memorizedCount++;
      } else if (progress[v] === 'learning') {
        sLearn++;
        learningCount++;
      }
    }
    
    return {
      ...surah,
      memorized: sMem,
      learning: sLearn,
      unmarked: surah.versesCount - sMem - sLearn
    };
  });

  return (
    <div className="w-full min-h-[100dvh] bg-[var(--q-bg)] text-[var(--q-text)] overflow-y-auto pb-32 relative">
      <header className="px-6 py-6 sticky top-0 bg-[var(--q-bg)]/95 backdrop-blur-md z-40 border-b border-[var(--q-border)]">
        <div className="flex items-center justify-between mb-4">
          <Link href="/quran" className="text-[var(--q-text-subtle)] hover:text-[var(--q-text)] transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-[var(--q-text)]">Memorization Tracker</h1>
          <div className="w-6"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-[var(--q-card)] rounded-2xl p-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <p className="text-[var(--q-text-subtle)] text-xs font-semibold uppercase tracking-wider mb-1">Memorized</p>
            <p className="text-3xl font-bold text-emerald-400">{memorizedCount}</p>
            <p className="text-xs text-emerald-400/60 mt-1">Verses</p>
          </div>
          <div className="bg-[var(--q-card)] rounded-2xl p-4 border border-amber-500/20 shadow-lg shadow-amber-500/10">
            <p className="text-[var(--q-text-subtle)] text-xs font-semibold uppercase tracking-wider mb-1">Learning</p>
            <p className="text-3xl font-bold text-amber-400">{learningCount}</p>
            <p className="text-xs text-amber-400/60 mt-1">Verses</p>
          </div>
        </div>
        
        <div className="mt-6 bg-[var(--q-card)] rounded-full h-2 overflow-hidden flex">
          <div style={{ width: `${(memorizedCount / totalVerses) * 100}%` }} className="h-full bg-emerald-500"></div>
          <div style={{ width: `${(learningCount / totalVerses) * 100}%` }} className="h-full bg-amber-500"></div>
        </div>
        <p className="text-center text-xs text-[var(--q-text-subtle)] mt-2 font-medium">Overall Progress: {((memorizedCount / totalVerses) * 100).toFixed(1)}%</p>
      </header>

      <div className="min-h-[calc(100dvh-200px)] px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {surahProgress.filter(s => s.memorized > 0 || s.learning > 0).length === 0 && (
           <div className="text-center text-[var(--q-text-subtle)] py-12">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <p>You haven't tracked any verses yet.</p>
              <p className="text-sm mt-2 opacity-60">Open a Surah, switch to Tasks, and mark verses as Learning or Memorized to see progress here.</p>
           </div>
        )}

        {surahProgress.filter(s => s.memorized > 0 || s.learning > 0).map(surah => (
          <Link href={`/quran/${surah.id}`} key={surah.id} className="block bg-[var(--q-card)]/50 hover:bg-[var(--q-card)] transition-colors rounded-2xl p-4 border border-[var(--q-border)]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-[var(--q-text)] text-lg">{surah.id}. {surah.englishName}</h3>
              <span className="text-xs font-bold text-[var(--q-text-subtle)]">{Math.round((surah.memorized / surah.versesCount) * 100)}%</span>
            </div>
            
            <div className="flex w-full h-1.5 rounded-full overflow-hidden bg-black/30">
              <div style={{ width: `${(surah.memorized / surah.versesCount) * 100}%` }} className="h-full bg-emerald-500"></div>
              <div style={{ width: `${(surah.learning / surah.versesCount) * 100}%` }} className="h-full bg-amber-500"></div>
            </div>
            
            <div className="flex gap-4 mt-3 text-xs font-medium">
               {surah.memorized > 0 && <span className="text-emerald-400">{surah.memorized} Memorized</span>}
               {surah.learning > 0 && <span className="text-amber-400">{surah.learning} Learning</span>}
               {surah.unmarked > 0 && <span className="text-slate-500">{surah.unmarked} Remaining</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
