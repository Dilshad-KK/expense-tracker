import React, { useEffect, useState } from 'react'
import GoBack from "../../../components/gobackSecond";


const NewDiscussion = () => {

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("pending");
    const [showSuccessMessage, setShowSuccessMessage] = useState("");
    const [user, setUser] = useState("");

    useEffect(() => {
        const cachedUser = localStorage.getItem("userIdentity");

        if (cachedUser) {
            setUser(cachedUser);
            return;
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        let user = "";
        if (timezone.includes("Asia/Dubai")) {
            user = "Dilshad";
        } else {
            user = "Shifa Dilshad";
        }

        localStorage.setItem("userIdentity", user);
        setUser(user);
    }, []);

    async function addDiscussion() {
        setLoading(true);
        console.log(loading)
        if (!message || !status || !user) {
            setLoading(false);
            return;
        }
        const response = await fetch('/api/discussions', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, status, user }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            setShowSuccessMessage("Discussion Added Successfully...!");
            setMessage("");
            setStatus("pending");
            setLoading(false);
            setTimeout(() => {
                setShowSuccessMessage("");
            }, 2000);
        } else {
            alert(`Error: ${data.error}`);
            setLoading(false);
        }
        setLoading(false);
    }
    return (
        <div className="bg-[#e8e8fd] min-h-screen relative">
            <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4 mb-8'>
                <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
                <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
                <GoBack />
                <span className='text-white z-[2000]'>Add New Discussion</span>
                <div />
            </div>
            <div className='px-4 pb-[150px]'>
                <div className="flex items-center justify-center flex-col">
                    <textarea
                        rows={4}
                        placeholder="Write here..."
                        className="text-black/60 mb-2 border-[1px] border-solid border-[#d3d3fe] w-full p-4 rounded-[8px] bg-[#f3f3fd] placeholder:text-[12px]"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <select className="text-black/60 text-base select border-[1px] border-solid border-[#d3d3fe] w-full bg-[#f3f3fd] text-[12px] placeholder:text-[12px]"
                        value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="discussed">Discussed</option>
                    </select>

                    <button className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full" onClick={addDiscussion}>
                        Add Discussion
                    </button>

                    {showSuccessMessage && (
                        <div className="flex items-center justify-center w-full">
                            <div role="alert" className="alert alert-success alert-soft mb-4 text-center w-full">
                                <span className="text-white text-[14px]">{showSuccessMessage}</span>
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>
        </div>
    )
}

export default NewDiscussion