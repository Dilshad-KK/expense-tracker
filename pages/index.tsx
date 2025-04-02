import Link from 'next/link'
import React from 'react'

const Home = () => {
  return (
    <div className='min-h-screen flex items-center justify-center p-12 flex-col'>
      <div className='text-3xl font-bold text-center mb-8'>
        Welcome to <span className='text-primary'>IBU</span> Expense Tracker
      </div>
      <div className='flex justify-between'>
        <Link href={"/ibuexpenses"} className="btn btn-soft btn-info mr-2">Ibu</Link>
        <Link href={"/ikkuexpenses"} className="btn btn-soft btn-success">Ikku</Link>
      </div>
    </div>
  )
}

export default Home