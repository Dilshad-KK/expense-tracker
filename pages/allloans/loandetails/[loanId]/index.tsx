import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import GoBack from "../../../../components/gobackSecond";
import { IoMdTrash } from "react-icons/io";
import moment from 'moment';
import { HiPencil } from "react-icons/hi";
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
  const [totalPaid, setTotalPaid] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");


  useEffect(() => {

    if (!loanId) return; // wait for router to be ready

    fetchLoan();
    fetchLoanDetails();
  }, [loanId]);


  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/loans?loanId=${loanId}`);
      const data: Loan[] = await res.json();
      setLoan(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/loanitems?loanId=${loanId}`);
      const data: ILoanDetails[] = await res.json();
      setLoanDetails(data);
      getTotalPaid(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching loan:", error);
    } finally {
      setLoading(false);
    }
  };

  async function deleteLoan(loanIdToDelete: string) {
    setLoading(true);
    const response = await fetch(`/api/loans?id=${loanIdToDelete}`, {
      method: "DELETE",
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      setShowSuccessMessage("Loan Deleted Successfully...!");
      setLoading(false);
      setTimeout(() => {
        router.push("/allloans");
      }, 2000);
    } else {
      alert(`Error: ${data.error}`);
      setLoading(false);
    }
  }

  const getTotalPaid = (loanItems: ILoanDetails[]) => {
    let paidAmount = 0;

    loanItems?.forEach((item) => {
      if (item?.status === 'paid') {
        paidAmount += Number(item?.amount);
      }
    });

    setTotalPaid(paidAmount);
  }



  return (
    <div className='bg-[#e8e8fd] min-h-screen'>
      <div>
        <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[220px]'>
          <div className='absolute left-[-100px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[230px]'></div>
          <div className='absolute left-[-50px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[230px]'></div>
          <div className='absolute left-[32px] z-[1000]'>
            <GoBack />
          </div>
          {loan?.length ?
            <div className='flex justify-center items-center flex-col'>
              <div className='bg-[#ffffff18] px-6 py-2 rounded-[24px] mb-4'>
                {loan?.length && <span className='text-white text-[18px] font-poppinsBold'>{loan[0]?.title}</span>}
              </div>
              <div className='mr-2 bg-[#2d23b9] px-4 py-2 rounded-[24px] flex items-center justify-center mb-2'>
                {loan?.length && <span className='text-white text-[10px] font-poppinsMed'>Total Amount &nbsp;&nbsp;&nbsp;<span className='font-poppinsBold'>{loan[0]?.currency}&nbsp;&nbsp;{loan[0]?.total_amount}</span> </span>}
              </div>
              <div className='flex mb-3'>
                <div className='mr-2 bg-[#2d23b9] px-4 py-2 rounded-[24px] flex items-center justify-center'>
                  {loan?.length && <span className='text-white text-[10px] font-poppinsMed'>Total Paid &nbsp;&nbsp;&nbsp;<span className='font-poppinsBold'>{loan[0]?.currency}&nbsp;&nbsp;{totalPaid}</span> &nbsp;&nbsp; | &nbsp;&nbsp;Total Remaining &nbsp;&nbsp;&nbsp;<span className='font-poppinsBold'>{loan[0]?.currency}&nbsp;&nbsp;{Number(loan[0]?.total_amount) - totalPaid}</span> </span>}
                </div>
              </div>
              <div className='flex'>
                <div className='mr-2 bg-[#c8f7de] px-4 py-2 rounded-[24px] flex items-center justify-center cursor-pointer'>
                  <span className='text-[#0d4a2a] text-[10px] font-poppinsMed'>Update</span>
                </div>
                <div className='mr-2 bg-[#f6d2c5] px-4 py-2 rounded-[24px] flex items-center justify-center cursor-pointer' onClick={() => deleteLoan(loanId as string)}>
                  <span className='text-[#85371a] text-[10px] font-poppinsMed'>Delete</span>
                </div>
              </div>

            </div>
            : <div className="flex w-[250px] flex-col gap-4 items-center justify-cenetr">
              <div className="skeleton h-8 w-[180px] bg-[#e0e0ff]"></div>
              <div className="skeleton h-4 w-[160px] bg-[#c4c4fa]"></div>
              <div className="skeleton h-6 w-full bg-[#d6d6f5]"></div>
              <div className='w-full flex items-center justify-center'>
                <div className="skeleton h-6 w-[60px] bg-[#d6d6f5] mr-2"></div>
                <div className="skeleton h-6 w-[60px] bg-[#d6d6f5]"></div>
              </div>
            </div>
          }


        </div>
      </div>

      {loading ?
        <div className='p-4'>
          {[1, 2, 3, 4]?.map((key) => (
            <div className="h-[70px] w-[100%] bg-white px-4 py-4 my-3 rounded-[12px] flex" key={key}>
              <div className="skeleton h-full w-[10%] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
              <div className='w-full'>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] mb-2"></div>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc]"></div>
              </div>
            </div>
          ))}
        </div>
        : loan?.length ?
          <div className='px-4 pt-4 pb-[150px]'>
            {loanDetails?.length && loan?.length ?
              loanDetails?.map((item, key) => {
                return (
                  <div className='bg-white px-4 py-4 my-3 rounded-[12px] flex justify-between items-center'>
                    <div className='flex'>
                      <div className='bg-[#a5a5fe2d] rounded-[12px] h-[40px] w-[40px] flex items-center justify-center flex-col mr-8'>
                        <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(item?.due_date).format("DD")}</span>
                        <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(item?.due_date).format("MMM")}</span>
                      </div>
                      <div className='flex items-start justify-center flex-col mr-8'>
                        <span className='text-black/80 text-[14px] font-poppinsMed mb-1'>{loan[0]?.currency + " "} {item?.amount}</span>
                        <span className='text-black/60 text-[12px] font-poppins'>{`Payment ${key + 1} of ${loanDetails?.length}`}</span>
                      </div>
                      <div className='flex items-center justify-center'>
                        {item?.status === 'paid' ?
                          <div className='bg-[#a7fac5] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{item?.status}</div>
                          :
                          <div className='bg-[#fbe2de] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{item?.status}</div>}
                      </div>
                    </div>

                    <Link href={`/allloans/loandetails/${loanId}/${item?.id}/edit`}>
                      <HiPencil className='text-[rgb(81,107,255)] text-[20px] cursor-pointer' />
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