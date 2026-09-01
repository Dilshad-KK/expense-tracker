import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache to prevent reading 114 files on every request
let quranCache: any[] | null = null;

function loadQuran() {
  if (quranCache) return quranCache;
  const quran = [];
  for (let i = 1; i <= 114; i++) {
    const filePath = path.join(process.cwd(), 'data', 'quran', `${i}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      quran.push(JSON.parse(data));
    }
  }
  quranCache = quran;
  return quran;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const exact = searchParams.get('exact') === 'true';

    if (!q) {
      return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
    }

    const quran = loadQuran();
    const results = [];
    let matchCount = 0;
    
    // For Arabic, it's better to just check if the string contains the query since Arabic has prefixes/suffixes.
    const searchStr = q.toLowerCase();

    for (const surah of quran) {
      for (const verse of surah.verses) {
        const arabicLower = verse.arabic.toLowerCase();
        const malayalamLower = verse.malayalam.toLowerCase();
        
        let isMatch = false;
        
        if (exact) {
          // Simple exact match logic for Arabic/Malayalam considering spaces
          const arabicWords = arabicLower.split(/\s+/);
          const malayalamWords = malayalamLower.split(/\s+/);
          isMatch = arabicWords.includes(searchStr) || malayalamWords.includes(searchStr);
        } else {
          isMatch = arabicLower.includes(searchStr) || malayalamLower.includes(searchStr);
        }

        if (isMatch) {
          results.push({
            surahId: surah.id,
            surahName: surah.englishName,
            verseId: verse.id,
            arabic: verse.arabic,
            malayalam: verse.malayalam,
          });
          matchCount++;
        }
      }
    }

    return NextResponse.json({ results, totalCount: matchCount, query: q });
  } catch (error) {
    console.error('Error searching Quran:', error);
    return NextResponse.json({ error: 'Failed to search Quran' }, { status: 500 });
  }
}
