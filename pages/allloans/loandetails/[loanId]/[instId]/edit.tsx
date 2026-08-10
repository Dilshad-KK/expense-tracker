import CommonHeader from "@/components/commonHeader";
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
    if (!loanId) return;
    fetchLoan();
  }, [loanId]);
  
  useEffect(() => {
    if (!loanId || !instId) return;
    fetchLoanDetails();
  }, [loanId, instId]);

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/loanitems?loanId=${loanId}`);
      const data: ILoanDetails[] = await res.json();
      setLoanDetails(data);
  
      const selected = data.find(item => item.id === Number(instId));
      if (selected) {
        setStatus(selected.status?.toLowerCase().trim() || ""); // normalize status
        if (selected.due_date) {
          setDateStarted(new Date(selected.due_date));
        }
        const index = data.findIndex(item => Number(instId));
        setInstOrder(index);
      }
    } catch (error) {
      console.error("Error fetching loan details:", error);
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
    <div className="bg-base-100 min-h-dvh flex flex-col">
      <CommonHeader title='Edit Installment' />
      {
        !loading && loan?.length && loanDetails?.length ?
          <div className='px-4 py-16 flex-1 flex items-start justify-center'>
            <div className='rounded-[12px] w-full flex flex-col'>
              {status && (
                <select
                  className="select border-[1px] mb-2 border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              )}
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
          </div> : null
      }
    </div>
  )
}
