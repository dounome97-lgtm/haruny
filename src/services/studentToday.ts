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
import { getMvpReadRepository, type StudentTodaySeed } from "@/services/mvpRepository";
import { toIsoExamSubjects } from "@/services/parentPlan";
import type { MissionLevel, StudentTodayView, StudyTask } from "@/types/study";

export async function getStudentTodayView(): Promise<StudentTodayView> {
  const seed = await getMvpReadRepository().getStudentTodaySeed();

  return buildStudentTodayView(seed);
}

export function buildStudentTodayView(seed: StudentTodaySeed): StudentTodayView {
  const generatedPlan = generateLongTermExamPlan({
    currentDate: seed.currentDate,
    examEndDate: seed.examEndDate,
    examName: seed.examName,
    examStartDate: seed.examStartDate,
    routineRules: seed.routineRules,
    studentId: seed.studentId,
    subjects: toIsoExamSubjects(seed.subjects),
  });
  const tasks = seed.savedTasks ?? generatedPlan.todayPlan.tasks;
  const timeBlocks =
    seed.savedTimeBlocks ??
    createFamilyTimeBlocks({
      currentDate: seed.currentDate,
      profile: seed.profile,
      rhythm: seed.familyRhythm,
    });
  const coach = seed.savedCoach ?? calculateDayCoach({
    currentTime: seed.currentTime,
    tasks,
    timeBlocks,
  });
  const nextTask =
    pickNextTask(tasks) ?? mockStudentToday.nextTask;

  return {
    ...seed.fallbackView,
    coach,
    dateLabel: formatKoreanDateLabel(seed.currentDate),
    headline: coach.message,
    nextTask,
    studentName: seed.studentName ?? seed.fallbackView.studentName,
    tasks,
    timeBlocks,
    subcopy: "남은 시간 안에서 필수 미션부터 가볍게 이어가요.",
  };
}

export const mockStudentTodaySeed: StudentTodaySeed = {
  currentDate: "2026-07-23",
  currentTime: "19:30",
  examEndDate: "2026-08-22",
  examName: "8월 기말고사",
  examStartDate: "2026-08-20",
  fallbackView: mockStudentToday,
  familyRhythm: mockFamilyDailyRhythm,
  profile: mockStudentProfile,
  routineRules: mockRoutineRules,
  studentId: "user-student-minjun",
  subjects: mockExamSubjects,
};

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

function formatKoreanDateLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = new Date(year, month - 1, day).getDay();

  return `${month}월 ${day}일 ${weekdays[weekday]}요일`;
}
