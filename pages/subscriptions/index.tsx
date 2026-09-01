import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import CommonHeader from "@/components/commonHeader";
import PageEmptyState from "@/components/pageEmptyState";
import PageFab from "@/components/pageFab";
import PageSection from "@/components/pageSection";
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
  const renewingSoonCount = subscriptions.filter((item) => {
    if (!item.renewal_date) return false;
    const renewalDate = moment(item.renewal_date);
    if (!renewalDate.isValid()) return false;
    const daysUntilRenewal = renewalDate.startOf("day").diff(moment().startOf("day"), "days");
    return daysUntilRenewal >= 0 && daysUntilRenewal <= 30;
  }).length;

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
          className="h-24 w-full bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-box flex items-center"
          key={item}
        >
          <div className="skeleton h-12 w-12 bg-base-200 dark:bg-base-300 rounded-box mr-3"></div>
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
      <div className="page-body-with-fab px-4 pt-2">
        <div className="page-shell space-y-4">
          <PageSection className="!px-0 !pt-0" contentClassName="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
                <HiOutlineCreditCard className="text-2xl" />
              </div>
              <div>
                <div className="text-[11px] font-poppinsMed text-base-content/50">Recurring spend</div>
                <div className="mt-2 text-base font-poppinsBold text-base-content">{subscriptions.length} active records</div>
              </div>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-base-content/10 bg-base-200/55 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-info"></span>
              <span className="text-xs text-base-content/60">Renewing soon</span>
              <span className="text-sm font-poppinsBold text-base-content">{renewingSoonCount}</span>
            </div>
          </PageSection>

          {loading ? (
            renderSkeleton()
          ) : error ? (
            <div className="alert alert-error alert-soft mb-4">
              <span className="text-white text-xs">{error}</span>
            </div>
          ) : subscriptions?.length ? (
            <div className="space-y-3">
              {subscriptions.map((item) => (
                <Link
                  href={`/subscriptions/${item.id}`}
                  key={item.id}
                  className="flex w-full items-center justify-between rounded-[26px] border border-base-content/10 bg-base-100/95 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_20px_48px_rgba(81,76,255,0.14)] dark:bg-base-200/80"
                >
                  <div className="flex items-center">
                    <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
                      <HiOutlineCreditCard className="text-2xl" />
                    </div>
                    <div className="flex flex-col">
                      <span className="mb-1 text-sm font-poppinsBold text-base-content">
                        {item.name}
                      </span>
                      <span className="mb-1 text-xs font-poppinsMed text-base-content/70">
                        {amountLabel(item)}
                      </span>
                      <span className="text-xs text-base-content/60">
                        Next: {formatRenewal(item.renewal_date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-center text-right">
                    <div
                    className={`rounded-full px-3 py-1 border text-[0.65rem] font-poppinsMed ${getStatusClass(
                      item.status
                    )}`}
                  >
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : ""}
                  </div>
                    <span className="mt-2 text-[0.65rem] text-base-content/50">
                      Added {moment(item.created_at).fromNow()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <PageEmptyState
              title="No subscriptions yet"
              description="Track recurring services like ChatGPT Plus, Netflix, or hosting plans."
              icon={<HiOutlineCreditCard className="text-2xl" />}
              action={<Link href="/subscriptions/new" className="btn btn-sm bg-primary text-primary-content border-none">Add your first subscription</Link>}
            />
          )}
        </div>
      </div>

      <PageFab href="/subscriptions/new" ariaLabel="Add subscription" />
    </div>
  );
};

export default Subscriptions;
