'use client'
import moment from "moment";
import { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa6";
import GoBack from "./goback";
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

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("Withdrawal");
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [closingBalance, setClosingBalance] = useState(0);
  // const [fcmToken, setFcmToken] = useState("")

  let apiPath = '';
  let formTitle = '';

  if (props?.user === "ikkuindia") {
    apiPath = '/api/ikkuexpensesindia';
    formTitle = "Ikkooos's India Expenses"
  }
  else if (props?.user === "ikkuuae") {
    apiPath = '/api/ikkuexpensesuae';
    formTitle = "Ikkooos's UAE Expenses"
  }
  else if (props?.user === "ibu") {
    apiPath = '/api/expenses';
    formTitle = "Iboootty's Expenses"
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    setLoading(true);
    const res = await fetch(apiPath);
    const data: Expense[] = await res.json();
    setExpenses(data);
    setTotalExpenses(data);
    setTotalDeposits(data);
    setClosingBalances(data);
    setLoading(false);
  }

  function setTotalExpenses(expenses: Expense[]) {
    let total = 0
    expenses?.map((expense) => {
      if (expense.type === "Withdrawal") {
        total += Number(expense.amount);
      }
    });
    setTotalExpense(parseFloat(total.toFixed(2)));
  }
  function setTotalDeposits(deposits: Expense[]) {
    let total = 0
    deposits?.map((deposit) => {
      if (deposit.type === "Deposit") {
        total += Number(deposit.amount);
      }
    });
    setTotalDeposit(parseFloat(total.toFixed(2)));
  }

  function setClosingBalances(transactions: Expense[]) {
    let deposits = 0;
    let withdrawals = 0;
    let cbalance = 0;

    transactions?.map((transaction) => {
      if (transaction.type === "Deposit") {
        deposits += Number(transaction.amount);
      }
    });

    transactions?.map((transaction) => {
      if (transaction.type === "Withdrawal") {
        withdrawals += Number(transaction.amount);
      }
    });

    cbalance = deposits - withdrawals;
    setClosingBalance(parseFloat(cbalance.toFixed(2)));
  }

  async function addExpense() {
    setLoading(true);
    if (!amount || !note || !type) {
      alert("All fields are required!");
      setLoading(false);
      return;
    }

    let balanceNumber = 0;

    if (!expenses[expenses?.length - 1]?.balance && type === "Deposit") {
      balanceNumber += Number(amount)
    }
    else if (!expenses[expenses?.length - 1]?.balance && type === "Withdrawal") {
      balanceNumber -= Number(amount)
    }
    else if (expenses[expenses?.length - 1]?.balance && type === "Deposit") {
      balanceNumber = Number(expenses[expenses?.length - 1]?.balance) + Number(amount);
    }
    else if (expenses[expenses?.length - 1]?.balance && type === "Withdrawal") {
      balanceNumber = Number(expenses[expenses?.length - 1]?.balance) - Number(amount);
    }

    balanceNumber = parseFloat(balanceNumber.toFixed(2));

    let balance = balanceNumber.toString();

    const response = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, note, type, balance }),
    });

    const data = await response.json();
    console.log(data);
    if (response.ok) {
      setShowSuccessMessage("Expense Added Successfully...!");
      // sendNotification(`Expense Added For ${formTitle}`);
      fetchExpenses();
      setAmount("");
      setNote("");
      setType("Withdrawal");
      setLoading(false);
      setTimeout(() => {
        setShowSuccessMessage("");
      }, 2000);
    } else {
      alert(`Error: ${data.error}`);
      setLoading(false);
    }
    setLoading(false);
  }

  async function deleteExpense(expenseIdToDelete: string) {
    setLoading(true);
    const response = await fetch(`${apiPath}?id=${expenseIdToDelete}`, {
      method: "DELETE",
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      setShowSuccessMessage("Expense Deleted Successfully...!");
      fetchExpenses();
      setLoading(false);
      setTimeout(() => {
        setShowSuccessMessage("");
      }, 2000);
    } else {
      alert(`Error: ${data.error}`);
      setLoading(false);
    }
  }

  //notification

  // useEffect(() => {



  //   const fetchToken = async () => {
  //     const token = await requestFCMToken();
  //     if (token) {
  //       localStorage.setItem("fcm_token", token); // Save FCM token locally
  //       // setFcmToken(token);
  //     }
  //   };
  //   fetchToken();


  //   if (typeof window !== "undefined" && "Notification" in window) {
  //     import("firebase/messaging").then(({ onMessage }) => {
  //       if (messaging) {
  //         onMessage(messaging, (payload: any) => {
  //           console.log("📩 Foreground notification received:", payload);
  //           new Notification(payload.notification.title, {
  //             body: payload.notification.body,
  //             icon: "/assets/notification.png",
  //           });
  //         });
  //       }
  //     });
  //   }

  // }, []);

  // const sendNotification = async (message:String) => {
  //   alert("send fn called ====>")
  //   const fcmToken = localStorage.getItem("fcm_token");
  //   alert(JSON.stringify(fcmToken))

  //   if (!fcmToken) {
  //     alert("FCM token not found! Please enable notifications.");
  //     return;
  //   }

  //   const response = await fetch("/api/sendNotification", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       fcmToken: fcmToken,
  //       title: "IBU Expense Tracker Alert!",
  //       body: message,
  //     }),
  //   });

  //   const data = await response.json();
  //   console.log("Notification Response:", data);
  // };

  return (
    <div className="bg-[#e8e8fd]">
      <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <GoBack />
        <span className='text-white z-[2000]'>{formTitle}</span>
        <div className='h-[50px] w-[50px] bg-white rounded-full flex items-center justify-center mb-3 z-[2000]'>
          <IoMdNotifications className='text-[24px]' />
        </div>
      </div>
      <div className="min-h-screen p-4 pb-[150px]">
        <div className="flex items-center justify-center mb-4 flex-col">
          <input
            type="number"
            placeholder="Amount"
            className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]" value={amount}
            onChange={(e) => setAmount(e.target.value)} />
          <input
            type="text"
            placeholder="Enter Description"
            className="input mb-2 border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] placeholder:text-[12px]" value={note}
            onChange={(e) => setNote(e.target.value)} />
          <select className="select border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
            value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Deposit">Deposit</option>
          </select>
          <button onClick={addExpense} className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full">
            Add Transaction
          </button>
          {/* <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
          <legend className="fieldset-legend">{formTitle}</legend>

          <label className="fieldset-label">Amount</label>
          <input type="number" className="input" placeholder="Enter Amount" value={amount}
            onChange={(e) => setAmount(e.target.value)} />

          <label className="fieldset-label">Note</label>
          <input type="text" className="input" placeholder="Enter Description" value={note}
            onChange={(e) => setNote(e.target.value)} />

          <label className="fieldset-label">Type</label>
          <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Withdrawal">Withdrawal</option>
            <option value="Deposit">Deposit</option>
          </select>
          <button onClick={addExpense} className="btn btn-outline my-[16px]">
            Add Transaction
          </button>
        </fieldset> */}

          {showSuccessMessage && (
            <div className="flex items-center justify-center w-full">
              <div role="alert" className="alert alert-success alert-soft mb-4 text-center w-full">
                <span className="text-white text-[14px]">{showSuccessMessage}</span>
              </div>
            </div>
          )
          }
        </div>
        {loading ? <div className="flex flex-col gap-2 justify-center items-center">
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
          <div className="skeleton h-4 w-[100%] bg-[#a5a5fe]"></div>
        </div> : expenses?.length > 0 ?
          <>
            <table className="table table-xs mb-4">
              <tbody>
                <tr>
                  <th className="text-[8px] text-[#000000d3] border-solid border-[1px] border-[#c6c6fc]">Total Expense : {totalExpense}</th>
                  <th className="text-[8px] text-[#000000] border-solid border-[1px] border-[#c6c6fc]">Total Deposit : {totalDeposit}</th>
                  <th className="text-[8px] text-[#000000] border-solid border-[1px] border-[#c6c6fc]">Closing Balance : {closingBalance}</th>
                </tr>
              </tbody>
            </table>
            <div className="overflow-x-auto">
              <table className="table table-xs bg-[#f2f2fe] rounded-none text-[#000000d3]">
                <thead>
                  <tr className="text-[8px] text-[#000000d3] font-poppinsBold border-solid border-[1px] border-[#dadafc]">
                    <th className="w-[40px] px-3">Amount</th>
                    <th>Note</th>
                    <th>Type</th>
                    <th className="w-[100px]">Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(((expense, key) => (
                      <tr key={key} className="border-solid border-[1px] border-[#dadafc]">
                        <th className="text-[8px] px-3">{expense.amount}</th>
                        <td className="text-[8px]">{expense.note}</td>
                        <td className="text-[8px]">{expense.type}</td>
                        <td className="text-[8px]">{moment(expense.created_at).format('MMMM Do YYYY')}</td>
                        <td className="px-3">
                          <FaTrashAlt className="cursor-pointer text-red-400 text-[10px]" onClick={() => {
                            deleteExpense(expense.id.toString());
                          }} />
                        </td>
                      </tr>
                    )))}

                </tbody>
              </table>
            </div>
          </>
          :
          <div className="flex items-center justify-center mt-16 text-gray-400 flex-col">
            <img src="/assets/empty.png" className="h-[70px] mb-4" />
            <span className="text-center">No Expenses Found...!</span>
          </div>
        }
      </div>
    </div>

  );
}