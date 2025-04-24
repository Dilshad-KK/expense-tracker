import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoMdNotifications } from "react-icons/io";
import Clock from '@/components/time';

import Loans from '@/components/loans';
import Discussions from '@/components/discussions';
import Periods from '@/components/periods';

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
    <div className='bg-[#e8e8fd]'>
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
        {/* <CountdownTimer /> */}
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Transactions</h3>
        <div className='mb-6 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>
          <Link href={"/ibuexpenses"} className='flex flex-col items-center justify-center'>
            <div className='bg-[#f0f6fb] h-[60px] w-[60px] rounded-full flex items-center justify-center mb-[8px]'>
              <img src='/assets/icons/girl.png' className='h-[40px]' />
            </div>
            <h2 className='font-poppinsMed text-[12px] text-black/80'>S-TXNS</h2>
          </Link>
          <Link href="/ikkuexpensesuae" className='flex flex-col items-center justify-center'>
            <div className='bg-[#f0f6fb] h-[60px] w-[60px] rounded-full flex items-center justify-center mb-[8px]'>
              <img src='/assets/icons/boy.png' className='h-[40px]' />
            </div>
            <h2 className='font-poppinsMed text-[12px] text-black/80'>D-TXNS-UAE</h2>
          </Link>
          <Link href="/ikkuexpensesindia" className='flex flex-col items-center justify-center'>
            <div className='bg-[#f0f6fb] h-[60px] w-[60px] rounded-full flex items-center justify-center mb-[8px]'>
              <img src='/assets/icons/boy.png' className='h-[40px]' />
            </div>
            <h2 className='font-poppinsMed text-[12px] text-black/80'>D-TXNS-IND</h2>
          </Link>
        </div>
        <Loans />
        <Discussions/>
        <Periods/>
      </div>
    </div>

  )
}

export default Home