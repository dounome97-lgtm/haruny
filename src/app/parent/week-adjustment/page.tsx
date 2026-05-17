import { ParentWeekAdjustmentScreen } from "@/components/parent/ParentSupportScreens";
import { getParentWeekAdjustmentView } from "@/services/parentPlan";

export default function ParentWeekAdjustmentPage() {
  return <ParentWeekAdjustmentScreen week={getParentWeekAdjustmentView()} />;
}
