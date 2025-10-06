import React, { useEffect, useState } from 'react'
import Slider from "react-slick";
import Link from 'next/link';
import moment from 'moment';

type Discussion = {
    id: number;
    message: string;
    status: string;
    user: string;
    created_at: string;
};

const Discussions = () => {

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

    var settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true
    };

    return (
        <>
            <div className='flex justify-between'>
                <h3 className='text-left mb-4 text-base-content text-[16px] font-poppinsMed'>Discussions</h3>
                <Link href={"/alldiscussions"} className='text-left mb-4 text-primary text-[12px] font-poppinsMed cursor-pointer'>View All</Link>
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
                        discussions?.length > 1 ?

                            <Slider {...settings} className='max-w-[100%]'>
                                {
                                    discussions.map((item, key) => (
                                        <div key={key}>
                                            <Link href={`/alldiscussions/discdetails/${item?.id}`} className='bg-base-100 px-4 py-4 mb-6 mx-1 rounded-[12px] flex justify-between border border-base-content/20 shadow-sm'>
                                                <div className='flex items-center justify-center'>
                                                    <div className={`h-[40px] w-[40px] ${item?.user === 'Dilshad' ? 'bg-info' : 'bg-secondary'}  rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                                                        <span className='text-[18px] text-white font-poppinsMed'>{item?.user === 'Dilshad' ? 'D' : 'S'}</span>
                                                    </div>
                                                    <div>
                                                        <div className='flex items-center justify-start mt-[-8px]'>
                                                            <span className='mr-1 text-[10px] text-base-content/60'>{item?.user}</span>
                                                            <span className='mr-1 mb-2 text-[16px] text-base-content/60'>.</span>
                                                            <span className='text-[10px] text-base-content/60 mr-2'>{moment(item?.created_at).fromNow().replace(/^\w/, c => c.toUpperCase())}</span>
                                                            <span className='mr-1 mb-2 text-[16px] text-base-content/60'>.</span>
                                                            {item?.status === "pending" ?
                                                                <div className='badge badge-warning badge-outline uppercase text-[8px] py-2 px-3'>{item?.status}</div>
                                                                :
                                                                <div className='badge badge-success badge-outline uppercase text-[8px] py-2 px-3'>{item?.status}</div>
                                                            }
                                                        </div>
                                                        <div className='text-base-content/70 text-[12px]'>{item?.message?.slice(0, 25)}{item?.message?.length >= 25 ? <span className='text-base-content/50 text-[10px]'>...</span> : ''}</div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))
                                }
                            </Slider>
                            :
                            <Link href={`/alldiscussions/discdetails/${discussions[0]?.id}`} className='bg-base-100 px-4 py-4 mb-8 rounded-[12px] flex justify-between border border-base-content/20 shadow-sm' >
                                <div className='flex items-center justify-center'>
                                    <div className={`h-[40px] w-[40px] ${discussions[0]?.user === 'Dilshad' ? 'bg-info' : 'bg-secondary'}  rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                                        <span className='text-[18px] text-white font-poppinsMed'>{discussions[0]?.user === 'Dilshad' ? 'D' : 'S'}</span>
                                    </div>
                                    <div>
                                        <div className='flex items-center justify-start'>
                                            <span className='mr-2 text-[10px] text-base-content/60'>{discussions[0]?.user}</span>
                                            <span className='mr-2 mb-2 text-[16px] text-base-content/60'>.</span>
                                            <span className='text-[10px] text-base-content/60 mr-2'>{moment(discussions[0]?.created_at).fromNow().replace(/^\w/, c => c.toUpperCase())}</span>
                                            <span className='mr-2 mb-2 text-[16px] text-base-content/60'>.</span>
                                            {discussions[0]?.status === "pending" ?
                                                <div className='badge badge-warning badge-outline uppercase text-[8px] py-2 px-3'>{discussions[0]?.status}</div>
                                                :
                                                <div className='badge badge-success badge-outline uppercase text-[8px] py-2 px-3'>{discussions[0]?.status}</div>
                                            }
                                        </div>
                                        <span className='text-base-content/70 text-[12px]'>{discussions[0]?.message?.slice(0, 25)}{discussions[0]?.message?.length >= 25 ? <span className='text-base-content/50 text-[10px]'>...</span> : ''}</span>
                                    </div>

                                </div>

                            </Link>
                }

            </div>
        </>
    )
}

export default Discussions
