'use client'

import { useRouter } from 'next/router'
import React from 'react'
import { FaArrowLeft } from "react-icons/fa6";

const GoBack = () => {
    const router = useRouter()
    return (
        <div 
            className='cursor-pointer z-[2000] transition-all duration-200 hover:scale-110 active:scale-95
                      bg-primary-content/20 dark:bg-primary-content/10 hover:bg-primary-content/30 
                      dark:hover:bg-primary-content/20 rounded-full w-8 h-8 flex items-center justify-center'
            onClick={() => router.back()}
        >
            <FaArrowLeft className='text-[16px] text-primary-content dark:text-primary-content/90' />
        </div>
    )
}

export default GoBack