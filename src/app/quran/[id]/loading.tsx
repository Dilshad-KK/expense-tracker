import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--q-bg)] text-[var(--q-text)] space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--q-accent)]" />
      <p className="text-sm font-medium text-[var(--q-accent)] animate-pulse">Loading Surah...</p>
    </div>
  );
}
