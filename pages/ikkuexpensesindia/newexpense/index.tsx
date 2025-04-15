import React, { useState } from 'react'
import GoBack from "../../../components/gobackSecond";


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

        const response = await fetch('/api/ikkuexpensesindia', {
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
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4 mb-8'>
                <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
                <GoBack />
                <span className='text-white z-[2000]'>Add New Expense</span>
                <div />
            </div>
            <div className='px-4 pb-[150px]'>
                <div className="flex items-center justify-center flex-col">
                    <input
                        type="number"
                        placeholder="Amount"
                        className="input text-black/60 mb-2 border-[1px] border-solid border-[#d3d3fe] w-full p-4 rounded-[8px] bg-[#f3f3fd] placeholder:text-[12px]"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Enter Description"
                        className="input text-black/60 mb-2 border-[1px] border-solid border-[#d3d3fe] w-full p-4 rounded-[8px] bg-[#f3f3fd] placeholder:text-[12px]"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    <select className="text-black/60 select border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
                        value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Deposit">Deposit</option>
                    </select>

                    <button className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full" onClick={addExpense}>
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