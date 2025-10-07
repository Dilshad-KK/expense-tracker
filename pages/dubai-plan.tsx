import dynamic from 'next/dynamic';

// Avoid SSR issues with Recharts by dynamically importing the page as client-only
const DubaiPlan = dynamic(() => import('../app/pages/DubaiPlan'), { ssr: false });

export default DubaiPlan;

