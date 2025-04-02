'use client'
import moment from "moment";
import { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

type Expense = {
    id: number;
    amount: number;
    note: string;
    type: string;
    created_at: string;
};



export default function IkkuExpenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState("Withdrawal");
    const [loading, setLoading] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState("");

    useEffect(() => {
        fetchExpenses();
    }, []);

    async function fetchExpenses() {
        setLoading(true);
        const res = await fetch("/api/ikkuexpenses");
        const data: Expense[] = await res.json();
        setExpenses(data);
        setLoading(false);
    }

    async function addExpense() {
        setLoading(true);
        if (!amount || !note || !type) {
            alert("All fields are required!");
            setLoading(false);
            return;
        }

        const response = await fetch("/api/ikkuexpenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, note, type }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            setShowSuccessMessage("Expense Added Successfully...!");
            fetchExpenses();
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
    }

    async function deleteExpense(expenseIdToDelete: string) {
        setLoading(true);
        const response = await fetch(`/api/ikkuexpenses?id=${expenseIdToDelete}`, {
            method: "DELETE",
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            setShowSuccessMessage("Expense Deleted Successfully...!");
            fetchExpenses();
            setLoading(false);
            setTimeout(() => {
                setShowSuccessMessage("");
            }, 2000);
        } else {
            alert(`Error: ${data.error}`);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="flex items-center justify-center mb-8 flex-col">
                <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
                    <legend className="fieldset-legend">Ikkooo's Expenses</legend>

                    <label className="fieldset-label">Amount</label>
                    <input type="number" className="input" placeholder="Enter Amount" value={amount}
                        onChange={(e) => setAmount(e.target.value)} />

                    <label className="fieldset-label">Note</label>
                    <input type="text" className="input" placeholder="Enter Description" value={note}
                        onChange={(e) => setNote(e.target.value)} />

                    <label className="fieldset-label">Type</label>
                    <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="Withdrawal">Withdrawal</option>
                        <option value="Deposit">Deposit</option>
                    </select>
                </fieldset>
                <button onClick={addExpense} className="btn btn-outline">
                    Add Expense
                </button>
            </div>

            {loading ? <div className="flex flex-col gap-2 justify-center items-center">
                <div className="skeleton h-4 w-[80%]"></div>
                <div className="skeleton h-4 w-[80%]"></div>
                <div className="skeleton h-4 w-[80%]"></div>
                <div className="skeleton h-4 w-[80%]"></div>
            </div> : expenses?.length > 0 ?
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Amount</th>
                                <th>Note</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map((expense => (
                                <tr>
                                    <th>{expense.amount}</th>
                                    <td>{expense.note}</td>
                                    <td>{expense.type}</td>
                                    <td>{moment(expense.created_at).format('MMMM Do YYYY, h:mm a')}</td>
                                    <td>
                                        <FaTrashAlt className="cursor-pointer text-red-400" onClick={() => {
                                            deleteExpense(expense.id.toString());
                                        }} />
                                    </td>
                                </tr>
                            )))}
                        </tbody>
                    </table>
                </div> : 
                <div className="flex items-center justify-center mt-16 text-gray-400 flex-col">
                    <img src="/assets/empty.png" className="h-[70px] mb-4"/>
                    <span className="text-center">No Expenses Found...!</span>
                </div>
            }

            {showSuccessMessage && (
                <div className="flex items-center justify-center">
                    <div role="alert" className="alert alert-success alert-soft mb-4 absolute bottom-0 text-center">
                        <span>{showSuccessMessage}</span>
                    </div>
                </div>

            )}
        </div>
    );
}