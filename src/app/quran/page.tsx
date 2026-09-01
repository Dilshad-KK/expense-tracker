import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { Menu } from 'lucide-react';
import LastReadCard from './LastReadCard';
import { surahNamesArabic } from '@/data/quran/arabicNames';

// Fetch directly on the server
async function getSurahs() {
  const filePath = path.join(process.cwd(), 'data', 'quran', 'index.json');
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data) as Array<{
    id: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    versesCount: number;
    revelationType?: string;
  }>;
}

const toArabicNumeral = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

export default async function QuranIndexPage() {
  const surahs = await getSurahs();

  return (
    <div className="w-full flex flex-col bg-[var(--q-bg)] text-[var(--q-text)] min-h-[100dvh]">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 sticky top-0 bg-[var(--q-bg)]/95 backdrop-blur-md z-40">
        <button className="text-[var(--q-text)] hover:text-[var(--q-accent)] transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-[var(--q-text)] tracking-wide">Mushaf</h1>
        <div className="w-6 h-6"></div> {/* Spacer for centering */}
      </header>

      <div className="max-w-3xl w-full mx-auto px-4 pb-28">
        
        {/* Last Read Card */}
        <LastReadCard />



        {/* Section Title */}
        <div className="px-2 mb-2 flex items-center justify-between">
           <div className="text-[var(--q-accent)] text-sm font-semibold">Surahs</div>
           <Link href="/quran/collections" className="text-xs font-bold text-[var(--q-accent-bold)] bg-[var(--q-accent-bold)]/10 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-[var(--q-accent-bold)]/20 transition-colors">
             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3v18l7-5 7 5V3z" /></svg>
             My Collection
           </Link>
        </div>

        {/* Surahs List */}
        <div className="bg-[var(--q-card)]/40 rounded-3xl overflow-hidden border border-[var(--q-border)] divide-y divide-white/5">
          {surahs.map((surah) => (
            <Link 
              href={`/quran/${surah.id}`} 
              key={surah.id}
              className="flex items-center justify-between p-4 hover:bg-[var(--q-border)] transition-colors group"
            >
              <div className="flex items-center space-x-4">
                {/* Octagon Number */}
                <div className="relative w-10 h-10 flex items-center justify-center text-[var(--q-accent)] group-hover:text-[var(--q-text)] transition-colors">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4">
                    <polygon points="50,5 82,18 95,50 82,82 50,95 18,82 5,50 18,18" />
                  </svg>
                  <span className="text-sm font-bold">
                    {surah.id}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-[var(--q-text)] mb-0.5">
                    {surah.englishName}
                  </h3>
                  <div className="flex items-center text-xs text-[var(--q-accent)] font-medium space-x-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{surah.versesCount} verses</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <h2 className="text-3xl font-arabic text-[var(--q-text)] leading-none pt-2" style={{ fontFamily: 'var(--font-arabic), "Amiri", "Scheherazade New", serif' }}>
                  {surahNamesArabic[surah.id]}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
