import React, { useEffect, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
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

const AllLoans = () => {

    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);

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
        <div className="bg-base-100 min-h-screen relative">
            <CommonHeader title='Loans' />
            <div className='px-4 pt-4 pb-[150px]'>
                {loading ?
                    <div>
                        {[1, 2, 3, 4]?.map((_, index) => (
                            <div key={index} className="h-[70px] w-[100%] bg-white dark:bg-base-200 px-4 py-4 my-3 rounded-[12px] flex border-2 border-base-300 dark:border-base-400">
                                <div className="skeleton h-full w-[10%] bg-[#d6d6fc] dark:bg-base-300 rounded-[12px] mr-3"></div>
                                <div className='w-full'>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] dark:bg-base-300 mb-2"></div>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] dark:bg-base-300"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    loans?.length > 0 ?
                        loans.map((loan, key) => (

                            <Link href={`/allloans/loandetails/${loan.id}`} key={key} className='bg-white dark:bg-base-200 px-4 py-4 my-3 rounded-[12px] flex justify-between border-2 border-base-300 dark:border-base-400 transition-all hover:shadow-md hover:border-primary/50 dark:hover:border-primary/60'>
                                <div className='flex items-center'>
                                    <div className='bg-[#a5a5fe2d] dark:bg-primary/20 rounded-[12px] h-[60px] w-[60px] flex items-center justify-center flex-col mr-4 border-2 border-primary/30 dark:border-primary/40'>
                                        <span className='text-black/80 dark:text-white/80 text-[12px] font-poppinsMed'>{moment(loan?.date_started).format("DD")}</span>
                                        <span className='text-black/80 dark:text-white/80 text-[10px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("MMM")}</span>
                                        <span className='text-black/80 dark:text-white/80 text-[8px] uppercase font-poppinsMed'>{moment(loan?.date_started).format("YYYY")}</span>
                                    </div>
                                    <div className='flex items-start justify-center flex-col'>
                                        <span className='text-black/80 dark:text-white/80 text-[14px] font-poppinsMed mb-1'>{loan?.title}</span>
                                        <span className='text-black/60 dark:text-white/60 text-[12px] font-poppinsMed mb-1'>{loan?.currency + " "} {loan?.total_amount}</span>
                                        <span className='text-black/60 dark:text-white/60 text-[10px] font-poppins'>{`${loan?.times}/${loan?.total_insts} Payment${loan?.times > 1 ? 's' : ''} done`}</span>
                                    </div>
                                </div>
                                <div className='flex items-center justify-end'>
                                    {loan?.times === Number(loan?.total_insts) ?
                                        <div className='bg-[#a7fac5] dark:bg-success/20 rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] dark:text-success border-2 border-success/40 dark:border-success/50 font-poppinsMed'>paid</div>
                                        :
                                        <div className='bg-[#fbe2de] dark:bg-error/20 rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] dark:text-error border-2 border-error/40 dark:border-error/50 font-poppinsMed'>pending</div>}
                                </div>
                            </Link>

                        ))
                        : 
                        <div className="text-center mt-8">
                            <div className="bg-white dark:bg-base-200 rounded-xl p-6 shadow-md border-2 border-base-300 dark:border-base-400">
                                <div className="bg-[#a5a5fe2d] dark:bg-primary/20 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30 dark:border-primary/40">
                                    <FaPlus className="text-[#514cff] dark:text-primary text-xl" />
                                </div>
                                <p className="text-black/80 dark:text-white/80 text-base mb-3 font-poppinsMed">No loans found</p>
                                <p className="text-black/60 dark:text-white/60 text-sm mb-4 font-poppins">Get started by adding your first loan</p>
                            </div>
                        </div>
                }
            </div>
            <Link href={"/allloans/newloan"} className='fixed z-[2000] right-8 bottom-28 bg-[#514cff] dark:bg-primary hover:bg-[#413cff] dark:hover:bg-primary-focus h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-lg border-2 border-white/20'>
                <FaPlus className='text-white text-base' />
            </Link>
        </div>
    )
}

export default AllLoans