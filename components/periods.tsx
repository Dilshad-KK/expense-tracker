import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { MdWaterDrop } from "react-icons/md";
import moment from 'moment';

type PeriodData = {
    id: string;
    last_period_date: string;
    cycle_length: number;
};


const Periods = () => {

    const [loading, setLoading] = useState(false);
    const [periods, setPeriods] = useState<PeriodData[]>([]);

    useEffect(() => {
        fetchPeriodData();
    }, []);

    async function fetchPeriodData() {
        setLoading(true);
        try {
            const res = await fetch('/api/periods');
            const data: PeriodData[] = await res.json();
            setPeriods(data);
        } catch (error) {
            console.error("Error fetching periods:", error);
        } finally {
            setLoading(false);
        }
    }

const getPeriodInfo = () => {
    const today = moment();
    const lastPeriodDate = moment(periods[0]?.last_period_date);
    const cycleLength = periods[0]?.cycle_length;

    if (!lastPeriodDate.isValid() || !cycleLength) {
      return {
        daysLeft: null,
        expectedDate: null,
        nextThreePeriods: [],
        text: 'Insufficient data to calculate period'
      };
    }

    const nextPeriodDate = lastPeriodDate.clone().add(cycleLength, "days");
    const rawDiff = nextPeriodDate.diff(today, "days");
    const daysLeft = rawDiff <= 0 ? 0 : rawDiff; // clamp at 0 for today/past

    let text = "";
    if (rawDiff <= 0) {
      text = "Next Period Is Expected Today";
    } else if (daysLeft === 1) {
      text = "Next Period Is Expected Tomorrow";
    } else {
      text = `Next Period Is Expected In ${daysLeft} days`;
    }

    // Next 6 expected periods starting from the upcoming one
    const nextThreePeriods: string[] = [];
    for (let i = 0; i < 6; i++) {
      const futureDate = nextPeriodDate.clone().add(cycleLength * i, "days");
      nextThreePeriods.push(futureDate.format("MMM Do YY"));
    }

    return {
      daysLeft,
      expectedDate: nextPeriodDate.format("MMM Do YY"),
      nextThreePeriods,
      text
    };
  };

    return (
        <div className='pb-[100px]'>
            <div className='flex justify-between'>
                <h3 className='text-left mb-4 text-base-content text-[16px] font-poppinsMed'>Menstrual Cycle</h3>
            </div>
            <div>
                {
                    loading ?
                        <div className="h-[90px] w-[100%] bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 px-4 py-4 rounded-[12px] flex mb-8 items-center">
                            <div className="skeleton h-[40px] w-[50px] bg-[#d6d6fc] dark:bg-base-300 rounded-[12px] mr-3"></div>
                            <div className='w-full flex flex-col items-center justify-center'>
                                <div className="skeleton h-3 w-[100%] bg-[#d6d6fc] dark:bg-base-300 mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] dark:bg-base-300 mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] dark:bg-base-300 rounded-[4px]"></div>
                            </div>
                        </div> :
                        <>
                            <Link
                                href="/periods"
                                className="relative mb-6 flex justify-between items-center w-full p-4 rounded-[8px] overflow-hidden bg-base-100 px-4 py-4 border border-base-content/20 shadow-sm"
                            >


                                <div className="relative z-20 text-base-content w-full">
                                    <div className='flex flex-row items-center justify-start'>
                                        <div className='bg-base-100 border border-base-300 h-[50px] w-[50px] rounded-lg flex flex-row items-center justify-center mr-[16px]'>
                                            <MdWaterDrop className='text-[24px] text-[#fc3f3f]  animate-bounce' />
                                        </div>
                                        <div className='flex flex-col items-start justify-center'>
                                            <span className='text-[12px] text-base-content font-poppinsMed mb-1'>{getPeriodInfo()?.text}</span>
                                            <span className='text-[10px] text-info font-poppinsMed mb-1'>  {getPeriodInfo()?.expectedDate || '-'}</span>
                                            <span className='text-[10px] text-success font-poppinsMed mb-1'>Last period was on {moment(periods[0]?.last_period_date).isValid() ? moment(periods[0]?.last_period_date).format("MMM Do YY") : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </>
                }
            </div>
        </div>
    )
}

export default Periods;
