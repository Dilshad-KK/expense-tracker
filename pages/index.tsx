import React, { useEffect, useState } from 'react'
import Link from 'next/link'
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
        <Categories />
        <Jan8CounterCard />
        <Link
          href="/notifications"
          className='mt-4 p-4 rounded-[14px] bg-[#f3f3fd] border border-[#d3d3fe] flex items-center justify-between'
        >
          <div className='flex items-center'>
            <div className='relative h-[40px] w-[40px] rounded-full mr-3 bg-white border border-[#e5e7eb] flex items-center justify-center'>
              <IoMdNotifications className='text-[20px] text-[#514cff]' />
            </div>
            <div className='flex flex-col'>
              <span className='text-[12px] text-black font-poppinsMed'>Notifications Test</span>
              <span className='text-[10px] text-black/60 font-poppinsMed'>Open to register device and test push</span>
            </div>
          </div>
          <span className='text-[10px] text-[#514cff] font-poppinsMed'>Open</span>
        </Link>
        <div className="h-[1px] bg-[#cccccc4c] w-full my-8" />
        <Loans />
        <Discussions />
        <Periods /> 
      </div>
    </div>

  )
}

export default Home
