import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import GoBack from "../../components/gobackSecond";
import moment from "moment";
import Link from "next/link";
import { IoPencil } from "react-icons/io5";

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

  const getPeriodInfo = () => {
    const today = moment();
    const lastPeriodDate = moment(data?.last_period_date);
    const cycleLength = data?.cycle_length;

    if (!lastPeriodDate.isValid() || !cycleLength) {
      return {
        daysLeft: null,
        expectedDate: null,
        nextThreePeriods: [],
        text: 'Insufficient data to calculate period'
      };
    }

    // Calculate the next period date
    const nextPeriodDate = lastPeriodDate.clone().add(cycleLength, "days");
    const daysLeft = nextPeriodDate.diff(today, "days");

    // Prepare the text
    let text = "";
    if (daysLeft <= 0) {
      text = "Next Period Is Expected Today";
    } else if (daysLeft === 1) {
      text = "Next Period Is Expected Tomorrow";
    } else {
      text = `Next Period Is Expected In ${daysLeft} days`;
    }

    // Generate the next 3 expected period dates
    const nextThreePeriods = [];
    for (let i = 0; i < 4; i++) {
      const futureDate = lastPeriodDate.clone().add(cycleLength * (i + 1), "days");
      nextThreePeriods.push(futureDate.format("MMM Do YY"));
    }

    return {
      daysLeft,
      expectedDate: nextPeriodDate.isSameOrBefore(today, 'day')
        ? today.format("MMM Do YY")
        : nextPeriodDate.format("MMM Do YY"),
      nextThreePeriods,
      text,
      lastPeriodDate
    };
  };


  return (
    <div className="bg-[#ffffff] min-h-screen relative">
      <div className='bg-[#514cff] px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[120px]'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[32px] z-[1000]'>
          <GoBack />
        </div>
        <span className='text-white z-[2000] font-poppinsBold text-[18px]'>Period Details</span>
        <Link href="/periods/update" className='text-white font-poppinsBold text-[18px] bg-[#ffffff4d] 
        h-[30px] w-[30px] rounded-full flex items-center justify-center absolute right-[32px] z-[1000]'>
          <IoPencil className="text-white text-[14px]" /></Link>
      </div>
      <div className="w-full text-center pb-[200px]">
        {loading ? <div className="flex items-center justify-center min-h-[50vh]">
          <span className="loading loading-spinner loading-lg text-[#524cff5a]"></span>
        </div> :
          data && nextDate ? (
            <div className="flex items-center justify-center flex-col mt-8">
              <div className="mb-6 shadow-xl h-[200px] w-[200px] bg-white flex items-center justify-center flex-col rounded-full">
                <div className="text-black/60 font-poppins text-[18px] mb-1 mt-8">
                  {getPhaseDetails()?.phase}
                </div>

                <div className="flex flex-col">
                  <div className="text-black/80 text-[12px] mb-[-8px]">Day</div>
                  <div className="text-black/80 text-[48px] font-poppinsMed">{getPhaseDetails()?.daysSinceLastPeriod}</div>
                </div>
              </div>

              <div>
                <div className="text-black/80 text-[14px] mb-1">{getPeriodInfo()?.text}</div>
                <div className="text-blue-500 font-poppinsMed text-[14px] mb-4">{getPeriodInfo()?.expectedDate}</div>
              </div>
              <div className="h-[1px] bg-[#cccccc4c] w-full my-3" />
              <div className="text-black mb-3 text-[14px]">Last Period</div>
              <div className="text-green-800 bg-green-200 px-6 py-1 rounded-md mb-2 text-[12px]">{getPeriodInfo()?.lastPeriodDate?.format("MMM Do YY")}</div>
              <div className="h-[1px] bg-[#cccccc4c] w-full my-3" />
              <div className="text-black mb-3 text-[14px]">Upcoming Periods</div>
              {getPeriodInfo()?.nextThreePeriods?.map((item, index) => (
                <div key={index} className="text-green-800 bg-green-200 px-6 py-1 rounded-md mb-2 text-[12px]">{item}</div>
              ))}
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