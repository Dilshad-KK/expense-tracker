import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CommonHeader from "@/components/commonHeader";
import PageAlert from "@/components/pageAlert";
import PageSection from "@/components/pageSection";
import SubscriptionForm, {
  SubscriptionFormState,
} from "@/components/subscriptions/subscriptionForm";

const defaultForm: SubscriptionFormState = {
  name: "",
  amount: "",
  currency: "AED",
  billingCycle: "monthly",
  renewalDate: "",
  status: "active",
  notes: "",
};

const NewSubscription = () => {
  const router = useRouter();
  const [formValues, setFormValues] = useState<SubscriptionFormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [user, setUser] = useState("");

  useEffect(() => {
    const cachedUser = localStorage.getItem("userIdentity");

    if (cachedUser) {
      setUser(cachedUser);
      return;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let detectedUser = "";
    if (timezone.includes("Asia/Dubai")) {
      detectedUser = "Dilshad";
    } else {
      detectedUser = "Shifa Dilshad";
    }

    localStorage.setItem("userIdentity", detectedUser);
    setUser(detectedUser);
  }, []);

  const handleSubmit = async (values: SubscriptionFormState) => {
    const parsedAmount = Number(values.amount);
    if (!Number.isFinite(parsedAmount)) {
      setError("Enter a valid amount.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          amount: parsedAmount,
          currency: values.currency,
          billingCycle: values.billingCycle,
          renewalDate: values.renewalDate || null,
          status: values.status,
          notes: values.notes,
          user,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error((data as any)?.error ?? "Failed to add");

      setShowSuccessMessage("Subscription added successfully.");
      setFormValues(defaultForm);
      setTimeout(() => setShowSuccessMessage(""), 2000);
      router.push("/subscriptions");
    } catch (err: any) {
      setError(err?.message || "Failed to add subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 min-h-dvh relative">
      <CommonHeader title="Add Subscription" />
      <PageSection contentClassName="space-y-4">
        {error && (
          <PageAlert tone="error">{error}</PageAlert>
        )}

        <SubscriptionForm
          initialValues={formValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Save subscription"
        />

        {showSuccessMessage && (
          <PageAlert>{showSuccessMessage}</PageAlert>
        )}
      </PageSection>
    </div>
  );
};

export default NewSubscription;
