import { useRouter } from 'next/router';

export default function Edit() {
  const router = useRouter();
  const { instId } = router.query; 
  return (
    <div>Edit installment : {instId}</div>
  )
}
