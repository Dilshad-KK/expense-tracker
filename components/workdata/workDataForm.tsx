import React, { useEffect, useMemo, useState } from "react";

export type WorkDataFormState = {
  month: string; // YYYY-MM
  daysWorked: string;
  leaveTaken: string;
  annualLeaveTotal: string;
  annualLeaveRemaining: string;
  sickLeaveTaken: string;
  unpaidLeaveTaken: string;
  wfhDays: string;
  overtimeHours: string;
  notes: string;
};

type Props = {
  initialValues: WorkDataFormState;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (values: WorkDataFormState) => void | Promise<void>;
};

const WorkDataForm = ({
  initialValues,
  submitLabel = "Save work data",
  loading = false,
  onSubmit,
}: Props) => {
  const [form, setForm] = useState<WorkDataFormState>(initialValues);

  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const annualUsed = useMemo(() => {
    const total = Number(form.annualLeaveTotal || 0);
    const remaining = Number(form.annualLeaveRemaining || 0);
    if (!Number.isFinite(total) || !Number.isFinite(remaining)) return 0;
    return total - remaining;
  }, [form.annualLeaveRemaining, form.annualLeaveTotal]);

  const totalLeaveThisMonth = useMemo(() => {
    const annual = Number(form.leaveTaken || 0);
    const sick = Number(form.sickLeaveTaken || 0);
    const unpaid = Number(form.unpaidLeaveTaken || 0);
    const sum = (Number.isFinite(annual) ? annual : 0) + (Number.isFinite(sick) ? sick : 0) + (Number.isFinite(unpaid) ? unpaid : 0);
    return Math.trunc(sum);
  }, [form.leaveTaken, form.sickLeaveTaken, form.unpaidLeaveTaken]);

  const handleChange =
    (field: keyof WorkDataFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Month</label>
          <input
            required
            type="month"
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            value={form.month}
            onChange={handleChange("month")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Days worked</label>
          <input
            type="number"
            min={0}
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0"
            value={form.daysWorked}
            onChange={handleChange("daysWorked")}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Annual leave taken</label>
          <input
            type="number"
            min={0}
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0"
            value={form.leaveTaken}
            onChange={handleChange("leaveTaken")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Sick leave</label>
          <input
            type="number"
            min={0}
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0"
            value={form.sickLeaveTaken}
            onChange={handleChange("sickLeaveTaken")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Unpaid leave</label>
          <input
            type="number"
            min={0}
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0"
            value={form.unpaidLeaveTaken}
            onChange={handleChange("unpaidLeaveTaken")}
          />
        </div>
      </div>
      <div className="text-xs text-base-content/70">
        Total leave this month: <span className="font-poppinsMed text-base-content/90">{totalLeaveThisMonth}</span> day(s)
      </div>

      <div className="bg-base-200 dark:bg-base-300 border border-base-300 dark:border-base-400 rounded-box p-4">
        <div className="text-xs text-base-content font-poppinsMed mb-3">Annual leave</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-xs text-base-content/80 font-poppinsMed">Total</label>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full text-sm bg-base-100 border-base-300 dark:bg-base-200 dark:border-base-400"
              placeholder="0"
              value={form.annualLeaveTotal}
              onChange={handleChange("annualLeaveTotal")}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-base-content/80 font-poppinsMed">Remaining</label>
            <input
              type="number"
              min={0}
              className="input input-bordered w-full text-sm bg-base-100 border-base-300 dark:bg-base-200 dark:border-base-400"
              placeholder="0"
              value={form.annualLeaveRemaining}
              onChange={handleChange("annualLeaveRemaining")}
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-base-content/70">
          Used: <span className="font-poppinsMed text-base-content/90">{Number.isFinite(annualUsed) ? annualUsed : 0}</span>{" "}
          day(s)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">WFH days</label>
          <input
            type="number"
            min={0}
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0"
            value={form.wfhDays}
            onChange={handleChange("wfhDays")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-base-content/80 font-poppinsMed">Overtime (hours)</label>
          <input
            type="number"
            min={0}
            step="0.5"
            className="input input-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            placeholder="0"
            value={form.overtimeHours}
            onChange={handleChange("overtimeHours")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-base-content/80 font-poppinsMed">Notes</label>
        <textarea
          rows={3}
          className="textarea textarea-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
          placeholder="Any extra info..."
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

export default WorkDataForm;
