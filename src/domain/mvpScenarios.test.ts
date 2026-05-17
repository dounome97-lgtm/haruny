import { describe, expect, it } from "vitest";
import { calculateDayCoach } from "./dayCoach";
import { generateLongTermExamPlan } from "./longTermPlan";
import { evaluateNotificationRules } from "./notificationPolicy";
import type { ExamSubject, NotificationRule, StudyTask, TimeBlock } from "@/types/study";

const subjects: ExamSubject[] = [
  {
    examDate: "2026-08-21",
    examDayIndex: 2,
    id: "math",
    importance: "high",
    subject: "수학",
    targetMinutes: 160,
  },
  {
    examDate: "2026-08-22",
    examDayIndex: 3,
    id: "english",
    importance: "high",
    subject: "영어",
    targetMinutes: 140,
  },
  {
    examDate: "2026-08-20",
    examDayIndex: 1,
    id: "social",
    importance: "medium",
    subject: "사회",
    targetMinutes: 60,
  },
];

const tasks: StudyTask[] = [
  {
    estimatedMinutes: 25,
    id: "math",
    missionLevel: "required",
    sourceType: "exam_plan",
    status: "pending",
    studyMode: "wrong_answer",
    subject: "수학",
    title: "수학 오답 20개",
  },
  {
    estimatedMinutes: 15,
    id: "english",
    missionLevel: "required",
    sourceType: "routine",
    status: "pending",
    studyMode: "memorization",
    subject: "영어",
    title: "영어 단어 40개",
  },
  {
    estimatedMinutes: 30,
    id: "science",
    missionLevel: "extra",
    sourceType: "exam_plan",
    status: "pending",
    studyMode: "concept",
    subject: "과학",
    title: "과학 개념 3페이지",
  },
];

const timeBlocks: TimeBlock[] = [
  {
    endAt: "20:00",
    id: "academy",
    isStudyAvailable: false,
    startAt: "19:30",
    title: "학원",
    type: "academy",
  },
  {
    endAt: "07:00",
    id: "sleep",
    isStudyAvailable: false,
    startAt: "22:30",
    title: "취침",
    type: "sleep",
  },
];

const notificationRules: NotificationRule[] = [
  {
    channel: "web_push",
    cooldownMinutes: 90,
    enabled: true,
    id: "start",
    maxPerDay: 1,
    messageTemplate: "지금 시작하면 오늘 계획을 지킬 수 있어요.",
    type: "study_start_needed",
  },
  {
    channel: "web_push",
    cooldownMinutes: 120,
    enabled: true,
    id: "recovery",
    maxPerDay: 1,
    messageTemplate: "오늘은 필수만 남기면 회복할 수 있어요.",
    type: "recovery_needed",
  },
];

describe("MVP scenarios", () => {
  it("validates the one-month exam plan phases and weekend buffer", () => {
    const fourWeeks = createExamPlan("2026-07-23");
    const twoWeeks = createExamPlan("2026-08-10");
    const oneWeek = createExamPlan("2026-08-15");

    expect(fourWeeks.weeklyPlan.examPhase).toBe("four_weeks_before");
    expect(twoWeeks.weeklyPlan.examPhase).toBe("two_weeks_before");
    expect(oneWeek.weeklyPlan.examPhase).toBe("one_week_before");
    expect(fourWeeks.weeklyPlan.weekendBufferMinutes).toBeGreaterThan(0);
  });

  it("keeps daily study as required, extra and optional mission-style tasks", () => {
    const plan = createExamPlan("2026-07-23");

    expect(plan.todayPlan.tasks[0].missionLevel).toBe("required");
    expect(plan.todayPlan.tasks[1].missionLevel).toBe("required");
    expect(plan.todayPlan.tasks[2].missionLevel).toBe("extra");
  });

  it("validates normal, recovery and impossible day-coach states", () => {
    expect(
      calculateDayCoach({
        currentTime: "18:00",
        tasks,
        timeBlocks,
      }).currentStatus,
    ).toBe("on_track");

    expect(
      calculateDayCoach({
        currentTime: "21:45",
        tasks,
        timeBlocks,
      }).currentStatus,
    ).toBe("recovery_needed");

    expect(
      calculateDayCoach({
        currentTime: "22:00",
        tasks,
        timeBlocks,
      }).currentStatus,
    ).toBe("impossible");
  });

  it("keeps parent notification criteria focused on start and recovery needs", () => {
    const decisions = evaluateNotificationRules({
      coachStatus: "recovery_needed",
      currentTime: "21:45",
      minutesSinceLastSent: {},
      parentSummaryDue: false,
      rules: notificationRules,
      sentToday: {
        parent_summary: 0,
        play_ending: 0,
        recovery_needed: 0,
        study_start_needed: 0,
      },
      timeBlocks,
    });

    const recoveryDecision = decisions.find(
      (decision) => decision.rule.type === "recovery_needed",
    );
    const startDecision = decisions.find(
      (decision) => decision.rule.type === "study_start_needed",
    );

    expect(recoveryDecision?.shouldSend).toBe(true);
    expect(startDecision?.shouldSend).toBe(false);
  });
});

function createExamPlan(currentDate: string) {
  return generateLongTermExamPlan({
    currentDate,
    examEndDate: "2026-08-22",
    examName: "8월 기말고사",
    examStartDate: "2026-08-20",
    studentId: "student-minjun",
    subjects,
  });
}
