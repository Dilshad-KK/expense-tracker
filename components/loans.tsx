import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Slider from "react-slick";
import moment from 'moment';

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
    times: number;
};

type ILoanDetails = {
    id: number;
    loan_id: string;
    created_at: string;
    due_date: string;
    amount: string;
    status: string;
};

const Loans = () => {

    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);


    var settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true
    };

useEffect(() => {
        fetchLoans();
    }, []);

    async function fetchLoans() {
        setLoading(true);

        try {
            const res = await fetch('/api/loans');
            const data: Loan[] = await res.json();

            // Use Promise.all to await all fetchLoanDetails
            const enrichedLoans = await Promise.all(
                data.map(async (item) => {
                    const times = await fetchLoanDetails(item.id);
                    return {
                        ...item,
                        times: times ?? 0, // fallback to 0 if undefined
                    };
                })
            );

            setLoans(enrichedLoans);
        } catch (error) {
            console.error("Error fetching loans:", error);
        } finally {
            setLoading(false);
        }
    }

    const fetchLoanDetails = async (loanId: number): Promise<number> => {
        try {
            const res = await fetch(`/api/loanitems?loanId=${loanId}`);
            const data: ILoanDetails[] = await res.json();

            let paidTimes = 0;
            data?.forEach((item) => {
                if (item?.status === 'paid') {
                    paidTimes += 1;
                }
            });

            return paidTimes;
        } catch (error) {
            console.error("Error fetching loan details:", error);
            return 0;
        }
    };


    return (
        <>
            <div className='flex justify-between'>
                <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Loans</h3>
                <Link href={"/allloans"} className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>View All</Link>
            </div>
            <div>
                {loans?.length > 1 ?
                    loading ?
                        <div className="h-[90px] w-[100%] bg-white px-4 py-4 rounded-[12px] flex mb-8 items-center">
                            <div className="skeleton h-[40px] w-[50px] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
                            <div className='w-full flex flex-col items-center justify-center'>
                                <div className="skeleton h-3 w-[100%] bg-[#d6d6fc] mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] rounded-[4px]"></div>
                            </div>
                        </div> :
                        <Slider {...settings} className='max-w-[100%]'>
                            {
                                loans.map((loan, key) => (
                                    <div>
                                        <Link href={`/allloans/loandetails/${loan.id}`} key={key} className='bg-white px-4 py-4 mb-8 mx-1 rounded-[12px] flex justify-between'>
                                            <div className='flex items-center'>
                                                <div className='bg-[#a5a5fe2d] rounded-[12px] h-[60px] w-[60px] flex items-center justify-center flex-col mr-8'>
                                                    <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(loan?.date_started).format("DD")}</span>
                                                    <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("MMM")}</span>
                                                    <span className='text-black/80 text-[8px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("YYYY")}</span>
                                                </div>
                                                <div className='flex items-start justify-center flex-col'>
                                                    <span className='text-black/80 text-[14px] font-poppinsMed mb-1'>{loan?.title}</span>
                                                    <span className='text-black/60 text-[12px] font-poppinsMed mb-1'>{loan?.currency + " "} {loan?.total_amount}</span>
                                                     <span className='text-black/60 text-[10px] font-poppins'>{`${loan?.times}/${loan?.total_insts} Payment${loan?.times > 1 ? 's' : ''} done`}</span>
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-end'>
                                                {loan?.status === 'paid' ?
                                                    <div className='bg-[#a7fac5] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{loan?.status}</div>
                                                    :
                                                    <div className='bg-[#fbe2de] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{loan?.status}</div>}
                                            </div>
                                        </Link>
                                    </div>
                                ))
                            }
                        </Slider>
                    :

                    loading ?
                        <div className="h-[90px] w-[100%] bg-white px-4 py-4 rounded-[12px] flex mb-8 items-center">
                            <div className="skeleton h-[40px] w-[50px] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
                            <div className='w-full flex flex-col items-center justify-center'>
                                <div className="skeleton h-3 w-[100%] bg-[#d6d6fc] mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-[#d6d6fc] rounded-[4px]"></div>
                            </div>
                        </div>
                        :
                        loans?.length > 0 ?
                            loans.map((loan, key) => (

                                <Link href={`/loandetails/${loan.id}`} key={key} className='bg-white px-4 py-4 mb-8 rounded-[12px] flex justify-between'>
                                    <div className='flex items-center'>
                                        <div className='bg-[#a5a5fe2d] rounded-[12px] h-[60px] w-[60px] flex items-center justify-center flex-col mr-8'>
                                            <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(loan?.date_started).format("DD")}</span>
                                            <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("MMM")}</span>
                                            <span className='text-black/80 text-[8px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("YYYY")}</span>
                                        </div>
                                        <div className='flex items-start justify-center flex-col'>
                                            <span className='text-black/80 text-[14px] font-poppinsMed mb-1'>{loan?.title}</span>
                                            <span className='text-black/60 text-[12px] font-poppinsMed mb-1'>{loan?.currency + " "} {loan?.total_amount}</span>
                                             <span className='text-black/60 text-[10px] font-poppins'>{`${loan?.times}/${loan?.total_insts} Payment${loan?.times > 1 ? 's' : ''} done`}</span>
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
        </>
    )
}

export default Loans