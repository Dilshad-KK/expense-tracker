      {/* Main Content */}
      <main className={`flex-1 flex flex-col w-full relative ${isMushafMode && mushafViewMode === 'swipable' ? 'overflow-hidden' : 'overflow-y-auto px-4 py-4 pb-32'}`}>
        <div className={`max-w-3xl w-full mx-auto ${isMushafMode && mushafViewMode === 'swipable' ? 'flex-1 flex flex-col min-h-0' : ''}`}>
          
          {isAudioMode && (
            <div className="divide-y divide-white/5">
              {allSurahs.map((s: any) => {
                const isActive = activeSurahId === s.id;
                return (
                  <div key={s.id} className="flex items-center justify-between py-4 group">
                    <div className="flex items-center space-x-4">
                      <div className={`relative w-10 h-10 flex items-center justify-center transition-colors ${isActive ? 'text-[var(--q-accent-bold)]' : 'text-[var(--q-accent)]'}`}>
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                          <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" />
                        </svg>
                        <span className="text-sm font-bold">{s.id}</span>
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-2xl font-bold transition-colors font-arabic pt-1.5 ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text)]'}`}>
                            {surahNamesArabic[s.id]}
                          </h3>
                          <span className={`text-sm font-bold mt-1.5 ${isActive ? 'text-[var(--q-accent)]' : 'text-[var(--q-text-muted)]'}`}>
                            {s.englishName}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-[var(--q-accent)] font-medium space-x-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span>{s.versesCount} verses</span>
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
               <div className="absolute top-0 right-0 opacity-10">
                  <svg className="w-32 h-32 -mr-8 -mt-8" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2L2 12l10 10 10-10L12 2z" />
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
              className={mushafViewMode === 'swipable' ? "flex flex-1 min-h-0 overflow-x-auto snap-x snap-mandatory w-full" : "max-w-4xl mx-auto w-full px-2"}
              dir={mushafViewMode === 'swipable' ? "rtl" : "ltr"}
              style={mushafViewMode === 'swipable' ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
            >
              {pages.map((pageData, index) => (
                <div 
                  id={`mushaf-page-${pageData.page}`}
                  data-page={pageData.page}
                  key={pageData.page} 
                  className={mushafViewMode === 'swipable' ? "no-scrollbar min-w-full w-full h-full overflow-y-auto shrink-0 snap-center px-4 pt-4 pb-[calc(8rem+env(safe-area-inset-bottom))]" : "mb-8"}
                >
                  <div className="max-w-4xl mx-auto w-full">
