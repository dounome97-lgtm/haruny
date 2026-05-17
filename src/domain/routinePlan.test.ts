import { describe, expect, it } from "vitest";
import {
  createRoutineTodayTasks,
  generateRoutinePlan,
  lightenRoutineTasks,
} from "./routinePlan";
import type { RoutineApplicationPeriod, RoutineRule, StudyTask } from "@/types/study";

const period: RoutineApplicationPeriod = {
  endDate: "2026-07-20",
  examPrepSwitchDate: "2026-07-21",
  startDate: "2026-05-18",
};

const rules: RoutineRule[] = [
  {
    estimatedMinutes: 25,
    id: "math",
    priority: 1,
    repeatType: "weekly",
    subject: "수학",
    title: "수학 기본 문제 25분",
    weekdays: [1, 3],
  },
  {
    estimatedMinutes: 15,
    id: "english",
    priority: 0,
    repeatType: "daily",
    subject: "영어",
    title: "영어 단어 15분",
    weekdays: [],
  },
];

describe("routinePlan", () => {
  it("generates weekly and daily routine tasks for today", () => {
    const plan = generateRoutinePlan({
      applicationPeriod: period,
      availableMinutes: 60,
      currentDate: "2026-05-18",
      rules,
    });

    expect(plan.weeklyRules).toHaveLength(1);
    expect(plan.dailyMemoryRules).toHaveLength(1);
    expect(plan.todayTasks.map((task) => task.title)).toEqual([
      "영어 단어 15분",
      "수학 기본 문제 25분",
    ]);
    expect(plan.totalTodayMinutes).toBe(40);
  });

  it("keeps the routine tasks connected to today's study task shape", () => {
    const tasks = createRoutineTodayTasks({
      currentDate: "2026-05-19",
      rules,
    });

    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      missionLevel: "required",
      sourceType: "routine",
      studyMode: "memorization",
      subject: "영어",
    });
  });

  it("lightens overloaded days by keeping tasks within available minutes", () => {
    const tasks: StudyTask[] = [
      createTask("영어", 15),
      createTask("수학", 25),
      createTask("국어", 20),
    ];

    expect(lightenRoutineTasks(tasks, 40).map((task) => task.subject)).toEqual([
      "영어",
      "수학",
    ]);
  });
});

function createTask(subject: string, estimatedMinutes: number): StudyTask {
  return {
    estimatedMinutes,
    id: `task-${subject}`,
    missionLevel: "required",
    sourceType: "routine",
    status: "pending",
    studyMode: "memorization",
    subject,
    title: `${subject} 루틴`,
  };
}
