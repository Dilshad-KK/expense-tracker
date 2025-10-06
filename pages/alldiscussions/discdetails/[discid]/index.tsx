import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import GoBack from "../../../../components/gobackSecond";
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
    <div className='bg-[#e8e8fd] min-h-screen'>
      <div>
        <div className='bg-primary px-4 py-8 flex justify-center items-center rounded-b-[24px] h-[160px] overflow-hidden'>
          <div className='absolute left-[-90px] z-[1000] bg-[#ffffff18] rounded-full w-[200px] h-[200px]'></div>
          <div className='absolute left-[-30px] z-[1000] bg-[#ffffff1a] rounded-full w-[200px] h-[200px]'></div>
          <div className='absolute left-[32px] z-[1000]'>
            <GoBack />
          </div>
          <div className='flex flex-col items-center justify-center z-[2000]'>
            <span className='text-white z-[2000] font-poppinsBold text-[18px] mb-4'>Discussion Details</span>
            <div className='flex'>
              <Link href={`/alldiscussions/discdetails/${discid}/edit`} className='mr-2 bg-[#c8f7de] px-4 py-2 rounded-[24px] flex items-center justify-center cursor-pointer'>
                <span  className='text-[#0d4a2a] text-[10px] font-poppinsMed'>Update</span>
              </Link>
              <div className='mr-2 bg-[#f6d2c5] px-4 py-2 rounded-[24px] flex items-center justify-center cursor-pointer'>
                <span className='text-[#85371a] text-[10px] font-poppinsMed' onClick={()=>deleteDiscussion(discussion[0]?.id)}>Delete</span>
              </div>
            </div>
          </div>

          {/* {discussion?.length ?
            <div className='flex justify-center items-center flex-col'>
              <div className='bg-[#ffffff18] px-6 py-2 rounded-[24px] mb-4'>
                {loan?.length && <span className='text-white text-[18px] font-poppinsBold'>{loan[0]?.title}</span>}
              </div>
              <div className='mr-2 bg-[#2d23b9] px-4 py-2 rounded-[24px] flex items-center justify-center mb-2'>
                {loan?.length && <span className='text-white text-[10px] font-poppinsMed'>Total Amount &nbsp;&nbsp;&nbsp;<span className='font-poppinsBold'>{loan[0]?.currency}&nbsp;&nbsp;{loan[0]?.total_amount}</span> </span>}
              </div>
              <div className='flex mb-3'>
                <div className='mr-2 bg-[#2d23b9] px-4 py-2 rounded-[24px] flex items-center justify-center'>
                  {loan?.length && <span className='text-white text-[10px] font-poppinsMed'>Total Paid &nbsp;&nbsp;&nbsp;<span className='font-poppinsBold'>{loan[0]?.currency}&nbsp;&nbsp;{totalPaid}</span> &nbsp;&nbsp; | &nbsp;&nbsp;Total Remaining &nbsp;&nbsp;&nbsp;<span className='font-poppinsBold'>{loan[0]?.currency}&nbsp;&nbsp;{Number(loan[0]?.total_amount) - totalPaid}</span> </span>}
                </div>
              </div>
              <div className='flex'>
                <div className='mr-2 bg-[#c8f7de] px-4 py-2 rounded-[24px] flex items-center justify-center cursor-pointer'>
                  <span className='text-[#0d4a2a] text-[10px] font-poppinsMed'>Update</span>
                </div>
                <div className='mr-2 bg-[#f6d2c5] px-4 py-2 rounded-[24px] flex items-center justify-center cursor-pointer' onClick={() => deleteLoan(loanId as string)}>
                  <span className='text-[#85371a] text-[10px] font-poppinsMed'>Delete</span>
                </div>
              </div>

            </div>
            : <div className="flex w-[250px] flex-col gap-4 items-center justify-cenetr">
              <div className="skeleton h-8 w-[180px] bg-[#e0e0ff]"></div>
              <div className="skeleton h-4 w-[160px] bg-[#c4c4fa]"></div>
              <div className="skeleton h-6 w-full bg-[#d6d6f5]"></div>
              <div className='w-full flex items-center justify-center'>
                <div className="skeleton h-6 w-[60px] bg-[#d6d6f5] mr-2"></div>
                <div className="skeleton h-6 w-[60px] bg-[#d6d6f5]"></div>
              </div>
            </div>
          } */}


        </div>
      </div>

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
