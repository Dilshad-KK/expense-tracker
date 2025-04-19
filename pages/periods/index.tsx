import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { MdWaterDrop } from "react-icons/md";

type PeriodData = {
  id: string;
  last_period_date: string;
  cycle_length: number;
};

export default function HomePage() {
  const [data, setData] = useState<PeriodData | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [today, setToday] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const todayStr = new Date().toISOString().split("T")[0];
      setToday(todayStr);

      const res = await fetch("/api/periods");
      const json = await res.json();
      if (json?.length > 0) {
        const latest = json[0];
        setData(latest);

        const next = new Date(latest.last_period_date);
        next.setDate(next.getDate() + latest.cycle_length);
        setNextDate(next.toISOString().split("T")[0]);
      }
    };

    fetchData();
  }, []);

  const handleConfirmStart = async () => {
    if (!data) return;

    const res = await fetch(`/api/periods?id=${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        last_period_date: today,
        cycle_length: data.cycle_length,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setData(updated[0]);
      const next = new Date(today);
      next.setDate(next.getDate() + data.cycle_length);
      setNextDate(next.toISOString().split("T")[0]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pink-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full text-center">
        <h1 className="text-xl font-semibold text-pink-700 mb-4">💖 Period Tracker</h1>

        {data && nextDate ? (
          <>
            <p className="text-lg mb-2 text-pink-800">
              🩸 Your next period is expected on <span className="font-bold">{nextDate}</span>
            </p>

            <button
              onClick={() => router.push("/periods/update")}
              className="mt-4 w-full bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition"
            >
              ✏️ Update Details
            </button>

            {nextDate === today && (
              <button
                onClick={handleConfirmStart}
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
              >
                ✅ Period Started Today
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-pink-700 text-lg mb-4">No period data found.</p>
            <button
              onClick={() => router.push("/periods/update")}
              className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600"
            >
              Add Period Info
            </button>
          </>
        )}
      </div>
    </div>
  );
}