import { describe, expect, it } from "vitest";
import {
  calculateDayCoach,
  calculateRemainingAvailableMinutes,
  calculateRemainingStudyMinutes,
  formatClock,
  parseClock,
  pickNextTask,
} from "./dayCoach";
import type { StudyTask, TimeBlock } from "@/types/study";

const tasks: StudyTask[] = [
  {
    id: "math",
    estimatedMinutes: 25,
    missionLevel: "required",
    sourceType: "exam_plan",
    status: "pending",
    studyMode: "wrong_answer",
    subject: "수학",
    title: "수학 오답 20개",
  },
  {
    id: "english",
    estimatedMinutes: 15,
    missionLevel: "required",
    sourceType: "routine",
    status: "pending",
    studyMode: "memorization",
    subject: "영어",
    title: "영어 단어 40개",
  },
  {
    id: "korean",
    estimatedMinutes: 20,
    missionLevel: "extra",
    sourceType: "routine",
    status: "pending",
    studyMode: "problem_solving",
    subject: "국어",
    title: "국어 독해 2지문",
  },
];

const timeBlocks: TimeBlock[] = [
  {
    id: "academy",
    endAt: "20:00",
    isStudyAvailable: false,
    startAt: "19:30",
    title: "학원",
    type: "academy",
  },
  {
    id: "sleep",
    endAt: "07:00",
    isStudyAvailable: false,
    startAt: "22:30",
    title: "취침",
    type: "sleep",
  },
];

describe("dayCoach", () => {
  it("sums remaining study minutes excluding done and moved tasks", () => {
    expect(
      calculateRemainingStudyMinutes([
        tasks[0],
        { ...tasks[1], status: "done" },
        { ...tasks[2], status: "moved" },
      ]),
    ).toBe(25);
  });

  it("calculates available minutes before sleep excluding unavailable blocks", () => {
    expect(
      calculateRemainingAvailableMinutes({
        currentMinute: parseClock("19:00"),
        deadline: parseClock("22:30"),
        timeBlocks,
      }),
    ).toBe(180);
  });

  it("picks a pending required task first", () => {
    expect(pickNextTask(tasks)?.id).toBe("math");
  });

  it("returns recovery_needed when all missions do not fit but required missions fit", () => {
    const coach = calculateDayCoach({
      currentTime: "21:45",
      tasks,
      timeBlocks,
    });

    expect(coach.currentStatus).toBe("recovery_needed");
    expect(coach.remainingAvailableMinutes).toBe(45);
    expect(coach.remainingStudyMinutes).toBe(60);
  });

  it("returns impossible when required missions do not fit", () => {
    const coach = calculateDayCoach({
      currentTime: "22:00",
      tasks,
      timeBlocks,
    });

    expect(coach.currentStatus).toBe("impossible");
  });

  it("formats minutes as a clock", () => {
    expect(formatClock(20 * 60 + 5)).toBe("20:05");
  });
});
