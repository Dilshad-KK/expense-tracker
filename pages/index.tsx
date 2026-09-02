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

const Home = () => {

  const [user, setUser] = useState("");
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
    <div className='min-h-dvh bg-base-100 dark:bg-base-400'>
      <div className='page-frame pt-4'>
        <div className='relative overflow-hidden rounded-[34px] bg-primary dark:bg-primary/80 px-5 py-6 shadow-[0_24px_60px_rgba(81,76,255,0.24)]'>
          <div className='absolute left-[-90px] top-[-20px] z-[0] h-[200px] w-[200px] rounded-full bg-white/10 dark:bg-white/3'></div>
          <div className='absolute left-[-30px] top-[-20px] z-[0] h-[200px] w-[200px] rounded-full bg-white/10 dark:bg-white/3'></div>
          <div className='relative z-[1] flex items-center justify-between gap-4'>
            <div className='flex min-w-0 items-center gap-4'>
              <div className='flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-white dark:bg-white/80'>
                <img src="/assets/icons/avatar.png" className='h-[35px]' />
              </div>
              <div className='min-w-0'>
                <Clock />
                <span className='mb-2 block truncate font-poppinsMed text-white dark:text-white/90'>Welcome Back {user}</span>
                <span className='block text-[12px] font-poppinsMed text-white/90 dark:text-white/70'>Have a nice day...!</span>
              </div>
            </div>
            <div className="relative z-[1] flex shrink-0 gap-2">
              
              <Link href="/profile" className='flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors active:scale-95 hover:bg-white/30 dark:bg-white/10'>
                <IoSettingsSharp className='text-[20px] text-white' />
              </Link>

              <Link href="/notifications" className='relative flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white shadow-sm dark:bg-white/80'>
                <IoMdNotifications className='text-[22px] text-primary' />
                {unread > 0 && (
                  <span className='absolute -top-1 -right-1 rounded-full bg-error px-[6px] py-[2px] text-[10px] text-white font-poppinsMed shadow-sm'>{unread}</span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='page-frame page-body py-8 dark:bg-base-400'>
        <Categories />
        <div className="h-px bg-base-content/20 dark:bg-base-content/5 w-full my-4" />
        <Loans />
        <Discussions />
        <Periods /> 
      </div>
    </div>

  )
}

export default Home
