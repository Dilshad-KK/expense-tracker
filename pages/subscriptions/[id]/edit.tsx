import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import CommonHeader from "@/components/commonHeader";
import PageAlert from "@/components/pageAlert";
import PageSection from "@/components/pageSection";
import SubscriptionForm, {
  SubscriptionFormState,
} from "@/components/subscriptions/subscriptionForm";
import { Subscription } from "@/types/subscription";

const defaultForm: SubscriptionFormState = {
  name: "",
  amount: "",
  currency: "AED",
  billingCycle: "monthly",
  renewalDate: "",
  status: "active",
  notes: "",
};

const EditSubscription = () => {
  const router = useRouter();
  const { id } = router.query;
  const subscriptionId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const [formValues, setFormValues] = useState<SubscriptionFormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const sub = data?.[0];
      if (!sub) {
        setError("Subscription not found.");
        return;
      }
      setFormValues({
        name: sub.name ?? "",
        amount: sub.amount !== undefined && sub.amount !== null ? String(sub.amount) : "",
        currency: sub.currency ?? "AED",
        billingCycle: sub.billing_cycle ?? "monthly",
        renewalDate: sub.renewal_date ?? "",
        status: sub.status ?? "active",
        notes: sub.notes ?? "",
      });
    } catch (err: any) {
      setError("Unable to load subscription.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (values: SubscriptionFormState) => {
    if (!subscriptionId) return;
    const parsedAmount = Number(values.amount);
    if (!Number.isFinite(parsedAmount)) {
      setError("Enter a valid amount.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: subscriptionId,
          name: values.name,
          amount: parsedAmount,
          currency: values.currency,
          billingCycle: values.billingCycle,
          renewalDate: values.renewalDate || null,
          status: values.status,
          notes: values.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error((data as any)?.error ?? "Failed");

      setShowSuccessMessage("Subscription updated successfully.");
      setTimeout(() => {
        router.push(`/subscriptions/${subscriptionId}`);
      }, 600);
    } catch (err: any) {
      setError(err?.message || "Failed to update subscription.");
    } finally {
      setSaving(false);
    }
  };

  const renderSkeleton = () => (
    <div>
      {[1, 2, 3].map((key) => (
        <div
          className="h-[70px] w-full bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-[12px] flex"
          key={key}
        >
          <div className="skeleton h-full w-[10%] bg-base-200 dark:bg-base-300 rounded-[12px] mr-3"></div>
          <div className="w-full">
            <div className="skeleton h-4 w-full bg-base-200 dark:bg-base-300 mb-2"></div>
            <div className="skeleton h-4 w-3/4 bg-base-200 dark:bg-base-300"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-base-100 min-h-dvh relative">
      <CommonHeader title="Update Subscription" />
      <PageSection className="pt-0" contentClassName="space-y-4">
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <PageAlert tone="error">{error}</PageAlert>
        ) : (
          <SubscriptionForm
            initialValues={formValues}
            onSubmit={handleSubmit}
            loading={saving}
            submitLabel="Update subscription"
          />
        )}

        {showSuccessMessage && (
          <PageAlert>{showSuccessMessage}</PageAlert>
        )}
      </PageSection>
    </div>
  );
};

export default EditSubscription;
