import { ParentExamPlanReviewScreen } from "@/components/parent/ParentExamPrepScreens";
import { getParentExamPlanReviewView } from "@/services/parentPlan";

export default function ParentExamPlanReviewPage() {
  return <ParentExamPlanReviewScreen review={getParentExamPlanReviewView()} />;
}
