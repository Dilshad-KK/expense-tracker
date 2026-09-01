import fs from 'fs';
import path from 'path';
import CollectionsClient from './CollectionsClient';

export default async function CollectionsPage() {
  const filePath = path.join(process.cwd(), 'data', 'quran', 'index.json');
  let allSurahs = [];
  if (fs.existsSync(filePath)) {
    allSurahs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }

  return <CollectionsClient allSurahs={allSurahs} />;
}
