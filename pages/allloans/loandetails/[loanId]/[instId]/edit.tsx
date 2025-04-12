import GoBack from '@/components/gobackSecond';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

type ILoanDetails = {
  id: number;
  loan_id: string;
  created_at: string;
  due_date: string;
  amount: string;
  status: string;
};

type Loan = {
  id: number;
  title: string;
  total_insts: string;
  paid_insts: string;
  total_amount: string;
  currency: string;
  date_started: string;
  created_at: string;
  status: string;
};

export default function Edit() {

  const router = useRouter();
  const { loanId, instId } = router.query;

  const [loan, setLoan] = useState<Loan[]>();
  const [loanDetails, setLoanDetails] = useState<ILoanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [instOrder, setInstOrder] = useState(1);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [dateStarted, setDateStarted] = useState<Date | null>(new Date());

  useEffect(() => {

    if (!loanId) return; // wait for router to be ready
    fetchLoan();
    fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/loanitems?loanId=${loanId}`);
      const data: ILoanDetails[] = await res.json();
      setLoanDetails(data);
      setStatus(data?.filter(item => item?.id === Number(instId))[0]?.status)
      const selected = data?.find(item => item?.id === Number(instId));
      if (selected?.due_date) {
        setDateStarted(new Date(selected.due_date));
      }
      const index = data?.findIndex(item => item?.id === Number(instId));
      setInstOrder(index);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/loans?loanId=${loanId}`);
      const data: Loan[] = await res.json();
      setLoan(data);
      setTitle(data[0]?.title)
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInstallment = async () => {
    try {
      const res = await fetch("/api/loanitems", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: instId,
          status,
          due_date: dateStarted && dateStarted.toISOString(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Update failed:", result.error);
        return;
      }

      console.log("Success:", result.message);
      setShowSuccessMessage("Installment Updated Successfully...!");
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <div className="bg-[#e8e8fd] min-h-screen flex flex-col">
      <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[160px] relative'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[32px] z-[1000]'>
          <GoBack />
        </div>
        {!loading && loan?.length ?
          <div className='flex flex-col items-center justify-center'>
            <div className='bg-[#ffffff18] px-6 py-2 rounded-[24px] mb-3'>
              <span className='text-white text-[18px] font-poppinsBold'>{title}</span>
            </div>
            <div className='bg-[#2d23b9] px-4 py-2 rounded-[24px] flex items-center justify-center mb-2'>
              <span className='text-white text-[12px] font-poppinsMed'>Installment&nbsp;{Number(instOrder) + 1}</span>
            </div>
          </div> :
          <div className="flex w-[250px] flex-col gap-4 items-center justify-cenetr">
            <div className="skeleton h-8 w-[180px] bg-[#e0e0ff]"></div>
            <div className="skeleton h-4 w-[160px] bg-[#c4c4fa]"></div>
          </div>
        }
      </div>
      <div className='px-4 py-16 flex-1 flex items-start justify-center'>
        <div className='rounded-[12px] w-full flex flex-col'>
          <select className="select border-[1px] mb-2 border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
            value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <div className="w-full">
            <DatePicker
              wrapperClassName='w-full'
              selected={dateStarted}
              onChange={(date: Date | null) => setDateStarted(date)}
              className="input text-black/80 mb-2 border border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px] text-[14px]"
              placeholderText="Select date"
            />
          </div>
          <input
            type="text"
            placeholder="Amount"
            className="text-black/80 cursor-not-allowed text-base mb-2 border border-[#d3d3fe] w-full bg-[#f3f3fd] rounded px-3 py-2 placeholder:text-[12px]"
            value={loanDetails[0]?.amount}
            disabled
          />
          <button className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full" onClick={() => {
            handleUpdateInstallment()
          }}>
            Update
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
