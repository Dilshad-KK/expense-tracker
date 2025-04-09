import Link from 'next/link'
import React from 'react'
// import CountdownTimer from "@/components/timer";

const Home = () => {
  return (
    <div className='min-h-screen flex items-center px-8 py-12 flex-col bg-[#e8e8fd]'>
      {/* <div className='text-3xl font-bold text-center mb-8'>
        Welcome to <span className='text-primary'>IBU</span> Expense Tracker
      </div> */}
      {/* <CountdownTimer /> */}
      <div className='mb-8 flex justify-between w-full'>
        <Link href={"/ibuexpenses"} className='flex flex-col items-center justify-center'>
          <div className='bg-white h-[60px] w-[60px] rounded-full flex items-center justify-center mb-1'>
            <img src='/assets/icons/girl.png' className='h-[40px]' />
          </div>
          <h2 className='font-poppinsMed text-[14px] text-black/80'>S-TXNS</h2>
        </Link>
        <Link href="/ikkuexpensesuae" className='flex flex-col items-center justify-center'>
          <div className='bg-white h-[60px] w-[60px] rounded-full flex items-center justify-center mb-1'>
            <img src='/assets/icons/boy.png' className='h-[40px]' />
          </div>
          <h2 className='font-poppinsMed text-[14px] text-black/80'>D-TXNS-UAE</h2>
        </Link>
        <Link href="/ikkuexpensesindia" className='flex flex-col items-center justify-center'>
          <div className='bg-white h-[60px] w-[60px] rounded-full flex items-center justify-center mb-1'>
            <img src='/assets/icons/boy.png' className='h-[40px]' />
          </div>
          <h2 className='font-poppinsMed text-[14px] text-black/80'>D-TXNS-IND</h2>
        </Link>
      </div>
    </div>
  )
}

export default Home