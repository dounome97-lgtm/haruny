import { ParentExamPrepCreateScreen } from "@/components/parent/ParentExamPrepScreens";
import { getParentExamPrepView } from "@/services/parentPlan";

export default function ParentExamPrepPage() {
  return <ParentExamPrepCreateScreen prep={getParentExamPrepView()} />;
}
