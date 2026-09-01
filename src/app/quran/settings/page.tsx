'use client';

import { Menu, Settings as SettingsIcon } from 'lucide-react';
import { useQuran } from '../QuranContext';

export default function SettingsPage() {
  const {
    appTheme, setAppTheme,
    translationMode, setTranslationMode,
    mushafViewMode, setMushafViewMode,
    arabicFont, setArabicFont,
    arabicFontSize, setArabicFontSize,
    translationFontSize, setTranslationFontSize,
    translationAudio, setTranslationAudio,
    playbackSpeed, setPlaybackSpeed,
    showWordByWord, setShowWordByWord,
    reciter, setReciter
  } = useQuran();

  return (
    <div className="w-full min-h-full flex-1 flex flex-col bg-[var(--q-bg)] text-[var(--q-text)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[var(--q-bg)]/95 backdrop-blur-md z-40 border-b border-[var(--q-border)]">
        <button className="text-[var(--q-text)] hover:text-[var(--q-accent)] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-[var(--q-text)] tracking-wide">Settings</h1>
        <div className="w-6 h-6"></div> {/* Spacer */}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-3xl w-full mx-auto space-y-8">
          
          {/* APPEARANCE */}
          <section>
            <h3 className="text-xs font-bold text-[var(--q-text)] tracking-widest uppercase mb-3 px-2">Appearance</h3>
            <div className="bg-[var(--q-card)]/80 backdrop-blur-md rounded-3xl border border-[var(--q-border)] shadow-lg p-2">
              <div className="flex flex-col space-y-4 p-2">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-[var(--q-text)]">App Theme</span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {['system', 'light', 'dark', 'sepia', 'midnight'].map(theme => (
                    <button 
                      key={theme}
                      onClick={() => setAppTheme(theme as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${appTheme === theme ? 'bg-[var(--q-accent-bold)] text-white shadow-md' : 'bg-[var(--q-bg)] text-[var(--q-accent)] border border-[var(--q-border)]'}`}
                    >
                      {theme === 'system' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                      {theme === 'light' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                      {theme === 'dark' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                      {theme === 'sepia' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                      {theme === 'midnight' && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
                      <span className="capitalize">{theme}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* QUR'AN */}
          <section>
            <h3 className="text-xs font-bold text-[var(--q-text)] tracking-widest uppercase mb-3 px-2">Qur'an</h3>
            <div className="bg-[var(--q-card)]/80 backdrop-blur-md rounded-3xl border border-[var(--q-border)] shadow-lg overflow-hidden">
              
              {/* Translation Mode */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--q-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 18c-4.549 0-8.25-3.701-8.25-8.25S7.451 3.75 12 3.75s8.25 3.701 8.25 8.25-3.701 8.25-8.25 8.25z"/></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Translation</span>
                </div>
                <div className="flex bg-[var(--q-bg)] rounded-full p-1 border border-[var(--q-border)]">
                  <button onClick={() => setTranslationMode('normal')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${translationMode === 'normal' ? 'bg-[var(--q-accent-bold)] text-white' : 'text-[var(--q-accent)]'}`}>Normal</button>
                  <button onClick={() => setTranslationMode('audio')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${translationMode === 'audio' ? 'bg-[var(--q-accent-bold)] text-white' : 'text-[var(--q-accent)]'}`}>Audio</button>
                </div>
              </div>
              
              {/* Word-by-Word Mode */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--q-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Word-by-Word Translation</span>
                </div>
                <button 
                  onClick={() => setShowWordByWord(!showWordByWord)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${showWordByWord ? 'bg-[var(--q-accent-bold)]' : 'bg-[var(--q-border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[var(--q-bg)] transition-transform ${showWordByWord ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
              
              {/* Mushaf View Mode */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Mushaf Layout</span>
                </div>
                <div className="flex bg-[var(--q-bg)] rounded-full p-1 border border-[var(--q-border)]">
                  <button onClick={() => setMushafViewMode('swipable')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${mushafViewMode === 'swipable' ? 'bg-[var(--q-accent-bold)] text-white' : 'text-[var(--q-accent)]'}`}>Swipe</button>
                  <button onClick={() => setMushafViewMode('continuous')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${mushafViewMode === 'continuous' ? 'bg-[var(--q-accent-bold)] text-white' : 'text-[var(--q-accent)]'}`}>Scroll</button>
                </div>
              </div>

              {/* Reciter */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--q-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Reciter</span>
                </div>
                <div className="flex items-center space-x-2 text-[var(--q-accent)]">
                  <select 
                    value={reciter}
                    onChange={(e) => setReciter(e.target.value)}
                    className="bg-transparent text-sm font-bold appearance-none text-right focus:outline-none"
                  >
                    <option value="Alafasy_128kbps" className="bg-[var(--q-bg)] text-[var(--q-text)]">Mishary Alafasy</option>
                    <option value="Abdul_Basit_Murattal_192kbps" className="bg-[var(--q-bg)] text-[var(--q-text)]">Abdul Basit</option>
                    <option value="Husary_128kbps" className="bg-[var(--q-bg)] text-[var(--q-text)]">Al-Husary</option>
                    <option value="Minshawy_Murattal_128kbps" className="bg-[var(--q-bg)] text-[var(--q-text)]">Al-Minshawi</option>
                  </select>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>

              {/* Quran Font */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--q-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)] font-serif font-bold text-lg">A</div>
                  <span className="font-bold text-[var(--q-text)]">Qur'an Font</span>
                </div>
                <div className="flex items-center space-x-2 text-[var(--q-accent)]">
                  <select 
                    value={arabicFont}
                    onChange={(e) => setArabicFont(e.target.value)}
                    className="bg-transparent text-sm font-bold appearance-none text-right focus:outline-none"
                  >
                    <option value="Amiri" className="bg-[var(--q-bg)] text-[var(--q-text)]">MeQuran</option>
                    <option value="Scheherazade" className="bg-[var(--q-bg)] text-[var(--q-text)]">Scheherazade</option>
                  </select>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>

              {/* Quran Font Size */}
              <div className="flex items-center justify-between p-5 border-b border-[var(--q-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Qur'an Font Size</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setArabicFontSize(Math.max(20, arabicFontSize - 2))} className="w-7 h-7 rounded-full border border-white/20 text-[var(--q-text)] flex items-center justify-center hover:bg-[var(--q-border)] transition-colors">-</button>
                  <span className="text-sm font-bold w-6 text-center">{arabicFontSize}</span>
                  <button onClick={() => setArabicFontSize(Math.min(64, arabicFontSize + 2))} className="w-7 h-7 rounded-full bg-[var(--q-border)] text-[var(--q-text)] flex items-center justify-center hover:bg-[var(--q-card-hover)] transition-colors">+</button>
                </div>
              </div>

              {/* Translation Font Size */}
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Translation Font Size</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button onClick={() => setTranslationFontSize(Math.max(12, translationFontSize - 1))} className="w-7 h-7 rounded-full border border-white/20 text-[var(--q-text)] flex items-center justify-center hover:bg-[var(--q-border)] transition-colors">-</button>
                  <span className="text-sm font-bold w-6 text-center">{translationFontSize}</span>
                  <button onClick={() => setTranslationFontSize(Math.min(32, translationFontSize + 1))} className="w-7 h-7 rounded-full bg-[var(--q-border)] text-[var(--q-text)] flex items-center justify-center hover:bg-[var(--q-card-hover)] transition-colors">+</button>
                </div>
              </div>

            </div>
          </section>

          {/* AUDIO */}
          <section>
            <h3 className="text-xs font-bold text-[var(--q-text)] tracking-widest uppercase mb-3 px-2">Audio</h3>
            <div className="bg-[var(--q-card)]/80 backdrop-blur-md rounded-3xl border border-[var(--q-border)] shadow-lg overflow-hidden">
              
              <div className="flex items-center justify-between p-5 border-b border-[var(--q-border)]">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Translation Audio</span>
                </div>
                <button 
                  onClick={() => setTranslationAudio(!translationAudio)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${translationAudio ? 'bg-[var(--q-accent-bold)]' : 'bg-[var(--q-border)]'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-[var(--q-bg)] shadow-sm transform transition-transform ${translationAudio ? 'translate-x-7' : 'translate-x-1'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-5 pb-2">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--q-border)] flex items-center justify-center text-[var(--q-text)]">
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
                  </div>
                  <span className="font-bold text-[var(--q-text)]">Playback Speed</span>
                </div>
                <span className="text-sm font-bold text-[var(--q-text)]">{playbackSpeed}x</span>
              </div>
              
              {/* Custom Slider */}
              <div className="px-6 pb-6 pt-2">
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.25" 
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[var(--q-border)] rounded-lg appearance-none cursor-pointer accent-[var(--q-accent-bold)]"
                />
                <div className="flex justify-between mt-2 px-1">
                  {[0.5, 1, 1.5, 2].map(speed => (
                    <div key={speed} className={`w-1.5 h-1.5 rounded-full ${playbackSpeed >= speed ? 'bg-[var(--q-accent-bold)]' : 'bg-[var(--q-border)]'}`}></div>
                  ))}
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
