import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import moment from "moment";
import CommonHeader from "@/components/commonHeader";
import HeaderAction from "@/components/headerAction";
import PageAlert from "@/components/pageAlert";
import PageSection from "@/components/pageSection";
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
    <div className="bg-base-100 min-h-dvh">
      <CommonHeader
        title="Subscription Details"
        right={
          subscription ? (
            <div className="flex items-center gap-2">
              <HeaderAction
                href={`/subscriptions/${subscription.id}/edit`}
                label="Update"
                tone="success"
                icon={<HiPencilSquare className="text-[16px]" />}
              />
              <HeaderAction
                onClick={deleteSubscription}
                label="Delete"
                tone="danger"
                disabled={deleting}
                icon={
                  deleting ? (
                    <span className="loading loading-spinner loading-sm text-rose-100" />
                  ) : (
                    <HiTrash className="text-[16px]" />
                  )
                }
              />
            </div>
          ) : null
        }
      />

      <div className="page-body px-4 pt-2">
        <div className="page-shell">
          {loading ? (
            <div>
              {[1, 2]?.map((key) => (
                <div
                  className="my-3 flex h-[90px] w-full items-center rounded-[12px] border-2 border-base-300 bg-base-100 px-4 py-4 dark:border-base-400 dark:bg-base-200"
                  key={key}
                >
                  <div className="mr-3 h-[50px] w-[50px] rounded-[12px] bg-base-200 skeleton dark:bg-base-300"></div>
                  <div className="w-full">
                    <div className="mb-2 h-4 w-full bg-base-200 skeleton dark:bg-base-300"></div>
                    <div className="mb-2 h-3 w-3/4 bg-base-200 skeleton dark:bg-base-300"></div>
                    <div className="h-3 w-1/2 bg-base-200 skeleton dark:bg-base-300"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <PageAlert tone="error">{error}</PageAlert>
          ) : subscription ? (
            <PageSection className="!px-0 !pt-0" contentClassName="space-y-4">
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
            </PageSection>
          ) : null}
        </div>
      </div>

      {showSuccessMessage && (
        <div className="page-body px-4 pt-0">
          <div className="page-shell">
            <PageAlert>{showSuccessMessage}</PageAlert>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionDetails;
