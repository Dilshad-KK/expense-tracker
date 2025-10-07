import React, { useEffect, useMemo, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
import { getAllCategories, getSuggestedCategory, trainCategoryForToken } from '@/utils/categoryMapper';


const NewExpense = () => {

    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [type, setType] = useState("Withdrawal");
    const [showSuccessMessage, setShowSuccessMessage] = useState("");
    const [chosenCategory, setChosenCategory] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<{ amount: string; note: string; type: 'Withdrawal'|'Deposit'; count: number }[]>([]);
    const suggestion = useMemo(() => getSuggestedCategory(note), [note]);
    const categories = useMemo(() => getAllCategories(), []);



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
            try {
              const token = (note || '').toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean)[0] || note;
              if (token) trainCategoryForToken(token, (chosenCategory || suggestion.key));
            } catch {}
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

    async function addQuick(a: string, n: string, t: 'Withdrawal'|'Deposit') {
        try {
            setLoading(true);
            const balance = '0';
            const response = await fetch('/api/ikkuexpensesindia', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: a, note: n, type: t, balance })
            });
            const data = await response.json();
            if (response.ok) {
                setShowSuccessMessage('Expense Added Successfully...!');
                setAmount(''); setNote(''); setType('Withdrawal');
                setTimeout(() => setShowSuccessMessage(''), 2000);
            } else {
                alert(`Error: ${data.error}`);
            }
        } finally { setLoading(false); }
    }

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/ikkuexpensesindia');
                const json = await res.json();
                const grouped = json?.grouped || {};
                const flat = Object.values(grouped).flat() as any[];
                const freq = new Map<string, { amount: string; note: string; type:'Withdrawal'|'Deposit'; count: number }>();
                for (const e of flat) {
                    const noteKey = String(e.note || '').trim().toLowerCase();
                    const amtKey = String(e.amount || '').trim();
                    const typeKey = String(e.type || 'Withdrawal');
                    const key = `${noteKey}|${amtKey}|${typeKey}`;
                    const cur = freq.get(key) || { amount: amtKey, note: e.note, type: typeKey, count: 0 };
                    cur.count += 1; freq.set(key, cur);
                }
                const list = Array.from(freq.values()).filter(x => x.count >= 2).sort((a,b)=>b.count-a.count).slice(0,5);
                setSuggestions(list);
            } catch {}
        })();
    }, []);

    // Voice input removed (no API key). Use iOS keyboard dictation instead.


    return (
        <div className="bg-base-100 min-h-screen relative">
            <CommonHeader title='Add New Expense' />
            <div className='px-4 pb-[150px]'>
                <div className="flex items-center justify-center flex-col">
                    {suggestions.length > 0 && (
                      <div className='w-full mb-3'>
                        <div className='text-xs text-base-content/60 mb-2'>Quick Add (frequent)</div>
                        <div className='flex flex-wrap gap-2'>
                          {suggestions.map((s, idx) => (
                            <button key={idx} className='px-3 py-2 rounded-lg border border-base-300 dark:border-base-600 bg-base-100 dark:bg-base-300 text-xs hover:border-primary/50'
                              onClick={() => addQuick(String(s.amount), s.note, s.type)}
                              disabled={loading}
                            >
                              {s.note} • {s.amount} • {s.type === 'Withdrawal' ? 'Pay' : 'Receive'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                        className="input input-bordered mb-2 w-full p-4 rounded-[8px] bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                    {note && (
                      <div className="w-full mb-2 flex items-center justify-between bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <img src={suggestion.icon} className="h-4 w-4 dark:invert" />
                          <span className="text-xs text-base-content/70">Suggested: <span className="font-poppinsMed text-base-content">{suggestion.label}</span></span>
                        </div>
                        <select
                          className="select select-xs select-bordered bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400"
                          value={chosenCategory || suggestion.key}
                          onChange={(e) => setChosenCategory(e.target.value)}
                        >
                          {categories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                        </select>
                      </div>
                    )}
                    {/* Tip: On iPhone, tap the keyboard mic to dictate into this field. */}
                    <select className="select select-bordered w-full bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-[12px] text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
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
