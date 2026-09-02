'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useQuran } from '../../QuranContext';
import { parseTajweed } from '@/lib/tajweed';

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

type TaskMode = 'recall' | 'record' | 'cloze';

const toArabicNumeral = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

export default function TasksClient({ surah }: { surah: SurahData }) {
  const {
    arabicFontSize,
    arabicFont,
    audioRef,
    isPlaying,
    setIsPlaying,
    activeSurahId,
    activeVerseId,
    playVerse,
    pauseAudio,
    stopAudio,
    highlightTajweed,
    memorizationProgress,
    setVerseProgress,
    verseLoopConfig,
    setLoopCount,
    setLoopsRemaining,
    setVerseLoopConfig
  } = useQuran();

  const [taskMode, setTaskMode] = useState<TaskMode | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [revealedVerses, setRevealedVerses] = useState<Set<number>>(new Set());
  const [showLoopMenuFor, setShowLoopMenuFor] = useState<number | null>(null);
  
  const handleSetLoopCount = (verseId: number, count: number) => {
    setLoopCount(verseId, count);
    setShowLoopMenuFor(null);
    if (activeVerseId === verseId) {
        setLoopsRemaining(count);
    }
  };
  
  // Recording State
  const [recordings, setRecordings] = useState<Record<number, string>>({});
  const [recordingVerseId, setRecordingVerseId] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async (verseId: number) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Recording is not supported in this browser or requires a secure (HTTPS) connection.');
        return;
      }
      
      if (recordingVerseId !== null) {
        stopRecording();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const type = mediaRecorder.mimeType || 'audio/mp4';
        const audioBlob = new Blob(audioChunksRef.current, { type });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordings(prev => ({ ...prev, [verseId]: audioUrl }));
      };

      mediaRecorder.start();
      setRecordingVerseId(verseId);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setRecordingVerseId(null);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      if (activeVerseId === null || activeSurahId !== surah.id) {
        playVerse(surah.id, 1, surah.verses.length, false);
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
  
  const renderArabicText = (verseId: number, text: string) => {
    let finalNodes: React.ReactNode[] = [];
    
    if (taskMode === 'cloze') {
      let seed = verseId * 12345 + surah.id * 6789;
      const random = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      
      const words = text.split(' ');
      finalNodes = words.map((word, index) => {
        const isHidden = random() > 0.7; // ~30% words hidden
        const key = `${verseId}-${index}`;
        const isRevealed = revealedWords.has(key);
        
        if (isHidden && !isRevealed) {
          return (
            <span 
              key={key} 
              onClick={(e) => { e.stopPropagation(); setRevealedWords(prev => new Set(prev).add(key)); }}
              className="inline-block cursor-pointer mx-1 px-2 pb-1 border-b-2 border-indigo-400/50 text-transparent select-none bg-black/10 rounded-t-md hover:bg-[var(--q-accent-bold)]/20 transition-colors"
            >
              {word}
            </span>
          );
        }
        
        if (!highlightTajweed) return <span key={key} className="mx-1">{word}</span>;
        const segments = parseTajweed(word);
        return (
          <span key={key} className="mx-1">
            {segments.map((seg, i) => {
              if (seg.rule === 'allah') return <span key={i} className="text-red-400 font-bold drop-shadow-sm">{seg.text}</span>;
              if (seg.rule === 'ghunnah') return <span key={i} className="text-emerald-400 font-bold drop-shadow-sm">{seg.text}</span>;
              return <span key={i}>{seg.text}</span>;
            })}
          </span>
        );
      });
      return <>{finalNodes}</>;
    }

    if (!highlightTajweed) return <>{text}</>;
    const segments = parseTajweed(text);
    return segments.map((seg, i) => {
      if (seg.rule === 'allah') return <span key={i} className="text-red-400 font-bold drop-shadow-sm">{seg.text}</span>;
      if (seg.rule === 'ghunnah') return <span key={i} className="text-emerald-400 font-bold drop-shadow-sm">{seg.text}</span>;
      return <span key={i}>{seg.text}</span>;
    });
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

  return (
    <div className={`w-full h-[100dvh] overflow-hidden flex flex-col relative transition-colors duration-500 bg-[var(--q-bg)]`}>
      
      {/* Top Navbar */}
      <header className={`sticky top-0 z-40 transition-colors duration-500 shadow-sm bg-[var(--q-bg)]/90 backdrop-blur-md border-b border-[var(--q-border)]`}>
        <div className="max-w-md md:max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/quran" className={`flex items-center transition-colors text-[var(--q-text-muted)] hover:text-[var(--q-text)]`}>
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className={`font-bold text-lg text-[var(--q-text)]`}>{surah.englishName}</span>
          </Link>
          <div className="w-5 h-5"></div>
        </div>
        
        {/* Mode Selector */}
        <div className="max-w-md md:max-w-xl mx-auto px-4 pb-3">
          <div className={`flex p-1 rounded-full bg-[var(--q-card)]/50 border border-[var(--q-border)] shadow-inner`}>
            {[
              { id: 'translation', label: 'Translation', href: `/quran/${surah.id}` },
              { id: 'quran', label: 'Mushaf', href: `/quran/${surah.id}` },
              { id: 'tasks', label: 'Tasks' }
            ].map((mode) => (
              mode.href ? (
                <Link
                  key={mode.id}
                  href={mode.href}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-300 text-center text-[var(--q-accent)]/60 hover:text-[var(--q-text)] block flex items-center justify-center`}
                >
                  {mode.label}
                </Link>
              ) : (
                <button
                  key={mode.id}
                  onClick={() => setTaskMode(null)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-300 bg-[var(--q-accent-bold)] text-white shadow-md flex items-center justify-center`}
                >
                  {mode.label}
                </button>
              )
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto px-4 py-4 pb-32`}>
        {taskMode === null ? (
          <div className={`max-w-3xl w-full mx-auto mt-4`}>
             <h2 className="text-2xl font-bold text-[var(--q-text)] mb-6 text-center">Learning Tasks</h2>
             <div className="grid grid-cols-2 gap-4">
               <button onClick={() => { setTaskMode('recall'); setRevealedVerses(new Set()); }} className="group relative bg-[var(--q-card)] hover:bg-[var(--q-card-hover)] p-6 rounded-3xl shadow-lg hover:shadow-[var(--q-accent)]/10 active:scale-95 transition-all text-left border border-[var(--q-border)] overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23ffffff'/%3E%3C/svg%3E")`, backgroundSize: '16px 16px' }}></div>
                 <div className="relative z-10">
                   <div className="bg-[var(--q-bg)] border border-[var(--q-border)] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:bg-[var(--q-accent-bold)]/20 transition-colors">
                      <svg className="w-6 h-6 text-[var(--q-accent-bold)] group-hover:text-[var(--q-accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                   </div>
                   <h3 className="text-lg font-bold text-[var(--q-text)] group-hover:text-[var(--q-accent)] transition-colors">Recall</h3>
                   <p className="text-[var(--q-text-subtle)] text-xs mt-1 font-medium leading-relaxed group-hover:text-[var(--q-text-muted)] transition-colors">Memorize verses by hiding and revealing them</p>
                 </div>
               </button>
               
               <button onClick={() => { setTaskMode('record'); }} className="group relative bg-[var(--q-card)] hover:bg-[var(--q-card-hover)] p-6 rounded-3xl shadow-lg hover:shadow-[var(--q-accent)]/10 active:scale-95 transition-all text-left border border-[var(--q-border)] overflow-hidden">
                 <div className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23ffffff'/%3E%3C/svg%3E")`, backgroundSize: '16px 16px' }}></div>
                 <div className="relative z-10">
                   <div className="bg-[var(--q-bg)] border border-[var(--q-border)] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:bg-[var(--q-accent-bold)]/20 transition-colors">
                      <svg className="w-6 h-6 text-[var(--q-accent-bold)] group-hover:text-[var(--q-accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                   </div>
                   <h3 className="text-lg font-bold text-[var(--q-text)] group-hover:text-[var(--q-accent)] transition-colors">Recorder</h3>
                   <p className="text-[var(--q-text-subtle)] text-xs mt-1 font-medium leading-relaxed group-hover:text-[var(--q-text-muted)] transition-colors">Record your recitation for self-evaluation</p>
                 </div>
               </button>
               
               <button onClick={() => { setTaskMode('cloze'); setRevealedWords(new Set()); }} className="group relative bg-[var(--q-card)] hover:bg-[var(--q-card-hover)] p-6 rounded-3xl shadow-lg hover:shadow-[var(--q-accent)]/10 active:scale-95 transition-all text-left border border-[var(--q-border)] overflow-hidden col-span-2">
                 <div className="absolute inset-0 opacity-[0.03] transition-opacity group-hover:opacity-[0.06]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='2' fill='%23ffffff'/%3E%3C/svg%3E")`, backgroundSize: '16px 16px' }}></div>
                 <div className="relative z-10">
                   <div className="bg-[var(--q-bg)] border border-[var(--q-border)] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-inner group-hover:bg-[var(--q-accent-bold)]/20 transition-colors">
                      <svg className="w-6 h-6 text-[var(--q-accent-bold)] group-hover:text-[var(--q-accent)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                   </div>
                   <h3 className="text-lg font-bold text-[var(--q-text)] group-hover:text-[var(--q-accent)] transition-colors">Word Test</h3>
                   <p className="text-[var(--q-text-subtle)] text-xs mt-1 font-medium leading-relaxed group-hover:text-[var(--q-text-muted)] transition-colors">Fill in the missing words to test your memory</p>
                 </div>
               </button>
             </div>
          </div>
        ) : (
        <div className={`max-w-3xl w-full mx-auto`}>
          <div className="flex items-center justify-between mb-6 mt-2">
            <button onClick={() => setTaskMode(null)} className="flex items-center text-[var(--q-accent)] hover:text-[var(--q-text)] transition-colors text-sm font-bold bg-[var(--q-border)] py-2 px-4 rounded-full">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Tasks Menu
            </button>
            
            {taskMode === 'recall' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRevealedVerses(new Set(surah.verses.map(v => v.id)))}
                  className="px-3 py-1.5 text-xs font-bold rounded-full bg-black/20 border border-[var(--q-border)] text-[var(--q-accent)] hover:text-[var(--q-text)] hover:bg-black/40 transition-colors shadow-inner"
                >
                  Reveal All
                </button>
                <button
                  onClick={() => {
                    setRevealedVerses(new Set());
                    setVerseLoopConfig({});
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-full bg-black/20 border border-[var(--q-border)] text-[var(--q-accent)] hover:text-[var(--q-text)] hover:bg-black/40 transition-colors shadow-inner"
                >
                  Hide All
                </button>
              </div>
            )}
          </div>
          
          {/* Header Card */}
          <div className="bg-gradient-to-br from-[var(--q-card)] to-[var(--q-bg)] rounded-3xl p-4 text-center text-[var(--q-text)] shadow-xl shadow-[var(--q-bg)]/20 relative overflow-hidden mb-8">
             <div className="relative z-10">
               <h2 className="text-2xl font-bold mb-1">{surah.englishName}</h2>
               {surah.id !== 9 && (
                  <h2 className="font-arabic pb-2 pt-1 text-[var(--q-text)]" style={{ fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif', fontSize: `min(${arabicFontSize * 1.3}px, 4.5dvh)`, lineHeight: '1.4' }}>
                    {renderArabicText(0, 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ')}
                  </h2>
                )}
             </div>
          </div>

          {/* Verses List */}
          <div className="divide-y divide-white/10">
            {surah.verses.map((verse: any) => {
              const isActive = activeVerseId === verse.id && activeSurahId === surah.id;

              return (
                <div 
                  id={`verse-${verse.id}`}
                  key={verse.id} 
                  className={`py-6 ${taskMode === 'recall' ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (taskMode === 'recall') {
                      setRevealedVerses(prev => {
                        const next = new Set(prev);
                        if (next.has(verse.id)) next.delete(verse.id);
                        else next.add(verse.id);
                        return next;
                      });
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-4 relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                      isActive ? 'bg-[var(--q-accent-bold)] text-[var(--q-text)] shadow-lg' : 'bg-[var(--q-card)] text-[var(--q-text-muted)]'
                    }`}>
                      {verse.id}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-[var(--q-text-subtle)]">
                      
                      {taskMode === 'recall' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealedVerses(prev => {
                              const next = new Set(prev);
                              if (next.has(verse.id)) next.delete(verse.id);
                              else next.add(verse.id);
                              return next;
                            });
                          }}
                          className={`p-2 transition-colors rounded-full ${revealedVerses.has(verse.id) ? 'text-[var(--q-accent)] bg-[var(--q-accent-bold)]/10' : 'text-[var(--q-text-subtle)] hover:text-[var(--q-text)] hover:bg-[var(--q-border)]'}`}
                          title={revealedVerses.has(verse.id) ? "Hide Ayah" : "Reveal Ayah"}
                        >
                          {revealedVerses.has(verse.id) ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      )}
                      
                      {taskMode === 'recall' && (
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
                      )}
                      
                      {taskMode === 'record' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (recordingVerseId === verse.id) stopRecording();
                            else startRecording(verse.id);
                          }}
                          className={`p-2 transition-colors rounded-full ${
                            recordingVerseId === verse.id ? 'text-red-400 bg-red-400/20 animate-pulse' : 
                            recordings[verse.id] ? 'text-blue-400 bg-blue-400/10' :
                            'hover:text-[var(--q-accent)] hover:bg-[var(--q-card-hover)]'
                          }`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </button>
                      )}
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudioClicked(verse.id);
                        }}
                        className={`p-2 transition-colors rounded-full ${isActive ? 'text-[var(--q-text)] bg-[var(--q-accent-bold)]' : 'hover:text-[var(--q-accent)] hover:bg-[var(--q-card-hover)]'}`}
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

                  <div className="flex flex-col gap-4">
                    <div className={`text-right transition-all duration-500 break-words ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text)]'}`}>
                      <p 
                        className={`leading-loose font-arabic transition-all duration-300 ${
                          taskMode === 'recall' && !revealedVerses.has(verse.id)
                            ? 'blur-[8px] opacity-40 select-none'
                            : ''
                        }`}
                        style={{ 
                          fontFamily: arabicFont === 'Amiri' ? 'var(--font-arabic), "Amiri", serif' : '"Scheherazade New", serif',
                          lineHeight: '2.2',
                          wordSpacing: '0.2em',
                          fontSize: `${arabicFontSize}px`
                        }}
                        dir="rtl"
                      >
                        {renderArabicText(verse.id, verse.arabic)}
                      </p>
                    </div>
                    
                    {/* Recording Playback */}
                    {taskMode === 'record' && recordings[verse.id] && (
                      <div className="mt-2 pt-3 border-t border-[var(--q-border)] flex items-center gap-3">
                        <span className="text-xs font-semibold text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">Your Recording</span>
                        <audio src={recordings[verse.id]} controls className="h-8 max-w-xs outline-none" />
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setRecordings(prev => {
                                const next = { ...prev };
                                delete next[verse.id];
                                return next;
                             });
                          }}
                          className="p-1.5 text-[var(--q-text-subtle)] hover:text-red-400 transition-colors ml-auto"
                        >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
