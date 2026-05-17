import { ParentTodayAdjustmentScreen } from "@/components/parent/ParentSupportScreens";
import { getParentTodayAdjustmentView } from "@/services/parentPlan";

export default function ParentTodayAdjustmentPage() {
  return <ParentTodayAdjustmentScreen adjustment={getParentTodayAdjustmentView()} />;
}
