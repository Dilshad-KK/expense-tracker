import CommonHeader from '@/components/commonHeader'
import PageFab from '@/components/pageFab';
import moment from 'moment';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaPlus } from "react-icons/fa6";
import { IoMdCheckmark } from "react-icons/io";

interface Checklist {
    id: number,
    title: string,
    priority: string,
    user: string,
    checked: boolean,
    created_at: string
}

const CheckList = () => {

    useEffect(() => {
        const cachedUser = localStorage.getItem("userIdentity");

        if (cachedUser) {
            if (cachedUser === "Dilshad") {
                setActive("Dilshad");
                setOptions(["Dilshad", "Shifa Dilshad" , "Vacation"])
            } else {
                setActive("Shifa Dilshad");
                setOptions(["Shifa Dilshad", "Dilshad" , "Vacation"])
            }
            fetchChecklist(cachedUser);
            return;
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let user = "";
        if (timezone.includes("Asia/Dubai")) {
            user = "Dilshad";
            setActive("Dilshad");
            setOptions(["Dilshad", "Shifa Dilshad" , "Vacation"])
        } else {
            user = "Shifa Dilshad";
            setActive("Shifa Dilshad");
            setOptions(["Shifa Dilshad", "Dilshad" , "Vacation"])
        }

        localStorage.setItem("userIdentity", user);
        fetchChecklist(user);
    }, []);

    const [loading, setLoading] = useState(false);
    const [checkeLoading, setCheckLoading] = useState(false);
    const [ckeckActiveKey, setCheckActiveKey] = useState('');
    const [checklist, setChecklist] = useState<Checklist[]>([]);
    const [active, setActive] = useState("");
    const [options, setOptions] = useState<string[]>([])
    const [showSuccessMessage, setShowSuccessMessage] = useState("");

    async function fetchChecklist(option: string) {
        setLoading(true);

        try {
            const res = await fetch('/api/checklist');
            const data: Checklist[] = await res.json();
            setChecklist(data?.filter(item => item?.user === option));
        } catch (error) {
            console.error("Error fetching discussions:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleUpdateChecklist = async (key: number, checked: boolean, id: number, user: string) => {
        try {
            setCheckActiveKey(String(id));
            setCheckLoading(true);
            const res = await fetch("/api/checklist", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: id,
                    checked: checked
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                console.error("Update failed:", result.error);
                setCheckLoading(false);
                return;
            }
            const response = await fetch('/api/checklist');
            const data: Checklist[] = await response.json();
            setChecklist(data?.filter(item => item?.user === user));
            setCheckLoading(false);
        } catch (err) {
            console.error("Unexpected error:", err);
            setCheckLoading(false);
        }
    };

    const handleFilter = (option: string) => {
        setActive(option)
        fetchChecklist(option)
    }




    const handleDelete = async (id: number, key: number, user: string) => {
        setCheckLoading(true);
        setCheckActiveKey(String(id));
        const response = await fetch(`/api/checklist?id=${id}`, {
            method: "DELETE",
        });

        const data = await response.json();
        console.log(data);

        if (response.ok) {
            const res = await fetch('/api/checklist');
            const data: Checklist[] = await res.json();
            setChecklist(data?.filter(item => item?.user === user));
            setCheckLoading(false);
            setShowSuccessMessage("Item Deleted Successfully...!");
        } else {
            alert(`Error: ${data.error}`);
            setCheckLoading(false);
        }
    }


    const ChecklistUi = ({ checked }: { checked: boolean }) => (
        <>
            {
                checklist?.length > 0 ?

                    checklist?.filter(item => checked ? item?.checked === true : item?.checked === false).map?.((item, key) => (

                        <div key={key} className='bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-box flex justify-between items-center'>
                            {/* <div className='bg-[#a5a5fe2d] rounded-[12px] h-[60px] w-[60px] flex items-center justify-center flex-col mr-4 flex-shrink-0'>
                                <span className='text-black/80 text-[12px] font-poppinsMed'>{moment(item?.created_at).format("DD")}</span>
                                <span className='text-black/80 text-[10px] uppercase font-poppinsMed'>{moment(item?.created_at).format("MMM")}</span>
                                <span className='text-black/80 text-[8px] uppercase font-poppinsMed'>{moment(item?.created_at).format("YYYY")}</span>
                            </div> */}
                            <div className='flex flex-grow flex-col items-start justify-center'>
                                <div className='text-sm text-base-content/80 mb-3 font-poppinsMed'>
                                    {item?.title}
                                </div>
                                <div className='flex'>
                                    <div className={`${item?.priority === 'low' ? 'text-success bg-success/10'
                                        : item?.priority === 'medium' ? 'text-warning bg-warning/10'
                                            : 'text-error bg-error/10'} text-xs rounded px-2 py-1 mr-3`}>
                                        {item?.priority === 'low' ? 'Low' : item?.priority === 'medium' ? 'Medium' : 'High'}
                                    </div>
                                    <div className='bg-base-200 flex items-center justify-center px-3 py-1 rounded text-base-content/70 mr-3'>
                                        <span className='text-xs mr-1'>{moment(item?.created_at).format("DD")}</span>
                                        <span className='text-xs mr-1'>{moment(item?.created_at).format("MMM")}</span>
                                        <span className='text-xs mr-1'>{moment(item?.created_at).format("YYYY")}</span>
                                    </div>
                                    <div className='bg-error/10 text-xs flex items-center justify-center px-3 py-1 rounded text-error cursor-pointer' onClick={() => { handleDelete(item?.id, key, item?.user) }}>
                                        Delete
                                    </div>
                                </div>

                            </div>
                            <div className='flex items-center justify-end w-12 flex-shrink-0'>
                                <div className={`${item?.checked ? 'bg-success' : 'bg-base-100 dark:bg-base-200 border-2 border-success/50'} h-6 w-6 rounded-full flex items-center justify-center cursor-pointer`}
                                    onClick={() => {
                                        handleUpdateChecklist(key, !item?.checked, item?.id, item?.user)
                                    }}
                                >
                                    {checkeLoading && ckeckActiveKey === String(item?.id) ? <span className={`loading loading-ring loading-md ${item?.checked ? 'text-white' : ''}`}></span> : item?.checked ? <IoMdCheckmark className='text-white' /> : null}
                                </div>
                            </div>
                        </div>
                    ))
                    : null
            }
        </>
    )



    return (
        <div className='bg-base-100 min-h-dvh relative'>
            <CommonHeader title="CHECKLIST" />
            <div className='px-4 pt-4 page-body-with-fab'>
                {loading || options?.length === 0 ?
                    <div>
                        {[1, 2, 3, 4]?.map((key) => (
                            <div className="h-16 w-full bg-base-100 dark:bg-base-200 border-2 border-base-300 dark:border-base-400 px-4 py-4 my-3 rounded-box flex" key={key}>
                                <div className="skeleton h-full w-1/12 bg-[#d6d6fc] dark:bg-base-300 rounded-box mr-3"></div>
                                <div className='w-full'>
                                    <div className="skeleton h-4 w-full bg-[#d6d6fc] dark:bg-base-300 mb-2"></div>
                                    <div className="skeleton h-4 w-full bg-[#d6d6fc] dark:bg-base-300"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    :
                    <>
                        <div className="flex justify-center items-center w-full mb-6 mt-3">
                            {options?.length ? options?.map((option: string) => (
                                <div className={`${option === active ? 'bg-primary text-primary-content' : 'bg-base-100 dark:bg-base-200 text-base-content/80 border border-base-300 dark:border-base-400'} mx-2  py-2 px-4 rounded-btn text-xs `}
                                    onClick={() => { handleFilter(option) }}>{option}</div>
                            )) : null}
                        </div>

                        <ChecklistUi checked={false} />
                        <ChecklistUi checked={true} />


                    </>

                }
            </div>
            <PageFab href="/checklist/newitem" ariaLabel="Add checklist item" />
        </div>
    )
}

export default CheckList
