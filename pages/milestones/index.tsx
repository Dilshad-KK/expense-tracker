import CommonHeader from '@/components/commonHeader'
import React from 'react';
import { FiPlus } from "react-icons/fi";
import { FiMinus } from "react-icons/fi";

const Milestones = () => {
    const TaskItems = [
        { logo: "", title: "Drink Water", desc: "", total: 3, current: 0, color: '2747c9', unit: "litres" },
        { logo: "", title: "Prayers", desc: "", total: 5, current: 0, color: '00b894', unit: "times" },
        { logo: "", title: "Bath", desc: "", total: 2, current: 0, color: 'd63031', unit: "times" },
        { logo: "", title: "Exercise", desc: "", total: 30, current: 0, color: 'fdcb6e', unit: "mins" },
    ]
    return (
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <CommonHeader title='MILESTONES' />
            <div className='px-4 pt-8 pb-[150px]'>
                {/* <div className='flex items-center justify-center mb-8'>
                    <div className='mx-2 text-[12px] bg-[#f1f3fc21] border border-solid border-[#bdc9fa] px-3 py-[6px] rounded-[18px] text-black/70'>THIS WEEK</div>
                    <div className='mx-2 text-[12px] bg-[#2747c9] border border-solid border-[#bdc9fa] px-3 py-[6px] rounded-[18px] text-[#f1f3fc] font-poppinsMed'>TODAY</div>
                    <div className='mx-2 text-[12px] bg-[#f1f3fc21] border border-solid border-[#bdc9fa] px-3 py-[6px] rounded-[18px] text-black/70'>THIS MONTH</div>
                </div> */}
                <div className='flex items-center justify-center mb-4'>
                    <progress className="progress progress-success w-100 bg-white mr-2" value="70" max="100"></progress>
                    <span className='text-[10px] text-black/70'>60%</span>
                </div>
                {
                    TaskItems?.map((item) => (
                        <div className='flex items-center justify-between bg-[#fffffffa] mb-2 px-3 py-2 rounded-[12px]'>
                            <div className='flex items-center'> 
                                <div>
                                    <FiMinus className='' style={{ color: `#${item?.color}` }} />
                                </div>
                                <div className='text-black/60 text-[12px] ml-3'>{item?.title}</div>
                            </div>
                            <div className='flex items-center'>
                                <div className='flex flex-col items-end mr-3'>
                                    <div>
                                        <span className='text-[12px]' style={{ color: `#${item.color}` }}>{item?.current}/</span>
                                        <span className='text-[12px] opacity-70' style={{ color: `#${item.color}` }}>{item?.total}</span>
                                    </div>
                                    <div className='text-[10px]'>{item?.unit}</div>
                                </div>
                                <div>
                                    <FiPlus className='' style={{ color: `#${item?.color}` }} />
                                </div>
                            </div>


                        </div>
                    ))
                }
            </div>


            {/* Goal
            --------------------------------------------
            Create a habit tracker with built-in:

            ⚠️ Reminders when habits are missed

            💬 Positive reinforcement for consistent behavior

            🎯 Suggestions to gradually build habits

            --------------------------------------------------------------------------------------------
            
            Example Encouragement Messages
            --------------------------------------------
            ✅ Praise	“Great job on praying all 5 today! Keep it up.”
            ⚠️ Reminder	“You haven’t logged Quran reading for 2 days, would you like a nudge?”
            🌙 Spiritual	“Tahajjud builds quietly. You’ve logged 1 this week, go for one more?”
            🛑 Warning	“You skipped your screen detox. Try a 10-minute offline break now.”
            ✨ Suggestion	“Feeling low? Quran or 10 mins of coding can give you a boost.”
            💧 Skin Care	“Skipped moisturizer yesterday. Drink water + moisturize today.”
            💇 Hair Care	“Scalp massage day! It boosts blood flow and relaxes the mind.”
            🛁 Hygiene	“Nice—two baths logged. Small rituals, big impact.”
            💪 Workout	“You missed your workout yesterday. Start today with just 10 push-ups.”
            --------------------------------------------------------------------------------------------

            Message Generation Logic (Sample)
            --------------------------------------------
            Quran Reminder: "You haven’t logged Quran reading for 2 days, would you like a nudge?"

            Tahajjud Reminder: "You’ve logged 1 Tahajjud this week, go for one more?"

            Screen Detox Reminder: "Yesterday’s screen use affected your sleep. Try a detox today."

            Hair Care Reminder: "Scalp massage or oil application can refresh your routine."

            Skin Care Reminder: "Missed skin care yesterday. Moisturize + hydrate today."

            Workout Reminder: "You missed your workout yesterday. Start today with just 10 push-ups."
            --------------------------------------------------------------------------------------------

            Daily Message Structure
            --------------------------------------------
            Message Type: 'encouragement', 'reminder', 'tip'

            Habit Type: 'quran', 'prayer', 'coding', 'sleep', 'skincare', 'haircare', 'workout'

            Message Content: The reminder or motivational message.

            Optional Action: Button to mark habit as completed or link to a related screen.
            --------------------------------------------------------------------------------------------
            Hair Care
            --------------------------------------------

            Scalp massage (2x/week)

            Oiling (2x/week)

            Shampoo (alternate days)

            Conditioner (alternate days)

            Skin Care
            --------------------------------------------

            Morning: Cleanser + Moisturizer + Sunscreen

            Night: Cleanser + Moisturizer

            Hydration reminders throughout the day

            Weekly: Face mask / exfoliation
            --------------------------------------------------------------------------------------------

            Workout Routine
            --------------------------------------------

            Push-ups (Start with 10, increase over time)

            Squats (alternate days)

            Planks (1-minute hold)

            Stretching (10 minutes daily) */}


        </div>
    )
}

export default Milestones