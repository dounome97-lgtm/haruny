import { ParentRoutineCreateScreen } from "@/components/parent/ParentRoutineScreens";
import { getParentRoutineCreateView } from "@/services/parentPlan";

export default async function ParentRoutinePage({
  searchParams,
}: {
  searchParams?: Promise<{
    ready?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <ParentRoutineCreateScreen
      isFamilyRhythmConfirmed={params?.ready === "1"}
      routine={getParentRoutineCreateView()}
    />
  );
}
