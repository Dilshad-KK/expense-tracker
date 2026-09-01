import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { useRouter } from 'next/router'
import { IoHomeOutline, IoHome, IoChatbubbles, IoChatbubblesOutline } from 'react-icons/io5'
import { CgProfile, CgUser } from 'react-icons/cg'
import { supabase } from '@/lib/supabase';

const NavLinks = () => {
  const router = useRouter()
  const currentPath = router.pathname

  const [chatUnread, setChatUnread] = useState(0)
  const [navUser, setNavUser] = useState('')

  // Resolve user identity from localStorage
  useEffect(() => {
    const user = localStorage.getItem('userIdentity') || ''
    setNavUser(user)
  }, [])

  // Fetch unread count + subscribe to realtime inserts
  useEffect(() => {
    if (!navUser) return

    const fetchUnread = async () => {
      try {
        const res = await fetch(`/api/chat?count=1&user=${encodeURIComponent(navUser)}`)
        const data = await res.json()
        setChatUnread(data.count ?? 0)
      } catch {}
    }

    fetchUnread()

    // When a new message arrives from the other user, bump the badge
    const channel = supabase
      .channel('nav_chat_badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as any
          if (msg.sender !== navUser) {
            setChatUnread((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [navUser])

  // Clear badge when user navigates to /chat
  useEffect(() => {
    if (currentPath === '/chat') {
      setChatUnread(0)
    }
  }, [currentPath])

  // Don't render the nav bar on the chat page (it has its own fixed layout)
  if (currentPath === '/chat') return null

  const isActive = (path: string) => currentPath === path

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: {
        active: <IoHome className="text-primary text-lg" />,
        inactive: <IoHomeOutline className="text-[#A19F9F] dark:text-base-content/60 text-lg" />,
      },
      badge: 0,
    },
    {
      path: '/chat',
      label: 'Chat',
      icon: {
        active: <IoChatbubbles className="text-primary text-lg" />,
        inactive: <IoChatbubblesOutline className="text-[#A19F9F] dark:text-base-content/60 text-lg" />,
      },
      badge: chatUnread,
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: {
        active: <CgUser className="text-primary text-lg" />,
        inactive: <CgProfile className="text-[#A19F9F] dark:text-base-content/60 text-lg" />,
      },
      badge: 0,
    },
  ]

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[2000] md:inset-y-0 md:left-0 md:right-auto md:w-24 md:flex md:items-center md:justify-center">
      <div className="w-full max-w-[calc(42rem+2rem)] mx-auto px-4 md:px-0 md:max-w-none md:mx-0 nav-safe-area md:!h-auto md:!pb-0 flex items-end md:items-center md:justify-center">
        <div className="pointer-events-auto mb-3 md:mb-0 flex md:flex-col h-[74px] md:h-auto md:py-8 w-full md:w-[72px] items-center justify-around md:gap-8 rounded-[30px] md:rounded-[40px] border border-base-content/10 bg-white/95 px-3 md:px-0 shadow-[0_18px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:bg-base-200/95 dark:shadow-[0_18px_50px_rgba(0,0,0,0.38)]">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 flex-1 md:flex-none max-w-20 w-full group ${
              isActive(item.path) ? 'transform -translate-y-1 md:-translate-y-0 md:translate-x-1' : 'hover:-translate-y-0.5 md:hover:-translate-y-0 md:hover:translate-x-0.5'
            }`}
          >
            {/* Active indicator dot */}
            {isActive(item.path) && (
              <div className="w-1 h-1 bg-primary rounded-full mb-2 md:mb-0 md:absolute md:-left-3 animate-bounce md:animate-pulse" />
            )}

            {/* Icon container */}
            <div
              className={`relative rounded-2xl p-3 transition-all duration-300 mb-1 md:mb-2 group-hover:scale-110 ${
                isActive(item.path)
                  ? 'bg-primary/15 dark:bg-primary/25 shadow-lg scale-110'
                  : 'bg-transparent hover:bg-base-300/30 dark:hover:bg-base-300/20'
              }`}
            >
              {isActive(item.path) ? item.icon.active : item.icon.inactive}

              {/* Unread badge */}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-poppinsMed rounded-full min-w-4 h-4 flex items-center justify-center px-1 leading-none">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[10px] md:text-xs transition-all duration-300 font-poppinsMed ${
                isActive(item.path)
                  ? 'text-primary dark:text-primary-light font-poppinsBold scale-105'
                  : 'text-[#A19F9F] dark:text-base-content/60 group-hover:text-base-content dark:group-hover:text-base-content/80'
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
        </div>
      </div>
    </div>
  )
}

export default NavLinks
