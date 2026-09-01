'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface LastRead {
  surahId: number;
  surahName: string;
  surahNameArabic: string;
  verseId: number;
}

interface QuranContextType {
  // Settings
  appTheme: 'system' | 'light' | 'dark' | 'sepia' | 'midnight';
  setAppTheme: (v: 'system' | 'light' | 'dark' | 'sepia' | 'midnight') => void;
  translationMode: 'normal' | 'audio';
  setTranslationMode: (v: 'normal' | 'audio') => void;
  mushafViewMode: 'swipable' | 'continuous';
  setMushafViewMode: (v: 'swipable' | 'continuous') => void;
  arabicFont: string;
  setArabicFont: (v: string) => void;
  arabicFontSize: number;
  setArabicFontSize: (v: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (v: number) => void;
  translationAudio: boolean;
  setTranslationAudio: (v: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (v: number) => void;
  highlightTajweed: boolean;
  setHighlightTajweed: (v: boolean) => void;
  showWordByWord: boolean;
  setShowWordByWord: (v: boolean) => void;
  reciter: string;
  setReciter: (v: string) => void;
  
  // Learning State
  memorizationProgress: Record<number, Record<number, 'learning' | 'memorized'>>;
  setVerseProgress: (surahId: number, verseId: number, status: 'learning' | 'memorized' | null) => void;
  
  // Last Read
  lastRead: LastRead | null;
  setLastRead: (v: LastRead) => void;

  // Saved Verses (Bookmarks)
  savedVerses: { surahId: number, verseId: number, timestamp: number }[];
  toggleSavedVerse: (surahId: number, verseId: number) => void;
  isVerseSaved: (surahId: number, verseId: number) => boolean;

  // Global Audio State
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  activeSurahId: number | null;
  activeVerseId: number | null;
  isContinuousPlay: boolean;
  totalVersesInSurah: number;
  loopsRemaining: number;
  verseLoopConfig: { [key: number]: number };
  setVerseLoopConfig: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>;
  
  // Global Audio Actions
  playVerse: (surahId: number, verseId: number, totalVerses: number, isContinuous?: boolean) => void;
  playFullSurah: (surahId: number) => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  setLoopCount: (verseId: number, count: number) => void;
  setLoopsRemaining: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setIsContinuousPlay: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveVerseId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveSurahId: React.Dispatch<React.SetStateAction<number | null>>;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export function QuranProvider({ children }: { children: ReactNode }) {
  const [appTheme, setAppTheme] = useState<'system' | 'light' | 'dark' | 'sepia' | 'midnight'>('sepia');
  const [translationMode, setTranslationMode] = useState<'normal' | 'audio'>('normal');
  const [mushafViewMode, setMushafViewMode] = useState<'swipable' | 'continuous'>('swipable');
  const [arabicFont, setArabicFont] = useState('Amiri');
  const [arabicFontSize, setArabicFontSize] = useState(20);
  const [translationFontSize, setTranslationFontSize] = useState(16);
  const [translationAudio, setTranslationAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [highlightTajweed, setHighlightTajweed] = useState(false);
  const [showWordByWord, setShowWordByWord] = useState(false);
  const [reciter, setReciter] = useState('Alafasy_128kbps');
  const [lastRead, setLastReadState] = useState<LastRead | null>(null);
  const [savedVerses, setSavedVerses] = useState<{ surahId: number, verseId: number, timestamp: number }[]>([]);
  
  // Learning State
  const [memorizationProgress, setMemorizationProgress] = useState<Record<number, Record<number, 'learning' | 'memorized'>>>({});

  // Global Audio State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSurahId, setActiveSurahId] = useState<number | null>(null);
  const [activeVerseId, setActiveVerseId] = useState<number | null>(null);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);
  const [totalVersesInSurah, setTotalVersesInSurah] = useState(0);
  const [loopsRemaining, setLoopsRemaining] = useState(0);
  const [verseLoopConfig, setVerseLoopConfig] = useState<{ [key: number]: number }>({});

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('quranGlobalSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.appTheme) setAppTheme(parsed.appTheme);
        if (parsed.translationMode) setTranslationMode(parsed.translationMode);
        if (parsed.mushafViewMode) setMushafViewMode(parsed.mushafViewMode);
        if (parsed.arabicFont) setArabicFont(parsed.arabicFont);
        if (parsed.arabicFontSize) setArabicFontSize(parsed.arabicFontSize);
        if (parsed.translationFontSize) setTranslationFontSize(parsed.translationFontSize);
        if (parsed.translationAudio !== undefined) setTranslationAudio(parsed.translationAudio);
        if (parsed.playbackSpeed) setPlaybackSpeed(parsed.playbackSpeed);
        if (parsed.highlightTajweed !== undefined) setHighlightTajweed(parsed.highlightTajweed);
        if (parsed.showWordByWord !== undefined) setShowWordByWord(parsed.showWordByWord);
        if (parsed.reciter) setReciter(parsed.reciter);
        if (parsed.lastRead) setLastReadState(parsed.lastRead);
        if (parsed.savedVerses) setSavedVerses(parsed.savedVerses);
        if (parsed.memorizationProgress) setMemorizationProgress(parsed.memorizationProgress);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-sepia', 'theme-midnight');
      
      let effectiveTheme = appTheme;
      if (effectiveTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'midnight' : 'light';
      }
      
      if (effectiveTheme === 'dark') effectiveTheme = 'midnight';
      
      document.documentElement.classList.add(`theme-${effectiveTheme}`);
    }
  }, [appTheme, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('quranGlobalSettings', JSON.stringify({
        appTheme,
        translationMode,
        mushafViewMode,
        arabicFont,
        arabicFontSize,
        translationFontSize,
        translationAudio,
        playbackSpeed,
        highlightTajweed,
        showWordByWord,
        reciter,
        lastRead,
        savedVerses,
        memorizationProgress
      }));
    }
  }, [appTheme, translationMode, mushafViewMode, arabicFont, arabicFontSize, translationFontSize, translationAudio, playbackSpeed, highlightTajweed, showWordByWord, reciter, lastRead, savedVerses, memorizationProgress, isMounted]);

