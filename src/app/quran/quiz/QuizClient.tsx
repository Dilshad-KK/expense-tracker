'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuran } from '../QuranContext';
import { parseTajweed } from '@/lib/tajweed';

export default function QuizClient() {
  const { arabicFont, arabicFontSize } = useQuran();
  
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctOption, setCorrectOption] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    try {
      const res = await fetch('/api/quiz/random');
      const data = await res.json();
      setAudioUrl(data.audioUrl);
      setOptions(data.options);
      setCorrectOption(data.correctOption);
      setIsPlaying(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleOptionClick = (opt: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(opt);
    if (opt === correctOption) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const renderArabicText = (text: string) => {
    const segments = parseTajweed(text);
    return segments.map((seg, i) => {
      if (seg.rule === 'allah') return <span key={i} className="text-red-400 font-bold drop-shadow-sm">{seg.text}</span>;
      if (seg.rule === 'ghunnah') return <span key={i} className="text-emerald-400 font-bold drop-shadow-sm">{seg.text}</span>;
      return <span key={i}>{seg.text}</span>;
    });
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[var(--q-bg)] text-[var(--q-text)] overflow-y-auto overflow-x-hidden pb-24 relative">
      <header className="px-6 py-6 sticky top-0 bg-[var(--q-bg)]/95 backdrop-blur-md z-40 border-b border-[var(--q-border)] flex items-center justify-between">
        <Link href="/quran" className="text-[var(--q-text-subtle)] hover:text-[var(--q-text)] transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[var(--q-text)]">Audio Quiz</h1>
        <div className="text-sm font-bold text-amber-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.618 5.968l1.453-1.453C20.692 2.9 19.336 1 17 1S13.308 2.9 14.93 4.515l1.453 1.453c-1.42 1.42-3.153 3.99-3.924 6.843L11.517 12a13.328 13.328 0 00-1.848-1.542l-1.488-1.025a1 1 0 00-1.458.26l-1.096 1.708a1 1 0 00.323 1.401l1.436.91A11.378 11.378 0 0110 16.5l.89.56a1 1 0 001.37-.367L13.11 15.3c2.193-3.665 4.316-5.748 6.425-7.863l-1.917-1.469zM4.773 14.072l.488 2.378A5 5 0 0010 20a1 1 0 00.995-1.096l-.32-3.52-2.31 1.705L4.773 14.072z" /></svg>
          {streak}
        </div>
      </header>

      <div className="min-h-[calc(100dvh-100px)] px-4 py-4 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 rounded-full bg-[var(--q-accent-bold)]/20 mb-4"></div>
            <div className="h-6 w-32 bg-[var(--q-border)] rounded-md"></div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center w-full mt-2">
              <h2 className="text-lg font-bold text-[var(--q-text)] mb-1">Identify the Verse</h2>
              <p className="text-xs text-[var(--q-text-subtle)] mb-4 max-w-sm mx-auto">Listen to the audio and select the correct Arabic text from the options below.</p>
              
              <div className="bg-[var(--q-card)] p-4 rounded-3xl border border-[var(--q-border)] shadow-xl inline-flex flex-col items-center">
                <button 
                  onClick={toggleAudio}
                  className="w-16 h-16 bg-[var(--q-accent-bold)] hover:bg-indigo-400 text-[var(--q-text)] rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 mb-2"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z" /></svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <p className="text-xs text-[var(--q-accent)] font-semibold">{isPlaying ? 'Playing...' : 'Play Audio'}</p>
                {audioUrl && (
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    onPlay={() => setIsPlaying(true)} 
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                )}
              </div>
            </div>

            <div className="w-full space-y-3">
              {options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt === correctOption;
                
                let stateClass = 'bg-[var(--q-card)]/50 hover:bg-[var(--q-card)] border-[var(--q-border)] text-[var(--q-text)]';
                if (selectedOption !== null) {
                  if (isCorrect) stateClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100';
                  else if (isSelected) stateClass = 'bg-red-500/20 border-red-500/50 text-red-100';
                  else stateClass = 'bg-[var(--q-card)]/20 border-[var(--q-border)] text-slate-500 opacity-50';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className={`w-full text-right p-6 rounded-2xl border transition-all ${stateClass}`}
                    dir="rtl"
                  >
                    <p className="font-arabic leading-loose" style={{ 
                      fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif',
                      fontSize: `${Math.min(arabicFontSize, 28)}px` 
                    }}>
                      {renderArabicText(opt)}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedOption !== null && (
              <div className="mt-8">
                <button 
                  onClick={fetchQuestion}
                  className="bg-white text-[#1c234a] font-bold px-8 py-3 rounded-full shadow-lg hover:bg-indigo-50 transition-colors"
                >
                  Next Question
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
