import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function StudentWeekPage() {
  return (
    <DesignReferenceScreen
      alt="학생 이번 주 확정 시안"
      hotspots={[
        { ariaLabel: "오늘로 이어가기", href: "/", left: 5.5, top: 85.4, width: 89, height: 6.2 },
      ]}
      src="/assets/haruny/screen-reference/05-student-this-week-selected.png"
    />
  );
}
