import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoMdNotifications } from "react-icons/io";
import { FaPeoplePulling } from "react-icons/fa6";
import Slider from "react-slick";
import Clock from '@/components/time';
import { MdWaterDrop } from "react-icons/md";
import Loans from '@/components/loans';


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
        <div className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>
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
        <div className='flex justify-between'>
          <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Upcoming Occasions</h3>
          <h3 className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>View All</h3>
        </div>
        <div className='mb-8 w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>
          <Slider {...settings1} className='max-w-[100%]'>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <FaPeoplePulling className='text-[24px] text-[#a097ff]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>Banglore Days</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>June 20 , 2025</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <FaPeoplePulling className='text-[24px] text-[#a097ff]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>Banglore Days</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>June 20 , 2025</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <FaPeoplePulling className='text-[24px] text-[#a097ff]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>Banglore Days</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>June 20 , 2025</span>
                </div>
              </div>
            </div>
          </Slider>
        </div>
        <div className='flex justify-between'>
          <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Menstrual Cycle</h3>
          <h3 className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>Explore</h3>
        </div>
        <div className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>
          <div className='flex flex-row items-center justify-start'>
            <div className='bg-[#fdeded] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
              <MdWaterDrop className='text-[24px] text-[#fc3f3f]' />
            </div>
            <div className='flex flex-col items-start justify-center'>
              <span className='text-[12px] text-black font-poppinsMed mb-1'>Period Expected In</span>
              <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>17 days</span>
              <span className='text-[10px] text-[#7bb3f8] font-poppinsMed mb-1'>Last period was on March 30 , 2025</span>
            </div>
          </div>
        </div>
        <div className='flex justify-between'>
          <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Checklist Today</h3>
          <h3 className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>View All</h3>
        </div>
        <div className='mb-32 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>


      </div>
    </div>

  )
}

export default Home