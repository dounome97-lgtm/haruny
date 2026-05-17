import { StudentAdjustmentScreen } from "@/components/student/StudentSupportScreens";
import { getStudentAdjustmentView } from "@/services/studentToday";

export default function StudentAdjustmentPage() {
  return <StudentAdjustmentScreen adjustment={getStudentAdjustmentView()} />;
}
