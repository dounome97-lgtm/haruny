import { describe, expect, it } from "vitest";
import {
  adjustRoutineRulesForExamPrep,
  calculatePrepStartDate,
  generateLongTermExamPlan,
  getExamPhase,
} from "./longTermPlan";
import type { ExamSubject, RoutineRule } from "@/types/study";

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

const routines: RoutineRule[] = [
  {
    estimatedMinutes: 15,
    id: "english-words",
    priority: 1,
    repeatType: "daily",
    subject: "영어",
    title: "영어 단어 15분",
    weekdays: [],
  },
  {
    estimatedMinutes: 30,
    id: "art",
    priority: 3,
    repeatType: "weekly",
    subject: "미술",
    title: "미술 감상",
    weekdays: [1],
  },
];

describe("longTermPlan", () => {
  it("starts exam preparation 30 days before the exam start date", () => {
    expect(calculatePrepStartDate("2026-08-20")).toBe("2026-07-21");
  });

  it("classifies exam phases by days until exam", () => {
    expect(getExamPhase("2026-07-23", "2026-08-20")).toBe("four_weeks_before");
    expect(getExamPhase("2026-08-01", "2026-08-20")).toBe("three_weeks_before");
    expect(getExamPhase("2026-08-10", "2026-08-20")).toBe("two_weeks_before");
    expect(getExamPhase("2026-08-15", "2026-08-20")).toBe("one_week_before");
  });

  it("generates weekly allocations and today's mission-style tasks", () => {
    const plan = generateLongTermExamPlan({
      currentDate: "2026-07-23",
      examEndDate: "2026-08-22",
      examName: "8월 기말고사",
      examStartDate: "2026-08-20",
      routineRules: routines,
      studentId: "student-minjun",
      subjects,
    });

    expect(plan.weeklyPlan.examPhase).toBe("four_weeks_before");
    expect(plan.weeklyPlan.allocations[0].subject).toBe("수학");
    expect(plan.weeklyPlan.weekendBufferMinutes).toBeGreaterThan(0);
    expect(plan.todayPlan.tasks[0].missionLevel).toBe("required");
    expect(plan.todayPlan.tasks[2].missionLevel).toBe("extra");
    expect(plan.todayPlan.tasks.some((task) => task.title === "영어 단어 15분")).toBe(
      true,
    );
  });

  it("keeps exam subject routines and removes unrelated weekly routines during exam prep", () => {
    const adjusted = adjustRoutineRulesForExamPrep(routines, subjects);

    expect(adjusted.map((rule) => rule.subject)).toEqual(["영어"]);
  });
});
