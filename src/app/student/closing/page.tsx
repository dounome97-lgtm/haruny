import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function StudentDayClosingPage() {
  return (
    <DesignReferenceScreen
      alt="학생 하루 마감 확정 시안"
      hotspots={[
        { ariaLabel: "마감하기", href: "/", left: 6, top: 86.9, width: 88, height: 6.1 },
        { ariaLabel: "내일 보기", href: "/student/week", left: 6, top: 94, width: 88, height: 4.3 },
      ]}
      src="/assets/haruny/screen-reference/04-student-day-closing-selected.png"
    />
  );
}
