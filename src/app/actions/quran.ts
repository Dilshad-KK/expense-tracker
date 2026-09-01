'use server';

import fs from 'fs';
import path from 'path';

export async function getVersesData(verses: { surahId: number, verseId: number }[]) {
  const result = [];
  
  // Group by surah to avoid reading the same file multiple times
  const grouped = verses.reduce((acc, curr) => {
    if (!acc[curr.surahId]) acc[curr.surahId] = [];
    acc[curr.surahId].push(curr.verseId);
    return acc;
  }, {} as Record<number, number[]>);

  for (const [surahId, verseIds] of Object.entries(grouped)) {
    const filePath = path.join(process.cwd(), 'data', 'quran', `${surahId}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      for (const verseId of verseIds) {
        const verseData = data.verses.find((v: any) => v.id === verseId);
        if (verseData) {
          result.push({
            surahId: parseInt(surahId),
            surahName: data.englishName,
            verseId,
            arabic: verseData.arabic,
            malayalam: verseData.malayalam
          });
        }
      }
    }
  }

  return result;
}
