import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full">
        <h1 className="text-xl font-semibold text-pink-700 text-center mb-4">🔧 Update Period Info</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-pink-900 mb-1">Cycle Length (days)</label>
            <input
              type="number"
              value={cycle}
              onChange={(e) => setCycle(Number(e.target.value))}
              min={1}
              className="w-full bg-white text-black border border-pink-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pink-900 mb-1">Last Period Start Date</label>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
              className="w-full bg-white text-black border border-pink-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-pink-400"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-600"
          >
            💾 Save & Go Back
          </button>
        </div>
      </div>
    </div>
  );
}