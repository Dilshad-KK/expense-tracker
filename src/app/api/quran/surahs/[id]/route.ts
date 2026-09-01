import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate ID is a number between 1 and 114
    const surahId = parseInt(id, 10);
    if (isNaN(surahId) || surahId < 1 || surahId > 114) {
      return NextResponse.json({ error: 'Invalid Surah ID' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'quran', `${surahId}.json`);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Surah not found' }, { status: 404 });
    }

    const data = fs.readFileSync(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading Surah:', error);
    return NextResponse.json({ error: 'Failed to load Surah data' }, { status: 500 });
  }
}
