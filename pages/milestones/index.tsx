import CommonHeader from '@/components/commonHeader';
import React, { useState } from 'react';
import { FiPlus, FiMinus } from "react-icons/fi";

const Milestones = () => {
    const initialTasks = [
        { title: "Drink Water", total: 3, current: 0, color: '2747c9', unit: "litres" },
        { title: "Prayers", total: 5, current: 0, color: '00b894', unit: "times" },
        { title: "Bath", total: 2, current: 0, color: 'd63031', unit: "times" },
        { title: "Exercise", total: 30, current: 0, color: 'fdcb6e', unit: "mins" },
    ];

    const [tasks, setTasks] = useState(initialTasks);

    const handleUpdate = (index : any, type : any) => {
        setTasks(prev => {
            return prev.map((task, i) => {
                if (i === index) {
                    const updated = { ...task };
                    if (type === 'inc' && updated.current < updated.total) updated.current += 1;
                    if (type === 'dec' && updated.current > 0) updated.current -= 1;
                    return updated;
                }
                return task;
            });
        });
    };

    const totalProgress = Math.floor(
        tasks.reduce((sum, t) => sum + t.current / t.total, 0) / tasks.length * 100
    );

    return (
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <CommonHeader title='MILESTONES' />
            <div className='px-4 pt-8 pb-[150px]'>
                <div className='flex items-center justify-center mb-6'>
                    <div className="flex-1">
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${totalProgress}%` }} />
                        </div>
                    </div>
                    <span className='text-[10px] text-black/70 ml-2'>{totalProgress}%</span>
                </div>

                {tasks.map((item, idx) => (
                    <div key={item.title} className='flex items-center justify-between bg-white shadow-sm mb-3 px-4 py-3 rounded-xl'>
                        <div className='flex items-center space-x-3'>
                            <button
                                onClick={() => handleUpdate(idx, 'dec')}
                            >
                                <FiMinus size={14} style={{ color: `#${item.color}` }} />
                            </button>
                            <div className='text-black/70 text-[12px]'>{item.title}</div>
                        </div>

                        <div className='flex items-center space-x-3'>
                            <div className='text-right'>
                                <div>
                                    <span className='text-[12px] font-medium' style={{ color: `#${item.color}` }}>
                                        {item.current}
                                    </span>
                                    <span className='text-[12px] opacity-50' style={{ color: `#${item.color}` }}>
                                        /{item.total}
                                    </span>
                                </div>
                                <div className='text-[10px] text-black/50'>{item.unit}</div>
                            </div>
                            <button
                                onClick={() => handleUpdate(idx, 'inc')}
                            >
                                <FiPlus size={14} style={{ color: `#${item.color}` }} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Milestones;