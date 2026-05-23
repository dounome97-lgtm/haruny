import {
  mockExamSubjects,
  mockFamilyDailyRhythm,
  mockRoutineRules,
  mockStudentProfile,
} from "@/data/mock";
import { calculateDayCoach } from "@/domain/dayCoach";
import { createFamilyTimeBlocks } from "@/domain/familySchedule";
import { generateLongTermExamPlan } from "@/domain/longTermPlan";
import { getMvpDataSource } from "@/services/mvpRepository";
import { upsertSupabaseRows } from "@/services/supabaseWrite";
import { toIsoExamSubjects } from "@/services/parentPlan";
import type { StudyTask, TimeBlock } from "@/types/study";

const DEMO_STUDENT_ID = "user-student-minjun";
const DEMO_PARENT_ID = "user-parent";
const DEMO_EXAM_PLAN_ID = "plan-exam-august-final";
const DEMO_EXAM_SCHEDULE_ID = "exam-august-final";
const DEMO_DAY_PLAN_ID = "day-plan-minjun-2026-07-23";
const DEMO_CURRENT_DATE = "2026-07-23";
const DEMO_CURRENT_TIME = "19:30";

export async function saveDemoExamPrepPlan(): Promise<void> {
  if (getMvpDataSource() !== "supabase") {
    return;
  }

  const generatedPlan = generateLongTermExamPlan({
    currentDate: DEMO_CURRENT_DATE,
    examEndDate: "2026-08-22",
    examName: "8월 기말고사",
    examStartDate: "2026-08-20",
    routineRules: mockRoutineRules,
    studentId: DEMO_STUDENT_ID,
    subjects: toIsoExamSubjects(mockExamSubjects),
  });
  const timeBlocks = createFamilyTimeBlocks({
    currentDate: DEMO_CURRENT_DATE,
    profile: mockStudentProfile,
    rhythm: mockFamilyDailyRhythm,
  });
  const coach = calculateDayCoach({
    currentTime: DEMO_CURRENT_TIME,
    tasks: generatedPlan.todayPlan.tasks,
    timeBlocks,
  });

  await upsertSupabaseRows("long_term_study_plans", [
    {
      created_by: DEMO_PARENT_ID,
      end_date: generatedPlan.goal.endDate,
      id: DEMO_EXAM_PLAN_ID,
      start_date: generatedPlan.goal.startDate,
      status: "active",
      student_id: DEMO_STUDENT_ID,
      title: generatedPlan.goal.title,
      type: "exam",
    },
  ]);
  await upsertSupabaseRows("exam_schedules", [
    {
      exam_end_date: generatedPlan.examSchedule.examEndDate,
      exam_name: generatedPlan.examSchedule.examName,
      exam_start_date: generatedPlan.examSchedule.examStartDate,
      id: DEMO_EXAM_SCHEDULE_ID,
      long_term_plan_id: DEMO_EXAM_PLAN_ID,
      prep_start_date: generatedPlan.examSchedule.prepStartDate,
    },
  ]);
  await upsertSupabaseRows(
    "exam_subjects",
    generatedPlan.examSchedule
      ? mockExamSubjects.map((subject) => ({
          exam_date: toIsoExamSubjects([subject])[0].examDate,
          exam_day_index: subject.examDayIndex,
          exam_schedule_id: DEMO_EXAM_SCHEDULE_ID,
          id: subject.id,
          importance: subject.importance,
          subject: subject.subject,
          target_minutes: subject.targetMinutes,
        }))
      : [],
  );
  await upsertSupabaseRows("day_plans", [
    {
      created_by: DEMO_PARENT_ID,
      id: DEMO_DAY_PLAN_ID,
      plan_date: generatedPlan.todayPlan.date,
      source_id: DEMO_EXAM_PLAN_ID,
      source_type: "exam_plan",
      status: "active",
      student_id: DEMO_STUDENT_ID,
    },
  ]);
  await upsertSupabaseRows(
    "study_tasks",
    generatedPlan.todayPlan.tasks.map((task, index) =>
      mapTaskRow(task, index + 1),
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
        id: "coach-minjun-2026-07-23",
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

function mapTaskRow(task: StudyTask, priority: number) {
  return {
    day_plan_id: DEMO_DAY_PLAN_ID,
    estimated_minutes: task.estimatedMinutes,
    id: task.id,
    mission_level: task.missionLevel,
    priority,
    source_id: task.sourceType === "exam_plan" ? DEMO_EXAM_PLAN_ID : task.id,
    source_type: task.sourceType,
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
    id: `block-${block.type}-2026-07-23`,
    is_study_available: block.isStudyAvailable,
    source: block.type === "academy" || block.type === "meal" ? "parent" : "system",
    start_at: block.startAt,
    title: block.title,
    type: block.type,
  };
}
