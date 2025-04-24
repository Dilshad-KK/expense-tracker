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
            return { daysLeft: null, expectedDate: null };
        }

        const nextPeriodDate = lastPeriodDate.clone().add(cycleLength, "days");
        const daysLeft = nextPeriodDate.diff(today, "days");

        return {
            daysLeft,
            expectedDate: nextPeriodDate.format("YYYY-MM-DD")
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
                            <Link href={"/periods"} className='mb-8 flex justify-between w-full bg-[#ffffff] p-4 rounded-[8px] shadow-md'>
                                <div className='flex flex-row items-center justify-start'>
                                    <div className='bg-[#fdeded] h-[40px] w-[40px] rounded-md flex flex-row items-center justify-center mr-[16px]'>
                                        <MdWaterDrop className='text-[24px] text-[#fc3f3f]' />
                                    </div>
                                    <div className='flex flex-col items-start justify-center'>
                                        <span className='text-[12px] text-black font-poppinsMed mb-1'>Period Expected In {getPeriodInfo().daysLeft} days</span>
                                        <span className='text-[10px] text-[#198720] font-poppinsMed mb-1'>Last period was on {moment(periods[0]?.last_period_date)?.format("MMM Do YY")}</span>
                                        <span className='text-[10px] text-[#1b569e] font-poppinsMed mb-1'>Next Period Expecting On {getPeriodInfo().expectedDate}</span>
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