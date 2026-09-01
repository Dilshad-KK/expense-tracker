import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonHeader from "@/components/commonHeader";
import HeaderAction from '@/components/headerAction';
import PageAlert from '@/components/pageAlert';
import PageEmptyState from '@/components/pageEmptyState';
import PageSection from '@/components/pageSection';
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
    <div className='bg-base-100 min-h-dvh'>
      <CommonHeader
        title='Loan Details'
        right={
          loan?.[0] ? (
            <HeaderAction
              onClick={() => deleteLoan(String(loan[0].id))}
              label="Delete"
              tone="danger"
              disabled={deleting}
              icon={
                deleting ? (
                  <span className='loading loading-spinner loading-sm text-rose-100' />
                ) : (
                  <HiTrash className='w-5 h-5' />
                )
              }
            />
          ) : null
        }
      />

      {loading ?
        <div className='page-body px-4 pt-2'>
          <div className='page-shell'>
            {[1, 2, 3, 4]?.map((key) => (
              <div className="my-3 flex h-16 w-full rounded-box border-2 border-base-300 bg-white px-4 py-4 dark:border-base-400 dark:bg-base-200" key={key}>
                <div className="mr-3 h-full w-1/12 rounded-box bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                <div className='w-full'>
                  <div className="mb-2 h-4 w-full bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                  <div className="h-4 w-full bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        : error ? (
          <div className='page-body px-4 pt-2'>
            <div className='page-shell'>
              <PageAlert tone="error">{error}</PageAlert>
            </div>
          </div>
        ) : loan?.length ?
          <div className='page-body px-4 pt-2'>
            <div className='page-shell space-y-4'>
              <PageSection className='!px-0 !pt-0' contentClassName='space-y-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <div className='text-[11px] font-poppinsMed text-base-content/50'>Loan</div>
                    <h2 className='mt-2 text-xl font-poppinsBold text-base-content'>{loan[0]?.title}</h2>
                    <div className='mt-2 text-sm text-base-content/70'>{loan[0]?.currency} {loan[0]?.total_amount} total</div>
                  </div>
                  <div className='rounded-[22px] border border-primary/15 bg-primary/10 px-4 py-3 text-right'>
                    <div className='text-[11px] font-poppinsMed text-primary/70'>Started</div>
                    <div className='mt-1 text-sm font-poppinsBold text-primary'>{moment(loan[0]?.date_started).format("DD MMM YYYY")}</div>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                  <div className='rounded-[22px] border border-base-content/10 bg-base-200/60 p-3'>
                    <div className='text-[11px] font-poppinsMed text-base-content/50'>Installments</div>
                    <div className='mt-1 text-base font-poppinsBold text-base-content'>{loanDetails.length}</div>
                  </div>
                  <div className='rounded-[22px] border border-base-content/10 bg-base-200/60 p-3'>
                    <div className='text-[11px] font-poppinsMed text-base-content/50'>Paid</div>
                    <div className='mt-1 text-base font-poppinsBold text-base-content'>{loanDetails.filter((item) => item.status === "paid").length}</div>
                  </div>
                  <div className='col-span-2 rounded-[22px] border border-base-content/10 bg-base-200/60 p-3 sm:col-span-1'>
                    <div className='text-[11px] font-poppinsMed text-base-content/50'>Status</div>
                    <div className='mt-1 text-base font-poppinsBold capitalize text-base-content'>{loan[0]?.status || "Pending"}</div>
                  </div>
                </div>
              </PageSection>

              {loanDetails?.length ? (
                <div className='space-y-3'>
                  {loanDetails.map((item, key) => (
                    <div key={item.id} className='flex items-center justify-between rounded-[24px] border border-base-content/10 bg-base-100/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:bg-base-200/80'>
                      <div className='flex min-w-0 items-center'>
                        <div className='mr-5 flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[22px] border border-primary/20 bg-primary/10'>
                          <span className='text-xs font-poppinsMed text-base-content/80'>{moment(item?.due_date).format("DD")}</span>
                          <span className='text-xs font-poppinsMed uppercase text-base-content/80'>{moment(item?.due_date).format("MMM")}</span>
                          <span className='text-[0.65rem] font-poppinsMed uppercase text-base-content/70'>{moment(item?.due_date).format("YYYY")}</span>
                        </div>
                        <div className='min-w-0'>
                          <span className='mb-1 block text-sm font-poppinsBold text-base-content'>{loan[0]?.currency} {item?.amount}</span>
                          <span className='block text-xs text-base-content/65'>{`Installment ${key + 1} of ${loanDetails?.length}`}</span>
                        </div>
                      </div>
                      <div className='flex items-center gap-3 pl-3'>
                        <div className={`rounded-full px-3 py-1 text-xs font-poppinsMed uppercase ${
                          item?.status === 'paid' ? 'border border-success/20 bg-success/10 text-success' : 'border border-warning/20 bg-warning/10 text-warning'
                        }`}>
                          {item?.status === 'paid' ? 'Paid' : 'Pending'}
                        </div>
                        <Link href={`/allloans/loandetails/${loanId}/${item?.id}/edit`} className='rounded-2xl border border-base-content/10 bg-base-200/60 p-2 text-primary transition hover:bg-primary/10'>
                          <HiPencil className='text-lg' />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <PageEmptyState title="No installments yet" description="This loan does not have any installment entries to show." />
              )}
            </div>
          </div>
          : null
      }
      {showSuccessMessage && (
        <div className="page-body px-4 pt-0">
          <div className="page-shell">
            <PageAlert>{showSuccessMessage}</PageAlert>
          </div>
        </div>
      )
      }
    </div>
  );
};

export default LoanDetails;
