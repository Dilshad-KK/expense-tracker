'use client'

import { useRouter } from 'next/router'
import React from 'react'
import { FaArrowLeft } from "react-icons/fa6";

const GoBack = () => {
    const router = useRouter()
  return (
    <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000] cursor-pointer' onClick={() => router.back()}>
    <FaArrowLeft className='text-[16px]' />
  </div>
  )
}

export default GoBack