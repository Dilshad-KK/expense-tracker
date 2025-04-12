import React, { useEffect, useState } from 'react'
import GoBack from "../../components/gobackSecond";
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";

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

const AllLoans = () => {

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(false);
    }, []);


    return (
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[120px]'>
                <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[32px] z-[1000]'>
                    <GoBack />
                </div>
                <span className='text-white z-[2000] font-poppinsBold text-[18px]'>Discussions</span>
            </div>
            <div className='px-4 pt-4 pb-[150px]'>
                {loading ?
                    <div>
                        {[1, 2, 3, 4]?.map(() => (
                            <div className="h-[70px] w-[100%] bg-white px-4 py-4 my-3 rounded-[12px] flex">
                                <div className="skeleton h-full w-[10%] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
                                <div className='w-full'>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] mb-2"></div>
                                    <div className="skeleton h-4 w-[100%] bg-[#d6d6fc]"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    discussions?.length > 0 ?
                        discussions.map((item, key) => (

                            <Link href={`/`} className='bg-white px-4 py-4 my-3 rounded-[12px] flex justify-between' key={key}>
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
                                        <span className='text-black/60 text-[12px]'>{item?.message}</span>
                                    </div>

                                </div>

                            </Link>

                        ))
                        : null
                }
            </div>
            <Link href={"/"} className='fixed z-[2000] right-8 bottom-28 bg-[#514cff] h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer'>
                <FaPlus className='text-white text-base' />
            </Link>
        </div>
    )
}

export default AllLoans