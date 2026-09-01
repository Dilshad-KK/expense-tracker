'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, ArrowLeft, Play } from 'lucide-react';
import { useQuran } from '../QuranContext';
import { getVersesData } from '@/src/app/actions/quran';
import QuranBottomNav from '@/components/quran/QuranBottomNav';

export default function CollectionsClient({ allSurahs }: { allSurahs: any[] }) {
  const { savedVerses, toggleSavedVerse, arabicFont, arabicFontSize, translationFontSize, playVerse } = useQuran();
  const [verseData, setVerseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (savedVerses.length > 0) {
        const data = await getVersesData(savedVerses);
        // Sort by timestamp descending
        const sortedData = data.sort((a, b) => {
          const aSave = savedVerses.find(v => v.surahId === a.surahId && v.verseId === a.verseId);
          const bSave = savedVerses.find(v => v.surahId === b.surahId && v.verseId === b.verseId);
          return (bSave?.timestamp || 0) - (aSave?.timestamp || 0);
        });
        setVerseData(sortedData);
      } else {
        setVerseData([]);
      }
      setLoading(false);
    }
    loadData();
  }, [savedVerses]);

  return (
    <div className="w-full min-h-[100dvh] flex flex-col bg-[var(--q-bg)] text-[var(--q-text)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[var(--q-bg)]/95 backdrop-blur-md z-40 border-b border-[var(--q-border)]">
        <Link href="/quran" className="text-[var(--q-text)] hover:text-[var(--q-accent)] transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold text-[var(--q-text)] tracking-wide flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-[var(--q-accent-bold)]" /> My Collection
        </h1>
        <div className="w-6 h-6"></div> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-3xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : verseData.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center opacity-70">
              <Bookmark className="w-16 h-16 mb-4 text-[var(--q-accent)]" strokeWidth={1} />
              <h2 className="text-xl font-bold mb-2">No bookmarks saved yet</h2>
              <p className="text-sm">Read the Quran and tap the bookmark icon on any verse to keep it in this saved collection.</p>
              <Link href="/quran" className="mt-8 bg-[var(--q-accent-bold)] hover:bg-indigo-700 text-[var(--q-text)] font-bold py-2 px-6 rounded-full transition-colors">
                Read Quran
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {verseData.map((verse, idx) => (
                <div key={`${verse.surahId}-${verse.verseId}`} className="bg-gradient-to-br from-[var(--q-card)] to-[var(--q-bg)] rounded-3xl p-5 shadow-lg border border-[var(--q-border)] relative group">
                  <div className="flex items-center justify-between mb-4">
                    <Link href={`/quran/${verse.surahId}#verse-${verse.verseId}`} className="bg-[var(--q-border)] hover:bg-white/20 transition-colors px-3 py-1.5 rounded-full text-xs font-bold text-[var(--q-accent)] flex items-center gap-2">
                      {verse.surahName} {verse.surahId}:{verse.verseId}
                    </Link>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => playVerse(verse.surahId, verse.verseId, 1000)}
                        className="p-2 text-[var(--q-accent)] hover:text-[var(--q-text)] hover:bg-[var(--q-accent-bold)] rounded-full transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => toggleSavedVerse(verse.surahId, verse.verseId)}
                        className="p-2 text-[#d97706] hover:text-[var(--q-text)] hover:bg-red-500 rounded-full transition-colors"
                      >
                        <Bookmark className="w-4 h-4" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right mb-4">
                    <p 
                      className="leading-loose font-arabic text-[var(--q-text)]" 
                      style={{ 
                        fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif',
                        lineHeight: '2',
                        fontSize: `${Math.min(arabicFontSize, 32)}px`
                      }}
                      dir="rtl"
                    >
                      {verse.arabic}
                    </p>
                  </div>
                  
                  <p 
                    className="text-[var(--q-text-muted)] leading-relaxed font-medium"
                    style={{ fontSize: `${Math.min(translationFontSize, 18)}px` }}
                  >
                    {verse.malayalam}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <QuranBottomNav />
    </div>
  );
}
