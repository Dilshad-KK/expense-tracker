import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import Link from "next/link";
import CommonHeader from "@/components/commonHeader";
import { FaPlus } from "react-icons/fa6";
import { IoPencil, IoTrashOutline } from "react-icons/io5";
import { WorkData } from "@/types/workdata";

const toNumber = (value: number | string | null | undefined) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatHours = (value: number | string) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0";
  return num % 1 === 0 ? String(num) : num.toFixed(1);
};

const WorkDataPage = () => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<WorkData[]>([]);
  const [error, setError] = useState("");

  const [activeUser, setActiveUser] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [year, setYear] = useState<string>(String(new Date().getFullYear()));

  const [actionLoading, setActionLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem("userIdentity");

    if (cachedUser) {
      setActiveUser(cachedUser);
      setOptions(
        cachedUser === "Dilshad"
          ? ["Dilshad", "Shifa Dilshad", "Vacation"]
          : ["Shifa Dilshad", "Dilshad", "Vacation"]
      );
      fetchWorkData(cachedUser);
      return;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const detectedUser = timezone.includes("Asia/Dubai") ? "Dilshad" : "Shifa Dilshad";
    localStorage.setItem("userIdentity", detectedUser);
    setActiveUser(detectedUser);
    setOptions(
      detectedUser === "Dilshad"
        ? ["Dilshad", "Shifa Dilshad", "Vacation"]
        : ["Shifa Dilshad", "Dilshad", "Vacation"]
    );
    fetchWorkData(detectedUser);
  }, []);

  async function fetchWorkData(user: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/workdata?user=${encodeURIComponent(user)}`);
      const payload = await res.json();
      if (!res.ok) throw new Error((payload as any)?.error ?? "Failed to fetch");
      setRecords(payload as WorkData[]);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch work data right now.");
    } finally {
      setLoading(false);
    }
  }

  const years = useMemo(() => {
    const set = new Set<string>();
    for (const item of records) {
      const y = moment(item.month).format("YYYY");
      if (y && y !== "Invalid date") set.add(y);
    }
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [records]);

  useEffect(() => {
    if (year === "all") return;
    if (!years.length) return;
    if (!years.includes(year)) setYear(years[0]);
  }, [year, years]);

  const filtered = useMemo(() => {
    if (year === "all") return records;
    return records.filter((item) => moment(item.month).format("YYYY") === year);
  }, [records, year]);

  const summary = useMemo(() => {
    const totals = {
      daysWorked: 0,
      leaveTaken: 0,
      sickLeave: 0,
      unpaidLeave: 0,
      wfhDays: 0,
      overtimeHours: 0,
    };

    for (const item of filtered) {
      totals.daysWorked += toNumber(item.days_worked);
      totals.leaveTaken += toNumber(item.leave_taken);
      totals.sickLeave += toNumber(item.sick_leave_taken);
      totals.unpaidLeave += toNumber(item.unpaid_leave_taken);
      totals.wfhDays += toNumber(item.wfh_days);
      totals.overtimeHours += toNumber(item.overtime_hours);
    }

    const latest = filtered?.[0];
    const annual = latest
      ? {
          total: toNumber(latest.annual_leave_total),
          remaining: toNumber(latest.annual_leave_remaining),
        }
      : null;

    return { totals, annual };
  }, [filtered]);

  const handleUserChange = (nextUser: string) => {
    setActiveUser(nextUser);
    fetchWorkData(nextUser);
  };

  const handleDelete = async (id: number) => {
    if (!activeUser) return;
    const ok = window.confirm("Delete this work data entry?");
    if (!ok) return;

    setActionId(id);
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/workdata?id=${id}`, { method: "DELETE" });
      const payload = await res.json();
      if (!res.ok) throw new Error((payload as any)?.error ?? "Failed to delete");
      await fetchWorkData(activeUser);
    } catch (err: any) {
      setError(err?.message || "Unable to delete right now.");
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  };

  const renderSkeleton = () => (
    <div>
      {[1, 2, 3].map((key) => (
        <div
          className="h-[110px] w-full bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex"
          key={key}
        >
          <div className="skeleton h-full w-[18%] bg-base-200 dark:bg-base-300 rounded-[12px] mr-3" />
          <div className="w-full">
            <div className="skeleton h-4 w-full bg-base-200 dark:bg-base-300 mb-2" />
            <div className="skeleton h-3 w-3/4 bg-base-200 dark:bg-base-300 mb-2" />
            <div className="skeleton h-3 w-1/2 bg-base-200 dark:bg-base-300" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-base-100 min-h-screen relative">
      <CommonHeader title="Work Data" />

      <div className="px-4 pb-[150px]">
        {error && (
          <div className="alert alert-error alert-soft mb-4">
            <span className="text-white text-[12px]">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <select
            className="select select-bordered w-full text-[12px] bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-base-content"
            value={activeUser}
            onChange={(e) => handleUserChange(e.target.value)}
            disabled={!options.length}
          >
            {!options.length ? <option value="">Loading...</option> : null}
            {options.map((opt) => (
              <option value={opt} key={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            className="select select-bordered w-full text-[12px] bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-base-content"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={loading}
          >
            <option value="all">All years</option>
            {years.map((y) => (
              <option value={y} key={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {!!filtered.length && (
          <div className="bg-base-200 dark:bg-base-300 border-2 border-base-300 dark:border-base-400 rounded-[14px] p-4 mb-4">
            <div className="text-[12px] text-base-content font-poppinsMed mb-3">Summary ({year === "all" ? "All" : year})</div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <div className="text-[10px] text-base-content/60">Worked</div>
                <div className="text-[14px] text-base-content font-poppinsBold">
                  {summary.totals.daysWorked} <span className="text-[11px] font-poppinsMed">days</span>
                </div>
              </div>
              <div className="bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <div className="text-[10px] text-base-content/60">Total Leave</div>
                <div className="text-[14px] text-base-content font-poppinsBold">
                  {summary.totals.leaveTaken + summary.totals.sickLeave + summary.totals.unpaidLeave}{" "}
                  <span className="text-[11px] font-poppinsMed">days</span>
                </div>
              </div>
              <div className="bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <div className="text-[10px] text-base-content/60">Overtime</div>
                <div className="text-[14px] text-base-content font-poppinsBold">
                  {formatHours(summary.totals.overtimeHours)} <span className="text-[11px] font-poppinsMed">hrs</span>
                </div>
              </div>
            </div>

            {summary.annual && (
              <div className="mt-3 text-[11px] text-base-content/70">
                Annual leave (latest):{" "}
                <span className="font-poppinsMed text-base-content/90">
                  {summary.annual.remaining}/{summary.annual.total}
                </span>
              </div>
            )}
          </div>
        )}

        {loading ? (
          renderSkeleton()
        ) : filtered.length ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col">
                  <span className="text-base-content font-poppinsMed text-[14px]">
                    {moment(item.month).format("MMMM YYYY")}
                  </span>
                  <span className="text-[10px] text-base-content/60">
                    Annual leave: {item.annual_leave_remaining}/{item.annual_leave_total}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/workdata/${item.id}/edit`}
                    className="h-[32px] w-[32px] rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <IoPencil className="text-[14px]" />
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="h-[32px] w-[32px] rounded-full bg-error/10 text-error flex items-center justify-center border border-error/20 disabled:opacity-70"
                    aria-label="Delete"
                    title="Delete"
                    disabled={actionLoading && actionId === item.id}
                  >
                    {actionLoading && actionId === item.id ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      <IoTrashOutline className="text-[14px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                  <div className="text-[10px] text-base-content/60">Worked</div>
                  <div className="text-[13px] text-base-content font-poppinsBold">{item.days_worked}</div>
                </div>
                <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                  <div className="text-[10px] text-base-content/60">AL Taken</div>
                  <div className="text-[13px] text-base-content font-poppinsBold">{item.leave_taken}</div>
                </div>
                <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                  <div className="text-[10px] text-base-content/60">WFH</div>
                  <div className="text-[13px] text-base-content font-poppinsBold">{item.wfh_days}</div>
                </div>
                <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                  <div className="text-[10px] text-base-content/60">Sick</div>
                  <div className="text-[13px] text-base-content font-poppinsBold">{item.sick_leave_taken}</div>
                </div>
                <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                  <div className="text-[10px] text-base-content/60">Unpaid</div>
                  <div className="text-[13px] text-base-content font-poppinsBold">{item.unpaid_leave_taken}</div>
                </div>
                <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-[12px] p-3">
                  <div className="text-[10px] text-base-content/60">Overtime</div>
                  <div className="text-[13px] text-base-content font-poppinsBold">
                    {formatHours(item.overtime_hours)}h
                  </div>
                </div>
              </div>

              {item.notes ? (
                <div className="mt-3 text-[11px] text-base-content/70 whitespace-pre-wrap">{item.notes}</div>
              ) : null}
            </div>
          ))
        ) : (
          <div className="bg-base-200 border-2 border-base-300 dark:bg-base-300 dark:border-base-400 rounded-[16px] p-6 text-center mt-4">
            <h3 className="text-base-content font-poppinsMed text-[14px] mb-2">No work data yet</h3>
            <p className="text-base-content/70 text-[12px] mb-4">
              Track days worked, leave taken, annual leave, WFH, overtime, and notes.
            </p>
            <Link href="/workdata/new" className="btn btn-sm bg-primary text-primary-content border-none">
              Add your first entry
            </Link>
          </div>
        )}
      </div>

      <Link
        href="/workdata/new"
        className="fixed z-[2000] right-8 bottom-28 bg-primary hover:bg-primary-focus h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-lg border-2 border-white/20"
        aria-label="Add work data"
      >
        <FaPlus className="text-white text-base" />
      </Link>
    </div>
  );
};

export default WorkDataPage;
