import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function FamilySettingsPage() {
  return (
    <DesignReferenceScreen
      alt="가족 설정 확정 시안"
      hotspots={[
        { ariaLabel: "안심 화면으로 돌아가기", href: "/parent/reassurance", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "하루 흐름 저장", href: "/", left: 5.5, top: 88.8, width: 89, height: 6.4 },
      ]}
      src="/assets/haruny/screen-reference/16-family-settings-selected-v2.png"
    />
  );
}
