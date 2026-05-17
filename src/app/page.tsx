import { StudentTodayScreen } from "@/components/student/StudentTodayScreen";
import { getStudentTodayView } from "@/services/studentToday";

export default function Home() {
  const today = getStudentTodayView();

  return <StudentTodayScreen initialToday={today} />;
}
