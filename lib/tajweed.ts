export type TajweedRule = 'ghunnah' | 'allah' | null;

export interface TajweedSegment {
  text: string;
  rule: TajweedRule;
}

export function parseTajweed(arabicText: string): TajweedSegment[] {
  // Regex to match "Allah" in various forms (with prefixes like bi-llahi, li-llahi)
  const allahRegex = /(ٱللَّهِ|ٱللَّهَ|ٱللَّهُ|للَّهِ|للَّهَ|للَّهُ|اللَّهِ|اللَّهَ|اللَّهُ)/g;
  
  // Regex to match Meem or Noon followed by Shaddah (and optionally other vowels)
  const ghunnahRegex = /([من]ّ[\u064B-\u0652]?)/g;

  // Combine regexes using alternation and capture groups to keep the delimiters
  const combinedRegex = new RegExp(`(${allahRegex.source}|${ghunnahRegex.source})`, 'g');

  const parts = arabicText.split(combinedRegex);
  const segments: TajweedSegment[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part.match(allahRegex)) {
      segments.push({ text: part, rule: 'allah' });
    } else if (part.match(ghunnahRegex)) {
      segments.push({ text: part, rule: 'ghunnah' });
    } else {
      segments.push({ text: part, rule: null });
    }
  }

  // Deduplicate/merge adjacent null rules
  const mergedSegments: TajweedSegment[] = [];
  for (const seg of segments) {
    if (mergedSegments.length > 0 && mergedSegments[mergedSegments.length - 1].rule === null && seg.rule === null) {
      mergedSegments[mergedSegments.length - 1].text += seg.text;
    } else {
      mergedSegments.push(seg);
    }
  }

  return mergedSegments;
}
