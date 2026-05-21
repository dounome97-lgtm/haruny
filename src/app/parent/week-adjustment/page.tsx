import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentWeekAdjustmentPage() {
  return (
    <DesignReferenceScreen
      alt="부모 이번 주 조정 확정 시안"
      hotspots={[
        { ariaLabel: "안심 화면으로 돌아가기", href: "/parent/reassurance", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "목요일만 조정", href: "/", left: 5, top: 86.5, width: 90, height: 6.6 },
      ]}
      src="/assets/haruny/screen-reference/13-parent-this-week-adjustment-selected-v2.png"
    />
  );
}
