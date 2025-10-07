import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { HiHome, HiChatBubbleLeftRight, HiUser } from 'react-icons/hi2'
import { IoHomeOutline, IoHome } from 'react-icons/io5'
import { TbMessage, TbMessage2, TbChartPie } from 'react-icons/tb'
import { CgProfile, CgUser } from 'react-icons/cg'
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store';

const NavLinks = () => {
  const router = useRouter()
  const currentPath = router.pathname
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [bottomOffset, setBottomOffset] = useState<number>(0);

  useEffect(() => {
    const vv: any = (typeof window !== 'undefined' ? (window as any).visualViewport : null);
    const compute = () => {
      try {
        const h = window.innerHeight || 0;
        const vvH = vv?.height || h;
        const vvTop = vv?.offsetTop || 0;
        const kb = Math.max(0, h - vvH - vvTop);
        const isOpen = kb > 40; // smaller threshold for Android/iOS
        setKeyboardOpen(isOpen);
        // Only adjust on chat route; elsewhere keep anchored bottom
        setBottomOffset(currentPath === '/chat' ? (isOpen ? kb : 0) : 0);
      } catch {
        setKeyboardOpen(false);
        setBottomOffset(0);
      }
    };
    const onFocus = (e: any) => {
      const tag = (e?.target?.tagName || '').toLowerCase();
      if (currentPath === '/chat' && (tag === 'input' || tag === 'textarea')) compute();
    };
    const onBlur = () => compute();
    if (vv) {
      vv.addEventListener('resize', compute);
      vv.addEventListener('scroll', compute);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focusin', onFocus);
      window.addEventListener('focusout', onBlur);
    }
    compute();
    return () => {
      try { vv && vv.removeEventListener('resize', compute); vv && vv.removeEventListener('scroll', compute); } catch {}
      try { window.removeEventListener('focusin', onFocus); window.removeEventListener('focusout', onBlur); } catch {}
    };
  }, [currentPath]);
  const unread = useSelector((s: RootState) => s.notifications.unreadCount);

  const isActive = (path: string) => currentPath === path

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: {
        active: <IoHome className="text-primary text-lg" />,
        inactive: <IoHomeOutline className="text-[#A19F9F] dark:text-base-content/60 text-lg" />
      }
    },
    {
      path: "/chat",
      label: "Chat",
      icon: {
        active: <TbMessage className="text-primary text-lg" />,
        inactive: <TbMessage2 className="text-[#A19F9F] dark:text-base-content/60 text-lg" />
      }
    },
    {
      path: "/profile",
      label: "Profile",
      icon: {
        active: <CgUser className="text-primary text-lg" />,
        inactive: <CgProfile className="text-[#A19F9F] dark:text-base-content/60 text-lg" />
      }
    }
  ]

  // Hide tabs on chat and Dubai Plan screens
  if (currentPath === '/chat' || currentPath === '/dubai-plan') return null;

  return (
    <div className='fixed bottom-0 w-full h-[88px] bg-white dark:bg-base-200 
                    shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]
                    border-t border-base-300/50 dark:border-base-400 z-[2000] 
                    rounded-t-3xl backdrop-blur-sm bg-white/95 dark:bg-base-200/95'
         style={{ bottom: bottomOffset }}>
      <div className='flex justify-around items-center w-full h-full px-6'>
        {navItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path} 
            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 flex-1 max-w-[80px] group ${
              isActive(item.path) 
                ? 'transform -translate-y-1' 
                : 'hover:-translate-y-0.5'
            }`}
          >
            {/* Active Indicator */}
            {isActive(item.path) && (
              <div className='w-1 h-1 bg-primary rounded-full mb-2 animate-bounce' />
            )}
            
            {/* Icon Container */}
            <div className={`
              rounded-2xl p-3 transition-all duration-300 mb-1 group-hover:scale-110
              ${isActive(item.path) 
                ? 'bg-primary/15 dark:bg-primary/25 shadow-lg scale-110' 
                : 'bg-transparent hover:bg-base-300/30 dark:hover:bg-base-300/20'
              }
            `}>
              <div className="relative">
                {isActive(item.path) ? item.icon.active : item.icon.inactive}
                {item.path === '/chat' && unread > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-error text-error-content text-[10px] flex items-center justify-center shadow">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </div>
            </div>
            
            {/* Label */}
            <span className={`
              text-[11px] transition-all duration-300 font-poppinsMed
              ${isActive(item.path) 
                ? 'text-primary dark:text-primary-light font-poppinsBold scale-105' 
                : 'text-[#A19F9F] dark:text-base-content/60 group-hover:text-base-content dark:group-hover:text-base-content/80'
              }
            `}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default NavLinks
