import React from 'react'
import GoBack from './gobackSecond'

const CommonHeader = (props: { title: string }) => {
    return (
        <div className='bg-gradient-to-br from-primary to-primary/90 dark:from-primary-dark dark:to-primary-dark/90 px-4 py-6 flex justify-center items-center rounded-b-3xl h-[100px] relative shadow-lg overflow-hidden'>
            
            <div className='absolute left-5 z-[1003]'>
                <GoBack />
            </div>
            
            <span className='text-primary-content z-[2000] font-poppinsBold text-[18px] drop-shadow-sm'>
                {props.title}
            </span>
        </div>
    )
}

export default CommonHeader