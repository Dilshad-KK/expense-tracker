import moment from "moment";
import { useMemo } from "react";
import CommonHeader from "@/components/commonHeader";
import PageEmptyState from "@/components/pageEmptyState";
import PageFab from "@/components/pageFab";
import PageSection from "@/components/pageSection";
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";
import { getCategoryIcon } from "@/utils/categoryMapper";
import { useGetGroupedExpensesQuery } from "@/store/api";

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

  const { data: expData, isFetching: loading } = useGetGroupedExpensesQuery(
    { apiPath, filter: 'all' },
    { skip: !apiPath, refetchOnFocus: true, refetchOnReconnect: true, refetchOnMountOrArgChange: true }
  );
  const grouped: Record<string, Expense[]> = useMemo(() => (expData?.grouped || {}), [expData]);
  const flat = useMemo(() => Object.values(grouped).flat() as Expense[], [grouped]);
  const totalExpense = useMemo(() => parseFloat((flat.reduce((acc, e) => acc + (e.type === 'Withdrawal' ? Number(e.amount) : 0), 0)).toFixed(2)), [flat]);
  const totalDeposit = useMemo(() => parseFloat((flat.reduce((acc, e) => acc + (e.type === 'Deposit' ? Number(e.amount) : 0), 0)).toFixed(2)), [flat]);
  const closingBalance = useMemo(() => parseFloat((totalDeposit - totalExpense).toFixed(2)), [totalDeposit, totalExpense]);

  return (
    <div className="bg-base-100 min-h-dvh">
      <CommonHeader title={formTitle} />
      <div className="page-body-with-fab px-4 pt-2">
        <div className="mx-auto max-w-2xl space-y-4">
          {loading ? (
            [1, 2, 3, 4]?.map((key) => (
              <div className="h-16 w-full rounded-box bg-base-100 py-4 flex" key={key}>
                <div className="mr-3 h-full w-[10%] rounded-box bg-base-200 skeleton"></div>
                <div className='w-full'>
                  <div className="mb-2 h-4 w-full bg-base-200 skeleton"></div>
                  <div className="h-4 w-full bg-base-200 skeleton"></div>
                </div>
              </div>
            ))
          ) : flat?.length > 0 ? (
            <>
              <PageSection className="!px-0 !pt-0" contentClassName="flex items-center justify-between gap-4">
                <div>
                  <div className="mb-1 text-xs font-poppinsMed text-base-content/70">Total Expense</div>
                  <div className="text-xs text-base-content/60">{currency}&nbsp;{totalExpense}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-poppinsMed text-base-content/70">Total Deposit</div>
                  <div className="text-xs text-base-content/60">{currency}&nbsp;{totalDeposit}</div>
                </div>
                <div>
                  <div className="mb-1 text-xs font-poppinsMed text-base-content/70">Closing Balance</div>
                  <div className="text-xs text-base-content/60">{currency}&nbsp;{closingBalance}</div>
                </div>
              </PageSection>
              {Object.keys(grouped).map((groupLabel) => (
                <div className="mb-6" key={groupLabel}>
                  <div className="mb-4 text-sm font-poppinsBold text-base-content/80">
                    {groupLabel}
                  </div>

                  <div className="space-y-3">
                    {grouped[groupLabel]?.map((item) => (
                      <Link
                        href={`${detailshref}${item?.id}`}
                        className="flex items-center rounded-[24px] border border-base-content/10 bg-base-100/95 p-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_48px_rgba(81,76,255,0.14)] dark:bg-base-200/80"
                        key={item.id}
                      >
                        <div className="mr-3 flex w-9 flex-col items-center justify-start">
                          <span className="text-xs leading-none text-base-content/70">{moment(item?.created_at).format("MMM")}</span>
                          <span className="text-xs leading-none text-base-content/70">{moment(item?.created_at).format("DD")}</span>
                        </div>
                        <div className="mr-3 flex-shrink-0 rounded-[18px] bg-base-200 p-3 ring-1 ring-base-300/60 dark:ring-base-300/40">
                          <img src={getCategoryIcon(item?.note)} alt="category" className="h-5 opacity-90 dark:invert" />
                        </div>
                        <div className="max-w-[200px]">
                          <div className="mb-1 text-xs text-base-content/80">{item?.note}</div>
                          <div className="text-[10px] text-base-content/60">{item?.type}</div>
                        </div>
                        <div className="flex flex-1 flex-col items-end justify-center flex-shrink-0">
                          <div className={`text-xs font-poppinsMed ${item?.type === 'Withdrawal' ? 'text-error' : 'text-success'}`}>{item?.type === 'Withdrawal' ? 'You Paid' : 'You Received'}</div>
                          <div className={`text-sm font-poppinsBold ${item?.type === 'Withdrawal' ? 'text-error' : 'text-success'}`}>{currency}&nbsp;{item?.amount}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <PageEmptyState title="No expenses found" description="Add an expense to start building category history and quick-add suggestions." icon={<FaPlus className="text-xl" />} />
          )}
        </div>
      </div>
      <PageFab href={addhref} ariaLabel="Add expense" />
    </div>

  );
}
