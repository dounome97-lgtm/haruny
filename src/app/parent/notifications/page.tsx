import { ParentNotificationSettingsScreen } from "@/components/parent/ParentSupportScreens";
import { getParentNotificationSettingsView } from "@/services/parentPlan";

export default function ParentNotificationsPage() {
  return (
    <ParentNotificationSettingsScreen settings={getParentNotificationSettingsView()} />
  );
}
