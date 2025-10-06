import React, { useState } from 'react'
import CommonHeader from "@/components/commonHeader";


const NewExpense = () => {

    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState("Withdrawal");
    const [showSuccessMessage, setShowSuccessMessage] = useState("");



    async function addExpense() {
        setLoading(true);
        if (!amount || !note || !type) {
            alert("All fields are required!");
            setLoading(false);
            return;
        }

        let balanceNumber = 0;

        let balance = balanceNumber.toString();

        const response = await fetch('/api/ikkuexpensesuae', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, note, type, balance }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            setShowSuccessMessage("Expense Added Successfully...!");
            // sendNotification(`Expense Added For ${formTitle}`);
            setAmount("");
            setNote("");
            setType("Withdrawal");
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
            <CommonHeader title='Add New Expense' />
            <div className='px-4 pb-[150px]'>
                <div className="flex items-center justify-center flex-col">
                    <input
                        type="number"
                        placeholder="Amount"
                        className="input input-bordered mb-2 w-full p-4 rounded-[8px] bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter Description"
                        className="input input-bordered mb-2 w-full p-4 rounded-[8px] bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <select className="select select-bordered w-full bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-[12px] text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
                        value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Deposit">Deposit</option>
                    </select>

                    <button className="btn btn-primary text-white text-[12px] my-[16px] w-full" onClick={addExpense}>
                    {loading ? <span className="ml-2 loading loading-dots loading-md"></span> : 'Add Expense'} 
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

export default NewExpense
