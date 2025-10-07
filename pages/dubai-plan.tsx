import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { IoChevronBack } from 'react-icons/io5';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dynamic from 'next/dynamic';

type IncomeItem = {
  id: string;
  source: string;
  amount: number;
  date: string; // ISO date string
};

type ExpenseItem = {
  id: string;
  category: string;
  amount: number;
};

type DeductionItem = {
  id: string;
  title: string;
  amount: number;
};

const TARGET_AMOUNT = 100000; // ₹
const HOURLY_RATE = 360; // ₹/hr
const STORAGE_KEY = 'dubaiPlanData';

const CURRENCY = (v: number) => `₹${v.toLocaleString('en-IN')}`;

const BRAND_COLORS = {
  primary: '#514CFF', // aligns with project primary
  earned: '#514CFF',
  remaining: '#D1D5DB',
  expenses: [
    '#6366F1',
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#14B8A6',
  ],
};

const defaultExpenses: ExpenseItem[] = [
  { id: 'travel', category: 'Travel', amount: 0 },
  { id: 'rent', category: 'Rent', amount: 0 },
  { id: 'food', category: 'Food', amount: 0 },
  { id: 'transport', category: 'Transport', amount: 0 },
  { id: 'visa', category: 'Visa', amount: 0 },
  { id: 'misc', category: 'Misc', amount: 0 },
];

