import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CommonHeader from "@/components/commonHeader";
import moment from "moment";
import Link from "next/link";
import { IoPencil } from "react-icons/io5";
import { HiSparkles, HiCalendar, HiClock, HiCake } from "react-icons/hi2";

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

  const getPhaseDetails = () => {
    if (!data?.last_period_date || !data?.cycle_length) return null;

    const today = moment();
    const lastPeriod = moment(data.last_period_date);
    const cycleLength = data.cycle_length;

    const daysSinceLastPeriod = today.diff(lastPeriod, "days");
    const currentDayInCycle = ((daysSinceLastPeriod % cycleLength) + cycleLength) % cycleLength;

    let phase = "";
    let phaseColor = "";
    let phaseDescription = "";

    if (currentDayInCycle >= 0 && currentDayInCycle <= 5) {
      phase = "Menstruation";
      phaseColor = "text-error";
      phaseDescription = "Your period phase";
    } else if (currentDayInCycle >= 6 && currentDayInCycle <= 13) {
      phase = "Follicular";
      phaseColor = "text-info";
      phaseDescription = "Pre-ovulation phase";
    } else if (currentDayInCycle >= 14 && currentDayInCycle <= 16) {
      phase = "Ovulation";
      phaseColor = "text-warning";
      phaseDescription = "Fertile window";
    } else {
      phase = "Luteal";
      phaseColor = "text-success";
      phaseDescription = "Post-ovulation phase";
    }

    return {
      phase,
      phaseColor,
      phaseDescription,
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

    const nextPeriodDate = lastPeriodDate.clone().add(cycleLength, "days");
    const daysLeft = nextPeriodDate.diff(today, "days");

    let text = "";
    let alertType = "bg-info/10 border-info/20 text-info";
    
    if (daysLeft <= 0) {
      text = "Expected Today";
      alertType = "bg-warning/10 border-warning/20 text-warning";
    } else if (daysLeft === 1) {
      text = "Expected Tomorrow";
      alertType = "bg-warning/10 border-warning/20 text-warning";
    } else if (daysLeft <= 3) {
      text = `In ${daysLeft} days`;
      alertType = "bg-warning/10 border-warning/20 text-warning";
    } else {
      text = `In ${daysLeft} days`;
      alertType = "bg-success/10 border-success/20 text-success";
    }

    const nextThreePeriods: any[] = [];
    const nextPeriodDateMoment = nextPeriodDate.clone();
    for (let i = 0; i < 6; i++) {
      const futureDate = nextPeriodDateMoment.clone().add(cycleLength * i, "days");
      nextThreePeriods.push(futureDate);
    }

    return {
      daysLeft,
      expectedDate: nextPeriodDate.isSameOrBefore(today, 'day')
        ? today.format("MMM Do YY")
        : nextPeriodDate.format("MMM Do YY"),
      nextThreePeriods,
      text,
      lastPeriodDate,
      alertType
    };
  };

  const phaseDetails = getPhaseDetails();
  const periodInfo = getPeriodInfo();

  return (
    <div className="bg-base-100 min-h-screen relative">
      <CommonHeader
        title="Period Details"
        right={(
          <Link href="/periods/update" className='text-primary-content font-poppinsBold text-[16px] bg-primary-content/20 h-[32px] w-[32px] rounded-full flex items-center justify-center transition-all hover:bg-primary-content/30 hover:scale-105'>
            <IoPencil className="text-primary-content text-[14px]" />
          </Link>
        )}
      />

      {/* Compact Main Content */}
      <div className="w-full pb-6 px-4 -mt-4 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <span className="loading loading-spinner loading-lg text-primary/60"></span>
          </div>
        ) : data && nextDate ? (
          <div className="max-w-md mx-auto space-y-4">
            {/* Current Cycle Compact Card */}
            <div className="bg-base-200 rounded-xl p-4 shadow-md border border-base-300 dark:border-base-400">
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-base-100 rounded-lg p-2 text-center border-2 border-base-300 dark:border-base-400">
                  <div className="text-[9px] text-base-content/60 font-poppinsMed uppercase tracking-wide mb-1">Cycle</div>
                  <div className="text-[14px] text-base-content font-poppinsBold flex items-center justify-center">
                    <HiClock className="mr-1 text-primary/70 text-xs" />
                    {data?.cycle_length}
                  </div>
                </div>
                
                <div className="bg-base-100 rounded-lg p-2 text-center border-2 border-base-300 dark:border-base-400">
                  <div className="text-[9px] text-base-content/60 font-poppinsMed uppercase tracking-wide mb-1">Day</div>
                  <div className="text-[14px] text-base-content font-poppinsBold">
                    {(phaseDetails?.currentDayInCycle ?? 0) + 1}
                  </div>
                </div>
                
                <div className="bg-base-100 rounded-lg p-2 text-center border-2 border-base-300 dark:border-base-400">
                  <div className="text-[9px] text-base-content/60 font-poppinsMed uppercase tracking-wide mb-1">Phase</div>
                  <div className={`text-[12px] font-poppinsBold ${phaseDetails?.phaseColor}`}>
                    {phaseDetails?.phase}
                  </div>
                </div>
              </div>
              
              {phaseDetails?.phaseDescription && (
                <div className="text-center">
                  <span className="text-base-content/70 text-[10px] font-poppins">
                    {phaseDetails.phaseDescription}
                  </span>
                </div>
              )}
            </div>

            {/* Upcoming Periods - Larger and More Readable */}
            <div className="bg-base-200 rounded-xl p-4 shadow-md border border-base-300 dark:border-base-400">
              <h2 className="text-base-content font-poppinsBold text-[14px] mb-3 flex items-center">
                Upcoming Periods
              </h2>
              
              <div className="grid grid-cols-3 gap-3">
                {periodInfo.nextThreePeriods?.map((item, index) => (
                  <div 
                    key={index}
                    className="bg-base-100 rounded-xl p-3 text-center border-2 border-base-300 dark:border-base-400 transition-all hover:shadow-md hover:border-primary/40 hover:scale-105"
                  >
                    <div className="text-base-content/90 text-[16px] font-poppinsBold mb-1">
                      {moment(item).format("DD")}
                    </div>
                    <div className="text-base-content/70 text-[11px] uppercase font-poppinsMed tracking-wide mb-1">
                      {moment(item).format("MMM")}
                    </div>
                    <div className="text-base-content/50 text-[9px] font-poppins">
                      {moment(item).format("YYYY")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compact Single Row Notifications */}
            <div className="grid grid-cols-2 gap-2">
              <div className={`rounded-lg border-2 py-2 px-3 text-[11px] font-poppinsMed flex items-center justify-center ${periodInfo.alertType}`}>
                <HiSparkles className="text-xs mr-1" />
                <span>{periodInfo.text}</span>
              </div>
              
              <div className="bg-base-200 border-2 border-base-300 dark:border-base-400 rounded-lg py-2 px-3 text-[11px] font-poppinsMed flex items-center justify-center text-base-content">
                <HiSparkles className="text-xs mr-1" />
                <span>Last: {periodInfo.lastPeriodDate?.format("MMM Do")}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-md mx-auto mt-6">
            <div className="bg-base-200 rounded-xl p-6 shadow-md border border-base-300 dark:border-base-400">
              <HiCalendar className="text-3xl text-base-content/40 mx-auto mb-3" />
              <p className="text-base-content text-base mb-3 font-poppinsMed">No period data found</p>
              <button
                onClick={() => router.push("/periods/update")}
                className="btn btn-primary btn-sm w-full rounded-lg font-poppinsMed text-sm"
              >
                Add Period Info
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}