import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'quran', 'index.json');
    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading Quran index:', error);
    return NextResponse.json({ error: 'Failed to load Quran surahs index' }, { status: 500 });
  }
}
