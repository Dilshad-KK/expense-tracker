import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import GoBack from "../../components/gobackSecond";
import moment from "moment";

type PeriodData = {
  id: string;
  last_period_date: string;
  cycle_length: number;
};

export default function HomePage() {
  const [data, setData] = useState<PeriodData | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [today, setToday] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const todayStr = new Date().toISOString().split("T")[0];
      setToday(todayStr);

      const res = await fetch("/api/periods");
      const json = await res.json();
      if (json?.length > 0) {
        const latest = json[0];
        setData(latest);
        setLoading(false);
        const next = new Date(latest.last_period_date);
        next.setDate(next.getDate() + latest.cycle_length);
        setNextDate(next.toISOString().split("T")[0]);
      }
    };

    fetchData();
  }, []);

  // const handleConfirmStart = async () => {
  //   if (!data) return;
  //   setLoading(true);
  //   const res = await fetch(`/api/periods?id=${data.id}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       last_period_date: today,
  //       cycle_length: data.cycle_length,
  //     }),
  //   });

  //   if (res.ok) {
  //     const updated = await res.json();
  //     setData(updated[0]);
  //     const next = new Date(today);
  //     next.setDate(next.getDate() + data.cycle_length);
  //     setNextDate(next.toISOString().split("T")[0]);
  //     setLoading(false);
  //   }
  //   setLoading(false);
  // };

  const getPhaseDetails = () => {
    if (!data?.last_period_date || !data?.cycle_length) return null;

    const today = moment();
    const lastPeriod = moment(data.last_period_date);
    const cycleLength = data.cycle_length;

    const daysSinceLastPeriod = today.diff(lastPeriod, "days");
    const currentDayInCycle = daysSinceLastPeriod % cycleLength;

    let phase = "";

    if (currentDayInCycle >= 0 && currentDayInCycle <= 5) {
      phase = "Menstrual Phase";
    } else if (currentDayInCycle >= 6 && currentDayInCycle <= 13) {
      phase = "Follicular Phase";
    } else if (currentDayInCycle >= 14 && currentDayInCycle <= 16) {
      phase = "Ovulation Phase";
    } else {
      phase = "Luteal Phase";
    }

    return {
      phase,
      currentDayInCycle,
      daysSinceLastPeriod,
    };
  };

  const getPeriodDays = () => {
    const today = moment();
    const nextPeriodDate = moment(data?.last_period_date).add(data?.cycle_length, "days");
    const daysLeft = nextPeriodDate.diff(today, "days");
    return daysLeft
  }

  return (
    <div className="bg-[#ffffff] min-h-screen relative">
      <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[120px]'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[32px] z-[1000]'>
          <GoBack />
        </div>
        <span className='text-white z-[2000] font-poppinsBold text-[18px]'>Period Details</span>
      </div>
      <div className="w-full text-center">
        {loading ? 'loading' :
          data && nextDate ? (
            <div className="flex items-center justify-center flex-col mt-16">
              <div className="mb-16 shadow-xl h-[300px] w-[300px] bg-white flex items-center justify-center flex-col rounded-full">
                <div className="text-black/70 font-poppins text-[24px] mb-3">
                  {getPhaseDetails()?.phase}
                </div>

                <div className="flex flex-col">
                  <div className="text-black/80 text-[12px] mb-[-8px]">Day</div>
                  <div className="text-black/80 text-[48px] font-poppinsMed">{getPhaseDetails()?.daysSinceLastPeriod}</div>
                </div>
              </div>

              <div>
                <div className="text-black/80">Next Period Expected In {getPeriodDays()} days</div>
                <button
                  onClick={() => router.push("/periods/update")}
                  className="mt-4 w-full bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition"
                >
                  ✏️ Update Details
                </button>
              </div>
              {/* <p className="text-lg mb-2 text-pink-800">
                🩸 Your next period is expected on <span className="font-bold">{nextDate}</span>
                {getPhaseDetails()?.phase}
              </p> */}

              {/* <button
                onClick={() => router.push("/periods/update")}
                className="mt-4 w-full bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-500 transition"
              >
                ✏️ Update Details
              </button> */}

              {/* {nextDate === today && (
                <button
                  onClick={handleConfirmStart}
                  className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  ✅ Period Started Today
                </button>
              )} */}
            </div>
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
          )
        }
      </div>
    </div>
  );
}