  const setVerseProgress = (surahId: number, verseId: number, status: 'learning' | 'memorized' | null) => {
    setMemorizationProgress(prev => {
      const next = { ...prev };
      if (!next[surahId]) next[surahId] = {};
      
      if (status === null) {
        delete next[surahId][verseId];
        if (Object.keys(next[surahId]).length === 0) {
          delete next[surahId];
        }
      } else {
        next[surahId][verseId] = status;
      }
      return next;
    });
  };

  const toggleSavedVerse = (surahId: number, verseId: number) => {
    setSavedVerses(prev => {
      const exists = prev.some(v => v.surahId === surahId && v.verseId === verseId);
      if (exists) {
        return prev.filter(v => !(v.surahId === surahId && v.verseId === verseId));
      } else {
        return [...prev, { surahId, verseId, timestamp: Date.now() }];
      }
    });
  };

  const isVerseSaved = (surahId: number, verseId: number) => {
    return savedVerses.some(v => v.surahId === surahId && v.verseId === verseId);
  };

  // Audio Actions
  const playVerse = (surahId: number, verseId: number, totalVerses: number, isContinuous: boolean = false) => {
    if (audioRef.current) {
      const paddedSurah = String(surahId).padStart(3, '0');
      const paddedVerse = String(verseId).padStart(3, '0');
      const url = `https://everyayah.com/data/${reciter}/${paddedSurah}${paddedVerse}.mp3`;
      
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      
      setActiveSurahId(surahId);
      setActiveVerseId(verseId);
      setTotalVersesInSurah(totalVerses);
      setIsPlaying(true);
      setIsContinuousPlay(isContinuous);
      
      const configuredLoops = verseLoopConfig[verseId] || 0;
      setLoopsRemaining(configuredLoops);
    }
  };

  const playFullSurah = (surahId: number) => {
    if (audioRef.current) {
      const paddedSurah = String(surahId).padStart(3, '0');
      
      // Map everyayah reciters to mp3quran server if possible, else fallback to alafasy
      let serverReciter = 'afs';
      if (reciter === 'Abdul_Basit_Murattal_192kbps') serverReciter = 'basit';
      if (reciter === 'Husary_128kbps') serverReciter = 'husary';
      if (reciter === 'Minshawy_Murattal_128kbps') serverReciter = 'minsh';
      
      const url = `https://server8.mp3quran.net/${serverReciter}/${paddedSurah}.mp3`;
      
      audioRef.current.src = url;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
      
      setActiveSurahId(surahId);
      setActiveVerseId(null);
      setTotalVersesInSurah(0);
      setIsPlaying(true);
      setIsContinuousPlay(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setActiveVerseId(null);
      setActiveSurahId(null);
      setIsContinuousPlay(false);
    }
  };

  const setLoopCount = (verseId: number, count: number) => {
    setVerseLoopConfig(prev => ({ ...prev, [verseId]: count }));
  };

  // Update playback speed if it changes while playing
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  return (
    <QuranContext.Provider value={{
      appTheme, setAppTheme,
      translationMode, setTranslationMode,
      mushafViewMode, setMushafViewMode,
      arabicFont, setArabicFont,
      arabicFontSize, setArabicFontSize,
      translationFontSize, setTranslationFontSize,
      translationAudio, setTranslationAudio,
      playbackSpeed, setPlaybackSpeed,
      highlightTajweed, setHighlightTajweed,
      showWordByWord, setShowWordByWord,
      reciter, setReciter,
      
      memorizationProgress, setVerseProgress,

      lastRead, setLastRead: setLastReadState,
      savedVerses, toggleSavedVerse, isVerseSaved,
      
      audioRef,
      isPlaying, setIsPlaying,
      activeSurahId, setActiveSurahId,
      activeVerseId, setActiveVerseId,
      isContinuousPlay, setIsContinuousPlay,
      totalVersesInSurah,
      loopsRemaining, setLoopsRemaining,
      verseLoopConfig, setVerseLoopConfig,
      
      playVerse,
      playFullSurah,
      pauseAudio,
      stopAudio,
      setLoopCount
    }}>
      {children}
    </QuranContext.Provider>
  );
}

export function useQuran() {
  const context = useContext(QuranContext);
  if (context === undefined) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}
