import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentRoutinePage() {
  return (
    <DesignReferenceScreen
      alt="부모 평시 루틴 만들기 확정 시안"
      hotspots={[
        { ariaLabel: "가족 설정으로 돌아가기", href: "/family", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "가족 일정에 맞추기", href: "/", left: 5.5, top: 88.2, width: 89, height: 6.5 },
      ]}
      src="/assets/haruny/screen-reference/14-parent-routine-create-selected-v2.png"
    />
  );
}
