'use client'
import moment from "moment";
import { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
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
    <div className="min-h-screen bg-base-200 p-4 mb-[100px]">
      <div className="flex items-center justify-center mb-8 flex-col">
        <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-4 rounded-box">
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
        </fieldset>

        {showSuccessMessage && (
          <div className="flex items-center justify-center">
            <div role="alert" className="alert alert-success alert-soft mb-4 text-center">
              <span>{showSuccessMessage}</span>
            </div>
          </div>
        )
        }
      </div>
      {loading ? <div className="flex flex-col gap-2 justify-center items-center">
        <div className="skeleton h-4 w-[80%]"></div>
        <div className="skeleton h-4 w-[80%]"></div>
        <div className="skeleton h-4 w-[80%]"></div>
        <div className="skeleton h-4 w-[80%]"></div>
      </div> : expenses?.length > 0 ?
        <>
          <table className="table table-xs mb-8">
            <tbody>
              <tr>
                <th className="text-[8px] border-amber-50 border-[1px] border-solid">Total Expense : {totalExpense}</th>
                <th className="text-[8px] border-amber-50 border-[1px] border-solid">Total Deposit : {totalDeposit}</th>
                <th className="text-[8px] border-amber-50 border-[1px] border-solid">Closing Balance : {closingBalance}</th>
              </tr>
            </tbody>
          </table>
          <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
            <table className="table table-xs">
              <thead>
                <tr className="text-[8px]">
                  <th className="w-[40px]">Amount</th>
                  <th>Note</th>
                  <th>Type</th>
                  <th className="w-[100px]">Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice() // create a shallow copy to avoid mutating the original array
                  .reverse().map(((expense, key) => (
                    <tr className="text-[8px]" key={key}>
                      <th>{expense.amount}</th>
                      <td>{expense.note}</td>
                      <td>{expense.type}</td>
                      <td>{moment(expense.created_at).format('MMMM Do YYYY')}</td>
                      <td>
                        <FaTrashAlt className="cursor-pointer text-red-400" onClick={() => {
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
  );
}