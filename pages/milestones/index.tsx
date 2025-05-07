import CommonHeader from '@/components/commonHeader';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiMinus } from "react-icons/fi";
import Link from 'next/link';
import { FaPlus } from "react-icons/fa6";
import moment from 'moment';

interface Habits {
    id: string,
    title: string,
    unit: string,
    total: number;
    user_id: string,
}

interface HabitLogs {
    id: string,
    habit_id: string,
    log_date: string,
    value: number;
    user_id: string,
}

interface Tasks extends Habits {
    current: number
}

const Milestones = () => {

    const [tasks, setTasks] = useState<Tasks[]>([]);
    const [loading, setLoading] = useState(false);
    const [habits, setHabits] = useState<Habits[]>([]);
    const [habitLogs, setHabitLogs] = useState<HabitLogs[]>([]);
    const [active, setActive] = useState("");
    const [options, setOptions] = useState<string[]>([])
    const [user, setUser] = useState("");
    const [date,setDate] = useState(moment().format('YYYY-MM-DD'));


    useEffect(() => {
        const cachedUser = localStorage.getItem("userIdentity");

        if (cachedUser) {
            if (cachedUser === "Dilshad") {
                setActive("Dilshad");
                setOptions(["Dilshad", "Shifa Dilshad"])
            } else {
                setActive("Shifa Dilshad");
                setOptions(["Shifa Dilshad", "Dilshad"])
            }
            setUser(cachedUser);
            fetchHabits(cachedUser);
            fetchHabitLogs(cachedUser);
            return;
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let user = "";
        if (timezone.includes("Asia/Dubai")) {
            user = "Dilshad";
            setActive("Dilshad");
            setOptions(["Dilshad", "Shifa Dilshad"])
        } else {
            user = "Shifa Dilshad";
            setActive("Shifa Dilshad");
            setOptions(["Shifa Dilshad", "Dilshad"])
        }
        setUser(user);
        localStorage.setItem("userIdentity", user);
        fetchHabits(user);
        fetchHabitLogs(user);
    }, []);

    const colors = [
        "2747c9", "00b894", "d63031", "fdcb6e"
    ]

    const totalProgress = Math.floor(
        habits.reduce((sum, t) => {
            const log = habitLogs?.find(item => item?.habit_id === t.id);
            const value = log?.value ?? 0; // use 0 if no log found
            return sum + value / t.total;
        }, 0) / habits.length * 100
    );

    const getLogValue = (id: string) => {
        return habitLogs?.filter(item => item?.habit_id === id)[0]?.value ? habitLogs?.filter(item => item?.habit_id === id)[0]?.value : 0
    }

    async function fetchHabits(option: string) {
        setLoading(true);
        try {

            const res = await fetch(`/api/milestones?user_id=${option}`);
            const data: Habits[] = await res.json();
            setHabits(data);
        } catch (error) {
            console.error("Error fetching Habits:", error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchHabitLogs(option: string) {
        setLoading(true);
        try {
            const logs = await fetch(`/api/habitlogs?user_id=${option}&&date=${moment().format('YYYY-MM-DD')}`);
            const logData: HabitLogs[] = await logs.json();
            setHabitLogs(logData);

        } catch (error) {
            console.error("Error fetching Habit Logs:", error);
        } finally {
            setLoading(false);
        }
    }

    async function logHabit(habit_id: string, op: string, total: number) {
        setLoading(true);
        let value = habitLogs?.filter(item => item?.habit_id === habit_id)[0]?.value || 0;
        if (op === 'inc') {
            if (total > 10) {
                if (value + 10 > total) {
                    value = total
                }
                else {
                    value += 10
                }
            }
            else if (total > 5) {
                if (value + 5 > total) {
                    value = total
                }
                else {
                    value += 5
                }
            }
            else {
                if (value + 1 > total) {
                    value = total
                }
                else {
                    value += 1
                }
            }

        }
        else {
            if (total > 10) {
                if (value - 10 < 0) {
                    value = 0
                }
                else {
                    value -= 10
                }
            }
            else if (total > 5) {
                if (value - 5 < 0) {
                    value = 0
                }
                else {
                    value -= 5
                }
            }
            else {
                if (value - 1 < 0) {
                    value = 0
                }
                else {
                    value -= 1
                }
            }
        }

        const response = await fetch("/api/habitlogs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ habit_id, value, user_id: active })
        });

        const data = await response.json();
        console.log(data?.data);
        if (data?.data?.length) {
            fetchHabitLogs(active);
        }
        setLoading(false)
    }

    const handleFilter = (option: string) => {
        setActive(option)
        fetchHabits(option)
        fetchHabitLogs(option)
    }

    return (
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <CommonHeader title='MILESTONES' />
            <div className="flex justify-center items-center w-full  mt-8">
                {options?.length ? options?.map((option: string) => (
                    <div className={`${option === active ? 'bg-[#514cff] text-white' : 'bg-[#ffffff91] text-black/80 border border-solid border-[#d3e2f9]'} mx-2  py-2 px-4 rounded-[8px] text-[12px] `}
                        onClick={() => { handleFilter(option) }}>{option}</div>
                )) : null}
            </div>
            <div className='px-4 pt-8 pb-[200px]'>
                {totalProgress >= 0 ? <div className='flex items-center justify-center mb-6'>
                    <div className="flex-1">
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${totalProgress}%` }} />
                        </div>
                    </div>
                    <span className='text-[10px] text-black/70 ml-2'>{totalProgress}%</span>
                </div> : null}

                {habits.map((item, idx) => (
                    <div className='relative shadow-sm mb-3  h-[60px]'>
                        <div key={item.title} className='flex absolute px-4 py-3 rounded-xl bg-white inset-0 items-center justify-between z-[100]'>
                            <div className='flex items-center space-x-3'>
                                <button
                                    onClick={() => logHabit(item?.id, 'dec', item?.total)}
                                >
                                    <FiMinus size={14} style={{ color: `#${colors[idx % colors?.length]}` }} />
                                </button>
                                <div className='text-black/70 text-[12px]'>{item.title}</div>
                            </div>

                            <div className='flex items-center space-x-3'>
                                <div className='text-right'>
                                    <div>
                                        <span className='text-[12px] font-medium' style={{ color: `#${colors[idx % colors?.length]}` }}>
                                            {getLogValue(item?.id)}
                                        </span>
                                        <span className='text-[12px] opacity-50' style={{ color: `#${colors[idx % colors?.length]}` }}>
                                            /{item.total}
                                        </span>
                                    </div>
                                    <div className='text-[10px] text-black/50'>{item.unit}</div>
                                </div>
                                <button
                                    onClick={() => logHabit(item?.id, 'inc', item?.total)}
                                >
                                    <FiPlus size={14} style={{ color: `#${colors[idx % colors?.length]}` }} />
                                </button>
                            </div>
                        </div>
                        <div className='absolute bottom-[-3px] right-0 left-0 rounded-xl  opacity-[70%] h-[50px] z-[99]'
                            style={{ backgroundColor: `#${colors[idx % colors?.length]}`, width: `${getLogValue(item?.id) / item?.total * 100}%` }}></div>
                    </div>

                ))}
            </div>
            <Link href={"/milestones/newitem"} className='fixed z-[2000] right-8 bottom-28 bg-[#514cff] h-[50px] w-[50px] rounded-full flex items-center justify-center cursor-pointer'>
                <FaPlus className='text-white text-base' />
            </Link>
        </div>
    );
};

export default Milestones;