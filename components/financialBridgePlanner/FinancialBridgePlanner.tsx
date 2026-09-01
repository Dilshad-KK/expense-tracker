"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Settings2, X } from "lucide-react";

type Key = "sep" | "oct" | "nov" | "dec" | "jan" | "feb";
type Status = "CONFIRMED" | "ESTIMATE" | "POTENTIAL" | "UNRESOLVED" | "EXPECTED";
type TabbyKey = Exclude<Key, "sep">;

type State = {
  cash: number;
  sep: { food: number; transport: number; mobile: number; tabby: number; carry: number };
  oct: { salary: number; hari: number; accommodation: number; india: number; food: number; taxi: number; misc: number; flight: number; returnFood: number; returnTransport: number };
  monthly: { salary: number; side: number; normal: number; iphone: number; iphoneCount: number; febExtra: number };
  tabby: Record<TabbyKey, { forecast: number; min: number; max: number; actual: string }>;
  sideReceived: Record<"nov" | "dec" | "jan" | "feb", boolean>;
  legacy: "unresolved" | "included" | "separate";
  kuri: { received: boolean; month: TabbyKey; aed: string; inr: string };
  surprise: { enabled: boolean; month: Key; amount: string; note: string };
};
type Row = { id: string; label: string; amount: number; type: "in" | "out"; status: Status; note: string; source: string; forecast?: number; actual?: number; history?: string };
type Plan = { key: Key; label: string; short: string; opening: number; income: number; expenses: number; base: number; result: number; bridge: number; close: number; kuriApplied: number; rows: Row[] };

const STORAGE = "financial-bridge-planner-v2";
const MONTHS: Array<{ key: Key; short: string; label: string }> = [
  { key: "sep", short: "SEP", label: "September 2026" }, { key: "oct", short: "OCT", label: "October 2026" },
  { key: "nov", short: "NOV", label: "November 2026" }, { key: "dec", short: "DEC", label: "December 2026" },
  { key: "jan", short: "JAN", label: "January 2027" }, { key: "feb", short: "FEB", label: "February 2027" },
];
const DEFAULT: State = {
  cash: 2100,
  sep: { food: 800, transport: 360, mobile: 50, tabby: 519.62, carry: 0 },
  oct: { salary: 6600, hari: 2565, accommodation: 900, india: 1000, food: 500, taxi: 100, misc: 50, flight: 700, returnFood: 300, returnTransport: 100 },
  monthly: { salary: 4800, side: 500, normal: 3200, iphone: 626.61, iphoneCount: 4, febExtra: 1500 },
  tabby: {
    oct: { forecast: 2700, min: 2500, max: 2900, actual: "" }, nov: { forecast: 2100, min: 2100, max: 2100, actual: "" },
    dec: { forecast: 1700, min: 1700, max: 1700, actual: "" }, jan: { forecast: 650, min: 500, max: 800, actual: "" }, feb: { forecast: 100, min: 0, max: 200, actual: "" },
  },
  sideReceived: { nov: true, dec: true, jan: true, feb: true }, legacy: "unresolved",
  kuri: { received: false, month: "oct", aed: "", inr: "100000" }, surprise: { enabled: false, month: "oct", amount: "", note: "" },
};

