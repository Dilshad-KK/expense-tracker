import React from 'react'
import Link from 'next/link';
import { FaRegUser } from "react-icons/fa6";
import { useRouter } from 'next/router'

const NavLinks = () => {
  const router = useRouter()
  const currentPath = router.pathname

  const isActive = (path: string) => currentPath === path

  return (
    <div className='bottom-0 w-full h-[90px] bg-white fixed shadow-[0_-4px_10px_rgba(0,0,0,0.1)] z-50'>
      <div className='flex justify-between px-12 w-full h-full'>
        <Link href={"/"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer`}>
          <img src={isActive("/") ? "/assets/icons/home-active.png" : "/assets/icons/home.png"} className='h-[22px]' />
          <span className={`text-[12px]  font-poppinsMed ${isActive("/") ? 'text-[#534fd6]' : 'text-[#A19F9F]'}`}>Home</span>
        </Link>
        {/* <Link href={"/features"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer ${isActive("/features") ? 'text-[#4f4bf0]' : 'text-black'}`}>
          <BsViewList className="text-[18px] mb-1" />
          <span className="text-[14px]">Features</span>
        </Link> */}
        <Link href={"/chat"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer`}>
          <img src={isActive("/chat") ? "/assets/icons/chat-active.png" : "/assets/icons/chat.png"} className='h-[24px]' />
          <span className={`text-[12px]  font-poppinsMed ${isActive("/chat") ? 'text-[#534fd6]' : 'text-[#A19F9F]'}`}>Chat</span>
        </Link>
        <Link href={"/profile"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer`}>
          <img src={isActive("/profile") ? "/assets/icons/profile-active.png" : "/assets/icons/profile.png"} className='h-[24px]' />
          <span className={`text-[12px]  font-poppinsMed ${isActive("/profile") ? 'text-[#534fd6]' : 'text-[#A19F9F]'}`}>Profile</span>
        </Link>
      </div>
    </div>
  )
}

export default NavLinks