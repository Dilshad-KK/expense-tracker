import React, { useEffect, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
import moment from 'moment';
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";
import { HiOutlineSparkles } from "react-icons/hi2";

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
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisOpen, setAnalysisOpen] = useState(false);
    const [analysisOverview, setAnalysisOverview] = useState<string>('');
    const [analysisAi, setAnalysisAi] = useState<any>(null);
    const [analysisLoans, setAnalysisLoans] = useState<any[]>([]);
    const [analysisError, setAnalysisError] = useState<string>('');

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

    const handleAnalyzeLoans = async () => {
        setAnalyzing(true);
        setAnalysisError('');
        setAnalysisOverview('');
        setAnalysisAi(null);
        setAnalysisLoans([]);
        setAnalysisOpen(true);

        try {
            const res = await fetch('/api/ai/analyze-loans');
            const raw = await res.text();
            const parsed = raw ? JSON.parse(raw) : null;
            if (!res.ok || parsed?.success === false) {
                setAnalysisError(parsed?.message || `AI request failed (HTTP ${res.status}).`);
                return;
            }
            setAnalysisOverview(parsed?.overview || '');
            setAnalysisAi(parsed?.ai ?? null);
            setAnalysisLoans(Array.isArray(parsed?.loans) ? parsed.loans : []);
        } catch (err: any) {
            setAnalysisError(err?.message || 'AI request failed.');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="bg-base-100 min-h-screen relative">
            <CommonHeader
                title='Loans'
                right={
                    <button
                        className="btn btn-sm btn-ghost"
                        onClick={handleAnalyzeLoans}
                        disabled={loading || analyzing}
                        title="Analyze loans with AI"
                    >
                        {analyzing ? <span className="loading loading-spinner loading-sm" /> : <HiOutlineSparkles className="text-[18px]" />}
                        <span className="hidden sm:inline ml-1">Analyze</span>
                    </button>
                }
            />
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

            {analysisOpen && (
                <div className="fixed inset-0 z-[3000] flex md:items-center md:justify-center bg-black/60 backdrop-blur-sm md:p-6 transition-opacity animate-in fade-in duration-200">
                    <div className="bg-base-100 md:rounded-[28px] shadow-2xl w-full h-full md:h-auto max-w-2xl flex flex-col md:max-h-[85vh] overflow-hidden border border-white/10">
                        <div className="p-5 md:p-6 border-b border-base-content/5 flex justify-between items-center bg-base-100/80 backdrop-blur-md z-10 shrink-0">
                            <div className="flex flex-col">
                                <h3 className="text-lg font-poppinsMed">Loan Analysis</h3>
                                <span className="text-[11px] text-base-content/50 font-poppinsMed">Powered by your AI server</span>
                            </div>
                            <button className="btn btn-sm btn-circle btn-ghost bg-base-200 hover:bg-error hover:text-white" onClick={() => setAnalysisOpen(false)}>✕</button>
                        </div>

                        <div className="p-5 md:p-6 overflow-y-auto flex-1 custom-scrollbar">
                            {analyzing ? (
                                <div className="flex items-center gap-3 text-base-content/70 font-poppinsMed">
                                    <span className="loading loading-spinner" />
                                    Analyzing your loans…
                                </div>
                            ) : analysisError ? (
                                <div className="alert alert-error">
                                    <span className="font-poppinsMed">{analysisError}</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="bg-base-200/50 border border-base-content/10 rounded-2xl p-4">
                                        <div className="text-[12px] text-base-content/60 font-poppinsMed mb-2 uppercase tracking-wider">Overview</div>
                                        <div className="whitespace-pre-wrap text-[14px] leading-relaxed font-poppinsMed text-base-content/80">
                                            {analysisOverview || 'No overview returned.'}
                                        </div>
                                    </div>

                                    {analysisAi && (
                                        <div className="bg-base-200/50 border border-base-content/10 rounded-2xl p-4">
                                            <div className="text-[12px] text-base-content/60 font-poppinsMed mb-3 uppercase tracking-wider">Suggestions</div>
                                            {Array.isArray(analysisAi?.actions) && analysisAi.actions.length > 0 ? (
                                                <ul className="list-disc pl-5 space-y-1 text-[13px] text-base-content/80 font-poppinsMed">
                                                    {analysisAi.actions.slice(0, 8).map((a: string, idx: number) => (
                                                        <li key={idx}>{a}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-[13px] text-base-content/60 font-poppinsMed">No suggestions returned.</div>
                                            )}
                                        </div>
                                    )}

                                    {analysisLoans.length > 0 && (
                                        <div className="bg-base-200/50 border border-base-content/10 rounded-2xl p-4">
                                            <div className="text-[12px] text-base-content/60 font-poppinsMed mb-3 uppercase tracking-wider">Per Loan</div>
                                            <div className="space-y-3">
                                                {analysisLoans.slice(0, 50).map((loan: any) => {
                                                    const note =
                                                        Array.isArray(analysisAi?.perLoanNotes)
                                                            ? analysisAi.perLoanNotes.find((n: any) => n?.id === loan?.id)?.note
                                                            : null;

                                                    const outstanding =
                                                        typeof loan?.outstanding === 'number'
                                                            ? `${loan?.currency ?? ''} ${Number(loan.outstanding).toLocaleString()}`
                                                            : null;
                                                    const nextDue = loan?.nextDue ? moment(loan.nextDue).format('YYYY-MM-DD') : null;
                                                    const nextAmount =
                                                        typeof loan?.nextAmount === 'number'
                                                            ? `${loan?.currency ?? ''} ${Number(loan.nextAmount).toLocaleString()}`
                                                            : null;

                                                    return (
                                                        <div key={loan.id} className="bg-base-100/70 border border-base-content/10 rounded-2xl p-4">
                                                            <div className="flex items-start justify-between gap-3">
                                                                <div className="flex flex-col">
                                                                    <div className="text-[14px] font-poppinsMed text-base-content/90">
                                                                        {loan?.title || `Loan #${loan?.id}`}
                                                                    </div>
                                                                    <div className="text-[12px] text-base-content/60 font-poppinsMed mt-1">
                                                                        {loan?.paidInsts ?? 0}/{loan?.totalInsts ?? 0} paid · {loan?.remainingInsts ?? 0} remaining
                                                                    </div>
                                                                </div>
                                                                <div className="shrink-0">
                                                                    {(loan?.status || '').toLowerCase() === 'paid' || (loan?.remainingInsts ?? 0) === 0 ? (
                                                                        <div className="badge badge-success badge-outline uppercase text-[10px] py-2 px-3">paid</div>
                                                                    ) : (
                                                                        <div className="badge badge-warning badge-outline uppercase text-[10px] py-2 px-3">pending</div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] font-poppinsMed text-base-content/70">
                                                                <div className="rounded-xl bg-base-200/60 border border-base-content/10 px-3 py-2">
                                                                    <div className="opacity-60 text-[10px] uppercase tracking-wider">Outstanding (approx)</div>
                                                                    <div className="mt-0.5 text-[12px] text-base-content/80">
                                                                        {outstanding || '—'}
                                                                    </div>
                                                                </div>
                                                                <div className="rounded-xl bg-base-200/60 border border-base-content/10 px-3 py-2">
                                                                    <div className="opacity-60 text-[10px] uppercase tracking-wider">Next due</div>
                                                                    <div className="mt-0.5 text-[12px] text-base-content/80">
                                                                        {nextDue ? `${nextDue}${nextAmount ? ` · ${nextAmount}` : ''}` : '—'}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {note ? (
                                                                <div className="mt-3 text-[12px] font-poppinsMed text-base-content/70">
                                                                    <span className="opacity-60">AI note:</span> {note}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-5 md:p-6 border-t border-base-content/5 bg-base-200/30 flex justify-end gap-3 shrink-0">
                            <button className="btn btn-ghost rounded-xl font-poppinsMed" onClick={() => setAnalysisOpen(false)}>Close</button>
                            <button className="btn btn-primary rounded-xl px-8 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all" onClick={handleAnalyzeLoans} disabled={analyzing || loading}>
                                {analyzing ? <span className="loading loading-spinner text-white w-4" /> : <span className="text-white font-poppinsMed">Re-run</span>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AllLoans
