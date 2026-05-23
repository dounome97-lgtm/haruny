import { ParentRoutineCreateScreen } from "@/components/parent/ParentRoutineScreens";
import { getParentRoutineCreateView } from "@/services/parentPlan";
import { startRoutinePlanAction } from "./actions";

export default function ParentRoutinePage() {
  const routine = getParentRoutineCreateView();

  return (
    <ParentRoutineCreateScreen
      isFamilyRhythmConfirmed
      onStartAction={startRoutinePlanAction}
      routine={routine}
    />
  );
}
