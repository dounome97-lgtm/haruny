import { ParentReassuranceScreen } from "@/components/parent/ParentSupportScreens";
import { getParentReassuranceView } from "@/services/parentPlan";

export default function ParentReassurancePage() {
  return <ParentReassuranceScreen reassurance={getParentReassuranceView()} />;
}
