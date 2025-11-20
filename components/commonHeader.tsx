import React from 'react'
import GoBack from './gobackSecond'

type Props = {
  title: string;
  right?: React.ReactNode;
  showBack?: boolean;
}

const CommonHeader = ({ title, right, showBack = true }: Props) => {
  return (
    <div className='bg-gradient-to-br from-primary to-primary/90 px-4 py-6 flex items-center justify-between rounded-b-3xl h-[100px] shadow-lg overflow-hidden mb-8'>
      <div className='flex items-center gap-3 z-[2000]'>
        {showBack && <GoBack />}
        <span className='text-primary-content font-poppinsBold text-[18px] drop-shadow-sm'>
          {title}
        </span>
      </div>
      {right ? (
        <div className='z-[2000] flex items-center gap-2'>
          {right}
        </div>
      ) : <div className='w-6' />}
    </div>
  )
}

export default CommonHeader
