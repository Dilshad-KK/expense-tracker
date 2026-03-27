import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonHeader from "@/components/commonHeader";
import moment from 'moment';
import Link from 'next/link';
import { HiPencilSquare, HiTrash } from 'react-icons/hi2';
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
    const res = await fetch(`/api/expenses?id=${expid}`);
    const result = await res.json();
    const data = Object.values(result.grouped).flat() as Expense[];
    setExpenses(data);
    setLoading(false);
  }

  async function deleteExpense() {
    setLoading(true);
    const response = await fetch(`/api/expenses?id=${expid}`, {
      method: "DELETE",
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      router.push("/ibuexpenses");
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
            <Link
              href={`/expenses`}
              aria-label='Edit'
              className='h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-sm hover:bg-white/20 active:scale-95 transition-all'
              title='Edit'
            >
              <HiPencilSquare className='w-5 h-5' />
            </Link>
            <button
              onClick={() => deleteExpense()}
              aria-label='Delete'
              title='Delete'
              className='h-9 w-9 rounded-full bg-red-500/15 backdrop-blur-md border border-red-500/20 text-red-100 flex items-center justify-center shadow-sm hover:bg-red-500/25 active:scale-95 transition-all disabled:opacity-50'
              disabled={loading}
            >
              {loading ? (
                <span className='loading loading-spinner loading-sm text-red-200' />
              ) : (
                <HiTrash className='w-5 h-5' />
              )}
            </button>
          </div>
        )}
      />

      {loading ? (
        <div className='p-4'>
          <div className="h-[70px] w-full bg-base-100 dark:bg-base-200 border border-base-300/60 dark:border-base-400/40 px-4 py-4 my-3 rounded-xl flex">
            <div className="skeleton h-full w-[10%] bg-base-200 dark:bg-base-300 rounded-xl mr-3"></div>
            <div className='w-full'>
              <div className="skeleton h-4 w-full bg-base-200 dark:bg-base-300 mb-2"></div>
              <div className="skeleton h-4 w-full bg-base-200 dark:bg-base-300"></div>
            </div>
          </div>
        </div>
      ) : expenses?.length ? (
        <div className='px-4 pt-6 pb-[150px]'>
          {expenses?.map(item => (
            <div className="mb-3 flex items-center rounded-xl bg-base-100/40 p-2">
              <div className="flex flex-col items-center justify-start w-[36px] mr-3">
                <span className="text-[12px] text-base-content/70 leading-none">{moment(item?.created_at).format("MMM")}</span>
                <span className="text-[12px] text-base-content/70 leading-none">{moment(item?.created_at).format("DD")}</span>
              </div>
              <div className="bg-base-200 p-3 mr-3 flex-shrink-0 rounded-xl ring-1 ring-base-300/60 dark:ring-base-300/40">
                <img src={getCategoryIcon(item?.note)} className="h-5 opacity-90 dark:invert" />
              </div>
              <div className="max-w-[220px]">
                <div className="text-base-content/80 text-[12px] mb-1">{item?.note}</div>
                <div className="text-base-content/60 text-[10px]">{item?.type}</div>
              </div>
              <div className="flex flex-1 items-end justify-center flex-col flex-shrink-0">
                <div className={`text-[10px] ${item?.type === 'Withdrawal' ? 'text-error' : 'text-success'}`}>{item?.type === 'Withdrawal' ? 'You Paid' : 'You Received'}</div>
                <div className={`text-[13px] font-poppinsBold ${item?.type === 'Withdrawal' ? 'text-error' : 'text-success'}`}>{'Rs'}&nbsp;{item?.amount}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}


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
