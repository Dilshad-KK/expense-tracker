import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CommonHeader from "@/components/commonHeader";
import PageSection from "@/components/pageSection";

export default function UpdatePage() {
  const [id, setId] = useState<string | null>(null);
  const [lastDate, setLastDate] = useState<string>("");
  const [cycle, setCycle] = useState<number>(26);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/periods");
      const json = await res.json();
      if (json?.length > 0) {
        const latest = json[0];
        setId(latest.id);
        setLastDate(latest.last_period_date);
        setCycle(latest.cycle_length);
      }
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      last_period_date: lastDate,
      cycle_length: cycle,
    };

    const res = await fetch(`/api/periods${id ? `?id=${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/periods");
    }
  };

  return (
    <div className="bg-base-100 min-h-dvh relative">
      <CommonHeader title='Update Period Details' />
      <PageSection contentClassName="max-w-md">
        <div className="w-full">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">Cycle Length (days)</label>
                <input
                  type="number"
                  value={cycle}
                  onChange={(e) => setCycle(Number(e.target.value))}
                  min={1}
                  className="input input-bordered text-base-content/80 mb-2 w-full p-4 rounded-btn bg-base-200 placeholder:text-xs"
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">Last Period Start Date</label>
              <input
                type="date"
                value={lastDate}
                onChange={(e) => setLastDate(e.target.value)}
                className="input input-bordered text-base-content/80 mb-2 w-full p-4 rounded-btn bg-base-200 placeholder:text-xs"
              />
            </div>

            <button
              onClick={handleSave}
              className="btn btn-primary text-white border-none text-sm my-4 w-full"
            >
              Save & Go Back
            </button>
          </div>
        </div>
      </PageSection>

    </div>
  );
}
