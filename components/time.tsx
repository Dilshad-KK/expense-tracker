import { useEffect, useState } from "react";
import moment from "moment";

export default function Clock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(moment().format("MMMM Do YYYY, h:mm:ss A"));
    };

    updateTime(); // Run immediately
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!currentTime) return null; // Avoid rendering anything until mounted

  return (
    <span className='text-[#ffffffee] z-[2000] font-poppinsMed text-[12px] mb-2'>
      {currentTime}
    </span>
  );
}