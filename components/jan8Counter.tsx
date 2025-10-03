import React, { useEffect, useMemo, useState } from 'react';

function getUpcomingJan8(now: Date) {
  const year = now.getFullYear();
  const jan8ThisYear = new Date(year, 0, 8, 0, 0, 0, 0);
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
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const circleStyle: React.CSSProperties = {
    background: `conic-gradient(rgb(59 130 246) ${percentRemaining}%, rgb(243 244 246) ${percentRemaining}%)`,
  };

  return (
    <div className='mt-8 p-4 rounded-lg bg-white border border-gray-200 shadow-sm hover:shadow-xs transition-shadow duration-200'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='relative h-12 w-12 rounded-full' style={circleStyle}>
            <div className='absolute inset-1 bg-white rounded-full flex items-center justify-center'>
              <span className='text-xs text-gray-700 font-medium'>{remainingDays}d</span>
            </div>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm text-gray-900 font-medium'>Jan 8 Countdown</span>
            <span className='text-xs text-gray-500'>{remainingDays} days remaining</span>
          </div>
        </div>
        <div className='text-xs text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full'>
          {Math.round(100 - percentRemaining)}% complete
        </div>
      </div>
    </div>
  );
}