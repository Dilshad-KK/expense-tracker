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
    <div
      className="fixed bottom-0 w-full h-[88px] bg-white dark:bg-base-200
                  shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.4)]
                  border-t border-base-300/50 dark:border-base-400 z-[2000]
                  rounded-t-3xl backdrop-blur-sm bg-white/95 dark:bg-base-200/95"
      style={{ bottom: 0 }}
    >
      <div className="flex justify-around items-center w-full h-full px-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 flex-1 max-w-[80px] group ${
              isActive(item.path) ? 'transform -translate-y-1' : 'hover:-translate-y-0.5'
            }`}
          >
            {/* Active indicator dot */}
            {isActive(item.path) && (
              <div className="w-1 h-1 bg-primary rounded-full mb-2 animate-bounce" />
            )}

            {/* Icon container */}
            <div
              className={`relative rounded-2xl p-3 transition-all duration-300 mb-1 group-hover:scale-110 ${
                isActive(item.path)
                  ? 'bg-primary/15 dark:bg-primary/25 shadow-lg scale-110'
                  : 'bg-transparent hover:bg-base-300/30 dark:hover:bg-base-300/20'
              }`}
            >
              {isActive(item.path) ? item.icon.active : item.icon.inactive}

              {/* Unread badge */}
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-[9px] font-poppinsMed rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-[4px] leading-none">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] transition-all duration-300 font-poppinsMed ${
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
  )
}

export default NavLinks
