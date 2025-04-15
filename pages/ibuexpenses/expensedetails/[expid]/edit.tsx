import React, { useEffect, useState } from 'react'
import GoBack from "../../../../components/gobackSecond";
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

      setShowSuccessMessage("Discussion Updated Successfully...!");
      setLoading(false);
    } catch (err) {
      console.error("Unexpected error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e8e8fd] min-h-screen relative">
      <div className='relative bg-[#514cff] h-[150px] rounded-b-[60px] flex justify-between items-center px-4 mb-8'>
        <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
        <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
        <GoBack />
        <span className='text-white z-[2000]'>Update Discussion</span>
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

          <button className="btn bg-[#514cff] text-white border-none text-[12px] my-[16px] w-full" onClick={handleUpdateDiscussion}>
             {loading ? <span className="ml-2 loading loading-dots loading-md"></span> : 'Update Discussion'}
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

export default UpdateDiscussion