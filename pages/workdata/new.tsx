import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import CommonHeader from "@/components/commonHeader";
import PageAlert from "@/components/pageAlert";
import PageSection from "@/components/pageSection";
import WorkDataForm, { WorkDataFormState } from "@/components/workdata/workDataForm";

const defaultForm: WorkDataFormState = {
  month: moment().format("YYYY-MM"),
  daysWorked: "",
  leaveTaken: "",
  annualLeaveTotal: "",
  annualLeaveRemaining: "",
  sickLeaveTaken: "",
  unpaidLeaveTaken: "",
  wfhDays: "",
  overtimeHours: "",
  notes: "",
};

const NewWorkData = () => {
  const router = useRouter();

  const [formValues, setFormValues] = useState<WorkDataFormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const [user, setUser] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const cachedUser = localStorage.getItem("userIdentity");

    if (cachedUser) {
      setUser(cachedUser);
      setOptions(
        cachedUser === "Dilshad"
          ? ["Dilshad", "Shifa Dilshad", "Vacation"]
          : ["Shifa Dilshad", "Dilshad", "Vacation"]
      );
      return;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const detectedUser = timezone.includes("Asia/Dubai") ? "Dilshad" : "Shifa Dilshad";
    localStorage.setItem("userIdentity", detectedUser);
    setUser(detectedUser);
    setOptions(
      detectedUser === "Dilshad"
        ? ["Dilshad", "Shifa Dilshad", "Vacation"]
        : ["Shifa Dilshad", "Dilshad", "Vacation"]
    );
  }, []);

  const asNum = (value: string) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const handleSubmit = async (values: WorkDataFormState) => {
    if (!values.month) {
      setError("Select a month.");
      return;
    }
    if (!user) {
      setError("Select a user.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/workdata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: values.month,
          daysWorked: asNum(values.daysWorked),
          leaveTaken: asNum(values.leaveTaken),
          annualLeaveTotal: asNum(values.annualLeaveTotal),
          annualLeaveRemaining: asNum(values.annualLeaveRemaining),
          sickLeaveTaken: asNum(values.sickLeaveTaken),
          unpaidLeaveTaken: asNum(values.unpaidLeaveTaken),
          wfhDays: asNum(values.wfhDays),
          overtimeHours: asNum(values.overtimeHours),
          notes: values.notes,
          user,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error((data as any)?.error ?? "Failed to add work data");

      setShowSuccessMessage("Work data added successfully.");
      setFormValues(defaultForm);
      setTimeout(() => setShowSuccessMessage(""), 2000);
      router.push("/workdata");
    } catch (err: any) {
      setError(err?.message || "Failed to add work data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 min-h-dvh relative">
      <CommonHeader title="Add Work Data" />
      <PageSection contentClassName="space-y-4">
        {error && (
          <PageAlert tone="error">{error}</PageAlert>
        )}

        <div className="space-y-2 mb-4">
          <label className="text-xs text-base-content/80 font-poppinsMed">User</label>
          <select
            className="select select-bordered w-full text-sm bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            disabled={!options.length}
          >
            {!options.length ? <option value="">Loading...</option> : null}
            {options.map((opt) => (
              <option value={opt} key={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <WorkDataForm
          initialValues={formValues}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Save work data"
        />

        {showSuccessMessage && (
          <PageAlert>{showSuccessMessage}</PageAlert>
        )}
      </PageSection>
    </div>
  );
};

export default NewWorkData;
