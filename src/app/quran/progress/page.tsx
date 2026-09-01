import fs from 'fs';
import path from 'path';
import ProgressClient from './ProgressClient';

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

export default async function ProgressPage() {
  const surahs = await getSurahs();
  return <ProgressClient surahs={surahs} />;
}
