import React, { useEffect, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
import PageAlert from '@/components/pageAlert';
import PageSection from '@/components/pageSection';


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
        <div className="bg-base-100 min-h-dvh relative">
            <CommonHeader title='Add New Discussion' />
            <PageSection contentClassName='space-y-4'>
                <div className="flex items-center justify-center flex-col">
                    <textarea
                        rows={4}
                        placeholder="Write here..."
                        className="textarea textarea-bordered text-base-content mb-2 w-full p-4 rounded-btn bg-base-200 placeholder:text-xs"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <select className="select select-bordered w-full bg-base-200 text-xs placeholder:text-xs text-base-content"
                        value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="discussed">Discussed</option>
                    </select>

                    <button className="btn btn-primary text-white text-sm my-4 w-full" onClick={addDiscussion}>
                        Add Discussion
                    </button>

                    {showSuccessMessage && (
                        <PageAlert className="w-full">{showSuccessMessage}</PageAlert>
                    )
                    }
                </div>
            </PageSection>
        </div>
    )
}

export default NewDiscussion
