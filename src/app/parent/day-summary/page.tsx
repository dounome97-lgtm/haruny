import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentDaySummaryPage() {
  return (
    <DesignReferenceScreen
      alt="부모 하루 마감 요약 확정 시안"
      hotspots={[
        { ariaLabel: "안심 화면으로 돌아가기", href: "/parent/reassurance", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "내일 보기", href: "/", left: 5, top: 85.8, width: 90, height: 6.2 },
        { ariaLabel: "오늘 자세히 보기", href: "/parent/reassurance", left: 30, top: 93, width: 40, height: 4.2 },
      ]}
      src="/assets/haruny/screen-reference/08-parent-day-end-summary-selected.png"
    />
  );
}
