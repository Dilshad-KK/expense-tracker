import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import CommonHeader from "@/components/commonHeader";
import HeaderAction from '@/components/headerAction';
import PageAlert from '@/components/pageAlert';
import PageSection from '@/components/pageSection';
import moment from 'moment';
import Link from 'next/link';
import { HiPencilSquare, HiTrash } from 'react-icons/hi2';

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
    <div className='bg-base-100 min-h-dvh'>
      <CommonHeader
        title='Discussion Details'
        right={(
          <div className='flex items-center gap-2'>
            <HeaderAction
              href={`/alldiscussions/discdetails/${discid}/edit`}
              label="Update"
              tone="success"
              icon={<HiPencilSquare />}
            />
            <HeaderAction
              onClick={() => deleteDiscussion(discussion[0]?.id)}
              label="Delete"
              tone="danger"
              icon={<HiTrash />}
            />
          </div>
        )}
      />

      {loading ? (
        <div className='page-body px-4 pt-2'>
          <div className='page-shell'>
            {[1, 2, 3, 4]?.map((key) => (
              <div className="my-3 flex h-16 w-full rounded-box border-2 border-base-300 bg-base-100 px-4 py-4 dark:border-base-400 dark:bg-base-200" key={key}>
                <div className="mr-3 h-full w-1/12 rounded-box bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                <div className='w-full'>
                  <div className="mb-2 h-4 w-full bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                  <div className="h-4 w-full bg-[#d6d6fc] skeleton dark:bg-base-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : discussion?.length ? (
        <div className='page-body px-4 pt-2'>
          <div className='page-shell'>
            <PageSection className='!px-0 !pt-0' contentClassName='space-y-4'>
              <div className='flex justify-between rounded-box'>
                <div className='flex items-center justify-center'>
                  <div className={`mr-4 flex size-10 flex-shrink-0 items-center justify-center rounded-full ${discussion[0]?.user === 'Dilshad' ? 'bg-[#126581]' : 'bg-[#8e156a]'}`}>
                    <span className='text-lg text-white font-poppinsMed'>{discussion[0]?.user === 'Dilshad' ? 'D' : 'S'}</span>
                  </div>
                  <div>
                    <div className='flex items-center justify-start'>
                      <span className='mr-1 text-xs text-base-content/70'>{discussion[0]?.user}</span>
                      <span className='mr-1 mb-2 text-base text-base-content/60'>.</span>
                      <span className='mr-2 text-xs text-base-content/70'>{moment(discussion[0]?.created_at).fromNow().replace(/^\w/, c => c.toUpperCase())}</span>
                      <span className='mr-1 mb-2 text-base text-base-content/60'>.</span>
                      {discussion[0]?.status === "pending" ? (
                        <div className='rounded-badge bg-warning/10 px-3 py-1 text-xs font-poppinsMed capitalize text-warning'>{discussion[0]?.status}</div>
                      ) : (
                        <div className='rounded-badge bg-success/10 px-3 py-1 text-xs font-poppinsMed capitalize text-success'>{discussion[0]?.status}</div>
                      )}
                    </div>
                    <span className='text-sm text-base-content/80'>{discussion[0]?.message}</span>
                  </div>
                </div>
              </div>
              <div className='rounded-[20px] border border-base-content/10 bg-base-200/60 p-3'>
                <div className='text-[11px] font-poppinsMed text-base-content/50'>Created</div>
                <div className='mt-1 text-sm font-poppinsBold text-base-content'>{moment(discussion[0]?.created_at).format("DD MMM YYYY")}</div>
                <div className='mt-1 text-xs text-base-content/60'>{moment(discussion[0]?.created_at).format("hh:mm A")}</div>
              </div>
            </PageSection>
          </div>
        </div>
      ) : null}

      {showSuccessMessage && (
        <div className="page-body px-4 pt-0">
          <div className="page-shell">
            <PageAlert>{showSuccessMessage}</PageAlert>
          </div>
        </div>
      )}
    </div>
  )
}

export default DiscussionDetails
