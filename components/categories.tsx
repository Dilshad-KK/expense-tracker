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
            <h3 className='text-left mb-4 text-base-content text-[16px] font-poppinsMed'>Category</h3>
            <div className='flex mb-8 justify-between'>
                <Link className='flex items-center justify-center flex-col' href={"/ibuexpenses"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <CiReceipt className='text-[30px] text-success' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>S-TXNS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/ikkuexpensesindia">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <CiReceipt className='text-[30px] text-info' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>D-TXNS 🇮🇳</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/ikkuexpensesuae">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <CiReceipt className='text-[30px] text-warning' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>D-TXNS 🇦🇪</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href={"/allloans"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <PiBankLight className='text-[26px] text-secondary' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>LOANS</div>
                </Link>
            </div>
            <div className='flex justify-between'>
                <Link className='flex items-center justify-center flex-col' href={"/alldiscussions"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <HiOutlineChatBubbleBottomCenter className='text-[26px] text-secondary' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>TALKS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/periods">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <IoIosFemale className='text-[26px] text-error' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>PERIODS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href="/checklist">
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <PiListPlusLight className='text-[26px] text-info' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>CHECKLISTS</div>
                </Link>
                <Link className='flex items-center justify-center flex-col' href={"/milestones"}>
                    <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                        <BsGem className='text-[26px] text-success' />
                    </div>
                    <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>MILESTONES</div>
                </Link>
            </div>
        </>
    )
}

export default Categories
