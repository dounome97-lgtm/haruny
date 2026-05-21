import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentExamPrepPage() {
  return (
    <DesignReferenceScreen
      alt="부모 시험 준비 만들기 확정 시안"
      hotspots={[
        { ariaLabel: "안심 화면으로 돌아가기", href: "/parent/reassurance", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "준비안 만들기", href: "/parent/exam-prep/subjects", left: 5.5, top: 87.4, width: 89, height: 6.7 },
      ]}
      src="/assets/haruny/screen-reference/10-parent-exam-prep-create-selected-v2.png"
    />
  );
}
