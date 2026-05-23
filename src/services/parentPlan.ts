import {
  mockExamSubjects,
  mockFamilyDailyRhythm,
  mockFamilySettings,
  mockParentDayEndSummary,
  mockParentExamPlanReview,
  mockParentExamPrep,
  mockParentNotificationSettings,
  mockParentRoutineCreate,
  mockParentExamSubjectEntry,
  mockParentTodayAdjustment,
  mockParentWeekAdjustment,
  mockRoutineApplicationPeriod,
  mockRoutineRules,
  mockStudentProfile,
} from "@/data/mock";
import {
  calculateAvailableMinutesFromFamilySettings,
  createFamilyTimeBlocks,
} from "@/domain/familySchedule";
import { generateLongTermExamPlan } from "@/domain/longTermPlan";
import { generateRoutinePlan } from "@/domain/routinePlan";
import { getMvpReadRepository } from "@/services/mvpRepository";
import type { ExamSubject } from "@/types/study";

export function getParentExamPrepView() {
  return mockParentExamPrep;
}

export function getParentExamSubjectEntryView() {
  return mockParentExamSubjectEntry;
}

export function getParentExamPlanReviewView() {
  const generatedPlan = generateLongTermExamPlan({
    currentDate: "2026-07-23",
    examEndDate: "2026-08-22",
    examName: "8월 기말고사",
    examStartDate: "2026-08-20",
    subjects: toIsoExamSubjects(mockExamSubjects),
    studentId: "user-student-minjun",
  });

  return {
    ...mockParentExamPlanReview,
    firstWeekTasks: generatedPlan.todayPlan.tasks
      .filter((task) => task.sourceType === "exam_plan")
      .map((task) => task.title),
    studentPreviewTasks: generatedPlan.todayPlan.tasks
      .slice(0, 2)
      .map((task) => `${task.subject} ${task.estimatedMinutes}분`),
    thisWeekMinutes: generatedPlan.weeklyPlan.totalTargetMinutes,
    todayMinutes: generatedPlan.todayPlan.tasks.reduce(
      (sum, task) => sum + task.estimatedMinutes,
      0,
    ),
    weekendBufferMinutes: generatedPlan.weeklyPlan.weekendBufferMinutes,
    weekStrategy: generatedPlan.weeklyPlan.strategyNote,
  };
}

export function getParentRoutineCreateView() {
  const generatedPlan = generateRoutinePlan({
    applicationPeriod: mockRoutineApplicationPeriod,
    availableMinutes: 45,
    currentDate: "2026-05-18",
    rules: mockRoutineRules,
  });

  return {
    ...mockParentRoutineCreate,
    dailyMemoryRules: generatedPlan.dailyMemoryRules,
    examPrepSwitchMessage: generatedPlan.examPrepSwitchMessage,
    lightenedTasks: generatedPlan.lightenedTasks,
    overloadMessage: generatedPlan.overloadMessage,
    todayTasks: generatedPlan.todayTasks,
    totalTodayMinutes: generatedPlan.totalTodayMinutes,
    weeklyRules: generatedPlan.weeklyRules,
  };
}

export async function getParentReassuranceView() {
  return getMvpReadRepository().getParentReassuranceView();
}

export function getParentTodayAdjustmentView() {
  return mockParentTodayAdjustment;
}

export function getParentWeekAdjustmentView() {
  return mockParentWeekAdjustment;
}

export function getParentDayEndSummaryView() {
  return mockParentDayEndSummary;
}

export function getParentNotificationSettingsView() {
  return mockParentNotificationSettings;
}

export function getFamilySettingsView() {
  const generatedTimeBlocks = createFamilyTimeBlocks({
    currentDate: "2026-05-18",
    profile: mockStudentProfile,
    rhythm: mockFamilyDailyRhythm,
  });
  const availableMinutesPreview = calculateAvailableMinutesFromFamilySettings({
    currentDate: "2026-05-18",
    currentTime: "17:30",
    profile: mockStudentProfile,
    rhythm: mockFamilyDailyRhythm,
  });

  return {
    ...mockFamilySettings,
    availableMinutesPreview,
    generatedTimeBlocks,
  };
}

export function toIsoExamSubjects(subjects: ExamSubject[]): ExamSubject[] {
  return subjects.map((subject) => ({
    ...subject,
    examDate: dayIndexToExamDate(subject.examDayIndex),
  }));
}

function dayIndexToExamDate(examDayIndex: number): string {
  const dates: Record<number, string> = {
    1: "2026-08-20",
    2: "2026-08-21",
    3: "2026-08-22",
  };

  return dates[examDayIndex] ?? "2026-08-20";
}