const num = (value: string | number | undefined) => { const result = Number(value ?? 0); return Number.isFinite(result) ? result : 0; };
const join = (...values: Array<string | false | undefined>) => values.filter(Boolean).join(" ");
function money(value: number, signed = false) {
  const sign = signed && value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}AED ${new Intl.NumberFormat("en-AE", { minimumFractionDigits: Math.abs(value % 1) ? 2 : 0, maximumFractionDigits: 2 }).format(Math.abs(value))}`;
}
function merge(saved: Partial<State>): State {
  return { ...DEFAULT, ...saved, sep: { ...DEFAULT.sep, ...saved.sep }, oct: { ...DEFAULT.oct, ...saved.oct }, monthly: { ...DEFAULT.monthly, ...saved.monthly }, tabby: { ...DEFAULT.tabby, ...saved.tabby }, sideReceived: { ...DEFAULT.sideReceived, ...saved.sideReceived }, kuri: { ...DEFAULT.kuri, ...saved.kuri }, surprise: { ...DEFAULT.surprise, ...saved.surprise } };
}
function tabby(state: State, key: TabbyKey) {
  const record = state.tabby[key];
  const actual = record.actual.trim() === "" ? undefined : num(record.actual);
  return { actual, amount: actual ?? record.forecast };
}

function plansFor(state: State): Plan[] {
  let opening = state.cash;
  let kuriReserve = state.kuri.received ? num(state.kuri.aed) : 0;
  const kuriIndex = state.kuri.received ? MONTHS.findIndex((month) => month.key === state.kuri.month) : Infinity;
  return MONTHS.map((month, index) => {
    const surprise = state.surprise.enabled && state.surprise.month === month.key ? num(state.surprise.amount) : 0;
    let rows: Row[] = [];
    let income = 0;
    let expenses = 0;
    if (month.key === "sep") {
      rows = [
        row("food", "Food", state.sep.food, "out", "CONFIRMED", "Required cash plan through Sep 28.", "September mess / main food"),
        row("transport", "Transport", state.sep.transport, "out", "CONFIRMED", "Cash base plan prevents normal spending being added to Tabby.", "AED 130 + AED 230 unpaid"),
        row("mobile", "Mobile", state.sep.mobile, "out", "CONFIRMED", "Required mobile recharge.", "September recharge"),
        row("tabby", "Tabby", state.sep.tabby, "out", "CONFIRMED", "AED 519.62 is not the remainder of the old AED 2,812.14 minimum.", "Current additional Tabby", undefined, undefined, state.legacy === "separate" ? "AED 705.36 legacy payment has been enabled separately." : "AED 705.36 legacy treatment is unresolved and is not double counted."),
      ];
      if (state.legacy === "separate") {
        rows.push(row("legacy", "Legacy Tabby installment", 705.36, "out", "UNRESOLVED", "Separate payment is enabled pending Tabby support confirmation.", "Legacy scheduled installments"));
      }
      expenses = sum(rows);
    } else if (month.key === "oct") {
      const payment = tabby(state, "oct"); income = state.oct.salary;
      rows = [
        row("hari", "Hari repayment", state.oct.hari, "out", "CONFIRMED", "Required. Hari card is not treated as cash.", "Due Sep 28"),
        row("accommodation", "Accommodation", state.oct.accommodation, "out", "CONFIRMED", "May require cash or transfer.", "Pre-India temporary accommodation"),
        row("india", "India purchases", state.oct.india, "out", "CONFIRMED", "India daily spending is outside this UAE bridge plan.", "Fixed travel items"),
        row("food", "Pre-flight food", state.oct.food, "out", "CONFIRMED", "Core pre-travel food expense.", "Food for two"),
        row("taxi", "Airport taxi", state.oct.taxi, "out", "CONFIRMED", "Airport transfer.", "Oct 6 travel"),
        row("misc", "Small top-ups", state.oct.misc, "out", "CONFIRMED", "Necessary top-ups only.", "Pre-travel reserve"),
        row("tabby", "Tabby minimum", payment.amount, "out", payment.actual === undefined ? "ESTIMATE" : "CONFIRMED", "Only the legitimate fee-free minimum is planned.", "Statement around Oct 3; due Oct 13", state.tabby.oct.forecast, payment.actual, "The minimum-payment mechanism defers eligible balance. The full statement is not treated as immediate cash due."),
        row("flight", "Return flight", state.oct.flight, "out", "CONFIRMED", "Core bridge expense.", "Return travel"),
        row("return-food", "Return food", state.oct.returnFood, "out", "ESTIMATE", "Four-day Sharjah return reserve.", "After return"),
        row("return-transport", "Return transport", state.oct.returnTransport, "out", "ESTIMATE", "Office and local travel reserve.", "After return"),
      ];
      expenses = sum(rows);
    } else {
      const key = month.key as TabbyKey; const payment = tabby(state, key);
      const side = state.sideReceived[key as "nov" | "dec" | "jan" | "feb"] ? state.monthly.side : 0;
      const iphone = ["nov", "dec", "jan", "feb"].indexOf(key) < state.monthly.iphoneCount ? state.monthly.iphone : 0;
      income = state.monthly.salary + side + (key === "feb" ? state.monthly.febExtra : 0);
      rows = [
        row("salary", "Guaranteed salary", state.monthly.salary, "in", "EXPECTED", "Base salary from Oct 28 onward.", "Expected on the 28th"),
        row("side", "Expected side hustle", side, "in", side ? "ESTIMATE" : "UNRESOLVED", side ? "AED 500 is expected, not guaranteed." : "Only guaranteed salary is included.", "Planning assumption"),
        row("normal", "Normal commitments", state.monthly.normal, "out", "ESTIMATE", "Rent, food, travel, mobile, India outgoing, and office kuri.", "Conservative monthly total"),
        row("tabby", "Tabby minimum", payment.amount, "out", payment.actual === undefined ? "ESTIMATE" : "CONFIRMED", "Actual statement overrides forecast. Pay only the fee-free requirement.", "Statement around the 3rd; due around the 13th", state.tabby[key].forecast, payment.actual, `Working range: ${money(state.tabby[key].min)}-${money(state.tabby[key].max)}.`),
        row("iphone", "iPhone installment", iphone, "out", iphone ? "EXPECTED" : "CONFIRMED", iphone ? "Funded from prior 28th salary under this plan." : "No installment scheduled here.", "Sharaf DG plan"),
        ...(key === "feb" ? [row("extra", "Feb 28 one-time extra", state.monthly.febExtra, "in", "EXPECTED", "Separate from normal salary: clear bridge, then build buffer.", "Expected Feb 28")] : []),
      ];
      expenses = state.monthly.normal + payment.amount + iphone;
    }
    if (surprise) { rows.push(row("surprise", state.surprise.note || "Unexpected expense", surprise, "out", "UNRESOLVED", "This shifts recovery timing immediately.", "Scenario control")); expenses += surprise; }
    const base = opening + income - expenses;
    const kuriApplied = index >= kuriIndex && base < 0 ? Math.min(-base, kuriReserve) : 0;
    kuriReserve -= kuriApplied;
    const result = base + kuriApplied; const close = Math.max(0, result);
    const plan: Plan = { key: month.key, short: month.short, label: month.label, opening, income, expenses, base, result, bridge: Math.max(0, -result), close, kuriApplied, rows };
    opening = month.key === "sep" ? state.sep.carry : close;
    return plan;
  });
}
function row(id: string, label: string, amount: number, type: "in" | "out", status: Status, note: string, source: string, forecast?: number, actual?: number, history?: string): Row { return { id, label, amount, type, status, note, source, forecast, actual, history }; }
function sum(rows: Row[]) { return rows.reduce((total, item) => total + (item.type === "out" ? item.amount : 0), 0); }

export default function FinancialBridgePlanner() {
  const [state, setState] = useState<State>(DEFAULT);
  const [loaded, setLoaded] = useState(false);
  const [monthOpen, setMonthOpen] = useState<Key | null>(null);
  const [rowOpen, setRowOpen] = useState<string | null>(null);
  const [tabbyOpen, setTabbyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(STORAGE); if (saved) setState(merge(JSON.parse(saved) as Partial<State>)); } catch {} setLoaded(true); }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch {} }, [loaded, state]);
  const plans = plansFor(state);
  const map = Object.fromEntries(plans.map((plan) => [plan.key, plan])) as Record<Key, Plan>;
  const nextTabby = tabby(state, "oct");
  const selected = monthOpen ? map[monthOpen] : null;
  const positive = plans.find((plan) => plan.base > 0)?.label ?? "Not yet projected";
  const updateActual = (key: TabbyKey, actual: string) => setState((previous) => ({ ...previous, tabby: { ...previous.tabby, [key]: { ...previous.tabby[key], actual } } }));
  return <main className="min-h-dvh bg-base-100 pb-10 font-poppins text-base-content"><div className="mx-auto w-full max-w-[1400px] px-4 py-5 lg:px-6">
    <header className="flex items-end justify-between border-b border-base-content/15 pb-4"><div><h1 className="text-xl font-poppinsBold tracking-[-0.03em]">Financial Bridge</h1><p className="mt-1 text-sm text-base-content/55">Sep 2026 - Feb 2027</p></div><button type="button" onClick={() => setSettingsOpen(!settingsOpen)} className="inline-flex items-center gap-2 border border-base-content/20 px-3 py-2 text-xs font-poppinsMed hover:bg-base-200"><Settings2 className="h-4 w-4" />Assumptions</button></header>
    <section className="grid grid-cols-2 divide-x divide-y divide-base-content/10 border-b border-base-content/15 text-sm lg:grid-cols-4 lg:divide-y-0"><Metric label="Available now" value={money(state.cash)} /><Metric label="Next income" value={`${money(state.oct.salary)} · Sep 28`} /><Metric label="Next Tabby" value={`~${money(nextTabby.amount)} · Oct 13`} note={nextTabby.actual === undefined ? "ESTIMATE" : "ACTUAL"} /><Metric label="Expected positive turn" value={positive.replace(" 2027", "")} /></section>
    <section className="mt-4 border border-base-content/15"><div className="flex items-center justify-between border-b border-base-content/15 px-3 py-2"><h2 className="text-xs font-poppinsMed text-base-content/55">Cash-flow timeline</h2><span className="text-[11px] text-base-content/45">Click a month for transactions · Click Tabby for its detail drawer</span></div><div className="bg-base-200/30 lg:bg-transparent"><div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-0 lg:p-0 lg:divide-x lg:divide-base-content/15">{plans.map((plan) => <MonthColumn key={plan.key} plan={plan} open={() => setMonthOpen(monthOpen === plan.key ? null : plan.key)} tabby={() => setTabbyOpen(true)} />)}</div></div><BridgeTrace plans={plans} /></section>
    <section className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]"><div className="border-l-2 border-base-content/30 bg-base-200/45 px-3 py-2 text-xs leading-5 text-base-content/70"><b className="font-poppinsMed text-base-content">Potential kuri: ₹1 lakh</b> · possible on a future 10th · 6 draws remaining · not included in base forecast.{state.kuri.received && <span className="ml-1 text-success">Receipt entered: it intercepts the bridge from {state.kuri.month.toUpperCase()}.</span>}</div><button type="button" onClick={() => setTabbyOpen(true)} className="border border-base-content/20 px-3 py-2 text-left text-xs font-poppinsMed hover:bg-base-200">Tabby mechanism & forecasts</button></section>
    {selected && <MonthDetail plan={selected} openRow={rowOpen} close={() => setMonthOpen(null)} toggle={(id) => setRowOpen(rowOpen === id ? null : id)} tabby={() => setTabbyOpen(true)} />}
    {tabbyOpen && <TabbyDrawer state={state} close={() => setTabbyOpen(false)} update={updateActual} />}
    {settingsOpen && <Settings state={state} change={setState} />}
  </div></main>;
}

function Metric({ label, value, note }: { label: string; value: string; note?: string }) { return <div className="min-w-0 px-3 py-3 first:pl-0 lg:px-4"><div className="text-[10px] font-poppinsMed text-base-content/45">{label}</div><div className="mt-1 truncate font-poppinsBold tabular-nums">{value}</div>{note && <div className="mt-0.5 text-[10px] font-poppinsMed text-warning">{note}</div>}</div>; }
function Flow({ label, amount, type, status }: { label: string; amount: number; type: "in" | "out" | "reference"; status: Status }) { return <div className="flex items-start justify-between gap-2 py-0.5 text-[11px] leading-4"><span className="min-w-0 text-base-content/68">{label}</span><span className={join("shrink-0 font-poppinsMed tabular-nums", type === "in" ? "text-success" : "text-base-content")}>{type === "in" && amount > 0 ? "+" : type === "out" && amount > 0 ? "-" : ""}{money(amount)}</span>{status === "ESTIMATE" && <span className="-ml-1 text-[8px] text-warning">EST</span>}</div>; }
function MonthColumn({ plan, open, tabby }: { plan: Plan; open: () => void; tabby: () => void }) {
  const gap = plan.base < 0; const positive = plan.base > 0;
  const inflows = plan.rows.filter((item) => item.type === "in"); const outflows = plan.rows.filter((item) => item.type === "out");
  const febExtra = plan.rows.find((item) => item.id === "extra")?.amount;
  return <article className="flex lg:min-h-[490px] flex-col rounded-xl border border-base-content/10 bg-base-100 p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-3 lg:py-3"><button type="button" onClick={open} className="flex items-start justify-between text-left"><div><div className="text-xs font-poppinsBold tracking-[0.03em]">{plan.short}</div><div className="mt-0.5 text-[10px] text-base-content/45">{plan.label.slice(0, -5)}</div></div><span className={join("mt-0.5 h-2 w-2 rounded-full", gap ? "bg-error" : positive ? "bg-success" : "bg-warning")} /></button><div className="mt-4"><Flow label={plan.key === "sep" ? "Available" : plan.opening ? "Opening cash" : "Opening after bridge"} amount={plan.opening} type="reference" status={plan.key === "sep" ? "CONFIRMED" : "ESTIMATE"} />{plan.key === "oct" && <Flow label="Sep 28 salary" amount={plan.income} type="in" status="EXPECTED" />}{plan.key !== "oct" && inflows.map((item) => <Flow key={item.id} label={item.label} amount={item.amount} type="in" status={item.status} />)}</div><div className="my-2 ml-1 h-3 border-l border-base-content/25" /><div className="space-y-1.5">{outflows.map((item) => <button key={item.id} type="button" onClick={item.id === "tabby" ? tabby : open} className="block w-full text-left hover:bg-base-200/70"><Flow label={item.label} amount={item.amount} type="out" status={item.status} /></button>)}</div><div className="mt-5 lg:mt-auto border-t border-base-content/15 pt-3"><div className="text-[10px] font-poppinsMed text-base-content/45">{plan.key === "sep" ? "Maximum remaining" : "Monthly result"}</div><div className={join("mt-1 text-base font-poppinsBold tabular-nums", gap ? "text-error" : positive ? "text-success" : "text-warning")}>{plan.key === "sep" ? money(plan.base) : `~${money(plan.base, true)}`}</div>{plan.key === "sep" && <div className="mt-1 text-[10px] text-base-content/45">Forecast carryover = AED 0</div>}</div>{plan.key === "oct" && <Fix plan={plan} />}{plan.key === "feb" && <div className="mt-3 border-l-2 border-success px-2 text-[11px] leading-5 text-base-content/65">Feb 28: <b className="font-poppinsMed text-success">+{money(febExtra || 0)}</b> expected one-time extra.</div>}{plan.key !== "oct" && plan.key !== "feb" && <div className="mt-3 text-[10px] text-base-content/40">{plan.key === "jan" ? "Clear bridge, then build buffer." : "Next month ↓"}</div>}</article>;
}
function Fix({ plan }: { plan: Plan }) { return <div className="mt-3 border-l-2 border-info bg-info/5 px-2 py-2 text-[10px] leading-4 text-base-content/72"><div className="font-poppinsBold text-info">{money(-Math.abs(plan.base), true)} TEMPORARY GAP</div><div className="mt-1.5 space-y-1"><div>Actual Tabby statement</div><div className="text-base-content/35">↓</div><div>Pay only legitimate fee-free minimum</div><div className="text-base-content/35">↓</div><div>Kuri received? <b>yes: reduce · no: bridge actual remainder</b></div><div className="text-base-content/35">↓</div><div>November pressure reduces</div></div></div>; }
function BridgeTrace({ plans }: { plans: Plan[] }) {
  const trace = plans.filter((plan) => plan.key !== "sep"); const values = trace.map((plan) => plan.base); const min = Math.min(...values, 0); const max = Math.max(...values, 0); const range = max - min || 1;
  const getY = (value: number) => 100 - ((value - min) / range) * 100;
  return <div className="border-t border-base-content/15 bg-base-100 px-4 py-4 lg:bg-transparent lg:px-3 lg:py-3"><div className="mb-4 text-[10px] font-poppinsMed text-base-content/45 lg:mb-1">Bridge trend · base forecast before potential kuri</div><div className="relative w-full px-6 lg:px-0"><div className="relative h-16 w-full lg:absolute lg:bottom-0 lg:left-0 lg:right-0 lg:top-0"><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true"><line x1="0" y1={getY(0)} x2="100" y2={getY(0)} stroke="currentColor" className="text-base-content/15" strokeWidth="1" vectorEffect="non-scaling-stroke" /><polyline points={values.map((v, i) => `${i * 25},${getY(v)}`).join(" ")} fill="none" stroke="currentColor" className="text-info" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>{values.map((value, index) => <div key={trace[index].key} className={join("absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-base-100", value < 0 ? "bg-error" : "bg-success")} style={{ left: `${index * 25}%`, top: `${getY(value)}%` }} />)}</div></div><div className="mt-2 grid grid-cols-5 gap-1 text-center lg:mt-16 lg:gap-2">{trace.map((plan) => <div key={plan.key} className={join("text-[9px] font-poppinsBold leading-tight tabular-nums lg:text-[11px]", plan.base < 0 ? "text-error" : "text-success")}>{plan.short}<br className="lg:hidden" /> <span className="hidden lg:inline"> </span>{money(plan.base, true).replace("AED ", "")}</div>)}</div></div>;
}
function MonthDetail({ plan, openRow, close, toggle, tabby }: { plan: Plan; openRow: string | null; close: () => void; toggle: (id: string) => void; tabby: () => void }) { return <section className="mt-4 border border-base-content/20"><div className="flex items-center justify-between border-b border-base-content/15 px-4 py-3"><div><h2 className="text-sm font-poppinsBold">{plan.label} transactions</h2><p className="mt-0.5 text-xs text-base-content/55">Opening {money(plan.opening)} · income {money(plan.income)} · expenses {money(plan.expenses)}</p></div><button type="button" onClick={close} className="p-1 text-base-content/55 hover:text-base-content"><X className="h-4 w-4" /></button></div><div className="divide-y divide-base-content/10">{plan.rows.map((item) => { const id = `${plan.key}-${item.id}`; const isOpen = openRow === id; return <div key={item.id}><button type="button" onClick={() => item.id === "tabby" ? tabby() : toggle(id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-3 text-left hover:bg-base-200/55"><span className="text-sm">{item.label}</span><span className={join("text-[10px] font-poppinsMed", item.status === "CONFIRMED" ? "text-success" : item.status === "UNRESOLVED" ? "text-error" : "text-warning")}>{item.status}</span><span className={join("font-poppinsBold tabular-nums", item.type === "in" ? "text-success" : "")}>{item.type === "in" ? "+" : "-"}{money(item.amount)}</span></button>{isOpen && <div className="grid gap-3 border-t border-base-content/10 bg-base-200/35 px-4 py-3 text-xs leading-5 text-base-content/65 md:grid-cols-3"><Info label="Calculation" value={item.note} /><Info label="Source" value={item.source} /><Info label="Forecast / actual" value={item.forecast === undefined ? item.history || "No separate forecast saved." : item.actual === undefined ? `Forecast ${money(item.forecast)} is active.` : `Forecast ${money(item.forecast)} · actual ${money(item.actual)} · variance ${money(item.actual - item.forecast, true)}.`} /></div>}</div>; })}</div></section>; }
function Info({ label, value }: { label: string; value: string }) { return <div><div className="mb-1 text-[10px] font-poppinsMed text-base-content/45">{label}</div><div>{value}</div></div>; }
function TabbyDrawer({ state, close, update }: { state: State; close: () => void; update: (key: TabbyKey, value: string) => void }) { return <section className="mt-4 border border-base-content/25"><div className="flex items-center justify-between border-b border-base-content/15 px-4 py-3"><div><h2 className="text-sm font-poppinsBold">Tabby details</h2><p className="mt-0.5 text-xs text-base-content/55">The fee-free minimum is planned cash payment; the whole statement is not.</p></div><button type="button" onClick={close} className="p-1 text-base-content/55 hover:text-base-content"><X className="h-4 w-4" /></button></div><div className="grid divide-y divide-base-content/10 md:grid-cols-2 md:divide-x md:divide-y-0"><div className="p-4 text-xs leading-6 text-base-content/70"><div className="mb-2 text-[10px] font-poppinsMed text-base-content/45">PREVIOUS STATEMENT</div><div className="grid grid-cols-2 gap-x-6 tabular-nums"><span>Statement</span><b>{money(6839.99)}</b><span>No-fee minimum</span><b>{money(2812.14)}</b><span>Amount paid</span><b>{money(2292.52)}</b><span>Payments due</span><b>{money(705.36)}</b><span>This month</span><b>{money(2106.78)}</b></div><div className="mt-3 border-l-2 border-error px-2 text-error">AED 705.36 legacy treatment: {state.legacy.toUpperCase()}</div><div className="mt-3">Gold on Tabby Card: <b>{money(4410)} + {money(2000)}</b>. Its Pay in 4 pressure should reduce if new spending stays controlled.</div></div><div className="p-4"><div className="mb-2 text-[10px] font-poppinsMed text-base-content/45">FORECAST → ACTUAL</div><div className="space-y-2">{(["oct", "nov", "dec", "jan", "feb"] as const).map((key) => { const item = state.tabby[key]; return <div key={key} className="grid grid-cols-[44px_1fr_110px] items-center gap-3 text-xs"><span className="font-poppinsMed">{key.toUpperCase()}</span><span className="tabular-nums text-base-content/60">{money(item.forecast)} <span className="text-base-content/40">({money(item.min)}-{money(item.max)})</span></span><input type="number" aria-label={`${key} Tabby actual`} value={item.actual} placeholder="Actual AED" onChange={(event) => update(key, event.target.value)} className="w-full border border-base-content/20 bg-base-100 px-2 py-1.5 text-right tabular-nums outline-none focus:border-info" /></div>; })}</div><p className="mt-3 text-xs leading-5 text-base-content/55">Entering an actual replaces its forecast and recalculates the later plan.</p></div></div></section>; }
function Settings({ state, change }: { state: State; change: (next: State) => void }) { const monthly = (key: keyof State["monthly"], value: number) => change({ ...state, monthly: { ...state.monthly, [key]: value } }); return <section className="mt-4 border border-base-content/20"><div className="border-b border-base-content/15 px-4 py-3"><h2 className="text-sm font-poppinsBold">Assumptions & scenarios</h2><p className="mt-0.5 text-xs text-base-content/55">All working values are editable. Plan changes when actual numbers change.</p></div><div className="grid divide-y divide-base-content/10 lg:grid-cols-3 lg:divide-x lg:divide-y-0"><div className="space-y-3 p-4"><Small>RECURRING PLAN</Small><Input label="Guaranteed salary" value={state.monthly.salary} change={(value) => monthly("salary", value)} /><Input label="Expected side hustle" value={state.monthly.side} change={(value) => monthly("side", value)} /><Input label="Normal commitments" value={state.monthly.normal} change={(value) => monthly("normal", value)} /><Input label="iPhone installment" value={state.monthly.iphone} change={(value) => monthly("iphone", value)} /></div><div className="space-y-3 p-4"><Small>CONDITIONAL KURI</Small><label className="flex items-center justify-between text-xs"><span>Kuri received</span><input type="checkbox" className="toggle toggle-sm" checked={state.kuri.received} onChange={(event) => change({ ...state, kuri: { ...state.kuri, received: event.target.checked } })} /></label><Select label="Receipt month" value={state.kuri.month} options={["oct", "nov", "dec", "jan", "feb"]} change={(value) => change({ ...state, kuri: { ...state.kuri, month: value as TabbyKey } })} /><StringInput label="Actual AED received" value={state.kuri.aed} change={(value) => change({ ...state, kuri: { ...state.kuri, aed: value } })} /><StringInput label="Actual INR amount" value={state.kuri.inr} change={(value) => change({ ...state, kuri: { ...state.kuri, inr: value } })} /></div><div className="space-y-3 p-4"><Small>SCENARIOS</Small><Select label="AED 705.36 legacy treatment" value={state.legacy} options={["unresolved", "included", "separate"]} change={(value) => change({ ...state, legacy: value as State["legacy"] })} /><label className="flex items-center justify-between text-xs"><span>Unexpected expense</span><input type="checkbox" className="toggle toggle-sm" checked={state.surprise.enabled} onChange={(event) => change({ ...state, surprise: { ...state.surprise, enabled: event.target.checked } })} /></label>{state.surprise.enabled && <><Select label="Month" value={state.surprise.month} options={MONTHS.map((month) => month.key)} change={(value) => change({ ...state, surprise: { ...state.surprise, month: value as Key } })} /><StringInput label="Amount" value={state.surprise.amount} change={(value) => change({ ...state, surprise: { ...state.surprise, amount: value } })} /></>}</div></div></section>; }
function Small({ children }: { children: ReactNode }) { return <div className="text-[10px] font-poppinsMed text-base-content/45">{children}</div>; }
function Input({ label, value, change }: { label: string; value: number; change: (value: number) => void }) { return <label className="block text-xs"><span className="mb-1 block text-base-content/55">{label}</span><input type="number" value={value} onChange={(event) => change(num(event.target.value))} className="w-full border border-base-content/20 bg-base-100 px-2 py-1.5 tabular-nums outline-none focus:border-info" /></label>; }
function StringInput({ label, value, change }: { label: string; value: string; change: (value: string) => void }) { return <label className="block text-xs"><span className="mb-1 block text-base-content/55">{label}</span><input type="number" value={value} onChange={(event) => change(event.target.value)} className="w-full border border-base-content/20 bg-base-100 px-2 py-1.5 tabular-nums outline-none focus:border-info" /></label>; }
function Select({ label, value, options, change }: { label: string; value: string; options: string[]; change: (value: string) => void }) { return <label className="block text-xs"><span className="mb-1 block text-base-content/55">{label}</span><select value={value} onChange={(event) => change(event.target.value)} className="w-full border border-base-content/20 bg-base-100 px-2 py-1.5 outline-none focus:border-info">{options.map((option) => <option key={option} value={option}>{option.toUpperCase()}</option>)}</select></label>; }
