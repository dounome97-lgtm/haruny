import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentReassurancePage() {
  return (
    <DesignReferenceScreen
      alt="부모 안심 확정 시안"
      hotspots={[
        { ariaLabel: "오늘 상태 보기", href: "/parent/day-summary", left: 5, top: 85.6, width: 90, height: 6.3 },
        { ariaLabel: "알림 기준 보기", href: "/parent/notifications", left: 5, top: 93.1, width: 90, height: 4.8 },
        { ariaLabel: "오늘 계획 조정 보기", href: "/parent/today-adjustment", left: 5, top: 68.3, width: 90, height: 6.3 },
      ]}
      src="/assets/haruny/screen-reference/07-parent-reassurance-selected.png"
    />
  );
}
