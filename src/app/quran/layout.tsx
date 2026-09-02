import { ReactNode } from 'react';
import QuranBottomNav from '@/components/quran/QuranBottomNav';
import { QuranProvider } from "@/src/app/quran/QuranContext";
import GlobalAudioPlayer from "@/components/quran/GlobalAudioPlayer";

export default function QuranLayout({ children }: { children: ReactNode }) {
  return (
    <QuranProvider>
      <div className="w-full h-[100dvh] flex flex-col relative bg-[var(--q-bg)]">
        <GlobalAudioPlayer />
        {/* Main Content Area */}
        <div className="flex-1 w-full flex flex-col overflow-y-auto">
          {children}
        </div>
        
        {/* Global Floating Nav for Quran Module */}
        <QuranBottomNav />
      </div>
    </QuranProvider>
  );
}
