import { ParentReassuranceScreen } from "@/components/parent/ParentSupportScreens";
import { getParentReassuranceView } from "@/services/parentPlan";

export default async function ParentReassurancePage() {
  const reassurance = await getParentReassuranceView();

  return <ParentReassuranceScreen reassurance={reassurance} />;
}
