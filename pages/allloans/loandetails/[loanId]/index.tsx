import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonHeader from "@/components/commonHeader";
import moment from 'moment';
import { HiPencil } from "react-icons/hi";
import { HiTrash } from "react-icons/hi2";
import Link from 'next/link';

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

type ILoanDetails = {
  id: number;
  loan_id: string;
  created_at: string;
  due_date: string;
  amount: string;
  status: string;
};

const LoanDetails = () => {
  const router = useRouter();
  const { loanId } = router.query;

  const [loan, setLoan] = useState<Loan[]>();
  const [loanDetails, setLoanDetails] = useState<ILoanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [error, setError] = useState("");


  useEffect(() => {

    if (!loanId) return; // wait for router to be ready

    fetchLoan();
    fetchLoanDetails();
  }, [loanId]);


  const fetchLoan = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/loans?loanId=${loanId}`);
      const data: Loan[] = await res.json();
      if (!res.ok) {
        throw new Error((data as any)?.error ?? "Failed to fetch loan");
      }
      setLoan(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan:", error);
      setError("Unable to load this loan.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/loanitems?loanId=${loanId}`);
      const data: ILoanDetails[] = await res.json();
      if (!res.ok) {
        throw new Error((data as any)?.error ?? "Failed to fetch loan details");
      }
      setLoanDetails(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan:", error);
      setError("Unable to load this loan.");
    } finally {
      setLoading(false);
    }
  };

  async function deleteLoan(loanIdToDelete: string) {
    const confirmed = window.confirm("Delete this loan and all its installments?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      const response = await fetch(`/api/loans?id=${loanIdToDelete}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok) {
        setShowSuccessMessage("Loan Deleted Successfully...!");
        setTimeout(() => {
          router.push("/allloans");
        }, 800);
      } else {
        throw new Error(data?.error ?? "Failed to delete loan");
      }
    } catch (err: any) {
      console.error("Error deleting loan:", err);
      setError("Failed to delete loan. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className='bg-base-100 min-h-screen'>
      <CommonHeader
        title='Loan Details'
        right={
          loan?.[0] ? (
            <button
              onClick={() => deleteLoan(String(loan[0].id))}
              aria-label='Delete'
              title='Delete'
              className='btn btn-circle btn-ghost hover:bg-error/10 text-error'
              disabled={deleting}
            >
              {deleting ? (
                <span className='loading loading-spinner loading-sm' />
              ) : (
                <HiTrash className='w-5 h-5' />
              )}
            </button>
          ) : null
        }
      />

      {loading ?
        <div className='p-4'>
          {[1, 2, 3, 4]?.map((key) => (
            <div className="h-[70px] w-[100%] bg-white dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex" key={key}>
              <div className="skeleton h-full w-[10%] bg-[#d6d6fc] dark:bg-base-300 rounded-[12px] mr-3"></div>
              <div className='w-full'>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] dark:bg-base-300 mb-2"></div>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] dark:bg-base-300"></div>
              </div>
            </div>
          ))}
        </div>
        : error ? (
          <div className='px-4'>
            <div className='alert alert-error alert-soft mb-4'>
              <span className='text-white text-[12px]'>{error}</span>
            </div>
          </div>
        ) : loan?.length ?
          <div className='px-4 pt-4 pb-[150px]'>
            {loanDetails?.length && loan?.length ?
              loanDetails?.map((item, key) => {
                return (
                  <div key={item.id} className='bg-white dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex justify-between items-center'>
                    <div className='flex'>
                      <div className='bg-[#a5a5fe2d] dark:bg-primary/20 rounded-[12px] h-[60px] w-[60px] flex items-center justify-center flex-col mr-8 border-2 border-primary/30 dark:border-primary/40'>
                        <span className='text-base-content/80 text-[12px] font-poppinsMed'>{moment(item?.due_date).format("DD")}</span>
                        <span className='text-base-content/80 text-[10px] uppercase font-poppinsMed'>{moment(item?.due_date).format("MMM")}</span>
                        <span className='text-base-content/80 text-[8px] uppercase font-poppinsMed'>{moment(item?.due_date).format("YYYY")}</span>
                      </div>
                      <div className='flex items-start justify-center flex-col mr-8'>
                        <span className='text-base-content text-[14px] font-poppinsMed mb-1'>{loan[0]?.currency + " "} {item?.amount}</span>
                        <span className='text-base-content/70 text-[12px] font-poppins'>{`Payment ${key + 1} of ${loanDetails?.length}`}</span>
                      </div>
                      <div className='flex items-center justify-center'>
                        {item?.status === 'paid' ?
                          <div className='bg-[#a7fac5] dark:bg-success/20 rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] dark:text-success border-2 border-success/40 dark:border-success/50 font-poppinsMed'>{item?.status}</div>
                          :
                          <div className='bg-[#fbe2de] dark:bg-error/20 rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] dark:text-error border-2 border-error/40 dark:border-error/50 font-poppinsMed'>{item?.status}</div>}
                      </div>
                    </div>
                    <Link href={`/allloans/loandetails/${loanId}/${item?.id}/edit`}>
                      <HiPencil className='text-primary text-[20px] cursor-pointer' />
                    </Link>
                  </div>
                )
              })
              : null
            }
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
  );
};

export default LoanDetails;
