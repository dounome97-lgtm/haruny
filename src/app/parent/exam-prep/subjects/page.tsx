import { ParentExamSubjectEntryScreen } from "@/components/parent/ParentExamPrepScreens";
import { getParentExamSubjectEntryView } from "@/services/parentPlan";

export default function ParentExamSubjectsPage() {
  return <ParentExamSubjectEntryScreen entry={getParentExamSubjectEntryView()} />;
}
