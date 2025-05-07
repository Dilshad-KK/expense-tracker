import React, { useEffect, useState } from 'react'
// import { IoMdNotifications } from "react-icons/io";
// import moment from 'moment';
// import Link from 'next/link';
// import { FaPlus } from "react-icons/fa6";
import "react-datepicker/dist/react-datepicker.css";
import CommonHeader from '@/components/commonHeader';

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

const NewItem = () => {

    useEffect(() => {
        const cachedUser = localStorage.getItem("userIdentity");

        if (cachedUser) {
            setUser(cachedUser);
            return;
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let user = "";
        if (timezone.includes("Asia/Dubai")) {
            user = "Dilshad";
        } else {
            user = "Shifa Dilshad";
        }

        localStorage.setItem("userIdentity", user);
        setUser(user);
    }, []);

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [priority, setPriority] = useState("low");
    const [user, setUser] = useState("")

    const [showSuccessMessage, setShowSuccessMessage] = useState("");

    async function addChecklistItem() {
        setLoading(true);
        console.log(loading)
        if (!title || !priority) {
            alert("All fields are required!");
            setLoading(false);
            return;
        }

        const response = await fetch('/api/checklist', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, priority, user, checked: false }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            setShowSuccessMessage("Item Added Successfully...!");
            setTitle("");
            setPriority("low");
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
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <CommonHeader title='Add New Item' />
            <div className='px-4 pb-[150px] mt-8'>
                <div className="flex items-center justify-center flex-col">
                    <input
                        type="text"
                        placeholder="Title"
                        className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <select className="text-black/60 mb-2 text-base select border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
                        value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <select className="text-black/60 text-base select border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
                        value={user} onChange={(e) => setUser(e.target.value)}>
                        {user === "Shifa Dilshad" ? <option value="Shifa Dilshad">Shifa Dilshad</option> :
                            <option value="Dilshad">Dilshad</option>}
                        {user === "Shifa Dilshad" ? <option value="Dilshad">Dilshad</option> :
                            <option value="Shifa Dilshad">Shifa Dilshad</option>}
                        <option value="Vacation">Vacation</option>
                    </select>


                    <button className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full" onClick={addChecklistItem}>
                        Add Item
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

export default NewItem