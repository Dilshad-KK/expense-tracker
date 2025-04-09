import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Link from 'next/link';
import { RiHomeLine } from "react-icons/ri";
import { FaRegMessage } from "react-icons/fa6";
import { FaRegUser } from "react-icons/fa6";
import { BsViewList } from "react-icons/bs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <div className='bottom-0 w-full h-[60px] bg-white fixed'>
        <div className='grid grid-cols-12 w-full h-full'>
          <Link href={"/"} className="col-span-3 text-black flex items-center justify-center flex-col cursor-pointer">
            <RiHomeLine className="text-[18px] mb-1"/>
            <span className="text-[14px]">Home</span>
          </Link>
          <Link href={"/features"} className="col-span-3 text-black flex items-center justify-center flex-col cursor-pointer">
            <BsViewList className="text-[18px] mb-1"/>
            <span className="text-[14px]">Features</span>
          </Link>
          <Link href={"/chat"} className="col-span-3 text-black flex items-center justify-center flex-col cursor-pointer">
            <FaRegMessage className="text-[18px] mb-1"/>
            <span className="text-[14px]">Chat</span>
          </Link>
          <Link href={"/profile"} className="col-span-3 text-black flex items-center justify-center flex-col cursor-pointer">
            <FaRegUser className="text-[18px] mb-1"/>
            <span className="text-[14px]">Profile</span>
          </Link>
        </div>
      </div></>
  )

}
