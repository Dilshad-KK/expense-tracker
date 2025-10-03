import moment from "moment";
import { useMemo } from "react";
import GoBack from "../gobackSecond";
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";
import { getCategoryIcon } from "@/utils/categoryMapper";
import { useGetGroupedExpensesQuery } from "@/store/api";
// import { messaging } from "../firebase";
// import { requestFCMToken } from "../firebase";

type Expense = {
  id: number;
  amount: number;
  note: string;
  type: string;
  balance: string;
  created_at: string;
};

interface UserType {
  user: string;
}

export default function ExpensesUi(props: UserType) {
  // const [active, setActive] = useState("All");

  let apiPath = '';
  let formTitle = '';
  let currency = '';
  let addhref = '';
  let detailshref = '';

  if (props?.user === "ikkuindia") {
    apiPath = '/api/ikkuexpensesindia';
    formTitle = "Ikkooos's India Expenses";
    currency = "Rs";
    addhref = "/ikkuexpensesindia/newexpense";
    detailshref = `/ikkuexpensesindia/expensedetails/`;
  }
  else if (props?.user === "ikkuuae") {
    apiPath = '/api/ikkuexpensesuae';
    formTitle = "Ikkooos's UAE Expenses";
    currency = "AED";
    addhref = "/ikkuexpensesuae/newexpense";
    detailshref = `/ikkuexpensesuae/expensedetails/`;
  }
  else if (props?.user === "ibu") {
    apiPath = '/api/expenses';
    formTitle = "Iboootty's Expenses";
    currency = "Rs";
    addhref = "/ibuexpenses/newexpense";
    detailshref = `/ibuexpenses/expensedetails/`;
  }

  // Fetch grouped expenses via RTK Query using the resolved apiPath
  const { data: expData, isFetching: loading } = useGetGroupedExpensesQuery({ apiPath, filter: 'all' }, { skip: !apiPath });
  const grouped: Record<string, Expense[]> = useMemo(() => (expData?.grouped || {}), [expData]);
  const flat = useMemo(() => Object.values(grouped).flat() as Expense[], [grouped]);
  const totalExpense = useMemo(() => parseFloat((flat.reduce((acc, e) => acc + (e.type === 'Withdrawal' ? Number(e.amount) : 0), 0)).toFixed(2)), [flat]);
  const totalDeposit = useMemo(() => parseFloat((flat.reduce((acc, e) => acc + (e.type === 'Deposit' ? Number(e.amount) : 0), 0)).toFixed(2)), [flat]);
  const closingBalance = useMemo(() => parseFloat((totalDeposit - totalExpense).toFixed(2)), [totalDeposit, totalExpense]);

  // const handleFilter = (option: string) => {
  //   setActive(option);
  //   let optionString = "all";
  //   option === "Last Three Months" ? optionString = "last3Months" :
  //     option === "This Month" ? optionString = "thisMonth" : option === "all"
  //   fetchExpenses(optionString)
  // }



  return (
    <div className="bg-[#ffffff]">
      <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4 mb-8'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <GoBack />
        <span className='text-white z-[2000]'>{formTitle}</span>
        <div />
      </div>
      <div className="min-h-screen p-4 pb-[150px]">
        {loading ?
          [1, 2, 3, 4]?.map((key) => (
            <div className="h-[70px] w-[100%] bg-white py-4 ounded-[12px] flex" key={key}>
              <div className="skeleton h-full w-[10%] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
              <div className='w-full'>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] mb-2"></div>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc]"></div>
              </div>
            </div>
          ))

          :

          flat?.length > 0 ?
            <>
              {/* <div className="flex justify-center items-center w-full mb-6">
                {["All", "This Month", "Last Three Months"]?.map((option: string) => (
                  <div className={`${option === active ? 'bg-[#514cff] text-white' : 'bg-slate-200 text-black/70'} mx-2  py-2 px-4 rounded-[12px] text-[12px] `}
                    onClick={() => { handleFilter(option) }}>{option}</div>
                ))}
              </div> */}
              <div className="mb-8 px-4 py-3 rounded-[4px] flex items-center justify-between border-solid border-[1px] 
                border-[#ddddf6] bg-[#ffffff]">
                <div>
                  <div className="text-[12px] text-black/70 font-poppinsMed mb-1">Total Expense</div>
                  <div className="text-[10px] text-black/60">{currency}&nbsp;{totalExpense}</div>
                </div>
                <div>
                  <div className="text-[12px] text-black/70 font-poppinsMed mb-1">Total Deposit</div>
                  <div className="text-[10px] text-black/60">{currency}&nbsp;{totalDeposit}</div>
                </div>
                <div>
                  <div className="text-[12px] text-black/70 font-poppinsMed mb-1">Closing Balance</div>
                  <div className="text-[10px] text-black/60">{currency}&nbsp;{closingBalance}</div>
                </div>
              </div>
              {Object?.keys(grouped)?.map(item => (
                <div className="mb-6">

                  <div className="text-black/80 font-poppinsMed text-[14px] mb-4">
                    {item}
                  </div>

                  {grouped[item]?.map(item => (
                    <Link href={`${detailshref}${item?.id}`} className="mb-4 flex items-center">
                      <div className="flex flex-col items-center justify-start bg-white w-[30px] ml-[-4px] mr-3">
                        <span className="text-[12px] text-black/70">{moment(item?.created_at).format("MMM")}</span>
                        <span className="text-[12px] text-black/70">{moment(item?.created_at).format("DD")}</span>
                      </div>
                      <div className="bg-[#e9f7ed] p-3 mr-3 flex-shrink-0">
                        <img src={getCategoryIcon(item?.note)} className="h-[20px] opacity-70" />
                      </div>
                      <div className="max-w-[200px]">
                        <div className="text-black/70 text-[12px] mb-1">{item?.note}</div>
                        <div className="text-black/50 text-[10px]">{item?.type}</div>
                      </div>
                      <div className="flex flex-1 items-end justify-center flex-col flex-shrink-0">
                        <div className={`text-[8px] font-poppinsMed ${item?.type === 'Withdrawal' ? 'text-[#e7632b]' : 'text-[#1b987b]'}`}>{item?.type === 'Withdrawal' ? 'You Paid' : 'You Received'}</div>
                        <div className={`text-[12px] font-poppinsMed ${item?.type === 'Withdrawal' ? 'text-[#e7632b]' : 'text-[#1b987b]'}`}>{currency}&nbsp;{item?.amount}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </>
            :
            <div className="flex items-center justify-center mt-16 text-gray-400 flex-col">
              <img src="/assets/empty.png" className="h-[70px] mb-4" />
              <span className="text-center">No Expenses Found...!</span>
            </div>
        }
      </div>
      <Link href={addhref} className='fixed z-[2000] right-8 bottom-28 bg-[#514cff] h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer'>
        <FaPlus className='text-white text-base' />
      </Link>
    </div>

  );
}
