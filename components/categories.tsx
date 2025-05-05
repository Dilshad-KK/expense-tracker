import React from 'react';
import Link from 'next/link'
import { CiReceipt } from "react-icons/ci";
import { PiBankLight } from "react-icons/pi";
import { HiOutlineChatBubbleBottomCenter } from "react-icons/hi2";
import { IoIosFemale } from "react-icons/io";
import { BsGem } from "react-icons/bs";
import { PiListPlusLight } from "react-icons/pi";

const Categories = () => {
    return (
        <>
            <h3 className='text-left mb-4 text-black text-[16px] font-poppinsMed'>Category</h3>
            <div className='flex mb-8 justify-between'>
                <Link className='flex items-center justify-center flex-col' href={"/ibuexpenses"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#e9f6ed] mb-2 rounded-[14px]'>
                        <CiReceipt className='text-[30px] text-[#75dc92]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>S-TXNS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/ikkuexpensesindia">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#eef8fe] mb-2 rounded-[14px]'>
                        <CiReceipt className='text-[30px] text-[#59afc9]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>D-TXNS 🇮🇳</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/ikkuexpensesuae">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#fcfae5] mb-2 rounded-[14px]'>
                        <CiReceipt className='text-[30px] text-[#d8c627]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>D-TXNS 🇦🇪</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href={"/allloans"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#f0edfd] mb-2 rounded-[14px]'>
                        <PiBankLight className='text-[26px] text-[#908acf]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>LOANS</div>
                </Link>
            </div>
            <div className='flex justify-between'>
                <Link className='flex items-center justify-center flex-col' href={"/alldiscussions"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#fbf0fa] mb-2 rounded-[14px]'>
                        <HiOutlineChatBubbleBottomCenter className='text-[26px] text-[#560f5497]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>TALKS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/periods">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#fbefec] mb-2 rounded-[14px]'>
                        <IoIosFemale className='text-[26px] text-[#c44624]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>PERIODS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/checklist">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#ecf1fb] mb-2 rounded-[14px]'>
                        <PiListPlusLight className='text-[26px] text-[#4b8ffc]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>CHECKLISTS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href={"/milestones"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-[#f3f9f2] mb-2 rounded-[14px]'>
                        <BsGem className='text-[26px] text-[#98e88d]' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-black/70 text-center'>MILESTONES</div>
                </Link>
            </div>
        </>
    )
}

export default Categories