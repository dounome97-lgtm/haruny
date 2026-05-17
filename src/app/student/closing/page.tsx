import { StudentDayClosingScreen } from "@/components/student/StudentSupportScreens";
import { getStudentDayClosingView } from "@/services/studentToday";

export default function StudentDayClosingPage() {
  return <StudentDayClosingScreen closing={getStudentDayClosingView()} />;
}
