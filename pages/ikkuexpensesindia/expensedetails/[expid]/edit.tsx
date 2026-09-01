import React, { useEffect, useState } from 'react'
import CommonHeader from "@/components/commonHeader";
import PageAlert from '@/components/pageAlert';
import PageSection from '@/components/pageSection';
import { useRouter } from 'next/router';

type Discussion = {
  id: number;
  message: string;
  status: string;
  user: string;
  created_at: string;
};

const UpdateDiscussion = () => {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("pending");
  const [showSuccessMessage, setShowSuccessMessage] = useState("");

  const router = useRouter();
  const { discid } = router.query;


  useEffect(() => {

    if (!discid) return;

    fetchDiscussions();
  }, [discid]);


  async function fetchDiscussions() {
    setLoading(true);
    try {
      const res = await fetch(`/api/discussions?id=${discid}`);
      const data: Discussion[] = await res.json();
      setMessage(data[0]?.message);
      setStatus(data[0]?.status);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  }


  const handleUpdateDiscussion = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/discussions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: discid,
          message,
          status,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Update failed:", result.error);
        setLoading(false);
        return;
      }

      setShowSuccessMessage("Expense Updated Successfully...!");
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-100 min-h-dvh relative">
      <CommonHeader title='Update Expense' />
      <PageSection contentClassName='space-y-4'>
        <div className="flex items-center justify-center flex-col">
          <textarea
            rows={4}
            placeholder="Expense note"
            className="textarea textarea-bordered mb-2 w-full p-4 rounded-[8px] bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <select className="select select-bordered text-base w-full bg-base-100 dark:bg-base-200 border-base-300 dark:border-base-400 text-[12px] text-base-content placeholder:text-[12px] placeholder:text-base-content/60"
            value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pending">Pending</option>
            <option value="discussed">Discussed</option>
          </select>

          <button className="btn btn-primary text-white text-[12px] my-[16px] w-full" onClick={handleUpdateDiscussion}>
             {loading ? <span className="ml-2 loading loading-dots loading-md"></span> : 'Update Expense'}
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

export default UpdateDiscussion
