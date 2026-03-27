import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import moment from "moment";
import CommonHeader from "@/components/commonHeader";
import { Subscription } from "@/types/subscription";
import { HiPencilSquare, HiTrash } from "react-icons/hi2";

const statusTone: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-warning/10 text-warning border-warning/20",
  cancelled: "bg-error/10 text-error border-error/20",
};

const SubscriptionDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const subscriptionId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  useEffect(() => {
    if (!subscriptionId) return;
    fetchSubscription();
  }, [subscriptionId]);

  async function fetchSubscription() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/subscriptions?id=${subscriptionId}`);
      const data: Subscription[] = await res.json();
      if (!res.ok) throw new Error((data as any)?.error ?? "Failed to load");
      setSubscription(data?.[0] ?? null);
    } catch (err: any) {
      setError("Unable to load this subscription.");
    } finally {
      setLoading(false);
    }
  }

  const deleteSubscription = async () => {
    if (!subscriptionId) return;
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/subscriptions?id=${subscriptionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as any)?.error ?? "Failed");
      setShowSuccessMessage("Subscription deleted successfully.");
      setTimeout(() => router.push("/subscriptions"), 600);
    } catch (err: any) {
      setError("Failed to delete subscription. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusClass = (status?: string) =>
    statusTone[status ?? ""] ?? "bg-base-200 text-base-content/70 border-base-300";

  const formatDate = (date?: string | null) =>
    date ? moment(date).format("DD MMM YYYY") : "Not set";

  const amountLabel = (value?: number | string | null) => {
    if (!value && value !== 0) return "";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(2) : String(value);
  };

  return (
    <div className="bg-base-100 min-h-screen">
      <CommonHeader
        title="Subscription Details"
        right={
          subscription ? (
            <div className="flex items-center gap-2">
              <Link
                href={`/subscriptions/${subscription.id}/edit`}
                aria-label="Edit subscription"
                className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-sm hover:bg-white/20 active:scale-95 transition-all"
              >
                <HiPencilSquare className="text-[16px]" />
              </Link>
              <button
                onClick={deleteSubscription}
                aria-label="Delete subscription"
                className="h-9 w-9 rounded-full bg-red-500/15 backdrop-blur-md border border-red-500/20 text-red-100 flex items-center justify-center shadow-sm hover:bg-red-500/25 active:scale-95 transition-all disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? (
                  <span className="loading loading-spinner loading-sm text-red-200" />
                ) : (
                  <HiTrash className="text-[16px]" />
                )}
              </button>
            </div>
          ) : null
        }
      />

      <div className="px-4 pt-2 pb-[150px]">
        {loading ? (
          <div>
            {[1, 2]?.map((key) => (
              <div
                className="h-[90px] w-full bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex items-center"
                key={key}
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
        ) : error ? (
          <div className="alert alert-error alert-soft mb-4">
            <span className="text-white text-[12px]">{error}</span>
          </div>
        ) : subscription ? (
          <div className="bg-base-200 border-2 border-base-300 dark:bg-base-200/70 dark:border-base-400 rounded-[16px] p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-base-content font-poppinsMed text-[18px]">
                  {subscription.name}
                </h2>
                <p className="text-base-content/70 text-[12px] font-poppins">
                  {subscription.currency} {amountLabel(subscription.amount)} /{" "}
                  {subscription.billing_cycle}
                </p>
                {subscription.user ? (
                  <p className="text-[11px] text-base-content/50 mt-1">Added by {subscription.user}</p>
                ) : null}
              </div>
              <div
                className={`rounded-full px-3 py-1 border text-[10px] uppercase font-poppinsMed ${getStatusClass(
                  subscription.status
                )}`}
              >
                {subscription.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-100 dark:bg-base-300/70 border-2 border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <p className="text-[11px] text-base-content/60 mb-1">Next renewal</p>
                <p className="text-[13px] text-base-content font-poppinsMed">
                  {formatDate(subscription.renewal_date)}
                </p>
                {subscription.renewal_date && (
                  <p className="text-[11px] text-base-content/60">
                    {moment(subscription.renewal_date).fromNow()}
                  </p>
                )}
              </div>
              <div className="bg-base-100 dark:bg-base-300/70 border-2 border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <p className="text-[11px] text-base-content/60 mb-1">Billing cycle</p>
                <p className="text-[13px] text-base-content font-poppinsMed capitalize">
                  {subscription.billing_cycle}
                </p>
                <p className="text-[11px] text-base-content/60">Currency: {subscription.currency}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-base-100 dark:bg-base-300/70 border-2 border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <p className="text-[11px] text-base-content/60 mb-1">Amount</p>
                <p className="text-[13px] text-base-content font-poppinsMed">
                  {subscription.currency} {amountLabel(subscription.amount)}
                </p>
              </div>
              <div className="bg-base-100 dark:bg-base-300/70 border-2 border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <p className="text-[11px] text-base-content/60 mb-1">Created</p>
                <p className="text-[13px] text-base-content font-poppinsMed">
                  {moment(subscription.created_at).format("DD MMM YYYY")}
                </p>
                <p className="text-[11px] text-base-content/60">{moment(subscription.created_at).fromNow()}</p>
              </div>
            </div>

            {subscription.notes ? (
              <div className="bg-base-100 dark:bg-base-300/70 border-2 border-base-300 dark:border-base-400 rounded-[12px] p-3">
                <p className="text-[11px] text-base-content/60 mb-1">Notes</p>
                <p className="text-[13px] text-base-content">{subscription.notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {showSuccessMessage && (
        <div className="flex items-center justify-end w-full p-4">
          <div role="alert" className="alert alert-success alert-soft mb-4 text-center w-full">
            <span className="text-white text-[14px]">{showSuccessMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
