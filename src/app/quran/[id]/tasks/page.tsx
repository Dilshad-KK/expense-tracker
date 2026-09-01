import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import TasksClient from './TasksClient';

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

  // Fetch page numbers from Quran.com API to augment the verses
  try {
    const res = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${surahId}?fields=page_number&per_page=500`, { next: { revalidate: 3600 * 24 } });
    if (res.ok) {
      const apiData = await res.json();
      if (apiData && apiData.verses) {
        data.verses = data.verses.map((verse: any, index: number) => {
          const apiVerse = apiData.verses[index];
          return {
            ...verse,
            page: apiVerse ? apiVerse.page_number : null
          };
        });
      }
    }
  } catch (error) {
    console.error("Failed to fetch page numbers", error);
  }

  return data;
}

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surah = await getSurah(id);

  if (!surah) {
    notFound();
  }

  return <TasksClient surah={surah} />;
}
