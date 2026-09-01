import React, { useEffect, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
import PageEmptyState from '@/components/pageEmptyState';
import PageFab from '@/components/pageFab';
import PageSection from '@/components/pageSection';
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";
import moment from 'moment';

type Discussion = {
    id: number;
    message: string;
    status: string;
    user: string;
    created_at: string;
};

const AllDiscussions = () => {
    const [loading, setLoading] = useState(false);
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const pendingCount = discussions.filter((item) => item.status === "pending").length;

    useEffect(() => {
        fetchDiscussions();
    }, []);

    async function fetchDiscussions() {
        setLoading(true);

        try {
            const res = await fetch('/api/discussions');
            const data: Discussion[] = await res.json();
            setDiscussions(data);
        } catch (error) {
            console.error("Error fetching discussions:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-base-100 min-h-dvh relative">
            <CommonHeader title='Discussions' />
            <div className='page-body-with-fab px-4 pt-2'>
                <div className='page-shell space-y-4'>
                    <PageSection className='!px-0 !pt-0' contentClassName='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center gap-4'>
                            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-poppinsBold text-primary'>
                                {discussions.length}
                            </div>
                            <div>
                                <div className='text-[11px] font-poppinsMed text-base-content/50'>Shared notes</div>
                                <div className='mt-2 text-base font-poppinsBold text-base-content'>{discussions.length} discussions logged</div>
                            </div>
                        </div>
                        <div className='inline-flex w-fit items-center gap-2 rounded-full border border-base-content/10 bg-base-200/55 px-3 py-2'>
                            <span className='h-2 w-2 rounded-full bg-warning'></span>
                            <span className='text-xs text-base-content/60'>Pending</span>
                            <span className='text-sm font-poppinsBold text-base-content'>{pendingCount}</span>
                        </div>
                    </PageSection>

                    {loading ? (
                        <div className='space-y-3'>
                            {[1, 2, 3, 4]?.map((_, i) => (
                                <div className="flex h-16 w-full rounded-[24px] border border-base-content/10 bg-base-100/95 px-4 py-4 shadow-sm dark:bg-base-200/80" key={i}>
                                    <div className="mr-3 h-full w-1/12 rounded-box bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                                    <div className='w-full'>
                                        <div className="mb-2 h-4 w-full bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                                        <div className="h-4 w-full bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : discussions?.length > 0 ? (
                        <div className='space-y-3'>
                            {discussions.map((item) => (
                                <Link
                                    href={`/alldiscussions/discdetails/${item?.id}`}
                                    className='flex w-full justify-between rounded-[26px] border border-base-content/10 bg-base-100/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_48px_rgba(81,76,255,0.14)] dark:bg-base-200/80'
                                    key={item.id}
                                >
                                    <div className='flex items-center justify-center'>
                                        <div className={`mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${item?.user === 'Dilshad' ? 'bg-[#126581]' : 'bg-[#8e156a]'}`}>
                                            <span className='text-lg text-white font-poppinsMed'>{item?.user === 'Dilshad' ? 'D' : 'S'}</span>
                                        </div>
                                        <div>
                                            <div className='flex items-center justify-start'>
                                                <span className='mr-1 text-xs text-base-content/70'>{item?.user}</span>
                                                <span className='mr-1 mb-2 text-base text-base-content/60'>.</span>
                                                <span className='mr-2 text-xs text-base-content/70'>{moment(item?.created_at).fromNow().replace(/^\w/, c => c.toUpperCase())}</span>
                                                <span className='mr-1 mb-2 text-base text-base-content/60'>.</span>
                                                {item?.status === "pending" ? (
                                                    <div className='rounded-badge bg-warning/10 px-3 py-1 text-xs font-poppinsMed capitalize text-warning'>{item?.status}</div>
                                                ) : (
                                                    <div className='rounded-badge bg-success/10 px-3 py-1 text-xs font-poppinsMed capitalize text-success'>{item?.status}</div>
                                                )}
                                            </div>
                                            <span className='text-sm text-base-content/80'>{item?.message}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <PageEmptyState
                            title="No discussions yet"
                            description="Add a shared discussion to keep decisions and pending topics in one place."
                            icon={<FaPlus className='text-xl' />}
                        />
                    )}
                </div>
            </div>
            <PageFab href="/alldiscussions/newdiscussion" ariaLabel="Add discussion" />
        </div>
    )
}

export default AllDiscussions