const DubaiPlan: React.FC = () => {
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(defaultExpenses);
  const [userId, setUserId] = useState<string>('');
  const [monthsPlan, setMonthsPlan] = useState<number>(4);
  const [deductions, setDeductions] = useState<DeductionItem[]>([]);

  // Add Income modal state
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState<{ id?: string; source: string; amount: string; date: string }>(
    { source: '', amount: '', date: new Date().toISOString().slice(0, 10) }
  );
  const [editingIncomeId, setEditingIncomeId] = useState<string | null>(null);

  // Resolve user identity (same logic as Home) and load from backend, fallback to localStorage
  useEffect(() => {
    const init = async () => {
      let user = '';
      try {
        const cachedUser = localStorage.getItem('userIdentity');
        if (cachedUser) user = cachedUser;
        else {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          user = timezone.includes('Asia/Dubai') ? 'Dilshad' : 'Shifa Dilshad';
          localStorage.setItem('userIdentity', user);
        }
      } catch {}
      setUserId(user);
      // months plan
      try {
        const m = Number(localStorage.getItem('dubaiPlanMonths') || '4');
        if (m && !Number.isNaN(m)) setMonthsPlan(m);
      } catch {}

      // Load from backend
      try {
        const [incRes, expRes] = await Promise.all([
          fetch(`/api/dubaiplan/incomes?user=${encodeURIComponent(user)}`),
          fetch(`/api/dubaiplan/expenses?user=${encodeURIComponent(user)}`),
        ]);
        if (incRes.ok) {
          const data = await incRes.json();
          setIncomes(Array.isArray(data) ? data.map((d: any) => ({ id: d.id, source: d.source, amount: Number(d.amount) || 0, date: d.date })) : []);
        }
        // Load monthly deductions
        try {
          const dedRes = await fetch(`/api/dubaiplan/deductions?user=${encodeURIComponent(user)}`);
          if (dedRes.ok) {
            const list = await dedRes.json();
            setDeductions(Array.isArray(list) ? list.map((d: any) => ({ id: d.id, title: d.title, amount: Number(d.amount) || 0 })) : []);
          }
        } catch {}
        if (expRes.ok) {
          const data = await expRes.json();
          setExpenses(Array.isArray(data) ? data.map((d: any) => ({ id: d.id, category: d.category, amount: Number(d.amount) || 0 })) : defaultExpenses);
        }
      } catch {
        // Fallback to localStorage cache
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as any;
            if (Array.isArray(parsed.incomes)) setIncomes(parsed.incomes);
            if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
            if (Array.isArray(parsed.deductions)) setDeductions(parsed.deductions);
          }
        } catch {}
      }
    };
    init();
  }, []);

  // Cache to localStorage on change (also include deductions when present)
  useEffect(() => {
    const payload: any = { incomes, expenses, deductions };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
  }, [incomes, expenses, deductions]);

  // Computations
  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + (Number(i.amount) || 0), 0), [incomes]);
  const totalHours = useMemo(() => totalIncome / HOURLY_RATE, [totalIncome]);
  const remainingTarget = useMemo(() => Math.max(0, TARGET_AMOUNT - totalIncome), [totalIncome]);
  const remainingHours = useMemo(() => Math.ceil(remainingTarget / HOURLY_RATE), [remainingTarget]);
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0), [expenses]);
  const progressPct = useMemo(() => Math.min(100, Math.round((totalIncome / TARGET_AMOUNT) * 100)), [totalIncome]);

  // Monthly computations
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthlyIncome = useMemo(
    () => incomes.reduce((s, i) => {
      const d = new Date(i.date);
      if (d >= monthStart && d <= monthEnd) return s + (Number(i.amount) || 0);
      return s;
    }, 0),
    [incomes, monthStart.getTime(), monthEnd.getTime()]
  );
  const monthlyHours = useMemo(() => monthlyIncome / HOURLY_RATE, [monthlyIncome]);
  // Treat deductions as overall one-time amounts (not monthly)
  const overallDeductionsTotal = useMemo(() => deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0), [deductions]);
  const monthlyNetIncome = useMemo(() => Math.max(0, monthlyIncome), [monthlyIncome]);
  const monthlyTargetAmount = useMemo(() => TARGET_AMOUNT / Math.max(1, monthsPlan), [monthsPlan]);
  // Monthly need is based only on monthly target vs income; overall deductions impact total target, not monthly
  const baseMonthlyRemainingAmount = useMemo(() => Math.max(0, monthlyTargetAmount - monthlyIncome), [monthlyTargetAmount, monthlyIncome]);
  const monthlyRemainingAmount = useMemo(() => baseMonthlyRemainingAmount, [baseMonthlyRemainingAmount]);
  const baseMonthlyRemainingHours = useMemo(() => Math.ceil(baseMonthlyRemainingAmount / HOURLY_RATE), [baseMonthlyRemainingAmount]);
  const monthlyRemainingHours = useMemo(() => baseMonthlyRemainingHours, [baseMonthlyRemainingHours]);
  const monthlyProgressPct = useMemo(() => Math.min(100, Math.round((monthlyIncome / monthlyTargetAmount) * 100)), [monthlyIncome, monthlyTargetAmount]);
  const remainingDaysInMonth = useMemo(() => Math.max(0, Math.ceil((monthEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))), [monthEnd.getTime(), now.getTime()]);
  const requiredDailyHours = useMemo(() => (remainingDaysInMonth > 0 ? (monthlyRemainingHours / remainingDaysInMonth) : monthlyRemainingHours), [monthlyRemainingHours, remainingDaysInMonth]);

  // Deadlines/Payday helpers
  const msPerDay = 1000 * 60 * 60 * 24;
  // Fixed deadlines in January 2026
  const jan11 = useMemo(() => new Date(2026, 0, 11), []);
  const jan23 = useMemo(() => new Date(2026, 0, 23), []);
  const daysUntilJan11 = useMemo(() => Math.max(0, Math.ceil((jan11.getTime() - now.getTime()) / msPerDay)), [jan11, now.getTime()]);
  const daysUntilJan23 = useMemo(() => Math.max(0, Math.ceil((jan23.getTime() - now.getTime()) / msPerDay)), [jan23, now.getTime()]);
  const totalRemainingHours = useMemo(() => Math.ceil(remainingTarget / HOURLY_RATE), [remainingTarget]);
  // Show total needed including overall deductions as a breakdown
  const totalNeededWithDeductions = useMemo(() => Math.max(0, remainingTarget + overallDeductionsTotal), [remainingTarget, overallDeductionsTotal]);
  const dailyHoursToJan11 = useMemo(() => (daysUntilJan11 > 0 ? (totalRemainingHours / daysUntilJan11) : totalRemainingHours), [totalRemainingHours, daysUntilJan11]);
  const dailyHoursToJan23 = useMemo(() => (daysUntilJan23 > 0 ? (totalRemainingHours / daysUntilJan23) : totalRemainingHours), [totalRemainingHours, daysUntilJan23]);

  // Handlers: Income
  const resetIncomeForm = () => {
    setIncomeForm({ source: '', amount: '', date: new Date().toISOString().slice(0, 10) });
    setEditingIncomeId(null);
  };

  const openAddIncome = () => {
    resetIncomeForm();
    setShowIncomeModal(true);
  };

  const openEditIncome = (id: string) => {
    const item = incomes.find((x) => x.id === id);
    if (!item) return;
    // Prefill hours instead of amount
    setIncomeForm({ id, source: item.source, amount: String((item.amount || 0) / HOURLY_RATE), date: item.date.slice(0, 10) });
    setEditingIncomeId(id);
    setShowIncomeModal(true);
  };

  const saveIncome = async () => {
    const hrs = Number(incomeForm.amount);
    if (!incomeForm.source.trim() || !hrs || !incomeForm.date) return;
    const amt = hrs * HOURLY_RATE;
    if (editingIncomeId) {
      try {
        const res = await fetch('/api/dubaiplan/incomes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingIncomeId, source: incomeForm.source.trim(), amount: amt, date: incomeForm.date }),
        });
        if (res.ok) {
          const updated = await res.json();
          setIncomes((prev) => prev.map((x) => (x.id === updated.id ? { id: updated.id, source: updated.source, amount: Number(updated.amount) || 0, date: updated.date } : x)));
        }
      } catch {}
    } else {
      try {
        const res = await fetch('/api/dubaiplan/incomes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: userId, source: incomeForm.source.trim(), amount: amt, date: incomeForm.date }),
        });
        if (res.ok) {
          const inserted = await res.json();
          const newItem: IncomeItem = { id: inserted.id, source: inserted.source, amount: Number(inserted.amount) || 0, date: inserted.date };
          setIncomes((prev) => [newItem, ...prev]);
        }
      } catch {}
    }
    setShowIncomeModal(false);
    resetIncomeForm();
  };

  const deleteIncome = async (id: string) => {
    try {
      const res = await fetch(`/api/dubaiplan/incomes?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) setIncomes((prev) => prev.filter((x) => x.id !== id));
    } catch {}
  };

  // Handlers: Expense (persist via Save button)
  const updateExpenseAmount = (id: string, value: string) => {
    const amt = Number(value);
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, amount: isNaN(amt) ? 0 : amt } : e)));
  };

  const addCategory = async () => {
    const name = prompt('Enter new category name');
    if (!name || !userId) return;
    try {
      const res = await fetch('/api/dubaiplan/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userId, category: name.trim(), amount: 0 }),
      });
      if (res.ok) {
        const row = await res.json();
        setExpenses((prev) => [...prev, { id: row.id, category: row.category, amount: Number(row.amount) || 0 }]);
      }
    } catch {}
  };

  const updateExpenseCategory = (id: string, value: string) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, category: value } : e)));
  };

  // Chart data
  const earnedVsRemaining = useMemo(
    () => [
      { name: 'Earned', value: totalIncome },
      { name: 'Remaining', value: Math.max(0, TARGET_AMOUNT - totalIncome) },
    ],
    [totalIncome]
  );

  const expenseBreakdown = useMemo(() => expenses.map((e) => ({ name: e.category, value: Number(e.amount) || 0 })), [expenses]);

  return (
    <div className="min-h-screen bg-base-100 dark:bg-base-400 p-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Header Summary Card */}
        <div className="md:col-span-2 bg-white dark:bg-base-200 rounded-2xl shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="btn btn-ghost btn-sm rounded-xl px-2">
                <IoChevronBack className="text-base-content text-lg" />
              </Link>
              <div>
                <h1 className="text-xl font-poppinsBold text-base-content">Dubai Plan</h1>
                <p className="text-sm text-base-content/70">Target: {CURRENCY(TARGET_AMOUNT)} • Rate: {CURRENCY(HOURLY_RATE)}/hr</p>
              </div>
            </div>
            <button
              onClick={openAddIncome}
              className="bg-primary text-white px-4 py-2 rounded-xl font-poppinsMed hover:opacity-95 active:opacity-90"
            >
              + Add Hours
            </button>
          </div>
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="w-full h-3 bg-base-200 rounded-full overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${progressPct}%`, backgroundColor: BRAND_COLORS.primary }}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Total Earned</div>
                <div className="font-poppinsBold">{CURRENCY(totalIncome)}</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Total Hours Worked</div>
                <div className="font-poppinsBold">{Math.floor(totalHours)} hrs</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Remaining Hours</div>
                <div className="font-poppinsBold">{remainingHours} hrs</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Remaining Target</div>
                <div className="font-poppinsBold">{CURRENCY(remainingTarget)}</div>
                {overallDeductionsTotal > 0 && (
                  <div className="text-[11px] text-base-content/70 mt-1">
                    + Deductions (overall): <span className="text-base-content">{CURRENCY(overallDeductionsTotal)}</span>
                    <div className="mt-0.5">Total Needed: <span className="font-poppinsBold text-base-content">{CURRENCY(totalNeededWithDeductions)}</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Monthly Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-poppinsBold text-base-content">This Month</h3>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base-content/60">Plan:</span>
                <select
                  className="select select-bordered select-xs rounded-lg"
                  value={monthsPlan}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMonthsPlan(v);
                    try { localStorage.setItem('dubaiPlanMonths', String(v)); } catch {}
                  }}
                >
                  <option value={4}>4 months</option>
                  <option value={6}>6 months</option>
                  <option value={9}>9 months</option>
                  <option value={12}>12 months</option>
                </select>
              </div>
            </div>

            <div className="w-full h-2 bg-base-200 rounded-full overflow-hidden mt-2">
              <div className="h-full" style={{ width: `${monthlyProgressPct}%`, backgroundColor: BRAND_COLORS.primary }} />
            </div>

            <div className="mt-2 grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Month Earned</div>
                <div className="font-poppinsBold">{CURRENCY(monthlyIncome)}</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Month Hours</div>
                <div className="font-poppinsBold">{Math.floor(monthlyHours)} hrs</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Monthly Target</div>
                <div className="font-poppinsBold">{CURRENCY(Math.round(monthlyTargetAmount))}</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Hours Left This Month</div>
                <div className="font-poppinsBold">{monthlyRemainingHours} hrs</div>
                <div className="text-[11px] text-base-content/60">deductions are overall, not monthly</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Daily Hours (to Month End)</div>
                <div className="font-poppinsBold">{requiredDailyHours.toFixed(1)} h/day</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Deductions (Overall)</div>
                <div className="font-poppinsBold">{CURRENCY(overallDeductionsTotal)}</div>
              </div>
            </div>
            {/* Monthly need (₹) - base only, since deductions are overall */}
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Monthly Need (₹)</div>
                <div className="font-poppinsBold">{CURRENCY(baseMonthlyRemainingAmount)}</div>
                <div className="text-[11px] text-base-content/60">base only (deductions are overall)</div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Month Net Income</div>
                <div className="font-poppinsBold">{CURRENCY(monthlyIncome)}</div>
              </div>
            </div>
          </div>

          {/* Deadlines */}
          <div className="mt-6">
            <h3 className="text-base font-poppinsBold text-base-content mb-2">Deadlines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Until Jan 11, 2026</div>
                <div className="font-poppinsBold">{daysUntilJan11} days • {dailyHoursToJan11.toFixed(1)} h/day</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Until Jan 23, 2026 (Shifting)</div>
                <div className="font-poppinsBold">{daysUntilJan23} days • {dailyHoursToJan23.toFixed(1)} h/day</div>
              </div>
              <div className="bg-base-100 dark:bg-base-300 rounded-xl p-3">
                <div className="text-base-content/60">Total Remaining</div>
                <div className="font-poppinsBold">{CURRENCY(remainingTarget)} • {totalRemainingHours} hrs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Income Tracker */}
        <div className="bg-white dark:bg-base-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-poppinsBold text-base-content">Income Tracker</h2>
            <button
              onClick={openAddIncome}
              className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-poppinsMed hover:opacity-95"
            >
              + Add Hours
            </button>
          </div>
          <div className="overflow-auto -mx-2 md:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-base-content/60">
                  <th className="px-2 py-2">Source</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Date</th>
                  <th className="px-2 py-2">Hours</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {incomes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2 py-6 text-center text-base-content/50">No income added yet</td>
                  </tr>
                )}
                {incomes.map((inc) => {
                  const hours = inc.amount / HOURLY_RATE;
                  return (
                    <tr key={inc.id} className="border-t border-base-200/60">
                      <td className="px-2 py-2">{inc.source}</td>
                      <td className="px-2 py-2">{CURRENCY(inc.amount)}</td>
                      <td className="px-2 py-2">{new Date(inc.date).toLocaleDateString()}</td>
                      <td className="px-2 py-2">{hours.toFixed(2)}</td>
                      <td className="px-2 py-2 space-x-2">
                        <button
                          onClick={() => openEditIncome(inc.id)}
                          className="text-primary font-poppinsMed hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteIncome(inc.id)}
                          className="text-error font-poppinsMed hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>



        {/* Overall Deductions */}
        <div className="bg-white dark:bg-base-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-poppinsBold text-base-content">Overall Deductions</h2>
            <button
              onClick={async () => {
                const title = prompt('Deduction title (e.g., Visa, Shifting, etc.)');
                if (!title || !userId) return;
                const amtStr = prompt('Amount (₹)') || '0';
                const amt = Number(amtStr) || 0;
                try {
                  const res = await fetch('/api/dubaiplan/deductions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user: userId, title: title.trim(), amount: amt })
                  });
                  if (res.ok) {
                    const row = await res.json();
                    setDeductions((prev) => [...prev, { id: row.id, title: row.title, amount: Number(row.amount) || 0 }]);
                  }
                } catch {}
              }}
              className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-poppinsMed hover:opacity-95"
            >
              + Add Overall Deduction
            </button>
          </div>
          <div className="overflow-auto -mx-2 md:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-base-content/60">
                  <th className="px-2 py-2">Title</th>
                  <th className="px-2 py-2">Amount</th>
                  <th className="px-2 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {deductions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-2 py-6 text-center text-base-content/50">No overall deductions</td>
                  </tr>
                )}
                {deductions.map((d) => (
                  <tr key={d.id} className="border-t border-base-200/60">
                    <td className="px-2 py-2">
                      <input
                        className="input input-sm input-bordered rounded-xl w-48"
                        value={d.title}
                        onChange={async (e) => {
                          const title = e.target.value;
                          setDeductions((prev) => prev.map((x) => (x.id === d.id ? { ...x, title } : x)));
                          try { await fetch('/api/dubaiplan/deductions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: d.id, title }) }); } catch {}
                        }}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="input input-sm input-bordered rounded-xl w-40"
                        value={d.amount}
                        onChange={async (e) => {
                          const amount = Number(e.target.value) || 0;
                          setDeductions((prev) => prev.map((x) => (x.id === d.id ? { ...x, amount } : x)));
                          try { await fetch('/api/dubaiplan/deductions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: d.id, amount }) }); } catch {}
                        }}
                        min={0}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/dubaiplan/deductions?id=${encodeURIComponent(d.id)}`, { method: 'DELETE' });
                            if (res.ok) setDeductions((prev) => prev.filter((x) => x.id !== d.id));
                          } catch {}
                        }}
                        className="text-error font-poppinsMed hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white dark:bg-base-200 rounded-2xl shadow-sm p-4">
          <h2 className="font-poppinsBold text-base-content mb-3">Progress</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={earnedVsRemaining} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {earnedVsRemaining.map((entry, index) => (
                    <Cell key={`cell-evr-${index}`} fill={index === 0 ? BRAND_COLORS.earned : BRAND_COLORS.remaining} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => CURRENCY(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        {/* Expense Tracker */}
        {/* <div className="bg-white dark:bg-base-200 rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-poppinsBold text-base-content">Expense Tracker</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  try {
                    await Promise.all(
                      expenses.map((e) =>
                        fetch('/api/dubaiplan/expenses', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: e.id, category: e.category, amount: e.amount })
                        })
                      )
                    );
                  } catch {}
                }}
                className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-poppinsMed hover:opacity-95"
              >
                Save
              </button>
              <button onClick={addCategory} className="bg-primary text-white px-3 py-2 rounded-xl text-sm font-poppinsMed hover:opacity-95">+ Add Category</button>
            </div>
          </div>
          <div className="overflow-auto -mx-2 md:mx-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-base-content/60">
                  <th className="px-2 py-2">Category</th>
                  <th className="px-2 py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id} className="border-t border-base-200/60">
                    <td className="px-2 py-2">
                      <input
                        className="input input-sm input-bordered rounded-xl w-48"
                        value={exp.category}
                        onChange={(e) => updateExpenseCategory(exp.id, e.target.value)}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        className="input input-sm input-bordered rounded-xl w-40"
                        value={exp.amount}
                        onChange={(e) => updateExpenseAmount(exp.id, e.target.value)}
                        min={0}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div> 

        <div className="bg-white dark:bg-base-200 rounded-2xl shadow-sm p-4">
          <h2 className="font-poppinsBold text-base-content mb-3">Expenses Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" outerRadius={80}>
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-exp-${index}`} fill={BRAND_COLORS.expenses[index % BRAND_COLORS.expenses.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => CURRENCY(Number(v))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-right text-sm text-base-content/60 mt-2">Total Expenses: <span className="font-poppinsBold text-base-content">{CURRENCY(totalExpenses)}</span></div>
        </div> */}
      </div>

      {/* Add/Edit Hours Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[3000]" onClick={() => setShowIncomeModal(false)}>
          <div className="bg-white dark:bg-base-200 rounded-2xl shadow-xl p-4 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-poppinsBold text-base-content mb-4">{editingIncomeId ? 'Edit Hours' : 'Add Hours'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 text-base-content/70">Source</label>
                <input
                  className="input input-bordered rounded-xl w-full"
                  placeholder="e.g., Freelance Project"
                  value={incomeForm.source}
                  onChange={(e) => setIncomeForm((s) => ({ ...s, source: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1 text-base-content/70">Hours</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="input input-bordered rounded-xl w-full"
                    placeholder="hrs"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm((s) => ({ ...s, amount: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-base-content/70">Date</label>
                  <input
                    type="date"
                    className="input input-bordered rounded-xl w-full"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm((s) => ({ ...s, date: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => { setShowIncomeModal(false); resetIncomeForm(); }} className="btn btn-ghost rounded-xl">Cancel</button>
              <button onClick={saveIncome} className="bg-primary text-white px-4 py-2 rounded-xl font-poppinsMed">
                {editingIncomeId ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(DubaiPlan), { ssr: false });
