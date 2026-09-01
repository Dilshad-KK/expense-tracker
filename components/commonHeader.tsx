import React from 'react'
import GoBack from './gobackSecond'

type Props = {
  title: string;
  right?: React.ReactNode;
  showBack?: boolean;
}

const CommonHeader = ({ title, right, showBack = true }: Props) => {
  return (
    <div className='sticky top-0 z-[1600] px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur-xl'>
      <div className='page-shell relative flex items-center justify-between gap-3 overflow-hidden rounded-[30px] border border-primary/10 bg-gradient-to-br from-primary via-primary to-primary/85 px-4 py-4 shadow-[0_20px_60px_rgba(81,76,255,0.30)]'>
        <div className='pointer-events-none absolute inset-x-0 top-0 h-20 bg-white/10 blur-3xl' />
        <div className='z-[2000] flex min-w-0 items-center gap-3'>
          {showBack ? <GoBack /> : <div className='h-10 w-10 shrink-0' />}
          <span className='truncate text-xl font-poppinsBold tracking-[-0.02em] text-primary-content drop-shadow-sm'>
            {title}
          </span>
        </div>
        {right ? (
          <div className='z-[2000] flex shrink-0 items-center gap-2'>
            {right}
          </div>
        ) : (
          <div className='h-10 w-10 shrink-0' />
        )}
      </div>
    </div>
  )
}

export default CommonHeader
