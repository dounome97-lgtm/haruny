import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentNotificationsPage() {
  return (
    <DesignReferenceScreen
      alt="부모 알림 설정 확정 시안"
      hotspots={[
        { ariaLabel: "안심 화면으로 돌아가기", href: "/parent/reassurance", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "알림 시간 저장", href: "/parent/reassurance", left: 5.5, top: 86.5, width: 89, height: 6.6 },
      ]}
      src="/assets/haruny/screen-reference/15-parent-notification-settings-selected-v2.png"
    />
  );
}
