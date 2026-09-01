'use client'

import { useRouter } from 'next/router'
import React from 'react'
import { FaArrowLeft } from "react-icons/fa6";

const GoBack = () => {
    const router = useRouter()
    return (
        <div 
            className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl
                      border border-primary-content/10 bg-primary-content/15 text-primary-content
                      shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200
                      hover:scale-[1.03] hover:bg-primary-content/20 active:scale-95'
            onClick={() => router.back()}
        >
            <FaArrowLeft className='text-[15px]' />
        </div>
    )
}

export default GoBack
