import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import GoBack from "../../components/gobackSecond";
import moment from 'moment';

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

  useEffect(() => {

    if (!loanId) return; // wait for router to be ready

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
        setLoading(false);
        fetch
      } catch (error) {
        console.error("Error fetching loan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
    fetchLoanDetails();
  }, [loanId]);

  return (
    <div className='bg-[#e8e8fd] min-h-screen'>
      {loading ?
        <div className="flex flex-col gap-2 justify-center items-center">
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
        </div>
        : loan?.length ?
          <div>
            <div className='bg-[#514cff] px-4 py-8 flex justify-between items-center rounded-b-[24px] h-[140px]'>
              <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
              <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
              <GoBack />
              <span className='text-white text-[18px] font-poppinsMed'>{loan[0]?.title}</span>
              <span className='text-white text-[14px] font-poppinsMed'>{loan[0]?.currency + " "} {loan[0]?.total_amount}</span>
            </div>
          </div> : null
      }
      <div className='p-4 pb-[150px]'>
        {loanDetails?.length && loan?.length ?
          loanDetails?.map((item, key) => {
            return (
              <div className='bg-white px-4 py-4 my-3 rounded-[12px] flex justify-between'>
                <div className='flex'>
                  <div className='bg-[#a5a5fe2d] rounded-[12px] h-[40px] w-[40px] flex items-center justify-center flex-col mr-8'>
                    <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(item?.due_date).format("DD")}</span>
                    <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(item?.due_date).format("MMM")}</span>
                  </div>
                  <div className='flex items-start justify-center flex-col'>
                    <span className='text-black/80 text-[14px] font-poppinsMed mb-1'>{loan[0]?.currency + " "} {item?.amount}</span>
                    <span className='text-black/60 text-[12px] font-poppins'>{`Payment ${key + 1} of ${loanDetails?.length}`}</span>
                  </div>
                </div>
                <div className='flex items-center justify-end'>
                  {item?.status === 'paid' ?
                    <div className='bg-[#a7fac5] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{item?.status}</div>
                    :
                    <div className='bg-[#fbe2de] rounded-[12px] text-[10px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{item?.status}</div>}
                </div>
              </div>
            )
          })
          : null
        }
      </div>

    </div>
  );
};

export default LoanDetails;