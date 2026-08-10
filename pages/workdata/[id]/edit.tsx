import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import CommonHeader from "@/components/commonHeader";
import WorkDataForm, { WorkDataFormState } from "@/components/workdata/workDataForm";
import { WorkData } from "@/types/workdata";

const defaultForm: WorkDataFormState = {
  month: "",
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

const EditWorkData = () => {
  const router = useRouter();
  const { id } = router.query;
  const workId = useMemo(() => (Array.isArray(id) ? id[0] : id), [id]);

  const [formValues, setFormValues] = useState<WorkDataFormState>(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const [user, setUser] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    const cachedUser = localStorage.getItem("userIdentity");
    if (!cachedUser) return;
    setOptions(
      cachedUser === "Dilshad"
        ? ["Dilshad", "Shifa Dilshad", "Vacation"]
        : ["Shifa Dilshad", "Dilshad", "Vacation"]
    );
  }, []);

  useEffect(() => {
    if (!workId) return;
    fetchWorkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workId]);

  async function fetchWorkData() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/workdata?id=${workId}`);
      const payload = await res.json();
      if (!res.ok) throw new Error((payload as any)?.error ?? "Failed to load");
      const item: WorkData | undefined = (payload as WorkData[])?.[0];
      if (!item) {
        setError("Work data entry not found.");
        return;
      }

      setUser(item.user ?? "");
      setFormValues({
        month: item.month ? moment(item.month).format("YYYY-MM") : "",
        daysWorked: item.days_worked !== undefined && item.days_worked !== null ? String(item.days_worked) : "",
        leaveTaken: item.leave_taken !== undefined && item.leave_taken !== null ? String(item.leave_taken) : "",
        annualLeaveTotal:
          item.annual_leave_total !== undefined && item.annual_leave_total !== null
            ? String(item.annual_leave_total)
            : "",
        annualLeaveRemaining:
          item.annual_leave_remaining !== undefined && item.annual_leave_remaining !== null
            ? String(item.annual_leave_remaining)
            : "",
        sickLeaveTaken:
          item.sick_leave_taken !== undefined && item.sick_leave_taken !== null ? String(item.sick_leave_taken) : "",
        unpaidLeaveTaken:
          item.unpaid_leave_taken !== undefined && item.unpaid_leave_taken !== null ? String(item.unpaid_leave_taken) : "",
        wfhDays: item.wfh_days !== undefined && item.wfh_days !== null ? String(item.wfh_days) : "",
        overtimeHours:
          item.overtime_hours !== undefined && item.overtime_hours !== null ? String(item.overtime_hours) : "",
        notes: item.notes ?? "",
      });
    } catch (err: any) {
      setError(err?.message || "Unable to load work data right now.");
    } finally {
      setLoading(false);
    }
  }

  const asNum = (value: string) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const handleSubmit = async (values: WorkDataFormState) => {
    if (!workId) return;
    if (!values.month) {
      setError("Select a month.");
      return;
    }
    if (!user) {
      setError("Select a user.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/workdata", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workId,
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
      if (!res.ok) throw new Error((data as any)?.error ?? "Failed to update work data");

      setShowSuccessMessage("Work data updated successfully.");
      setTimeout(() => router.push("/workdata"), 600);
    } catch (err: any) {
      setError(err?.message || "Failed to update work data.");
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
      <CommonHeader title="Update Work Data" />
      <div className="px-4 pt-4 page-body">
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <div className="alert alert-error alert-soft mb-4">
            <span className="text-white text-[12px]">{error}</span>
          </div>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              <label className="text-[12px] text-base-content/80 font-poppinsMed">User</label>
              <select
                className="select select-bordered w-full text-[13px] bg-base-200 border-base-300 dark:bg-base-300 dark:border-base-400"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                disabled={saving}
              >
                <option value={user}>{user || "Select user"}</option>
                {options
                  .filter((opt) => opt !== user)
                  .map((opt) => (
                    <option value={opt} key={opt}>
                      {opt}
                    </option>
                  ))}
              </select>
            </div>

            <WorkDataForm
              initialValues={formValues}
              onSubmit={handleSubmit}
              loading={saving}
              submitLabel="Update work data"
            />
          </>
        )}

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

export default EditWorkData;

