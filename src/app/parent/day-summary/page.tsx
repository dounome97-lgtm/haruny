import { ParentDayEndSummaryScreen } from "@/components/parent/ParentSupportScreens";
import { getParentDayEndSummaryView } from "@/services/parentPlan";

export default function ParentDaySummaryPage() {
  return <ParentDayEndSummaryScreen summary={getParentDayEndSummaryView()} />;
}
