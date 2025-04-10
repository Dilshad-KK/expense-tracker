import Link from 'next/link'
import React from 'react'
import { IoMdNotifications } from "react-icons/io";
import { PiMoneyThin } from "react-icons/pi";
import { FaPeoplePulling } from "react-icons/fa6";
import Slider from "react-slick";
// import CountdownTimer from "@/components/timer";

const Home = () => {

  var settings = {
    // dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true
  };
  var settings1 = {
    // dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true
  };

  return (
    <div className='bg-[#e8e8fd]'>
      <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <img src="/assets/icons/avatar.png" className='h-[35px]' />
        </div>
        <span className='text-white z-[2000]'>Welcome Back..!</span>
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
        <div className='flex justify-between'>
          <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Budget & Loans</h3>
          <h3 className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>View All</h3>
        </div>
        <div className='mb-8 w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>
          <Slider {...settings} className='max-w-[100%]'>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <PiMoneyThin className='text-[24px] text-[#8b81fa]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>Nikkah Ceremony</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>December 20 , 2025</span>
                  <span className='text-[10px] text-[#ff3030] font-poppinsMed mb-1'>Pending</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <PiMoneyThin className='text-[24px] text-[#8b81fa]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>MacBook Air M2</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>December 20 , 2025</span>
                  <span className='text-[10px] text-[#1aa127] font-poppinsMed mb-1'>Completed</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <PiMoneyThin className='text-[24px] text-[#8b81fa]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>House Construction</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>February 10 , 2022</span>
                  <span className='text-[10px] text-[#ff3030] font-poppinsMed mb-1'>Pending</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <PiMoneyThin className='text-[24px] text-[#8b81fa]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>Iphone 13</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>February 10 , 2022</span>
                  <span className='text-[10px] text-[#ff3030] font-poppinsMed mb-1'>Pending</span>
                </div>
              </div>
            </div>
            <div>
              <div className='flex flex-row items-center justify-start'>
                <div className='bg-[#eeedf9] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                  <PiMoneyThin className='text-[24px] text-[#8b81fa]' />
                </div>
                <div className='flex flex-col items-start justify-center'>
                  <span className='text-[12px] text-black font-poppinsMed mb-1'>Iphone 16 Pro</span>
                  <span className='text-[10px] text-[#858585] font-poppinsMed mb-1'>February 10 , 2022</span>
                  <span className='text-[10px] text-[#ff3030] font-poppinsMed mb-1'>Pending</span>
                </div>
              </div>
            </div>
          </Slider>
        </div>
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
          </Slider>
        </div>
        <div className='flex justify-between'>
          <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Checklist Today</h3>
          <h3 className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>View All</h3>
        </div>
        <div className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Menstrual Cycle</h3>
        <div className='mb-16 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>

      </div>
    </div>

  )
}

export default Home