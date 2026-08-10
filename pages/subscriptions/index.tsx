import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import CommonHeader from "@/components/commonHeader";
import { FaPlus } from "react-icons/fa6";
import { HiOutlineCreditCard } from "react-icons/hi2";
import { Subscription } from "@/types/subscription";

const statusTone: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-error/10 text-error border-error/20",
};

const Subscriptions = () => {
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscriptions");
      const payload = await res.json();
      if (!res.ok) throw new Error((payload as any)?.error ?? "Failed to fetch");
      setSubscriptions(payload as Subscription[]);
    } catch (err: any) {
      setError(err?.message || "Unable to fetch subscriptions right now.");
    } finally {
      setLoading(false);
    }
  }

  const renderSkeleton = () => (
    <div>
      {[1, 2, 3].map((item) => (
        <div
          className="h-[90px] w-full bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex items-center"
          key={item}
        >
          <div className="skeleton h-[50px] w-[50px] bg-base-200 dark:bg-base-300 rounded-[12px] mr-3"></div>
          <div className="w-full">
            <div className="skeleton h-4 w-full bg-base-200 dark:bg-base-300 mb-2"></div>
            <div className="skeleton h-3 w-3/4 bg-base-200 dark:bg-base-300 mb-2"></div>
            <div className="skeleton h-3 w-1/2 bg-base-200 dark:bg-base-300"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const getStatusClass = (status?: string) =>
    statusTone[status ?? ""] ?? "bg-base-200 text-base-content/70 border-base-300";

  const formatRenewal = (date?: string | null) =>
    date ? moment(date).format("DD MMM YYYY") : "No date set";

  const amountLabel = (sub: Subscription) => {
    const num = Number(sub.amount);
    const value = Number.isFinite(num) ? num.toFixed(2) : sub.amount;
    const cycle = sub.billing_cycle
      ? sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1)
      : "Cycle";
    return `${sub.currency} ${value} / ${cycle}`;
  };

  return (
    <div className="bg-base-100 min-h-dvh relative">
      <CommonHeader title="Subscriptions" />
      <div className="px-4 page-body-with-fab">
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div className="alert alert-error alert-soft mb-4">
            <span className="text-white text-[12px]">{error}</span>
          </div>
        ) : subscriptions?.length ? (
          subscriptions.map((item) => (
            <Link
              href={`/subscriptions/${item.id}`}
              key={item.id}
              className="bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex justify-between items-center transition-all hover:shadow-md hover:border-primary/50 dark:hover:border-primary/60"
            >
              <div className="flex items-center">
                <div className="h-[50px] w-[50px] bg-primary/10 text-primary rounded-[14px] flex items-center justify-center mr-4 flex-shrink-0">
                  <HiOutlineCreditCard className="text-[24px]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base-content font-poppinsMed text-[14px] mb-1">
                    {item.name}
                  </span>
                  <span className="text-base-content/70 text-[12px] font-poppinsMed mb-1">
                    {amountLabel(item)}
                  </span>
                  <span className="text-base-content/60 text-[11px] font-poppins">
                    Next: {formatRenewal(item.renewal_date)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-center text-right">
                <div
                  className={`rounded-full px-3 py-1 border text-[10px] uppercase font-poppinsMed ${getStatusClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </div>
                <span className="text-[10px] text-base-content/50 mt-2">
                  Added {moment(item.created_at).fromNow()}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="bg-base-200 border-2 border-base-300 dark:bg-base-300 dark:border-base-400 rounded-[16px] p-6 text-center mt-4">
            <h3 className="text-base-content font-poppinsMed text-[14px] mb-2">
              No subscriptions yet
            </h3>
            <p className="text-base-content/70 text-[12px] mb-4">
              Track recurring services like ChatGPT Plus, Netflix, or hosting plans.
            </p>
            <Link href="/subscriptions/new" className="btn btn-sm bg-primary text-primary-content border-none">
              Add your first subscription
            </Link>
          </div>
        )}
      </div>

      <Link
        href="/subscriptions/new"
        className="fixed z-[2000] right-8 bottom-28 bg-primary hover:bg-primary-focus h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-105 shadow-lg border-2 border-white/20"
      >
        <FaPlus className="text-white text-base" />
      </Link>
    </div>
  );
};

export default Subscriptions;
