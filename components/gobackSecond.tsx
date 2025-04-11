'use client'

import { useRouter } from 'next/router'
import React from 'react'
import { FaArrowLeft } from "react-icons/fa6";

const GoBack = () => {
    const router = useRouter()
  return (
    <div className='cursor-pointer z-[2000]' onClick={() => router.back()}>
    <FaArrowLeft className='text-[18px] text-white' />
  </div>
  )
}

export default GoBack