import React, { useEffect, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
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
            <div className='px-4 pt-4 page-body-with-fab'>
                {loading ?
                    <div>
                        {[1, 2, 3, 4]?.map((_, i) => (
                            <div className="h-[70px] w-[100%] bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex" key={i}>
                                <div className="skeleton h-full w-[10%] bg-[#d6d6fc] dark:bg-base-300 rounded-[12px] mr-3"></div>
                                <div className='w-full'>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] dark:bg-base-300 mb-2"></div>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] dark:bg-base-300"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    discussions?.length > 0 ?
                        discussions.map((item, key) => (

                            <Link href={`/alldiscussions/discdetails/${item?.id}`} className='bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex justify-between transition-all hover:shadow-md hover:border-primary/50 dark:hover:border-primary/60' key={key}>
                                <div className='flex items-center justify-center'>
                                    <div className={`h-[40px] w-[40px] ${item?.user === 'Dilshad' ? 'bg-[#126581]' : 'bg-[#8e156a]'}  rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                                        <span className='text-[18px] text-white font-poppinsMed'>{item?.user === 'Dilshad' ? 'D' : 'S'}</span>
                                    </div>
                                    <div>
                                        <div className='flex items-center justify-start'>
                                            <span className='mr-1 text-[10px] text-base-content/70'>{item?.user}</span>
                                            <span className='mr-1 mb-2 text-[16px] text-base-content/60'>.</span>
                                            <span className='text-[10px] text-base-content/70 mr-2'>{moment(item?.created_at).fromNow().replace(/^\w/, c => c.toUpperCase())}</span>
                                            <span className='mr-1 mb-2 text-[16px] text-base-content/60'>.</span>
                                            {item?.status === "pending" ?
                                                <div className='bg-error/10 rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-error font-poppinsMed'>{item?.status}</div>
                                                :
                                                <div className='bg-success/10 rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-success font-poppinsMed'>{item?.status}</div>

                                            }
                                        </div>
                                        <span className='text-base-content/80 text-[12px]'>{item?.message}</span>
                                    </div>

                                </div>

                            </Link>

                        ))
                        : null
                }
            </div>
            <Link href={"/alldiscussions/newdiscussion"} className='fixed z-[2000] right-8 bottom-28 bg-primary hover:bg-primary-focus h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-lg border-2 border-white/20'>
                <FaPlus className='text-white text-base' />
            </Link>
        </div>
    )
}

export default AllDiscussions
