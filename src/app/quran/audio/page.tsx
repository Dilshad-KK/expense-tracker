import fs from 'fs';
import path from 'path';
import AudioClient from './AudioClient';

async function getSurahs() {
  const filePath = path.join(process.cwd(), 'data', 'quran', 'index.json');
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data) as Array<{
    id: number;
    name: string;
    englishName: string;
    versesCount: number;
  }>;
}

export default async function AudioPage() {
  const surahs = await getSurahs();
  return <AudioClient surahs={surahs} />;
}
