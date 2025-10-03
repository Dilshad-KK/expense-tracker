import React, { useEffect, useMemo, useState } from 'react';

function getUpcomingJan8(now: Date) {
  const year = now.getFullYear();
  const jan8ThisYear = new Date(year, 0, 8, 0, 0, 0, 0); // Jan is month 0
  return now <= jan8ThisYear ? jan8ThisYear : new Date(year + 1, 0, 8, 0, 0, 0, 0);
}

function startOfToday(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export default function Jan8CounterCard() {
  const [now, setNow] = useState<Date>(() => new Date());

  const { remainingDays, percentRemaining } = useMemo(() => {
    const target = getUpcomingJan8(now);
    const start = startOfToday(now);
    const totalMs = Math.max(target.getTime() - start.getTime(), 1);
    const remainingMs = Math.max(target.getTime() - now.getTime(), 0);
    const percentRem = Math.min(100, Math.max(0, (remainingMs / totalMs) * 100));
    const daysLeft = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    return { remainingDays: daysLeft, percentRemaining: percentRem };
  }, [now]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000); // update each minute
    return () => clearInterval(id);
  }, []);

  const circleStyle: React.CSSProperties = {
    background: `conic-gradient(#514cff ${percentRemaining}%, #e5e7eb ${percentRemaining}%)`,
  };

  return (
    <div className='mt-4 p-4 rounded-[14px] bg-[#f3f3fd] border border-[#d3d3fe] flex items-center justify-between'>
      <div className='flex items-center'>
        <div className='relative h-[56px] w-[56px] rounded-full mr-3' style={circleStyle}>
          <div className='absolute inset-[6px] bg-white rounded-full flex items-center justify-center'>
            <span className='text-[12px] text-black font-poppinsMed'>{remainingDays}d</span>
          </div>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] text-black font-poppinsMed'>Jan 8 Countdown</span>
          <span className='text-[10px] text-black/60 font-poppinsMed'>{remainingDays} days remaining</span>
        </div>
      </div>
      <div className='text-[10px] text-[#514cff] font-poppinsMed'>{Math.round(100 - percentRemaining)}% done</div>
    </div>
  );
}

