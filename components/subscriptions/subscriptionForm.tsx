import React, { useEffect, useState } from "react";

export type SubscriptionFormState = {
  name: string;
  amount: string;
  currency: string;
  billingCycle: string;
  renewalDate: string;
  status: string;
  notes: string;
};

type Props = {
  initialValues: SubscriptionFormState;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (values: SubscriptionFormState) => void | Promise<void>;
};

const billingOptions = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];

const currencyOptions = ["AED", "USD", "INR", "EUR", "GBP"];

const SubscriptionForm = ({
  initialValues,
  loading = false,
  submitLabel = "Save subscription",
  onSubmit,
}: Props) => {
  const [form, setForm] = useState<SubscriptionFormState>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const handleChange =
    (field: keyof SubscriptionFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-base-content/80 font-poppinsMed">Subscription name</label>
        <input
          required
          type="text"
          className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
          placeholder="e.g. ChatGPT Plus"
          value={form.name}
          onChange={handleChange("name")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Amount</label>
          <input
            required
            type="number"
            step="0.01"
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange("amount")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Currency</label>
          <select
            className="select select-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            value={form.currency}
            onChange={handleChange("currency")}
          >
            {currencyOptions.map((code) => (
              <option value={code} key={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Billing cycle</label>
          <select
            className="select select-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            value={form.billingCycle}
            onChange={handleChange("billingCycle")}
          >
            {billingOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Next renewal</label>
          <input
            type="date"
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            value={form.renewalDate}
            onChange={handleChange("renewalDate")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-base-content/80 font-poppinsMed">Status</label>
        <select
          className="select select-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
          value={form.status}
          onChange={handleChange("status")}
        >
          {statusOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-base-content/80 font-poppinsMed">Notes</label>
        <textarea
          rows={3}
          className="textarea textarea-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
          placeholder="Add renewal reminders, payment method, etc."
          value={form.notes}
          onChange={handleChange("notes")}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn bg-primary text-primary-content border-none w-full text-sm hover:bg-primary/90 disabled:opacity-70"
      >
        {loading && <span className="loading loading-spinner loading-xs mr-2" />}
        {submitLabel}
      </button>
    </form>
  );
};

export default SubscriptionForm;
