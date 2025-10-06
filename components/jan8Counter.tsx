import React, { useEffect, useMemo, useState } from 'react';

function getUpcomingJan8(now: Date) {
  const year = now.getFullYear();
  const jan8ThisYear = new Date(year, 0, 8, 0, 0, 0, 0);
  return now <= jan8ThisYear ? jan8ThisYear : new Date(year + 1, 0, 8, 0, 0, 0, 0);
}

function getCycleStartForTarget(targetJan8: Date) {
  // Fixed cycle start: June 29 of the year prior to the upcoming Jan 8
  const startYear = targetJan8.getFullYear() - 1;
  return new Date(startYear, 5, 29, 0, 0, 0, 0); // June is month index 5
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function countWeekdays(start: Date, end: Date) {
  // Count working days (Mon-Fri) from start (inclusive) to end (exclusive)
  let s = startOfDay(start);
  const e = startOfDay(end);
  if (e <= s) return 0;
  let count = 0;
  while (s < e) {
    const day = s.getDay(); // 0 Sun ... 6 Sat
    if (day !== 0 && day !== 6) count++;
    s = new Date(s.getFullYear(), s.getMonth(), s.getDate() + 1);
  }
  return count;
}

export default function Jan8CounterCard() {
  const [now, setNow] = useState<Date>(() => new Date());

  const { remainingDays, percentRemaining, totalDays, elapsedDays, remainingWorkDays } = useMemo(() => {
    const target = getUpcomingJan8(now);
    const start = getCycleStartForTarget(target);
    // If we're before cycle start, treat progress as 0 and remaining as full
    const nowForProgress = now < start ? start : now;
    const totalMs = Math.max(target.getTime() - start.getTime(), 1);
    const remainingMsForProgress = Math.max(target.getTime() - nowForProgress.getTime(), 0);
    const percentRem = Math.min(100, Math.max(0, (remainingMsForProgress / totalMs) * 100));
    // Remaining days should be based on actual now (not clamped) for the label
    const remainingMsActual = Math.max(target.getTime() - now.getTime(), 0);
    const daysLeft = Math.max(0, Math.ceil(remainingMsActual / (1000 * 60 * 60 * 24)));
    const totalDays = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60 * 24)));
    const elapsedMs = Math.max(0, nowForProgress.getTime() - start.getTime());
    const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24))));
    // Working days
    const totalWorkDays = countWeekdays(start, target);
    const elapsedWorkDays = countWeekdays(start, nowForProgress);
    const remainingWorkDays = Math.max(0, totalWorkDays - elapsedWorkDays);
    return { remainingDays: daysLeft, percentRemaining: percentRem, totalDays, elapsedDays, remainingWorkDays };
  }, [now]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const percentDone = Math.round(100 - percentRemaining);

  return (
    <div className='mt-8 p-4 rounded-lg bg-base-100 border border-base-300 shadow-sm hover:shadow-xs transition-shadow duration-200'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div
            className='radial-progress text-primary'
            style={{ ['--value' as any]: percentDone, ['--size' as any]: '3rem', ['--thickness' as any]: '6px' }}
            role='progressbar'
            aria-valuenow={percentDone}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className='text-xs text-base-content font-medium'>{remainingDays}d</span>
          </div>
          <div className='flex flex-col'>
            <span className='text-sm text-base-content font-medium'>Jan 8 Countdown</span>
            <span className='text-xs text-base-content/70'>{remainingDays} days remaining</span>
            <span className='text-[11px] text-base-content/50'>Working left: {remainingWorkDays} days</span>
          </div>
        </div>
        <div className='text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full'>
          {percentDone}% • {elapsedDays}/{totalDays} days
        </div>
      </div>
    </div>
  );
}
