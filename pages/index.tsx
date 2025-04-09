import Link from 'next/link'
import React from 'react'
import CountdownTimer from "@/components/timer";

const Home = () => {
  return (
    <div className='min-h-screen flex items-center justify-center p-12 flex-col'>
      <div className='text-3xl font-bold text-center mb-8'>
        Welcome to <span className='text-primary'>IBU</span> Expense Tracker
      </div>
      <CountdownTimer/>
      <div className='flex justify-between'>
        <Link href={"/ibuexpenses"} className="btn btn-soft btn-info mr-2">Ibootty</Link>
        <Link href={"/ikkuexpensesuae"} className="btn btn-soft btn-success mr-2">Ikku UAE</Link>
        <Link href={"/ikkuexpensesindia"} className="btn btn-outline text-violet-300 bg-violet-950 border-transparent">Ikku India</Link>
      </div>
      {/* <div className='absolute bottom-0 w-full h-[50px] bg-white'>sd</div> */}
    </div>
  )
}

export default Home