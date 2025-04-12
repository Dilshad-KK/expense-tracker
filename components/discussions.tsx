import React, { } from 'react'
import Link from 'next/link'
import Slider from "react-slick";

const Discussions = () => {

    var settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true
    };

    const discussions = [
        {
            id: 1,
            user: "Paaathu",
            time: "3h ago",
            message: "Moona memma symptoms discussed on call",
            status: "Pending"
        },
        {
            id: 2,
            user: "Ikku",
            time: "3h ago",
            message: "Umma Uppa Call Details",
            status: "Pending"
        },
        {
            id: 3,
            user: "Ikku",
            time: "3h ago",
            message: "Kunjitha Call Details",
            status: "Discussed"
        },
        {
            id: 4,
            user: "Paaathu",
            time: "3h ago",
            message: "App bug discussed today on call",
            status: "Pending"
        },
        {
            id: 5,
            user: "Ikku",
            time: "3h ago",
            message: "Unwanted android apps found on screenshot",
            status: "Pending"
        },
        {
            id: 6,
            user: "Ikku",
            time: "3h ago",
            message: "Islamic ruling on other relion's food which is a part of ritual",
            status: "Pending"
        }
    ]


    return (
        <>
            <div className='flex justify-between'>
                <h3 className='text-left mb-3 text-black text-[14px] font-poppinsBold'>Discussions</h3>
                <Link href={"/alldiscussions"} className='text-left mb-3 text-[#4a99fb] text-[12px] font-poppinsMed cursor-pointer'>View All</Link>
            </div>
            <div>
                {discussions?.length > 1 ?
                    <Slider {...settings} className='max-w-[100%]'>
                        {
                            discussions.map((item, key) => (
                                <div>
                                    <Link href={`/`} className='bg-white px-4 py-4 mb-8 mx-1 rounded-[12px] flex justify-between'>
                                        <div className='flex items-center justify-center'>
                                            <div className={`h-[40px] w-[40px] ${item?.user === 'Ikku' ? 'bg-[#126581]' : 'bg-[#8e156a]'}  rounded-full flex items-center justify-center mr-4`}>
                                                <span className='text-[18px] text-white font-poppinsMed'>{item?.user === 'Ikku' ? 'D' : 'S'}</span>
                                            </div>
                                            <div>
                                                <div className='flex items-center justify-start'>
                                                    <span className='mr-2 text-[10px] text-slate-600'>{item?.user}</span>
                                                    <span className='mr-2 mb-2 text-[16px] text-slate-600'>.</span>
                                                    <span className='text-[10px] text-slate-600 mr-2'>{item?.time}</span>
                                                    <span className='mr-2 mb-2 text-[16px] text-slate-600'>.</span>
                                                    {item?.status === "Pending" ?
                                                        <div className='bg-[#fbe2de] rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{item?.status}</div>
                                                        :
                                                        <div className='bg-[#a7fac5] rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{item?.status}</div>
                                                    }
                                                </div>
                                                <span className='text-black/60 text-[12px]'>{item?.message?.slice(0, 25)}{item?.message?.length >= 25 ? <span className='text-[#5272ff] text-[10px]'>...Read More</span> : ''}</span>
                                            </div>

                                        </div>

                                    </Link>
                                </div>
                            ))
                        }
                    </Slider>
                    :
                    <Link href={`/`} className='bg-white px-4 py-4 mb-8 rounded-[12px] flex justify-between' >
                        <div className='flex items-center justify-center'>
                            <div className={`h-[40px] w-[40px] ${discussions[0]?.user === 'Ikku' ? 'bg-[#126581]' : 'bg-[#8e156a]'}  rounded-full flex items-center justify-center mr-4`}>
                                <span className='text-[18px] text-white font-poppinsMed'>{discussions[0]?.user === 'Ikku' ? 'D' : 'S'}</span>
                            </div>
                            <div>
                                <div className='flex items-center justify-start'>
                                    <span className='mr-2 text-[10px] text-slate-600'>{discussions[0]?.user}</span>
                                    <span className='mr-2 mb-2 text-[16px] text-slate-600'>.</span>
                                    <span className='text-[10px] text-slate-600 mr-2'>{discussions[0]?.time}</span>
                                    <span className='mr-2 mb-2 text-[16px] text-slate-600'>.</span>
                                    {discussions[0]?.status === "Pending" ?
                                        <div className='bg-[#fbe2de] rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{discussions[0]?.status}</div>
                                        :
                                        <div className='bg-[#a7fac5] rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{discussions[0]?.status}</div>
                                    }
                                </div>
                                <span className='text-black/60 text-[12px]'>{discussions[0]?.message?.slice(0, 25)}{discussions[0]?.message?.length >= 25 ? <span className='text-[#5272ff] text-[10px]'>...Read More</span> : ''}</span>
                            </div>

                        </div>

                    </Link>
                }

            </div>
        </>
    )
}

export default Discussions