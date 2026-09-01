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

            // If API already returned precomputed times, use directly; otherwise enrich client-side
            const hasTimes = Array.isArray(data) && data.length > 0 && typeof (data[0] as any).times === 'number';
            if (hasTimes) {
                setLoans(data as any);
            } else {
                const enrichedLoans = await Promise.all(
                    data.map(async (item) => {
                        const times = await fetchLoanDetails(item.id);
                        return { ...item, times: times ?? 0 };
                    })
                );
                setLoans(enrichedLoans);
            }
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
            <div className='flex items-center justify-between mt-6 mb-6'>
                <h3 className='text-left text-base-content text-[18px] font-poppinsSemi'>Loans</h3>
                <Link href={"/allloans"} className='text-primary text-[13px] font-poppinsMed hover:underline transition-all'>View All</Link>
            </div>
            <div>
                {
                    loading ?
                        <div className="h-[90px] w-[100%] bg-base-100 px-4 py-4 rounded-[12px] flex mb-8 items-center">
                            <div className="skeleton h-[40px] w-[50px] bg-base-200 rounded-[12px] mr-3"></div>
                            <div className='w-full flex flex-col items-center justify-center'>
                                <div className="skeleton h-3 w-[100%] bg-base-200 mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-base-200 mb-2 rounded-[4px]"></div>
                                <div className="skeleton h-2 w-[100%] bg-base-200 rounded-[4px]"></div>
                            </div>
                        </div> :
                        loans?.length > 1 ?
                            <Slider {...settings} className='max-w-[100%]'>
                                {
                                    loans.map((loan, key) => (
                                        <div>
                                            <Link href={`/allloans/loandetails/${loan.id}`} key={key} className='group bg-gradient-to-br from-base-100/90 to-base-200/50 backdrop-blur-sm px-5 py-5 mb-6 mx-1 rounded-[22px] flex justify-between border border-white/5 hover:border-primary/30 shadow-[0_4px_20px_rgb(0_0_0/0.03)] hover:shadow-[0_8px_30px_rgb(0_0_0/0.1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden'>
                                                {/* Inner light reflection */}
                                                <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none'></div>
                                                
                                                <div className='flex items-center relative z-10'>
                                                    <div className='bg-gradient-to-b from-base-200 to-base-300/80 rounded-[16px] h-[64px] w-[64px] flex items-center justify-center flex-col mr-5 shadow-inner border border-white/5'>
                                                        <span className='text-base-content/90 text-[14px] font-poppinsSemi leading-none mb-1'>{moment(loan?.date_started).format("DD")}</span>
                                                        <span className='text-base-content/70 text-[9px] uppercase font-poppinsSemi tracking-wider'>{moment(loan?.date_started).format("MMM YYYY")}</span>
                                                    </div>
                                                    <div className='flex items-start justify-center flex-col'>
                                                        <span className='text-base-content/90 text-[15px] font-poppinsSemi mb-1 tracking-tight'>{loan?.title}</span>
                                                        <span className='text-base-content/70 text-[13px] font-poppinsMed mb-1.5'>{loan?.currency} <span className="text-base-content">{loan?.total_amount}</span></span>
                                                        <span className='text-base-content/50 text-[10px] font-poppinsSemi tracking-wider uppercase'>{`${loan?.times}/${loan?.total_insts} Payment${loan?.times > 1 ? 's' : ''} done`}</span>
                                                    </div>
                                                </div>
                                                <div className='flex items-center justify-end relative z-10'>
                                                    {loan?.times === Number(loan?.total_insts)
                                                        ? <div className='badge bg-success/10 text-success border-success/20 uppercase text-[9px] font-poppinsSemi tracking-widest py-3 px-4 rounded-full'>paid</div>
                                                        : <div className='badge bg-warning/10 text-warning border-warning/20 uppercase text-[9px] font-poppinsSemi tracking-widest py-3 px-4 rounded-full'>pending</div>}
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                }
                            </Slider>
                            :

                            loading ?
                                <div className="h-[90px] w-[100%] bg-base-100 px-4 py-4 rounded-[12px] flex mb-8 items-center border border-base-content/10">
                                    <div className="skeleton h-[40px] w-[50px] bg-base-200 rounded-[12px] mr-3"></div>
                                    <div className='w-full flex flex-col items-center justify-center'>
                                        <div className="skeleton h-3 w-[100%] bg-base-200 mb-2 rounded-[4px]"></div>
                                        <div className="skeleton h-2 w-[100%] bg-base-200 mb-2 rounded-[4px]"></div>
                                        <div className="skeleton h-2 w-[100%] bg-base-200 rounded-[4px]"></div>
                                    </div>
                                </div>
                                :
                                loans?.length > 0 ?
                                    loans.map((loan, key) => (

                                        <Link href={`/loandetails/${loan.id}`} key={key} className='group bg-gradient-to-br from-base-100/90 to-base-200/50 backdrop-blur-sm px-5 py-5 mb-5 rounded-[22px] flex justify-between border border-white/5 hover:border-primary/30 shadow-[0_4px_20px_rgb(0_0_0/0.03)] hover:shadow-[0_8px_30px_rgb(0_0_0/0.1)] transition-all duration-300 hover:-translate-y-1 relative overflow-hidden'>
                                            {/* Inner light reflection */}
                                            <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none'></div>
                                            
                                            <div className='flex items-center relative z-10'>
                                                <div className='bg-gradient-to-b from-base-200 to-base-300/80 rounded-[16px] h-[64px] w-[64px] flex items-center justify-center flex-col mr-5 shadow-inner border border-white/5'>
                                                    <span className='text-base-content/90 text-[14px] font-poppinsSemi leading-none mb-1'>{moment(loan?.date_started).format("DD")}</span>
                                                    <span className='text-base-content/70 text-[9px] uppercase font-poppinsSemi tracking-wider'>{moment(loan?.date_started).format("MMM YYYY")}</span>
                                                </div>
                                                <div className='flex items-start justify-center flex-col'>
                                                    <span className='text-base-content/90 text-[15px] font-poppinsSemi mb-1 tracking-tight'>{loan?.title}</span>
                                                    <span className='text-base-content/70 text-[13px] font-poppinsMed mb-1.5'>{loan?.currency} <span className="text-base-content">{loan?.total_amount}</span></span>
                                                    <span className='text-base-content/50 text-[10px] font-poppinsSemi tracking-wider uppercase'>{`${loan?.times}/${loan?.total_insts} Payment${loan?.times > 1 ? 's' : ''} done`}</span>
                                                </div>
                                            </div>
                                            <div className='flex items-center justify-end relative z-10'>
                                                {loan?.status === 'paid' ?
                                                    <div className='badge bg-success/10 text-success border-success/20 uppercase text-[9px] font-poppinsSemi tracking-widest py-3 px-4 rounded-full'>{loan?.status}</div>
                                                    :
                                                    <div className='badge bg-warning/10 text-warning border-warning/20 uppercase text-[9px] font-poppinsSemi tracking-widest py-3 px-4 rounded-full'>{loan?.status}</div>}
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
