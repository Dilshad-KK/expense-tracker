import React, { useState } from 'react'
// import { IoMdNotifications } from "react-icons/io";
import CommonHeader from "@/components/commonHeader";
// import moment from 'moment';
// import Link from 'next/link';
// import { FaPlus } from "react-icons/fa6";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

// type Loan = {
//     id: number;
//     title: string;
//     total_insts: string;
//     paid_insts: string;
//     total_amount: string;
//     currency: string;
//     date_started: string;
//     created_at: string;
//     status: string;
// };

const NewLoan = () => {

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [totalInsts, setTotalInsts] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [currency, setCurrency] = useState("");
    const [dateStarted, setDateStarted] = useState<Date | null>(new Date());
    const [status, setStatus] = useState("");
    const [showSuccessMessage, setShowSuccessMessage] = useState("");

    async function addLoan() {
        setLoading(true);
        console.log(loading)
        if (!title || !totalInsts || !totalAmount || !currency || !dateStarted || !status) {
            alert("All fields are required!");
            setLoading(false);
            return;
        }

        const response = await fetch('/api/loans', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, totalInsts, totalAmount, currency, dateStarted, status }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            setShowSuccessMessage("Loan Added Successfully...!");
            setTitle("");
            setTotalInsts("");
            setTotalAmount("");
            setCurrency("");
            setDateStarted(new Date());
            setStatus("");
            setLoading(false);
            setTimeout(() => {
                setShowSuccessMessage("");
            }, 2000);
        } else {
            alert(`Error: ${data.error}`);
            setLoading(false);
        }
        setLoading(false);
    }
    return (
        <div className="bg-base-100 min-h-screen relative">
            <CommonHeader title='Add New Loan' />
            <div className='px-4 pb-[150px]'>
                <div className="flex items-center justify-center flex-col">
                    <input
                        type="text"
                        placeholder="Title"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Total Amount"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Currency"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Total Insts"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={totalInsts}
                        onChange={(e) => setTotalInsts(e.target.value)}
                    />
                    {/* <input
                        type="text"
                        placeholder="Date Started"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={dateStarted}
                        onChange={(e) => setDateStarted(e.target.value)}
                    /> */}
                    <input
                        type="text"
                        placeholder="Status"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    />
                    <div className="w-full">
                        <DatePicker
                            wrapperClassName='w-full'
                            selected={dateStarted}
                            onChange={(date: Date | null) => setDateStarted(date)}
                            className="input mb-2 border border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px] text-[14px]"
                            placeholderText="Select date"
                        />
                    </div>
                    <button className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full" onClick={addLoan}>
                        Add Loan
                    </button>

                    {showSuccessMessage && (
                        <div className="flex items-center justify-center w-full">
                            <div role="alert" className="alert alert-success alert-soft mb-4 text-center w-full">
                                <span className="text-white text-[14px]">{showSuccessMessage}</span>
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default NewLoan
