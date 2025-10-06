import React from 'react'
import GoBack from './gobackSecond'

const CommonHeader = (props:{title:string}) => {
    return (
        <div className='bg-primary px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[120px]'>
            <div className='absolute left-[-90px] top-[-80px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
            <div className='absolute left-[-30px] top-[-80px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
            <div className='absolute left-[32px] z-[1000]'>
                <GoBack />
            </div>
            <span className='text-white z-[2000] font-semibold text-[16px]'>{props.title}</span>
        </div>
    )
}

export default CommonHeader
