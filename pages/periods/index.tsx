import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import GoBack from "../../components/gobackSecond";
import moment from "moment";
import Link from "next/link";
import { IoPencil } from "react-icons/io5";
import { HiSparkles } from "react-icons/hi2";

type PeriodData = {
  id: string;
  last_period_date: string;
  cycle_length: number;
};

export default function HomePage() {
  const [data, setData] = useState<PeriodData | null>(null);
  const [nextDate, setNextDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      phase = "Menstruation";
    } else if (currentDayInCycle >= 6 && currentDayInCycle <= 13) {
      phase = "Follicular";
    } else if (currentDayInCycle >= 14 && currentDayInCycle <= 16) {
      phase = "Ovulation";
    } else {
      phase = "Luteal";
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
      nextThreePeriods.push(futureDate);
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
            <div className="flex items-center justify-center flex-col mt-16">
              <div className="mb-2 flex">
                <div className="flex flex-col bg-[#edf9f9] px-4 py-2 rounded-md items-start justify-center border-[1px] border-solid border-[#9ebfbf6f] mr-2">
                  <div className="text-[12px] text-[#177777] font-poppinsMed">Cycle Length</div>
                  <div className="text-[16px] text-[#177777] font-poppinsMed"> {data?.cycle_length}</div>
                </div>
                <div className="flex flex-col bg-[#e3fcec65] px-4 py-2 rounded-md items-start justify-center border-[1px] border-solid border-[#adf4c6] mr-2">
                  <div className="text-[12px] text-[#166534] font-poppins">Phase</div>
                  <div className="text-[14px] text-[#166534] font-poppinsMed"> {getPhaseDetails()?.phase}</div>
                </div>
                <div className="flex flex-col bg-[#fefdf7] px-4 py-2 rounded-md items-start justify-center border-[1px] border-solid border-[#f8e3b3]">
                  <div className="text-[12px] text-[#f8bf2d] font-poppinsMed">Day</div>
                  <div className="text-[16px] text-[#8a6a17] font-poppinsMed"> {getPhaseDetails()?.daysSinceLastPeriod}</div>
                </div>
              </div>

              <div className="h-[1px] bg-[#cccccc4c] w-full my-8" />

              <div className="text-black text-[14px] font-poppinsMed mb-4">Upcoming Periods</div>
              <div className="flex justify-between w-[300px] mb-4">
                {getPeriodInfo()?.nextThreePeriods?.map((item, index) => (
                  <div className='bg-[#a5a5fe2d] rounded-[12px] h-[60px] w-[60px] flex items-center justify-center flex-col' key={index}>
                    <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(item).format("DD")}</span>
                    <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(item).format("MMM")}</span>
                    <span className='text-black/80 text-[8px] uppercase font-poppinsMed'>{moment(item).format("YYYY")}</span>
                  </div>
                ))}
              </div>
              <div className="h-[1px] bg-[#cccccc4c] w-full my-8" />
              <div className="text-green-800 w-[340px] bg-[#d9fae4] py-4 px-8 text-[14px] mb-2 rounded-md border-[1px] border-solid border-[#adf4c6] flex items-center justify-center">
                <HiSparkles className="mr-2 text-[16px]" />
                {getPeriodInfo()?.text}
              </div>
              <div className="text-[#ad219a] w-[340px] bg-[#fcf4fb] py-4 px-8 text-[14px] mb-1 rounded-md border-[1px] border-solid border-[#fed9f9] flex items-center justify-center">
                <HiSparkles className="mr-2 text-[16px]" />
                Last period was on {getPeriodInfo()?.lastPeriodDate?.format("MMM Do YY")}
              </div>
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