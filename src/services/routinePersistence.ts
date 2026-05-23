import {
  mockFamilyDailyRhythm,
  mockRoutineApplicationPeriod,
  mockRoutineRules,
  mockStudentProfile,
} from "@/data/mock";
import { calculateDayCoach } from "@/domain/dayCoach";
import { createFamilyTimeBlocks } from "@/domain/familySchedule";
import { generateRoutinePlan } from "@/domain/routinePlan";
import { getMvpDataSource } from "@/services/mvpRepository";
import { upsertSupabaseRows } from "@/services/supabaseWrite";
import type { RoutineApplicationPeriod, RoutineRule, StudyTask, TimeBlock } from "@/types/study";

const DEMO_FAMILY_ID = "family-minjun";
const DEMO_STUDENT_ID = "user-student-minjun";
const DEMO_PARENT_ID = "user-parent";
const DEMO_ROUTINE_PLAN_ID = "plan-routine-normal";
const DEMO_DAY_PLAN_ID = "day-plan-minjun-2026-05-18";
const DEMO_CURRENT_DATE = "2026-05-18";
const DEMO_CURRENT_TIME = "17:30";

type RoutineSaveDraft = {
  applicationPeriod: RoutineApplicationPeriod;
  rules: RoutineRule[];
};

export async function saveDemoRoutinePlan(formData?: FormData): Promise<void> {
  if (getMvpDataSource() !== "supabase") {
    return;
  }

  const draft = parseRoutineDraft(formData);
  const generatedPlan = generateRoutinePlan({
    applicationPeriod: draft.applicationPeriod,
    availableMinutes: 90,
    currentDate: DEMO_CURRENT_DATE,
    rules: draft.rules,
  });
  const timeBlocks = createFamilyTimeBlocks({
    currentDate: DEMO_CURRENT_DATE,
    profile: mockStudentProfile,
    rhythm: mockFamilyDailyRhythm,
  });
  const coach = calculateDayCoach({
    currentTime: DEMO_CURRENT_TIME,
    tasks: generatedPlan.todayTasks,
    timeBlocks,
  });

  await upsertSupabaseRows("long_term_study_plans", [
    {
      created_by: DEMO_PARENT_ID,
      end_date: draft.applicationPeriod.endDate,
      id: DEMO_ROUTINE_PLAN_ID,
      start_date: draft.applicationPeriod.startDate,
      status: "active",
      student_id: DEMO_STUDENT_ID,
      title: "평시 루틴",
      type: "routine",
    },
  ]);
  await upsertSupabaseRows(
    "routine_rules",
    draft.rules.map((rule, index) => ({
      end_date: draft.applicationPeriod.endDate,
      estimated_minutes: rule.estimatedMinutes,
      family_id: DEMO_FAMILY_ID,
      id: rule.id,
      long_term_plan_id: DEMO_ROUTINE_PLAN_ID,
      priority: index,
      repeat_type: rule.repeatType,
      start_date: draft.applicationPeriod.startDate,
      student_id: DEMO_STUDENT_ID,
      subject: rule.subject,
      title: rule.title,
      weekdays: rule.weekdays,
    })),
  );
  await upsertSupabaseRows("day_plans", [
    {
      created_by: DEMO_PARENT_ID,
      id: DEMO_DAY_PLAN_ID,
      plan_date: DEMO_CURRENT_DATE,
      source_id: DEMO_ROUTINE_PLAN_ID,
      source_type: "routine",
      status: "active",
      student_id: DEMO_STUDENT_ID,
    },
  ]);
  await upsertSupabaseRows(
    "study_tasks",
    generatedPlan.todayTasks.map((task, index) =>
      mapRoutineTaskRow(task, index + 1),
    ),
  );
  await upsertSupabaseRows(
    "time_blocks",
    timeBlocks.map((block) => mapTimeBlockRow(block)),
  );
  await upsertSupabaseRows(
    "coach_states",
    [
      {
        current_status: coach.currentStatus,
        day_plan_id: DEMO_DAY_PLAN_ID,
        id: "coach-minjun-2026-05-18",
        latest_start_at: coach.latestStartAt,
        message: coach.message,
        next_task_id: coach.nextTaskId || null,
        recovery_message: coach.recoveryMessage,
        remaining_available_minutes: coach.remainingAvailableMinutes,
        remaining_study_minutes: coach.remainingStudyMinutes,
      },
    ],
    { onConflict: "day_plan_id" },
  );
}

function parseRoutineDraft(formData?: FormData): RoutineSaveDraft {
  const rawDraft = formData?.get("routineDraft");

  if (typeof rawDraft === "string" && rawDraft.length > 0) {
    try {
      const parsed = JSON.parse(rawDraft) as Partial<RoutineSaveDraft>;
      const rules = Array.isArray(parsed.rules)
        ? parsed.rules.filter(isRoutineRule)
        : [];

      if (rules.length > 0 && isApplicationPeriod(parsed.applicationPeriod)) {
        return {
          applicationPeriod: parsed.applicationPeriod,
          rules,
        };
      }
    } catch {
      // Invalid form payload falls back to the stable demo seed.
    }
  }

  return {
    applicationPeriod: mockRoutineApplicationPeriod,
    rules: mockRoutineRules,
  };
}

function isApplicationPeriod(
  value: Partial<RoutineSaveDraft>["applicationPeriod"],
): value is RoutineApplicationPeriod {
  return Boolean(
    value &&
      typeof value.startDate === "string" &&
      typeof value.endDate === "string" &&
      typeof value.examPrepSwitchDate === "string",
  );
}

function isRoutineRule(value: unknown): value is RoutineRule {
  if (!value || typeof value !== "object") {
    return false;
  }

  const rule = value as Partial<RoutineRule>;

  return Boolean(
    typeof rule.id === "string" &&
      typeof rule.title === "string" &&
      typeof rule.subject === "string" &&
      Array.isArray(rule.weekdays) &&
      typeof rule.estimatedMinutes === "number" &&
      (rule.repeatType === "weekly" || rule.repeatType === "daily") &&
      typeof rule.priority === "number",
  );
}

function mapRoutineTaskRow(task: StudyTask, priority: number) {
  return {
    day_plan_id: DEMO_DAY_PLAN_ID,
    estimated_minutes: task.estimatedMinutes,
    id: task.id,
    mission_level: task.missionLevel,
    priority,
    source_id: task.id.replace(/^routine-/, ""),
    source_type: "routine",
    status: task.status,
    study_mode: task.studyMode,
    subject: task.subject,
    title: task.title,
  };
}

function mapTimeBlockRow(block: TimeBlock) {
  return {
    day_plan_id: DEMO_DAY_PLAN_ID,
    end_at: block.endAt,
    id: `routine-block-${block.type}-2026-05-18`,
    is_study_available: block.isStudyAvailable,
    source: block.type === "academy" || block.type === "meal" ? "parent" : "system",
    start_at: block.startAt,
    title: block.title,
    type: block.type,
  };
}
