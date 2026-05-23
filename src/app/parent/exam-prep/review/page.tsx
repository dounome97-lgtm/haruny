import { ParentExamPlanReviewScreen } from "@/components/parent/ParentExamPrepScreens";
import { getParentExamPlanReviewView } from "@/services/parentPlan";
import { startExamPrepPlanAction } from "./actions";

export default function ParentExamPlanReviewPage() {
  const review = getParentExamPlanReviewView();

  return (
    <ParentExamPlanReviewScreen
      onStartAction={startExamPrepPlanAction}
      review={review}
    />
  );
}
