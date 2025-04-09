import React from 'react'
import Link from 'next/link';
import { RiHomeLine } from "react-icons/ri";
import { FaRegMessage } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { BsViewList } from "react-icons/bs";
import { useRouter } from 'next/router'

const NavLinks = () => {
    const router = useRouter()
    const currentPath = router.pathname
  
    const isActive = (path:string) => currentPath === path

  return (
    <div className='bottom-0 w-full h-[90px] bg-white fixed'>
    <div className='grid grid-cols-12 w-full h-full'>
      <Link href={"/"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer ${isActive("/") ? 'text-[#4f4bf0]' : 'text-black'}`}>
        <RiHomeLine className="text-[18px] mb-1"/>
        <span className="text-[14px] font-poppins">Home</span>
      </Link>
      <Link href={"/features"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer ${isActive("/features") ? 'text-[#4f4bf0]' : 'text-black'}`}>
        <BsViewList className="text-[18px] mb-1"/>
        <span className="text-[14px]">Features</span>
      </Link>
      <Link href={"/chat"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer ${isActive("/chat") ? 'text-[#4f4bf0]' : 'text-black'}`}>
        <FaRegMessage className="text-[18px] mb-1"/>
        <span className="text-[14px]">Chat</span>
      </Link>
      <Link href={"/profile"} className={`col-span-3  flex items-center justify-center flex-col cursor-pointer ${isActive("/profile") ? 'text-[#4f4bf0]' : 'text-black'}`}>
        <FaRegUser className="text-[18px] mb-1"/>
        <span className="text-[14px]">Profile</span>
      </Link>
    </div>
  </div>
  )
}

export default NavLinks