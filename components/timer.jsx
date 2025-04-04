import React, { useState, useEffect } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const minuteSeconds = 60;
const hourSeconds = 3600;
const daySeconds = 86400;

const timerProps = {
    isPlaying: true,
    size: 100,
    strokeWidth: 6
};

// Function to format remaining time
const renderTime = (dimension, time) => (
    <div className="flex flex-col items-center text-sm font-medium">
        <div className="text-[12px]">{String(time).padStart(2, "0")}</div>
        <div className="text-[11px]">{dimension}</div>
    </div>
);

// Convert remaining time to days, hours, minutes, seconds
const getTimeUnits = (time) => ({
    days: Math.floor(time / daySeconds),
    hours: Math.floor((time % daySeconds) / hourSeconds),
    minutes: Math.floor((time % hourSeconds) / minuteSeconds),
    seconds: Math.floor(time % 60)
});

export default function CountdownTimer() {
    const [remainingTime, setRemainingTime] = useState(null);
    const [isClient, setIsClient] = useState(false);  // Track if rendered on client

    // Only execute on the client side
    useEffect(() => {
        setIsClient(true);  // After component mounts, set client-side
    }, []);

    useEffect(() => {
        if (isClient) {
            const targetDate = Math.floor(new Date("2025-06-13T00:00:00").getTime() / 1000);
            setRemainingTime(targetDate - Math.floor(Date.now() / 1000));

            const interval = setInterval(() => {
                setRemainingTime((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isClient]);

    if (!isClient || remainingTime === null) return null; // Prevent rendering on SSR or before state is initialized

    const { days, hours, minutes, seconds } = getTimeUnits(remainingTime);

    return (
        <div className="flex gap-4 mb-16">
            <CountdownCircleTimer
                key={remainingTime}
                {...timerProps}
                duration={daySeconds * days}
                initialRemainingTime={remainingTime}
                colors={["#3B82F6", "#FACC15", "#EF4444", "#EF4444"]}
                colorsTime={[daySeconds * days, daySeconds * 0.75, daySeconds * 0.5, 0]}
                size={75}
            >
                {() => renderTime("Days", days)}
            </CountdownCircleTimer>

            <CountdownCircleTimer
                key={`hours-${remainingTime}`}
                {...timerProps}
                duration={daySeconds}
                initialRemainingTime={remainingTime % daySeconds}
                colors={["#3B82F6", "#FACC15", "#EF4444", "#EF4444"]}
                colorsTime={[daySeconds, daySeconds * 0.75, daySeconds * 0.5, 0]}
                size={75}
            >
                {() => renderTime("Hours", hours)}
            </CountdownCircleTimer>

            <CountdownCircleTimer
                key={`minutes-${remainingTime}`}
                {...timerProps}
                duration={hourSeconds}
                initialRemainingTime={remainingTime % hourSeconds}
                colors={["#3B82F6", "#FACC15", "#EF4444", "#EF4444"]}
                colorsTime={[hourSeconds, hourSeconds * 0.75, hourSeconds * 0.5, 0]}
                size={75}
            >
                {() => renderTime("Minutes", minutes)}
            </CountdownCircleTimer>

            <CountdownCircleTimer
                key={`seconds-${remainingTime}`}
                {...timerProps}
                duration={minuteSeconds}
                initialRemainingTime={remainingTime % minuteSeconds}
                colors={["#3B82F6", "#FACC15", "#EF4444", "#EF4444"]}
                colorsTime={[minuteSeconds, minuteSeconds * 0.75, minuteSeconds * 0.5, 0]}
                size={75}
            >
                {() => renderTime("Seconds", seconds)}
            </CountdownCircleTimer>
        </div>
    );
}
