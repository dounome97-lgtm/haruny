import { StudentWeekScreen } from "@/components/student/StudentSupportScreens";
import { getStudentWeekView } from "@/services/studentToday";

export default function StudentWeekPage() {
  return <StudentWeekScreen week={getStudentWeekView()} />;
}
