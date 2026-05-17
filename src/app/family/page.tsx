import { FamilySettingsScreen } from "@/components/family/FamilySettingsScreen";
import { getFamilySettingsView } from "@/services/parentPlan";

export default function FamilySettingsPage() {
  return <FamilySettingsScreen settings={getFamilySettingsView()} />;
}
