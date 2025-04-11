import React, { useEffect, useState } from 'react'
import { IoMdNotifications } from "react-icons/io";
import GoBack from "../../components/goback";
import moment from 'moment';
import Link from 'next/link';

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
        <div className="bg-[#e8e8fd] min-h-screen">
            <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4 mb-8'>
                <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
                <GoBack />
                <span className='text-white z-[2000]'>Loans</span>
                <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
                    <IoMdNotifications className='text-[24px]' />
                </div>
            </div>
            <div className='px-4 pb-[150px]'>
                {loading ? null :
                    loans?.length > 0 ?
                        loans.map((loan, key) => (

                            <Link href={`/loandetails/${loan.id}`} key={key} className='bg-white px-4 py-4 my-3 rounded-[12px] flex justify-between'>
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

        </div>
    )
}

export default AllLoans