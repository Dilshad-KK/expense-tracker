'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Play, Pause, Download, AlertTriangle } from 'lucide-react';
import { useQuran } from '../QuranContext';
import { surahNamesArabic } from '@/data/quran/arabicNames';

interface Surah {
  id: number;
  name: string;
  englishName: string;
  versesCount: number;
}
export default function AudioClient({ surahs }: { surahs: Surah[] }) {
  const { 
    playbackSpeed, 
    setPlaybackSpeed,
    activeSurahId,
    isPlaying,
    setIsPlaying,
    playFullSurah,
    pauseAudio,
    audioRef: globalAudioRef
  } = useQuran();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (globalAudioRef.current) {
      globalAudioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, globalAudioRef]);

  const getFullSurahAudioUrl = (surahId: number) => {
    const paddedId = String(surahId).padStart(3, '0');
    // Using mp3quran.net server for Mishary Alafasy full surahs
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

  const togglePlay = (surahId: number, versesCount: number) => {
    if (activeSurahId === surahId) {
      if (isPlaying) {
        pauseAudio();
      } else {
        if (globalAudioRef.current) {
          globalAudioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }
    } else {
      playFullSurah(surahId);
    }
  };

  return (
    <div className="w-full min-h-full flex-1 flex flex-col bg-[var(--q-bg)] text-[var(--q-text)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[var(--q-bg)]/95 backdrop-blur-md z-40 border-b border-[var(--q-border)]">
        <button className="text-[var(--q-text)] hover:text-[var(--q-accent)] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-[var(--q-text)] tracking-wide">Audio Player</h1>
        <div className="w-6 h-6"></div> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="max-w-3xl w-full mx-auto divide-y divide-white/5">
          {surahs.map((surah) => {
            const isActive = activeSurahId === surah.id;
            return (
              <div key={surah.id} className="flex items-center justify-between py-4 group">
                <div className="flex items-center space-x-4">
                  {/* Octagon Number */}
                  <div className={`relative w-10 h-10 flex items-center justify-center transition-colors ${isActive ? 'text-[var(--q-accent-bold)]' : 'text-[var(--q-accent)]'}`}>
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                      <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" />
                    </svg>
                    <span className="text-sm font-bold">
                      {surah.id}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-2xl font-bold transition-colors font-arabic pt-1.5 ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text)]'}`}>
                        {surahNamesArabic[surah.id]}
                      </h3>
                      <span className={`text-sm font-bold mt-1.5 ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text-muted)]'}`}>
                        {surah.englishName}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-[var(--q-accent)] font-medium space-x-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{surah.versesCount} verses</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 z-10 relative">
                  <button 
                    onClick={() => {
                      const speeds = [0.5, 1, 1.25, 1.5, 2];
                      const currentIndex = speeds.indexOf(playbackSpeed);
                      const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                      setPlaybackSpeed(nextSpeed);
                      if (globalAudioRef.current) globalAudioRef.current.playbackRate = nextSpeed;
                    }}
                    className="w-10 h-10 rounded-full border-2 border-[var(--q-border)] flex items-center justify-center text-[10px] font-bold text-[var(--q-text)] hover:bg-[var(--q-border)] transition-colors"
                  >
                    {playbackSpeed}x
                  </button>
                  <button 
                    onClick={() => togglePlay(surah.id, surah.versesCount)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      isActive && isPlaying 
                        ? 'bg-[var(--q-accent)] border-[var(--q-accent)] text-white shadow-md scale-105' 
                        : 'border-[var(--q-border)] text-[var(--q-text)] hover:bg-[var(--q-border)]'
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <Pause className="w-4 h-4" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleDownload(surah.id, surah.englishName)}
                    disabled={downloadingIds.has(surah.id)}
                    className="w-10 h-10 rounded-full border-2 border-[var(--q-border)] flex items-center justify-center text-[var(--q-text)] hover:bg-[var(--q-border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloadingIds.has(surah.id) ? (
                      <svg className="animate-spin h-5 w-5 text-[var(--q-accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <Download className="w-4 h-4" strokeWidth={2.5} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast Notification for Download */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#d97706] text-[var(--q-text)] px-4 py-4 rounded-xl shadow-xl flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
             <p className="text-sm font-bold leading-snug">{toastMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
