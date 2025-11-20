import React from 'react';
import Link from 'next/link'
import { CiReceipt } from "react-icons/ci";
import { PiBankLight, PiListPlusLight } from "react-icons/pi";
import { HiOutlineChatBubbleBottomCenter, HiOutlineCreditCard } from "react-icons/hi2";
import { IoIosFemale } from "react-icons/io";
import { TbChartPie } from "react-icons/tb";

const Categories = () => {
    const menuItems = [
        {
            label: "S-TXNS",
            href: "/ibuexpenses",
            icon: <CiReceipt className='text-[30px] text-success' />
        },
        {
            label: "D-TXNS 🇮🇳",
            href: "/ikkuexpensesindia",
            icon: <CiReceipt className='text-[30px] text-info' />
        },
        {
            label: "D-TXNS 🇦🇪",
            href: "/ikkuexpensesuae",
            icon: <CiReceipt className='text-[30px] text-warning' />
        },
        {
            label: "LOANS",
            href: "/allloans",
            icon: <PiBankLight className='text-[26px] text-secondary' />
        },
        {
            label: "TALKS",
            href: "/alldiscussions",
            icon: <HiOutlineChatBubbleBottomCenter className='text-[26px] text-secondary' />
        },
        {
            label: "PERIODS",
            href: "/periods",
            icon: <IoIosFemale className='text-[26px] text-error' />
        },
        {
            label: "CHECKLISTS",
            href: "/checklist",
            icon: <PiListPlusLight className='text-[26px] text-info' />
        },
        // {
        //     label: "DUBAI PLAN",
        //     href: "/dubai-plan",
        //     icon: <TbChartPie className='text-[26px] text-primary' />
        // },
        {
            label: "SUBSCRIPTIONS",
            href: "/subscriptions",
            icon: <HiOutlineCreditCard className='text-[26px] text-primary' />
        }
    ];

    return (
        <>
            <h3 className='text-left mb-4 text-base-content text-[16px] font-poppinsMed'>Category</h3>
            <div className='grid grid-cols-4 gap-4 justify-items-center'>
                {menuItems.map((item) => (
                    <Link key={item.label} className='flex items-center justify-center flex-col' href={item.href}>
                        <div className='h-[60px] w-[60px] flex items-center justify-center bg-base-200 mb-2 rounded-[14px] border border-base-content/10 shadow-sm'>
                            {item.icon}
                        </div>
                        <div className='font-poppinsMed text-[12px] text-base-content/70 text-center'>{item.label}</div>
                    </Link>
                ))}
            </div>
        </>
    )
}

export default Categories
