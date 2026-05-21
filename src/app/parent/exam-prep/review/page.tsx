import { DesignReferenceScreen } from "@/components/ui/DesignReferenceScreen";

export default function ParentExamPlanReviewPage() {
  return (
    <DesignReferenceScreen
      alt="부모 시험 준비안 확인 확정 시안"
      hotspots={[
        { ariaLabel: "시험 과목 입력으로 돌아가기", href: "/parent/exam-prep/subjects", left: 4, top: 1.7, width: 9, height: 5 },
        { ariaLabel: "이 준비안으로 시작", href: "/", left: 5.5, top: 87.5, width: 89, height: 6.7 },
      ]}
      src="/assets/haruny/screen-reference/12-parent-exam-plan-review-selected-v2.png"
    />
  );
}
