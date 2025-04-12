import { useRouter } from 'next/router';

export default function EditLoanPage() {
  const router = useRouter();
  const { loanId } = router.query; // Get loanId from the URL

  // Here you can fetch loan data and display it in an editable form
  // For now, just show the loanId

  return (
    <div>
      <h1>Edit Loan ID: {loanId}</h1>
      {/* Create a form here for editing the loan details */}
    </div>
  );
}