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
import Jan8CounterCard from '@/components/jan8Counter';

// import CountdownTimer from "@/components/timer";

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
    <div className='bg-[#ffffff]'>
      <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <img src="/assets/icons/avatar.png" className='h-[35px]' />
        </div>
        <div className='flex flex-col items-start w-[200px]'>
          <Clock />
          <span className='text-white z-[2000] font-poppinsMed mb-2'>Welcome Back {user}</span>
          <span className='text-[#ffffffe9] z-[2000] font-poppinsMed text-[12px]'>Have a nice day...!</span>
        </div>
        <Link href="/notifications" className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000] relative'>
          <IoMdNotifications className='text-[24px]' />
          {unread > 0 && (
            <span className='absolute -top-1 -right-1 bg-[#ff3b30] text-white text-[10px] rounded-full px-[6px] py-[2px] font-poppinsMed'>{unread}</span>
          )}
        </Link>
      </div>
      <div className='min-h-screen px-4 py-8'>
        <Categories />
        <Jan8CounterCard />
        <div className="h-[1px] bg-[#cccccc4c] w-full my-8" />
        <Loans />
        <Discussions />
        <Periods /> 
      </div>
    </div>

  )
}

export default Home
