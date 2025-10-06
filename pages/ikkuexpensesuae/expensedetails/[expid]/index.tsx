import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonHeader from "@/components/commonHeader";
import moment from 'moment';
import Link from 'next/link';
import { getCategoryIcon } from '@/utils/categoryMapper';

type Expense = {
  id: number;
  amount: number;
  note: string;
  type: string;
  balance: string;
  created_at: string;
};


const ExpenseDetails = () => {
  const router = useRouter();
  const { expid } = router.query;

  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {

    if (!expid) return;

    fetchExpenses();
  }, [expid]);

  async function fetchExpenses() {
    setLoading(true);
    const res = await fetch(`/api/ikkuexpensesuae?id=${expid}`);
    const result = await res.json();
    const data = Object.values(result.grouped).flat() as Expense[];
    setExpenses(data);
    setLoading(false);
  }

  async function deleteExpense() {
    setLoading(true);
    const response = await fetch(`/api/ikkuexpensesuae?id=${expid}`, {
      method: "DELETE",
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      router.push("/ikkuexpensesuae");
      setShowSuccessMessage("Expense Deleted Successfully...!");
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
    <div className='bg-base-100 min-h-screen'>
      <CommonHeader
        title='Expense Details'
        right={(
          <div className='flex items-center gap-2'>
            <Link href={`/ikkuexpensesuae`} className='btn btn-xs btn-success text-white'>Update</Link>
            <button onClick={() => deleteExpense()} className='btn btn-xs btn-error text-white'>Delete</button>
          </div>
        )}
      />

      {loading ?
        <div className='p-4'>
          <div className="h-[70px] w-[100%] bg-white px-4 py-4 my-3 rounded-[12px] flex">
            <div className="skeleton h-full w-[10%] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
            <div className='w-full'>
              <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] mb-2"></div>
              <div className="skeleton h-4 w-[100%] bg-[#d6d6fc]"></div>
            </div>
          </div>
        </div>
        : expenses?.length ?
          <div className='px-4 pt-8 pb-[150px]'>

            {expenses?.map(item => (
              <div className="mb-4 flex items-center">
                <div className="flex flex-col items-center justify-start bg-white w-[30px] ml-[-4px] mr-3">
                  <span className="text-[12px] text-black/70">{moment(item?.created_at).format("MMM")}</span>
                  <span className="text-[12px] text-black/70">{moment(item?.created_at).format("DD")}</span>
                </div>
                <div className="bg-[#e9f7ed] p-3 mr-3 flex-shrink-0">
                  <img src={getCategoryIcon(item?.note)} className="h-[20px] opacity-70" />
                </div>
                <div className="max-w-[220px]">
                  <div className="text-black/70 text-[12px] mb-1">{item?.note}</div>
                  <div className="text-black/50 text-[10px]">{item?.type}</div>
                </div>
                <div className="flex flex-1 items-end justify-center flex-col flex-shrink-0">
                  <div className={`text-[8px] ${item?.type === 'Withdrawal' ? 'text-[#e7632b]' : 'text-[#1b987b]'}`}>{item?.type === 'Withdrawal' ? 'You Paid' : 'You Received'}</div>
                  <div className={`text-[12px] ${item?.type === 'Withdrawal' ? 'text-[#e7632b]' : 'text-[#1b987b]'}`}>{'AED'}&nbsp;{item?.amount}</div>
                </div>
              </div>
            ))}


          </div>
          : null
      }


      {showSuccessMessage && (
        <div className="flex items-center justify-end w-full p-4">
          <div role="alert" className="alert alert-success alert-soft mb-4 text-center w-full">
            <span className="text-white text-[14px]">{showSuccessMessage}</span>
          </div>
        </div>
      )
      }
    </div>
  )
}

export default ExpenseDetails
