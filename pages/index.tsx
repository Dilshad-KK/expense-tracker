import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoMdNotifications } from "react-icons/io";
import Clock from '@/components/time';

import Loans from '@/components/loans';
import Discussions from '@/components/discussions';
import { CiReceipt } from "react-icons/ci";
import { PiBankLight } from "react-icons/pi";
import { HiOutlineChatBubbleBottomCenter } from "react-icons/hi2";
import { IoIosFemale } from "react-icons/io";
import { BsGraphUp } from "react-icons/bs";

// import CountdownTimer from "@/components/timer";

const Home = () => {

  var settings1 = {
    // dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true
  };

  const [user, setUser] = useState("");

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
        <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <IoMdNotifications className='text-[24px]' />
        </div>
      </div>
      <div className='min-h-screen px-4 py-8'>
        <h3 className='text-left mb-4 text-black text-[16px] font-poppinsMed'>Category</h3>
        <div className='flex mb-8 justify-between'>
          <Link className='flex items-center justify-center flex-col' href={"/ibuexpenses"}>
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#e9f6ed] mb-2 rounded-[14px]'>
              <CiReceipt className='text-[30px] text-[#75dc92]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>S-TXNS</div>
          </Link>
          <Link className='flex items-center justify-center flex-col' href="/ikkuexpensesindia">
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#eef8fe] mb-2 rounded-[14px]'>
              <CiReceipt className='text-[30px] text-[#59afc9]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>D-TXNS 🇮🇳</div>
          </Link>
          <Link className='flex items-center justify-center flex-col' href="/ikkuexpensesuae">
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#fcfae5] mb-2 rounded-[14px]'>
              <CiReceipt className='text-[30px] text-[#d8c627]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>D-TXNS 🇦🇪</div>
          </Link>
          <Link className='flex items-center justify-center flex-col' href={"/allloans"}>
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#f0edfd] mb-2 rounded-[14px]'>
              <PiBankLight className='text-[26px] text-[#908acf]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>LOANS</div>
          </Link>
        </div>
        <div className='flex mb-16 justify-between'>
          <Link className='flex items-center justify-center flex-col' href={"/alldiscussions"}>
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#fbf0fa] mb-2 rounded-[14px]'>
              <HiOutlineChatBubbleBottomCenter className='text-[26px] text-[#560f5497]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>TALKS</div>
          </Link>
          <Link className='flex items-center justify-center flex-col' href="/periods">
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#fbefec] mb-2 rounded-[14px]'>
              <IoIosFemale className='text-[26px] text-[#c44624]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>PERIODS</div>
          </Link>
          <Link className='flex items-center justify-center flex-col' href="/">
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#edf2fa] mb-2 rounded-[14px]'>
              <BsGraphUp className='text-[26px] text-[#6ea2f7]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>BUDGET</div>
          </Link>
          <Link className='flex items-center justify-center flex-col' href={"/"}>
            <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#ecfbea] mb-2 rounded-[14px]'>
              <PiBankLight className='text-[26px] text-[#269018]' />
            </div>
            <div className='font-poppinsMed text-[12px] text-black/70 text-center'>SAVINGS</div>
          </Link>
        </div>
        <Loans />
        <Discussions />
        {/* <Periods />  */}
      </div>
    </div>

  )
}

export default Home