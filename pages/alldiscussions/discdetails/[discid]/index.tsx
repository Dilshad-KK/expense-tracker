import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonHeader from "@/components/commonHeader";
import moment from 'moment';
import Link from 'next/link';

type Discussion = {
  id: number;
  message: string;
  status: string;
  user: string;
  created_at: string;
};

const DiscussionDetails = () => {
  const router = useRouter();
  const { discid } = router.query;

  const [loading, setLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState("");
  const [discussion, setDiscussion] = useState<Discussion[]>([]);

  useEffect(() => {

    if (!discid) return;

    fetchDiscussions();
  }, [discid]);


  async function fetchDiscussions() {
    setLoading(true);

    try {
      const res = await fetch(`/api/discussions?id=${discid}`);
      const data: Discussion[] = await res.json();
      setDiscussion(data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    } finally {
      setLoading(false);
    }
  }


  async function deleteDiscussion(discIdToDelete: number) {
    setLoading(true);
    const response = await fetch(`/api/discussions?id=${discIdToDelete}`, {
      method: "DELETE",
    });

    const data = await response.json();
    console.log(data);

    if (response.ok) {
      setLoading(false);
      setShowSuccessMessage("Discussion Deleted Successfully...!");
      router.push("/alldiscussions");
    } else {
      alert(`Error: ${data.error}`);
      setLoading(false);
    }
  }


  return (
    <div className='bg-base-100 min-h-screen'>
      <CommonHeader
        title='Discussion Details'
        right={(
          <div className='flex items-center gap-2'>
            <Link href={`/alldiscussions/discdetails/${discid}/edit`} className='btn btn-xs btn-success text-white'>Update</Link>
            <button onClick={() => deleteDiscussion(discussion[0]?.id)} className='btn btn-xs btn-error text-white'>Delete</button>
          </div>
        )}
      />

      {loading ?
        <div className='p-4'>
          {[1, 2, 3, 4]?.map((key) => (
            <div className="h-[70px] w-[100%] bg-white px-4 py-4 my-3 rounded-[12px] flex" key={key}>
              <div className="skeleton h-full w-[10%] bg-[#d6d6fc] rounded-[12px] mr-3"></div>
              <div className='w-full'>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc] mb-2"></div>
                <div className="skeleton h-4 w-[100%] bg-[#d6d6fc]"></div>
              </div>
            </div>
          ))}
        </div>
        : discussion?.length ?
          <div className='px-4 pt-4 pb-[150px]'>



            <div className='bg-white px-4 py-4 my-3 rounded-[12px] flex justify-between'>
              <div className='flex items-center justify-center'>
                <div className={`h-[40px] w-[40px] ${discussion[0]?.user === 'Dilshad' ? 'bg-[#126581]' : 'bg-[#8e156a]'}  rounded-full flex items-center justify-center mr-4 flex-shrink-0`}>
                  <span className='text-[18px] text-white font-poppinsMed'>{discussion[0]?.user === 'Dilshad' ? 'D' : 'S'}</span>
                </div>
                <div>
                  <div className='flex items-center justify-start'>
                    <span className='mr-1 text-[10px] text-slate-600'>{discussion[0]?.user}</span>
                    <span className='mr-1 mb-2 text-[16px] text-slate-600'>.</span>
                    <span className='text-[10px] text-slate-600 mr-2'>{moment(discussion[0]?.created_at).fromNow().replace(/^\w/, c => c.toUpperCase())}</span>
                    <span className='mr-1 mb-2 text-[16px] text-slate-600'>.</span>
                    {discussion[0]?.status === "pending" ?
                      <div className='bg-[#fbe2de] rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-[#8f4d43] font-poppinsMed'>{discussion[0]?.status}</div>
                      :
                      <div className='bg-[#a7fac5] rounded-[12px] text-[8px] py-1 px-3 flex items-center justify-center uppercase text-[#345c42] font-poppinsMed'>{discussion[0]?.status}</div>

                    }
                  </div>
                  <span className='text-black/60 text-[12px]'>{discussion[0]?.message}</span>
                </div>

              </div>

            </div>
          </div>
          : null
      }


      {showSuccessMessage && (
        <div className="flex items-center justify-end w-full p-4">
          <div role="alert" className="alert alert-success alert-soft mb-4 text-center w-full">
            <span className="text-white text-[14px]">{showSuccessMessage}</span>
          </div>
        </div>
      )
      }
    </div>
  )
}

export default DiscussionDetails
