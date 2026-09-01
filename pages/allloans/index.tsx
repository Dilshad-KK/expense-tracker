import React, { useEffect, useMemo, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
import PageEmptyState from '@/components/pageEmptyState';
import PageFab from '@/components/pageFab';
import PageSection from '@/components/pageSection';
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

type LoanFilter = 'all' | 'pending' | 'paid';

const AllLoans = () => {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<LoanFilter>('all');

    useEffect(() => {
        fetchLoans();
    }, []);

    async function fetchLoans() {
        setLoading(true);

        try {
            const res = await fetch('/api/loans');
            const data: Loan[] = await res.json();

            const enrichedLoans = await Promise.all(
                data.map(async (item) => {
                    const times = await fetchLoanDetails(item.id);
                    return {
                        ...item,
                        times: times ?? 0,
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

    const isLoanPaid = (loan: Loan) => loan.times === Number(loan.total_insts);
    const completedLoans = loans.filter(isLoanPaid).length;
    const pendingLoans = loans.length - completedLoans;
    const filteredLoans = useMemo(() => {
        if (activeFilter === 'paid') {
            return loans.filter(isLoanPaid);
        }

        if (activeFilter === 'pending') {
            return loans.filter((loan) => !isLoanPaid(loan));
        }

        return loans;
    }, [activeFilter, loans]);

    return (
        <div className="bg-base-100 min-h-dvh relative">
            <CommonHeader title='Loans' />
            <div className='page-body-with-fab px-4 pt-2'>
                <div className='page-shell space-y-4'>
                    <PageSection className='!px-0 !pt-0' contentClassName='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[22px] border border-primary/20 bg-primary/10'>
                                <span className='text-[0.65rem] font-poppinsMed uppercase text-base-content/60'>Done</span>
                                <span className='mt-1 text-lg font-poppinsBold text-primary'>{completedLoans}</span>
                            </div>
                            <div>
                                <div className='text-[11px] font-poppinsMed text-base-content/50'>Overview</div>
                                <div className='mt-2 text-base font-poppinsBold text-base-content'>{loans.length} loan{loans.length === 1 ? "" : "s"} tracked</div>
                            </div>
                        </div>
                        <div className='inline-flex w-fit items-center gap-2 rounded-full border border-base-content/10 bg-base-200/55 px-3 py-2'>
                            <span className='h-2 w-2 rounded-full bg-success'></span>
                            <span className='text-xs text-base-content/60'>Completed</span>
                            <span className='text-sm font-poppinsBold text-base-content'>{completedLoans}</span>
                        </div>
                    </PageSection>

                    {!loading && loans.length > 0 ? (
                        <div className='flex flex-wrap gap-2'>
                            {([
                                { key: 'all', label: 'All', count: loans.length },
                                { key: 'pending', label: 'Pending', count: pendingLoans },
                                { key: 'paid', label: 'Paid', count: completedLoans },
                            ] as Array<{ key: LoanFilter; label: string; count: number }>).map((filter) => (
                                <button
                                    key={filter.key}
                                    type='button'
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`rounded-full border px-3 py-2 text-xs font-poppinsMed transition ${
                                        activeFilter === filter.key
                                            ? 'border-primary/30 bg-primary text-primary-content shadow-[0_12px_28px_rgba(81,76,255,0.22)]'
                                            : 'border-base-content/10 bg-base-100/90 text-base-content/70 hover:border-primary/20 hover:text-base-content'
                                    }`}
                                >
                                    {filter.label} {filter.count}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    {loading ? (
                        <div className='space-y-3'>
                            {[1, 2, 3, 4]?.map((_, index) => (
                                <div key={index} className="flex h-24 w-full items-center rounded-[24px] border border-base-content/10 bg-base-100/95 px-4 py-4 shadow-sm dark:bg-base-200/80">
                                    <div className="skeleton mr-3 h-full w-1/12 rounded-box bg-[#d6d6fc] dark:bg-base-300"></div>
                                    <div className='w-full'>
                                        <div className="skeleton mb-2 h-4 w-full bg-[#d6d6fc] dark:bg-base-300"></div>
                                        <div className="skeleton h-4 w-full bg-[#d6d6fc] dark:bg-base-300"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : loans?.length > 0 ? (
                        <div className='space-y-3'>
                            {filteredLoans.map((loan) => (
                                <Link
                                    href={`/allloans/loandetails/${loan.id}`}
                                    key={loan.id}
                                    className='flex w-full justify-between rounded-[26px] border border-base-content/10 bg-base-100/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_48px_rgba(81,76,255,0.14)] dark:bg-base-200/80'
                                >
                                    <div className='flex items-center'>
                                        <div className='mr-4 flex h-16 w-16 flex-col items-center justify-center rounded-[22px] border border-primary/20 bg-primary/10'>
                                            <span className='text-xs font-poppinsMed text-base-content/80'>{moment(loan?.date_started).format("DD")}</span>
                                            <span className='text-xs font-poppinsMed uppercase text-base-content/80'>{moment(loan?.date_started).format("MMM")}</span>
                                            <span className='text-[0.65rem] font-poppinsMed uppercase text-base-content/70'>{moment(loan?.date_started).format("YYYY")}</span>
                                        </div>
                                        <div className='flex flex-col'>
                                            <span className='mb-1 text-sm font-poppinsBold text-base-content'>{loan?.title}</span>
                                            <span className='mb-1 text-xs font-poppinsMed text-base-content/70'>{loan?.currency} {loan?.total_amount}</span>
                                            <span className='text-xs text-base-content/60'>{`${loan?.times}/${loan?.total_insts} installment${Number(loan?.total_insts) === 1 ? '' : 's'} completed`}</span>
                                        </div>
                                    </div>
                                    <div className='flex items-center justify-end'>
                                        {isLoanPaid(loan) ? (
                                            <div className='rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-poppinsMed capitalize text-success'>Paid</div>
                                        ) : (
                                            <div className='rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-poppinsMed capitalize text-warning'>Pending</div>
                                        )}
                                    </div>
                                </Link>
                            ))}
                            {filteredLoans.length === 0 ? (
                                <div className='rounded-[24px] border border-dashed border-base-content/15 bg-base-100/70 px-4 py-6 text-center text-sm text-base-content/60'>
                                    No {activeFilter === 'all' ? '' : `${activeFilter} `}loans to show.
                                </div>
                            ) : null}
                        </div>
                    ) : (
                        <PageEmptyState
                            title="No loans yet"
                            description="Add your first loan to start tracking installments and payment progress."
                            icon={<FaPlus className="text-xl" />}
                        />
                    )}
                </div>
            </div>
            <PageFab href="/allloans/newloan" ariaLabel="Add loan" className="bg-[#514cff] hover:bg-[#413cff] dark:bg-primary dark:hover:bg-primary-focus" />
        </div>
    )
}

export default AllLoans
