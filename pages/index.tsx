import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';
import { useAppDispatch } from '@/lib/store';
import { fetchUnreadCount } from '@/store/notificationsSlice';
import { IoMdNotifications } from "react-icons/io";
import Clock from '@/components/time';

import Loans from '@/components/loans';
import Discussions from '@/components/discussions';
import Categories from '@/components/categories';
import Periods from '@/components/periods';
import { IoSettingsSharp } from 'react-icons/io5';
import SettingsModal from '@/components/SettingsModal';

const Home = () => {

  const [user, setUser] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const unread = useSelector((s: RootState) => s.notifications.unreadCount);

  useEffect(() => {
    const cachedUser = localStorage.getItem("userIdentity");

    if (cachedUser) {
      setUser(cachedUser);
      return;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let user = "";
    if (timezone.includes("Asia/Dubai")) {
      user = "Dilshad";
    } else {
      user = "Shifa Dilshad";
    }

    localStorage.setItem("userIdentity", user);
    setUser(user);
  }, []);

  useEffect(() => { dispatch(fetchUnreadCount()); }, [dispatch]);

  // One-time auto-fix: if an old OneSignal SW is controlling the scope, reset it.
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
      try {
        const already = localStorage.getItem('swAutoResetDone') === '1';
        if (already) return;
        const reg = await navigator.serviceWorker.getRegistration();
        const script = reg?.active?.scriptURL || '';
        if (script.includes('OneSignalSDKWorker')) {
          // Unsubscribe and unregister legacy workers, clear caches, then reload
          try {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) {
              try { const sub = await r.pushManager.getSubscription(); if (sub) await sub.unsubscribe(); } catch {}
              await r.unregister();
            }
          } catch {}
          try {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          } catch {}
          localStorage.setItem('swAutoResetDone', '1');
          setTimeout(() => window.location.reload(), 300);
        }
      } catch {}
    })();
  }, []);

  return (
    <div className='bg-base-100 dark:bg-base-400'>
      <div className='relative bg-primary dark:bg-primary/80 h-[150px] rounded-b-[60px] flex justify-between items-center px-4 overflow-hidden'>
        <div className='absolute left-[-90px] z-[1000] bg-white/10 dark:bg-white/3 rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-white/10 dark:bg-white/3 rounded-full w-[200px] h-[200px]'></div>
        <div className='h-[50px] w-[50px] bg-white dark:bg-white/80 rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <img src="/assets/icons/avatar.png" className='h-[35px]' />
        </div>
        <div className='flex flex-col items-start w-[200px]'>
          <Clock />
          <span className='text-white dark:text-white/90 z-[2000] font-poppinsMed mb-2'>Welcome Back {user}</span>
          <span className='text-white/90 dark:text-white/70 z-[2000] font-poppinsMed text-[12px]'>Have a nice day...!</span>
        </div>
        <div className="flex gap-2 relative z-[2000]">
          <button onClick={() => setIsSettingsOpen(true)} className='h-[42px] w-[42px] bg-white/20 dark:bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors active:scale-95'>
            <IoSettingsSharp className='text-[20px] text-white' />
          </button>
          
          <Link href="/notifications" className='h-[42px] w-[42px] bg-white dark:bg-white/80 rounded-full flex items-center justify-center relative shadow-sm'>
            <IoMdNotifications className='text-[22px] text-primary' />
            {unread > 0 && (
              <span className='absolute -top-1 -right-1 bg-error text-white text-[10px] rounded-full px-[6px] py-[2px] font-poppinsMed shadow-sm'>{unread}</span>
            )}
          </Link>
        </div>
      </div>
      <div className='min-h-dvh px-4 py-8 dark:bg-base-400 page-body'>
        <Categories />
        <div className="h-px bg-base-content/20 dark:bg-base-content/5 w-full my-4" />
        <Loans />
        <Discussions />
        <Periods /> 
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentUser={user} 
      />
    </div>

  )
}

export default Home
