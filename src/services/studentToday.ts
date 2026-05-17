import {
  mockExamSubjects,
  mockFamilyDailyRhythm,
  mockRoutineRules,
  mockStudentProfile,
  mockStudentAdjustment,
  mockStudentDayClosing,
  mockStudentToday,
  mockStudentWeek,
} from "@/data/mock";
import { calculateDayCoach, pickNextTask } from "@/domain/dayCoach";
import { createFamilyTimeBlocks } from "@/domain/familySchedule";
import { generateLongTermExamPlan } from "@/domain/longTermPlan";
import { toIsoExamSubjects } from "@/services/parentPlan";
import type { MissionLevel, StudentTodayView, StudyTask } from "@/types/study";

export function getStudentTodayView(): StudentTodayView {
  const generatedPlan = generateLongTermExamPlan({
    currentDate: "2026-07-23",
    examEndDate: "2026-08-22",
    examName: "8월 기말고사",
    examStartDate: "2026-08-20",
    routineRules: mockRoutineRules,
    studentId: "user-student-minjun",
    subjects: toIsoExamSubjects(mockExamSubjects),
  });
  const tasks = generatedPlan.todayPlan.tasks;
  const timeBlocks = createFamilyTimeBlocks({
    currentDate: "2026-07-23",
    profile: mockStudentProfile,
    rhythm: mockFamilyDailyRhythm,
  });
  const coach = calculateDayCoach({
    currentTime: "19:30",
    tasks,
    timeBlocks,
  });
  const nextTask =
    pickNextTask(tasks) ?? mockStudentToday.nextTask;

  return {
    ...mockStudentToday,
    coach,
    headline: coach.message,
    nextTask,
    tasks,
    timeBlocks,
    subcopy: "남은 시간 안에서 필수 미션부터 가볍게 이어가요.",
  };
}

export function getStudentWeekView() {
  return mockStudentWeek;
}

export function getStudentDayClosingView() {
  return mockStudentDayClosing;
}

export function getStudentAdjustmentView() {
  return mockStudentAdjustment;
}

export function getTasksByMissionLevel(
  tasks: StudyTask[],
  missionLevel: MissionLevel,
): StudyTask[] {
  return tasks.filter((task) => task.missionLevel === missionLevel);
}

export function getMissionLevelLabel(missionLevel: MissionLevel): string {
  const labels: Record<MissionLevel, string> = {
    required: "필수",
    extra: "추가",
    optional: "남으면",
  };

  return labels[missionLevel];
}
