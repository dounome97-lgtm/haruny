import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function StudentAdjustmentPage() {
  return (
    <DesignReferenceScreen
      alt="학생 오늘 줄이기 확정 시안"
      hotspots={[
        { ariaLabel: "오늘 화면으로 돌아가기", href: "/", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "조정 요청 보내기", href: "/", left: 6, top: 85.8, width: 88, height: 6.8 },
        { ariaLabel: "조정 요청 취소", href: "/", left: 6, top: 93.7, width: 88, height: 5 },
      ]}
      src="/assets/haruny/screen-reference/06-student-plan-adjustment-request-selected.png"
    />
  );
}
