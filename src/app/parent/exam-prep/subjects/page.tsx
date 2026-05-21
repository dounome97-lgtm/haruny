import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentExamSubjectsPage() {
  return (
    <DesignReferenceScreen
      alt="부모 시험 과목 입력 확정 시안"
      hotspots={[
        { ariaLabel: "시험 준비 만들기로 돌아가기", href: "/parent/exam-prep", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "균형 확인하기", href: "/parent/exam-prep/review", left: 5.5, top: 86, width: 89, height: 7 },
      ]}
      src="/assets/haruny/screen-reference/11-parent-exam-subject-days-selected-v2.png"
    />
  );
}
