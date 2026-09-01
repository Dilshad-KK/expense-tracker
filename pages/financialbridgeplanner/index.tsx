import CommonHeader from "@/components/commonHeader";
import FinancialBridgePlanner from "@/components/financialBridgePlanner/FinancialBridgePlanner";

export default function FinancialBridgePlannerAliasPage() {
  return (
    <div className="min-h-dvh bg-base-100 dark:bg-base-100">
      <CommonHeader title="Financial Bridge Planner" />
      <FinancialBridgePlanner />
    </div>
  );
}
