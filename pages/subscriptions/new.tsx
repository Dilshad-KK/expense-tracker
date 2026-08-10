import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CommonHeader from "@/components/commonHeader";
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
      <div className="px-4 page-body">
        {error && (
          <div className="alert alert-error alert-soft mb-4">
            <span className="text-white text-[12px]">{error}</span>
          </div>
        )}

        <SubscriptionForm
          initialValues={formValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Save subscription"
        />

        {showSuccessMessage && (
          <div className="flex items-center justify-center w-full mt-4">
            <div role="alert" className="alert alert-success alert-soft text-center w-full">
              <span className="text-white text-[14px]">{showSuccessMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewSubscription;
