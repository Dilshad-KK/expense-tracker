'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Play, Pause, Download, AlertTriangle, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuran } from '../QuranContext';
import { surahNamesArabic } from '@/data/quran/arabicNames';

interface Verse {
  id: number;
  arabic: string;
  malayalam: string;
}

interface SurahData {
  id: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  verses: Verse[];
}

type ReadingMode = 'translation' | 'quran' | 'audio';

const toArabicNumeral = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

export default function QuranReaderClient({ surah, allSurahs = [] }: { surah: SurahData, allSurahs?: any[] }) {
  const {
    arabicFontSize,
    translationFontSize,
    playbackSpeed,
    setPlaybackSpeed,
    arabicFont,
    mushafViewMode,
    showWordByWord,
    setLastRead,
    toggleSavedVerse,
    isVerseSaved,
    audioRef,
    isPlaying,
    setIsPlaying,
    activeSurahId,
    activeVerseId,
    setActiveVerseId,
    isContinuousPlay,
    setIsContinuousPlay,
    loopsRemaining,
    setLoopsRemaining,
    verseLoopConfig,
    playVerse,
    pauseAudio,
    stopAudio,
    setLoopCount
  } = useQuran();

  const [readingMode, setReadingMode] = useState<ReadingMode>('translation');
  const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());
  
  const [showLoopMenuFor, setShowLoopMenuFor] = useState<number | null>(null);

  // Audio Mode States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  const getFullSurahAudioUrl = (surahId: number) => {
    const paddedId = String(surahId).padStart(3, '0');
    return `https://server8.mp3quran.net/afs/${paddedId}.mp3`;
  };

  const handleDownload = async (surahId: number, surahName: string) => {
    if (downloadingIds.has(surahId)) return;
    
    setDownloadingIds(prev => new Set(prev).add(surahId));
    setToastMessage(`Starting download for ${surahName}...`);
    
    try {
      const url = getFullSurahAudioUrl(surahId);
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${surahName}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      
      setToastMessage(`${surahName} downloaded successfully!`);
    } catch (error) {
      setToastMessage(`Failed to download ${surahName}. Please try again.`);
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(surahId);
        return next;
      });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const togglePlay = (surahId: number) => {
    if (activeSurahId === surahId) {
      if (isPlaying) pauseAudio();
      else {
        if (audioRef.current) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }
    } else {
      playFullSurah(surahId);
    }
  };

  useEffect(() => {
    // Update last read when surah is opened
    setLastRead({
      surahId: surah.id,
      surahName: surah.englishName,
      surahNameArabic: surah.name,
      verseId: activeVerseId || 1
    });
  }, [surah, activeVerseId, setLastRead]);

  const toggleReveal = (verseId: number) => {
    setRevealedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(verseId)) next.delete(verseId);
      else next.add(verseId);
      return next;
    });
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (activeVerseId === null || activeSurahId !== surah.id) {
        playVerse(surah.id, 1, surah.verses.length, isContinuousPlay);
      } else {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.error("Resume failed", e));
          setIsPlaying(true);
        }
      }
    }
  };

  const handlePlayAudioClicked = (verseId: number) => {
    if (activeVerseId === verseId && activeSurahId === surah.id) {
      togglePlayPause();
    } else {
      playVerse(surah.id, verseId, surah.verses.length, false);
    }
  };
  
  const playFullSurah = (surahId: number = surah.id) => {
    const targetSurah = allSurahs.find(s => s.id === surahId) || surah;
    playVerse(surahId, 1, targetSurah.versesCount || targetSurah.verses.length, true);
  };

  const handleSetLoopCount = (verseId: number, count: number) => {
    setLoopCount(verseId, count);
    setShowLoopMenuFor(null);
    if (activeVerseId === verseId) {
        setLoopsRemaining(count);
    }
  };

  // Scroll to active verse automatically
  useEffect(() => {
    if (isPlaying && activeVerseId !== null && activeSurahId === surah.id) {
      setTimeout(() => {
        const el = document.getElementById(`verse-${activeVerseId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [activeVerseId, activeSurahId, isPlaying, surah.id]);
  
  const isMushafMode = readingMode === 'quran';
  const isAudioMode = readingMode === 'audio';

  // Group verses by page
  const pages = useMemo(() => {
    const groups: { [key: number]: any[] } = {};
    surah.verses.forEach(v => {
      // @ts-ignore
      const p = v.page || 0;
      if (!groups[p]) groups[p] = [];
      groups[p].push(v);
    });
    
    return Object.keys(groups).map(Number).sort((a, b) => a - b).map(p => ({
      page: p,
      verses: groups[p]
    }));
  }, [isMushafMode, surah.verses]);

  const [currentPage, setCurrentPage] = useState<number>(0); // index into pages array

  // Reference to the scrollable mushaf container
  const mushafScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to a page by index
  const goToPageIndex = (index: number) => {
    const pageData = pages[index];
    if (pageData) {
      const el = document.getElementById(`mushaf-page-${pageData.page}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    }
  };

  const goToPage = (pageNumber: number) => {
    const index = pages.findIndex(p => p.page === pageNumber);
    if (index !== -1) goToPageIndex(index);
  };

  // Keep currentPage in sync as the user scrolls/swipes
  useEffect(() => {
    const container = mushafScrollRef.current;
    if (!container || mushafViewMode !== 'swipable') return;

    const onScroll = () => {
      const pageWidth = container.clientWidth;
      if (pageWidth === 0) return;
      const index = Math.round(container.scrollLeft / pageWidth);
      const clamped = Math.max(0, Math.min(index, pages.length - 1));
      setCurrentPage(clamped);
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [mushafViewMode, pages.length]);

  const handleNextPage = () => {
    setCurrentPage(prev => {
      const next = Math.min(prev + 1, pages.length - 1);
      goToPageIndex(next);
      return next;
    });
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => {
      const prevIdx = Math.max(0, prev - 1);
      goToPageIndex(prevIdx);
      return prevIdx;
    });
  };

  return (
    <div className={`w-full h-[100dvh] overflow-hidden flex flex-col relative transition-colors duration-500 bg-[var(--q-bg)]`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-4 right-4 z-50 bg-[var(--q-accent-bold)] text-[var(--q-text)] px-4 py-3 rounded-lg shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 transition-colors duration-500 shadow-sm bg-[var(--q-bg)]/90 backdrop-blur-md border-b border-[var(--q-border)]`}>
        <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/quran" className={`flex items-center transition-colors text-[var(--q-text-muted)] hover:text-[var(--q-text)]`}>
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-3xl text-[var(--q-text)] font-arabic leading-none pt-2`}>{surahNamesArabic[surah.id]}</span>
              <span className="text-sm font-bold text-[var(--q-text-muted)] mt-2">
                {surah.englishName}
              </span>
            </div>
          </Link>
          <div className="w-5 h-5"></div>
        </div>
        
        {/* Mode Selector */}
        <div className="max-w-md md:max-w-xl mx-auto px-4 pb-3">
          <div className={`flex p-1 rounded-full bg-[var(--q-card)]/50 border border-[var(--q-border)] shadow-inner`}>
            {[
              { id: 'translation', label: 'Translation' },
              { id: 'quran', label: 'Mushaf' },
              { id: 'tasks', label: 'Tasks', isLink: true, href: `/quran/${surah.id}/tasks` }
            ].map((mode) => (
              mode.isLink ? (
                <Link
                  key={mode.id}
                  href={mode.href!}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-300 text-center text-[var(--q-accent)]/60 hover:text-[var(--q-text)] block flex items-center justify-center`}
                >
                  {mode.label}
                </Link>
              ) : (
                <button
                  key={mode.id}
                  onClick={() => setReadingMode(mode.id as ReadingMode)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-300 ${
                    readingMode === mode.id
                      ? 'bg-[var(--q-text)] text-[var(--q-bg)] shadow-md'
                      : 'text-[var(--q-text-muted)] hover:text-[var(--q-text)]'
                  }`}
                >
                  {mode.label}
                </button>
              )
            ))}
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col w-full relative ${isMushafMode && mushafViewMode === 'swipable' ? 'overflow-hidden' : 'overflow-y-auto px-4 py-4 pb-32'}`}>
        <div className={`max-w-7xl w-full mx-auto ${isMushafMode && mushafViewMode === 'swipable' ? 'flex-1 flex flex-col min-h-0' : 'w-full'}`}>
          
          {isAudioMode && (
            <div className="divide-y divide-white/5">
              {allSurahs.map((s: any) => {
                const isActive = activeSurahId === s.id;
                return (
                  <div key={s.id} className="flex items-center justify-between py-4 group gap-2">
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                      <div className={`shrink-0 relative w-10 h-10 flex items-center justify-center transition-colors ${isActive ? 'text-[var(--q-accent-bold)]' : 'text-[var(--q-accent)]'}`}>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                          <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" />
                        </svg>
                        <span className="text-sm font-bold">{s.id}</span>
                      </div>
                      
                      <div className="flex flex-col flex-1 min-w-0">
                        <h3 className={`text-xl md:text-2xl font-bold transition-colors font-arabic leading-tight pt-1 ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text)]'}`}>
                          {surahNamesArabic[s.id]}
                        </h3>
                        <span className={`text-[13px] md:text-sm font-bold mt-1 leading-snug truncate ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text-muted)]'}`}>
                          {s.englishName}
                        </span>
                        <div className="flex items-center text-[11px] md:text-xs text-[var(--q-accent)] font-medium space-x-1 mt-1">
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{s.versesCount} verses</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 md:space-x-3 shrink-0 z-10 relative">
                      <button 
                        onClick={() => {
                          const speeds = [0.5, 1, 1.25, 1.5, 2];
                          const currentIndex = speeds.indexOf(playbackSpeed);
                          const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                          setPlaybackSpeed(nextSpeed);
                          if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
                        }}
                        className="w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold text-[var(--q-text)] hover:bg-[var(--q-border)] transition-colors"
                      >
                        {playbackSpeed}x
                      </button>
                      <button 
                        onClick={() => togglePlay(s.id)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isActive && isPlaying 
                            ? 'bg-[var(--q-accent-bold)] border-indigo-500 text-[var(--q-text)] shadow-lg shadow-indigo-500/30' 
                            : 'border-white/20 text-[var(--q-text)] hover:bg-[var(--q-border)]'
                        }`}
                      >
                        {isActive && isPlaying ? (
                          <Pause className="w-4 h-4" fill="currentColor" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleDownload(s.id, s.englishName)}
                        disabled={downloadingIds.has(s.id)}
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1c234a] hover:bg-indigo-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloadingIds.has(s.id) ? (
                          <svg className="animate-spin h-5 w-5 text-[#1c234a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <Download className="w-4 h-4" strokeWidth={3} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Header Card */}
          {!isMushafMode && !isAudioMode && (
            <div className="bg-gradient-to-br from-[var(--q-card)] to-[var(--q-bg)] rounded-3xl p-4 text-center text-[var(--q-text)] shadow-xl shadow-[var(--q-bg)]/20 relative overflow-hidden mb-4">
               {/* Subtle decorative crescent — much smaller and properly positioned */}
               <div className="absolute top-3 right-4 opacity-[0.07] pointer-events-none" aria-hidden="true">
                 <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                 </svg>
               </div>
               
               <div className="relative z-10">
                 <h2 className="text-4xl font-bold mb-2 font-arabic leading-relaxed">{surahNamesArabic[surah.id]}</h2>
                 <p className="text-[var(--q-accent)] text-lg font-bold mb-4 opacity-90">{surah.englishName}</p>
                 
                 <div className="flex items-center justify-center text-[10px] font-semibold uppercase tracking-widest text-[var(--q-text-muted)] mb-3 border-b border-[var(--q-border)] pb-2 w-3/4 mx-auto">
                   <span>{surah.revelationType === 'Meccan' ? 'MECCAN' : 'MEDINIAN'}</span>
                   <span className="w-1 h-1 rounded-full bg-[var(--q-accent)] mx-2"></span>
                   <span>{surah.verses.length} VERSES</span>
                 </div>
                 
                 {/* Play Full Surah Button */}
                 {!isPlaying && activeVerseId === null && surah.verses.length > 0 && (
                   <div className="flex justify-center items-center mb-3">
                     <button 
                       onClick={() => playFullSurah(surah.id)}
                       className="mx-auto flex items-center justify-center gap-2 bg-[var(--q-card)] hover:bg-[var(--q-card-hover)] transition-colors text-[var(--q-text)] py-2.5 px-6 rounded-full font-medium shadow-sm backdrop-blur-sm group/btn border border-[var(--q-border)]"
                     >
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                       <span>Listen to Surah</span>
                     </button>
                   </div>
                 )}
                 
                 {surah.id !== 9 && (
                    <h2 className="font-arabic pb-2 pt-1 text-[var(--q-text)]" style={{ fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif', fontSize: `min(${arabicFontSize * 1.3}px, 4.5dvh)`, lineHeight: '1.4' }}>
                      بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                    </h2>
                  )}
               </div>
            </div>
          )}

          {/* Verses List / Mushaf View */}
          {!isAudioMode && (
            isMushafMode ? (
            <div 
              ref={mushafScrollRef}
              className={mushafViewMode === 'swipable'
                ? "flex flex-1 min-h-0 overflow-x-auto snap-x snap-mandatory w-full"
                : "max-w-3xl mx-auto w-full px-4"}
              style={mushafViewMode === 'swipable' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
            >
              {pages.map((pageData, index) => (
                <div 
                  id={`mushaf-page-${pageData.page}`}
                  data-page={pageData.page}
                  key={pageData.page} 
                  className={mushafViewMode === 'swipable'
                    ? "no-scrollbar min-w-full w-full h-full overflow-y-auto shrink-0 snap-start px-4 pt-4 pb-[calc(8rem+env(safe-area-inset-bottom))]"
                    : "mb-8"}
                >
                  <div className="max-w-3xl mx-auto w-full">
                    {/* Mushaf Mode Bismillah (First Page Only) */}
                    {index === 0 && surah.id !== 9 && (
                       <div className="text-center pb-4 border-b border-[var(--q-border)] mb-4">
                          <h2 className="font-arabic text-[var(--q-text)]" style={{ fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif', fontSize: mushafViewMode === 'swipable' ? `min(${arabicFontSize * 1.5}px, 5dvh)` : '2.25rem', lineHeight: mushafViewMode === 'swipable' ? '2.1' : '2.5' }}>
                            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
                          </h2>
                       </div>
                    )}
                    <div 
                      className="text-right"
                      style={{ direction: 'rtl', lineHeight: mushafViewMode === 'swipable' ? '2.1' : '2.5' }}
                  >
                    {pageData.verses.map((verse: any) => {
                      const isActive = activeVerseId === verse.id;
                      return (
                         <span 
                            id={`verse-${verse.id}`}
                            key={verse.id}
                            className={`inline transition-all cursor-pointer leading-loose ${isActive ? 'text-[var(--q-accent)] bg-[var(--q-card-hover)]/40 rounded-lg px-1' : 'text-[var(--q-text)] hover:text-[var(--q-accent)]'}`}
                            onClick={() => handlePlayAudioClicked(verse.id)}
                         >
                            <span
                              className="font-arabic"
                              style={{ 
                                fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif',
                                fontSize: mushafViewMode === 'swipable' ? `min(${arabicFontSize}px, 3.8dvh)` : `${arabicFontSize}px`,
                                lineHeight: mushafViewMode === 'swipable' ? '2.1' : '2.5',
                                wordSpacing: '0.15em'
                              }}
                            >
                               {verse.arabic}
                            </span>
                            <span className="inline-flex items-center justify-center mx-2 text-[var(--q-accent)] relative align-middle" style={{ width: Math.max(30, arabicFontSize * 1.2) + 'px', height: Math.max(30, arabicFontSize * 1.2) + 'px' }}>
                              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                                <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                                <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="1" />
                              </svg>
                              <span style={{ fontSize: `${Math.max(10, arabicFontSize * 0.4)}px` }} className="font-bold translate-y-[2px]">{toArabicNumeral(verse.id)}</span>
                            </span>
                            {' '}
                         </span>
                      );
                    })}
                  </div>
                  
                  {/* Page Separator */}
                  {mushafViewMode !== 'swipable' && (
                    <div className="flex items-center justify-center text-[var(--q-accent)]/50 mt-8 mb-4">
                       <div className="h-px bg-[var(--q-border)] flex-1"></div>
                       <span className="px-4 text-xs font-semibold">{pageData.page}</span>
                       <div className="h-px bg-[var(--q-border)] flex-1"></div>
                    </div>
                  )}
                  
                  {/* Extra spacer at the bottom to allow scrolling past the fixed navigator */}
                  {mushafViewMode === 'swipable' && (
                     <div className="h-32 w-full shrink-0"></div>
                  )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div 
              className="max-w-3xl mx-auto w-full px-2"
              dir="ltr"
            >
              {pages.map((pageData, index) => (
                <div 
                  id={`mushaf-page-${pageData.page}`}
                  data-page={pageData.page}
                  key={pageData.page} 
                  className="mb-8"
                >
                  <div className="max-w-3xl mx-auto w-full">
                    <div className="divide-y divide-white/10">
                      {pageData.verses.map((verse: any, vIndex: number) => {
                  const isActive = activeVerseId === verse.id;

                  const animationProps = {};

                  return (
                <motion.div 
                  {...animationProps as any}
                  id={`verse-${verse.id}`}
                  key={`verse-${verse.id}`} 
                  className={`py-6`}
                >
                  <>
                    <div className="flex items-center justify-between mb-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          isActive ? 'bg-[var(--q-accent)] text-[var(--q-bg)] shadow-md scale-110' : 'bg-[var(--q-card)] text-[var(--q-text-muted)]'
                        }`}>
                          {verse.id}
                        </div>
                        
                        <div className="flex items-center space-x-2 text-[var(--q-text-subtle)]">
                          <div className="relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSavedVerse(surah.id, verse.id); }}
                              className={`p-2 transition-colors rounded-full ${isVerseSaved(surah.id, verse.id) ? 'text-[#d97706] bg-[#d97706]/10' : 'hover:text-[var(--q-accent)] hover:bg-[var(--q-card-hover)]'}`}
                            >
                              <Bookmark className="w-5 h-5" fill={isVerseSaved(surah.id, verse.id) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                          
                          <div className="relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setShowLoopMenuFor(showLoopMenuFor === verse.id ? null : verse.id); }}
                              className={`p-2 transition-colors rounded-full ${verseLoopConfig[verse.id] > 0 ? 'text-[var(--q-accent)] bg-[var(--q-card-hover)]' : 'hover:text-[var(--q-accent)] hover:bg-[var(--q-card-hover)]'}`}
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {verseLoopConfig[verse.id] > 0 && <span className="absolute -top-1 -right-1 bg-[var(--q-accent-bold)] text-[var(--q-text)] text-[9px] font-bold px-1.5 py-0.5 rounded-full">{verseLoopConfig[verse.id] === Infinity ? '∞' : verseLoopConfig[verse.id]}</span>}
                            </button>
                            
                            {showLoopMenuFor === verse.id && (
                              <div className="absolute right-0 top-full mt-2 bg-[var(--q-bg)] rounded-xl shadow-xl border border-[var(--q-border)] p-2 z-50 flex flex-col w-32">
                                <span className="text-xs font-semibold text-[var(--q-text-subtle)] mb-2 px-2">Repeat</span>
                                {[
                                  { label: 'None', val: 0 },
                                  { label: '3 Times', val: 3 },
                                  { label: '5 Times', val: 5 },
                                  { label: 'Infinite', val: Infinity }
                                ].map(opt => (
                                  <button 
                                    key={opt.label}
                                    onClick={(e) => { e.stopPropagation(); handleSetLoopCount(verse.id, opt.val); }}
                                    className={`text-left px-3 py-2 text-sm rounded-lg font-medium transition-colors ${verseLoopConfig[verse.id] === opt.val ? 'bg-[var(--q-card-hover)] text-[var(--q-accent)]' : 'text-[var(--q-text-muted)] hover:bg-[var(--q-card)]'}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayAudioClicked(verse.id);
                            }}
                            className={`p-2 transition-all rounded-full ${isActive ? 'text-[var(--q-bg)] bg-[var(--q-accent)] shadow-md scale-110' : 'text-[var(--q-text-muted)] hover:text-[var(--q-accent)] hover:bg-[var(--q-card-hover)]'}`}
                          >
                            {isActive && isPlaying ? (
                              <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-4 relative">
                        <div className={`text-right transition-all duration-500 break-words ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text)]'}`}>
                          {showWordByWord && verse.words && verse.words.length > 0 ? (
                            <div className="flex flex-wrap flex-row-reverse gap-x-6 gap-y-8 justify-start" dir="rtl">
                              {verse.words.map((word: any, i: number) => (
                                <div key={i} className="flex flex-col items-center justify-start group cursor-pointer rounded-xl p-2 -m-2 hover:bg-[var(--q-card-hover)]/30 transition-colors">
                                  <span 
                                    className="font-arabic transition-colors group-hover:text-[var(--q-accent)]"
                                    style={{ 
                                      fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif',
                                      fontSize: `${arabicFontSize * 1.2}px`,
                                      lineHeight: '1.8'
                                    }}
                                  >
                                    {word.text_uthmani}
                                  </span>
                                  {word.translation && word.translation.text && (
                                    <span className="text-[13px] text-[var(--q-text-subtle)] mt-2 text-center leading-tight group-hover:text-[var(--q-accent)] transition-colors font-medium max-w-[120px]">
                                      {word.translation.text}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p 
                              className="leading-loose font-arabic transition-all" 
                              style={{ 
                                fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif',
                                lineHeight: '2',
                                fontSize: `${arabicFontSize}px`
                              }}
                              dir="rtl"
                            >
                              {verse.arabic}
                            </p>
                          )}
                        </div>

                        <div className={`transition-all duration-500 opacity-100`}>
                          <p 
                            className="text-[var(--q-text-muted)] leading-relaxed text-left font-medium transition-all break-words"
                            style={{ fontSize: `${translationFontSize}px` }}
                          >
                            {verse.malayalam}
                          </p>
                        </div>
                      </div>
                  </>
                </motion.div>
                  );
                })}
                    </div>
                  </div>
                  {/* Page Separator */}
                  {mushafViewMode !== 'swipable' && (
                    <div className="flex items-center justify-center text-[var(--q-accent)]/50 mt-8 mb-4">
                       <div className="h-px bg-[var(--q-border)] flex-1"></div>
                       <span className="px-4 text-xs font-semibold">{pageData.page}</span>
                       <div className="h-px bg-[var(--q-border)] flex-1"></div>
                    </div>
                  )}
                  
                  {/* Extra spacer at the bottom to allow scrolling past the fixed navigator */}
                  {mushafViewMode === 'swipable' && (
                     <div className="h-32 w-full shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      {/* Toast Notification for Download */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#d97706] text-[var(--q-text)] px-4 py-4 rounded-xl shadow-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
             <p className="text-sm font-bold leading-snug">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Bottom Page Navigator */}
      {isMushafMode && mushafViewMode === 'swipable' && pages.length > 0 && (
        <div className="fixed left-0 right-0 z-40 flex justify-center pointer-events-none" style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}>
          <div className="bg-[var(--q-card)]/90 backdrop-blur-md px-3 py-2 rounded-full border border-[var(--q-border)] flex items-center space-x-4 shadow-xl pointer-events-auto">
            {/* Prev page (← in LTR = earlier pages) */}
            <button
              className="p-2 text-[var(--q-text)] hover:text-[var(--q-accent)] hover:bg-[var(--q-border)] rounded-full transition-colors active:scale-95 disabled:opacity-30"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              aria-label="Previous page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <div className="relative flex items-center bg-[var(--q-border)] rounded-full px-2 py-1">
              <select 
                value={currentPage}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setCurrentPage(idx);
                  goToPageIndex(idx);
                }}
                className="bg-transparent hover:bg-[var(--q-border)] transition-colors text-[var(--q-text)] font-bold text-sm outline-none cursor-pointer appearance-none px-4 py-1 rounded-full pr-8 text-center"
              >
                {pages.map((p, i) => <option key={p.page} value={i} className="bg-[var(--q-bg)] text-[var(--q-text)]">Page {p.page}</option>)}
              </select>
              <svg className="w-4 h-4 text-[var(--q-text)]/70 absolute right-2.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </div>

            {/* Next page */}
            <button
              className="p-2 text-[var(--q-text)] hover:text-[var(--q-accent)] hover:bg-[var(--q-border)] rounded-full transition-colors active:scale-95 disabled:opacity-30"
              onClick={handleNextPage}
              disabled={currentPage === pages.length - 1}
              aria-label="Next page"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
