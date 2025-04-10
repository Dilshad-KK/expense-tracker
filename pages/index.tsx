import Link from 'next/link'
import React from 'react'
import { IoMdNotifications } from "react-icons/io";
// import CountdownTimer from "@/components/timer";

const Home = () => {
  return (
    <div className='bg-[#e8e8fd]'>
      <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'>ff</div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'>ff</div>
        <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <img src="/assets/icons/avatar.png" className='h-[35px]' />
        </div>
        <span className='text-white z-[2000]'>Welcome Back..!</span>
        <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <IoMdNotifications className='text-[24px]' />
        </div>
      </div>
      <div className='min-h-screen px-4 py-12'>
        {/* <CountdownTimer /> */}
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsMed'>Transactions</h3>
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
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsMed'>Checklist Today</h3>
        <div className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsMed'>Upcoming Occasions</h3>
        <div className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsMed'>Menstrual Cycle</h3>
        <div className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>
        <h3 className='text-left mb-3 text-black text-[14px] font-poppinsMed'>Budget & Loans</h3>
        <div className='mb-16 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>

        </div>
      </div>
    </div>

  )
}

export default Home