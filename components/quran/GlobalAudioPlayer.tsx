'use client';

import { useEffect } from 'react';
import { useQuran } from '@/src/app/quran/QuranContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import surahsData from '@/data/quran/index.json';
import { surahNamesArabic } from '@/data/quran/arabicNames';

export default function GlobalAudioPlayer() {
  const pathname = usePathname() || "";
  const { 
    audioRef, 
    activeSurahId,
    activeVerseId, 
    isContinuousPlay, 
    loopsRemaining, 
    setLoopsRemaining, 
    totalVersesInSurah, 
    playVerse,
    pauseAudio,
    stopAudio,
    isPlaying,
    setIsPlaying,
    setIsContinuousPlay,
    setActiveVerseId,
    setActiveSurahId,
    verseLoopConfig,
    playFullSurah
  } = useQuran();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => {
        if (!activeSurahId) return;

        if (activeVerseId === null) {
          setIsPlaying(false);
          setActiveSurahId(null);
          return;
        }

        // Handle loop logic
        if (loopsRemaining > 0) {
           setLoopsRemaining(prev => prev === Infinity ? Infinity : prev - 1);
           audioRef.current!.play().catch(console.error);
           return;
        }

        // Handle continuous play logic
        if (isContinuousPlay && activeVerseId < totalVersesInSurah) {
          playVerse(activeSurahId, activeVerseId + 1, totalVersesInSurah, true);
        } else {
          // Playback finished completely
          setActiveVerseId(null);
          setIsPlaying(false);
          setIsContinuousPlay(false);
        }
      };
    }
  }, [activeVerseId, activeSurahId, isContinuousPlay, loopsRemaining, totalVersesInSurah, verseLoopConfig, playVerse, setLoopsRemaining, setIsPlaying, setIsContinuousPlay, setActiveVerseId, audioRef]);

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (audioRef.current && activeSurahId !== null) {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  // Only show the global player when something is actively playing
  const showGlobalPlayer = activeSurahId !== null;
  const activeSurah = activeSurahId ? surahsData.find(s => s.id === activeSurahId) : null;
  
  return (
    <>
      <audio ref={audioRef} />
      
      {/* Global Mini Player UI */}
      <div className={`flex-shrink-0 z-40 w-full transition-all duration-300 overflow-hidden ${showGlobalPlayer ? 'h-14 opacity-100 bg-[var(--q-bg)] border-b border-[var(--q-border)] shadow-md' : 'h-0 opacity-0 border-none'}`}>
        <div className="max-w-md md:max-w-xl mx-auto px-4 h-full flex items-center justify-between">
          <Link href={`/quran/${activeSurahId || 1}`} className="flex items-center space-x-3 flex-1 group">
             <div className={`w-2 h-2 rounded-full ${isPlaying ? 'animate-pulse' : ''} bg-[var(--q-accent)]`}></div>
             <div>
                <div className="flex items-center gap-2 text-[var(--q-text)] group-hover:text-[var(--q-accent)] transition-colors">
                  {activeSurah ? (
                    <>
                      <span className="font-arabic text-xl leading-none pt-1.5">{surahNamesArabic[activeSurah.id]}</span>
                      <span className="text-xs font-bold mt-1.5">
                        {activeSurah.englishName}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-bold">Surah {activeSurahId}</span>
                  )}
                </div>
                <p className="text-[10px] font-medium text-[var(--q-text-subtle)]">
                  {activeVerseId !== null ? `Verse ${activeVerseId} ${isContinuousPlay ? '• Continuous' : ''}` : 'Full Surah Playing'}
                </p>
             </div>
          </Link>
          
          <div className="flex items-center space-x-4">
             <button onClick={togglePlayPause} className="transition-colors p-1 rounded-full shadow-sm bg-[var(--q-card)] text-[var(--q-text)] hover:bg-[var(--q-card-hover)]">
               {isPlaying ? (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
               ) : (
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
               )}
             </button>
             
             <button onClick={stopAudio} className="transition-colors p-1 text-[var(--q-text-subtle)] hover:text-red-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z" /></svg>
             </button>
          </div>
        </div>
      </div>
    </>
  );
}
