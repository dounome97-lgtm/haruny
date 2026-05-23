import { StudentTodayScreen } from "@/components/student/StudentTodayScreen";
import { getStudentTodayView } from "@/services/studentToday";

export default async function Home() {
  const today = await getStudentTodayView();

  return <StudentTodayScreen initialToday={today} />;
}
