import React from 'react'
import GoBack from './gobackSecond'

type Props = {
  title: string;
  right?: React.ReactNode;
  showBack?: boolean;
}

const CommonHeader = ({ title, right, showBack = true }: Props) => {
  return (
    <div className='bg-gradient-to-br from-primary to-primary/90 px-4 py-6 flex justify-center items-center rounded-b-3xl h-[100px] relative shadow-lg overflow-hidden'>
      {showBack && (
        <div className='absolute left-5 z-[1003]'>
          <GoBack />
        </div>
      )}
      <span className='text-primary-content z-[2000] font-poppinsBold text-[18px] drop-shadow-sm'>
        {title}
      </span>
      {right && (
        <div className='absolute right-5 z-[1003]'>
          {right}
        </div>
      )}
    </div>
  )
}

export default CommonHeader
