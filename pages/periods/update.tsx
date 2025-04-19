import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import GoBack from "../../components/gobackSecond";

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
    <div className="bg-[#ffffff] min-h-screen relative">
      <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[120px]'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[32px] z-[1000]'>
          <GoBack />
        </div>
        <span className='text-white z-[2000] font-poppinsBold text-[18px]'>Update Period Details</span>
      </div>
      <div className="flex items-center justify-center h-full pt-24">
        <div className="bg-white shadow-xl rounded-2xl p-6 max-w-md w-full">
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

    </div>
  );
}