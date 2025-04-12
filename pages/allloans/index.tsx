import React, { useEffect, useState } from 'react'
import GoBack from "../../components/gobackSecond";
import moment from 'moment';
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";

type Loan = {
    id: number;
    title: string;
    total_insts: string;
    paid_insts: string;
    total_amount: string;
    currency: string;
    date_started: string;
    created_at: string;
    status: string;
};

const AllLoans = () => {

    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchLoans();
    }, []);

    async function fetchLoans() {
        setLoading(true);
        const res = await fetch('/api/loans');
        const data: Loan[] = await res.json();
        setLoans(data);
        setLoading(false);
    }

    return (
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[120px]'>
                <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[32px] z-[1000]'>
                    <GoBack />
                </div>
                <span className='text-white z-[2000] font-poppinsBold text-[18px]'>Loans</span>
            </div>
            <div className='px-4 pt-4 pb-[150px]'>
                {loading ?
                    <div>
                        {[1, 2, 3, 4]?.map(() => (
                            <div className="h-[70px] w-[100%] bg-white px-4 py-4 my-3 rounded-[12px] flex">
                                <div className="skeleton h-full w-[10%] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
                                <div className='w-full'>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] mb-2"></div>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc]"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    loans?.length > 0 ?
                        loans.map((loan, key) => (

                            <Link href={`/allloans/loandetails/${loan.id}`} key={key} className='bg-white px-4 py-4 my-3 rounded-[12px] flex justify-between'>
                                <div className='flex items-center'>
                                    <div className='bg-[#a5a5fe2d] rounded-[12px] h-[40px] w-[40px] flex items-center justify-center flex-col mr-8'>
                                        <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(loan?.date_started).format("DD")}</span>
                                        <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("MMM")}</span>
                                    </div>
                                    <div className='flex items-start justify-center flex-col'>
                                        <span className='text-black/80 text-[14px] font-poppinsMed mb-1'>{loan?.title}</span>
                                        <span className='text-black/60 text-[12px] font-poppinsMed mb-1'>{loan?.currency + " "} {loan?.total_amount}</span>
                                        <span className='text-black/60 text-[10px] font-poppins'>{`${loan?.total_insts} Payments`}</span>
                                    </div>
                                </div>
                                <div className='flex items-center justify-end'>
                                    {loan?.status === 'paid' ?
                                        <div className='bg-[#a7fac5] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{loan?.status}</div>
                                        :
                                        <div className='bg-[#fbe2de] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{loan?.status}</div>}
                                </div>
                            </Link>

                        ))
                        : null
                }
            </div>
            <Link href={"/allloans/newloan"} className='fixed z-[2000] right-8 bottom-28 bg-[#514cff] h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer'>
                <FaPlus className='text-white text-base' />
            </Link>
        </div>
    )
}

export default AllLoans