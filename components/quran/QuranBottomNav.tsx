'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Headphones, Settings, Compass } from 'lucide-react';

export default function QuranBottomNav() {
  const pathname = usePathname() || "";

  const tabs = [
    {
      id: 'home',
      href: '/',
      icon: <Home className="w-5 h-5" />,
      label: 'Home'
    },
    {
      id: 'mushaf',
      href: '/quran',
      // We consider it active if we are exactly on /quran or reading a surah, 
      // but not audio, settings, or discover.
      isActive: pathname === '/quran' || (pathname.startsWith('/quran/') && !pathname.includes('/audio') && !pathname.includes('/settings') && !pathname.includes('/discover') && !pathname.includes('/mosque')),
      icon: <BookOpen className="w-5 h-5" />,
      label: 'Mushaf'
    },
    {
      id: 'discover',
      href: '/quran/discover',
      isActive: pathname.includes('/discover'),
      icon: <Compass className="w-5 h-5" />,
      label: 'Discover'
    },
    {
      id: 'audio',
      href: '/quran/audio',
      isActive: pathname.includes('/audio'),
      icon: <Headphones className="w-5 h-5" />,
      label: 'Audio'
    },
    {
      id: 'settings',
      href: '/quran/settings',
      isActive: pathname.includes('/settings'),
      icon: <Settings className="w-5 h-5" />,
      label: 'Settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-[var(--q-bg)]/85 backdrop-blur-2xl border-t border-[var(--q-border)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto">
        <nav className="px-6 py-3 flex items-center justify-between">
          {tabs.map((tab) => {
            // Determine active state manually if provided, otherwise exact match
            const isActive = tab.isActive !== undefined ? tab.isActive : pathname === tab.href;

            return (
              <Link 
                key={tab.id}
                href={tab.href}
                className={`flex items-center justify-center transition-all duration-300 rounded-full h-10 ${
                  isActive ? 'bg-white/15 px-5 shadow-sm' : 'w-10 hover:bg-[var(--q-border)]'
                }`}
              >
                <div className={`flex items-center space-x-2 ${isActive ? 'text-[var(--q-text)]' : 'text-[var(--q-accent)]/60 hover:text-[var(--q-accent)]'}`}>
                  {tab.icon}
                  {isActive && <span className="text-sm font-bold">{tab.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
