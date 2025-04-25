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
            console.error("Error fetching discussions:", error);
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

    // Calculate the next period date
    const nextPeriodDate = lastPeriodDate.clone().add(cycleLength, "days");
    const daysLeft = nextPeriodDate.diff(today, "days");

    // Prepare the text
    let text = "";
    if (daysLeft <= 0) {
      text = "Next Period Is Expected Today";
    } else if (daysLeft === 1) {
      text = "Next Period Is Expected Tomorrow";
    } else {
      text = `Next Period Is Expected In ${daysLeft} days`;
    }

    // Generate the next 3 expected period dates
    const nextThreePeriods = [];
    for (let i = 1; i < 4; i++) {
      const futureDate = lastPeriodDate.clone().add(cycleLength * (i + 1), "days");
      nextThreePeriods.push(futureDate.format("MMM Do YY"));
    }

    return {
      daysLeft,
      expectedDate: nextPeriodDate.isSameOrBefore(today, 'day')
        ? today.format("MMM Do YY")
        : nextPeriodDate.format("MMM Do YY"),
      nextThreePeriods,
      text
    };
  };

    return (
        <>
            <div className='flex justify-between'>
                <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Menstrual Cycle</h3>
            </div>
            <div>
                {
                    loading ?
                        <div className="h-[90px] w-[100%] bg-white px-4 py-4 rounded-[12px] flex mb-8 items-center">
                            <div className="skeleton h-[40px] w-[50px] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
                            <div className='w-full flex flex-col items-center justify-center'>
                                <div className="skeleton h-3 w-[100%] bg-[#d6d6fc] mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] rounded-[4px]"></div>
                            </div>
                        </div> :
                        <>
                            <Link
                                href="/periods"
                                className="relative mb-6 flex justify-between items-center w-full p-4 rounded-[8px] shadow-md overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('/assets/period.jpg')] bg-cover bg-center z-0" />

                                <div className="absolute inset-0 backdrop-blur-md bg-white/80 z-10" />

                                <div className="relative z-20 text-black w-full">
                                    <div className='flex flex-row items-center justify-start'>
                                        <div className='bg-[#fff7f7] border-[1px] border-solid border-[#f8d5d5f0] h-[50px] w-[50px] rounded-lg flex flex-row items-center justify-center mr-[16px]'>
                                            <MdWaterDrop className='text-[24px] text-[#fc3f3f]  animate-bounce' />
                                        </div>
                                        <div className='flex flex-col items-start justify-center'>
                                            <span className='text-[12px] text-black font-poppinsMed mb-1'>{getPeriodInfo()?.text}</span>
                                            <span className='text-[10px] text-[#308dff] font-poppinsMed mb-1'>  {getPeriodInfo().expectedDate}</span>
                                            <span className='text-[10px] text-[#1fa027] font-poppinsMed mb-1'>Last period was on {moment(periods[0]?.last_period_date)?.format("MMM Do YY")}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </>
                }
            </div>
        </>
    )
}

export default Periods;