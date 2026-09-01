import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import QuranReaderClient from './QuranReaderClient';

// Fetch directly on the server
async function getSurah(id: string) {
  const surahId = parseInt(id, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return null;
  }

  const filePath = path.join(process.cwd(), 'data', 'quran', `${surahId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  // Fetch page numbers and word-by-word translations from Quran.com API
  try {
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?fields=page_number&words=true&word_fields=text_uthmani,translation&per_page=500`, { next: { revalidate: 3600 * 24 } });
    if (res.ok) {
      const apiData = await res.json();
      if (apiData && apiData.verses) {
        data.verses = data.verses.map((verse: any, index: number) => {
          const apiVerse = apiData.verses[index];
          return {
            ...verse,
            page: apiVerse ? apiVerse.page_number : null,
            words: apiVerse ? apiVerse.words : []
          };
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch page numbers", error);
  }

  return data;
}

async function getAllSurahs() {
  const filePath = path.join(process.cwd(), 'data', 'quran', 'index.json');
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export default async function QuranReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surah = await getSurah(id);
  const allSurahs = await getAllSurahs();

  if (!surah) {
    notFound();
  }

  return <QuranReaderClient surah={surah} allSurahs={allSurahs} />;
}
