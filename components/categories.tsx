import React from 'react';
import Link from 'next/link'
import { CiReceipt } from "react-icons/ci";
import { PiBankLight } from "react-icons/pi";
import { HiOutlineEnvelope, HiOutlineChatBubbleBottomCenter, HiOutlineCreditCard, HiOutlineSparkles, HiOutlineArrowTrendingUp } from "react-icons/hi2";
import { IoIosFemale } from "react-icons/io";
import { FaMosque } from "react-icons/fa6";

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
            label: "BRIDGE",
            href: "/financialbridge",
            icon: <HiOutlineArrowTrendingUp className='text-[26px] text-info' />
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
        /* {
            label: "CHECKLISTS",
            href: "/checklist",
            icon: <PiListPlusLight className='text-[26px] text-info' />
        }, */
        {
            label: "HR MAILER",
            href: "/hrmailer",
            icon: <HiOutlineEnvelope className='text-[26px] text-primary' />
        },
        {
            label: "AI CHAT",
            href: "/ai",
            icon: <HiOutlineSparkles className='text-[26px] text-secondary' />
        },
        {
            label: "SUBSCRIPTIONS",
            href: "/subscriptions",
            icon: <HiOutlineCreditCard className='text-[26px] text-primary' />
        },
        {
            label: "QURAN",
            href: "/quran",
            icon: <FaMosque className='text-[26px] text-emerald-400' />
        }
    ];

    return (
        <div className="relative mb-10">
            <h3 className='text-left mb-6 text-base-content text-[18px] font-poppinsSemi tracking-tight'>Quick Access</h3>
            
            <div className='grid grid-cols-4 sm:grid-cols-5 gap-y-8 gap-x-2 justify-items-center'>
                {menuItems.map((item) => (
                    <Link key={item.label} className='flex flex-col items-center group relative w-full cursor-pointer' href={item.href}>
                        {/* Subtle Background Glow on Hover */}
                        <div className='absolute top-2 w-[50px] h-[50px] bg-base-content/10 rounded-full blur-xl scale-50 opacity-0 group-hover:opacity-100 group-hover:scale-150 group-hover:bg-primary/20 transition-all duration-500 pointer-events-none'></div>
                        
                        {/* Premium Glass Icon Container */}
                        <div className='relative z-10 h-[68px] w-[68px] flex items-center justify-center bg-gradient-to-b from-base-200/90 to-base-300/60 backdrop-blur-md mb-3 rounded-[22px] shadow-[0_4px_20px_rgb(0_0_0/0.05)] group-hover:shadow-[0_8px_30px_rgb(0_0_0/0.15)] border border-white/5 group-hover:border-primary/40 group-hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden'>
                            
                            {/* Inner light reflection */}
                            <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none'></div>
                            
                            {/* Icon Animation Wrapper */}
                            <div className='group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300 ease-out'>
                                {item.icon}
                            </div>
                        </div>
                        
                        {/* Typography */}
                        <div className='font-poppinsSemi text-[10px] text-base-content/50 group-hover:text-base-content transition-colors duration-300 text-center tracking-widest uppercase mt-1'>{item.label}</div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default Categories
