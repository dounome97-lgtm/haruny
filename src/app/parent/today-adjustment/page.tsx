import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentTodayAdjustmentPage() {
  return (
    <DesignReferenceScreen
      alt="부모 오늘 계획 조정 확정 시안"
      hotspots={[
        { ariaLabel: "안심 화면으로 돌아가기", href: "/parent/reassurance", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "조정안 적용", href: "/", left: 5.5, top: 83.4, width: 89, height: 6.5 },
        { ariaLabel: "그대로 두기", href: "/", left: 5.5, top: 91, width: 89, height: 5.7 },
      ]}
      src="/assets/haruny/screen-reference/09-parent-today-plan-adjustment-selected.png"
    />
  );
}
