import { describe, expect, it } from "vitest";
import {
  calculateAvailableMinutesFromFamilySettings,
  createFamilyTimeBlocks,
  summarizeTodayCapacity,
} from "./familySchedule";
import type { FamilyDailyRhythm, StudentProfile, StudyTask } from "@/types/study";

const profile: StudentProfile = {
  defaultSleepTime: "22:30",
  defaultWakeTime: "07:00",
  id: "profile",
  schoolEndTime: "15:30",
  schoolStartTime: "08:30",
  userId: "student",
};

const rhythm: FamilyDailyRhythm = {
  academyBlocks: [
    {
      endAt: "20:00",
      id: "academy",
      startAt: "19:30",
      title: "학원",
      type: "academy",
      weekdays: [1],
    },
  ],
  defaultDinnerTime: "18:30",
  defaultSleepTime: "22:30",
  mealBlocks: [
    {
      endAt: "18:30",
      id: "dinner",
      startAt: "18:00",
      title: "저녁",
      type: "meal",
      weekdays: [1],
    },
  ],
  schoolEndTime: "15:30",
  schoolStartTime: "08:30",
};

const tasks: StudyTask[] = [
  {
    estimatedMinutes: 40,
    id: "math",
    missionLevel: "required",
    sourceType: "routine",
    status: "pending",
    studyMode: "problem_solving",
    subject: "수학",
    title: "수학",
  },
];

describe("familySchedule", () => {
  it("creates school, academy, meal and sleep blocks from family settings", () => {
    const blocks = createFamilyTimeBlocks({
      currentDate: "2026-05-18",
      profile,
      rhythm,
    });

    expect(blocks.map((block) => block.type)).toEqual([
      "school",
      "meal",
      "academy",
      "sleep",
    ]);
  });

  it("reflects family settings in available study time", () => {
    expect(
      calculateAvailableMinutesFromFamilySettings({
        currentDate: "2026-05-18",
        currentTime: "17:30",
        profile,
        rhythm,
      }),
    ).toBe(240);
  });

  it("summarizes whether today's tasks fit the family rhythm", () => {
    const capacity = summarizeTodayCapacity({
      currentDate: "2026-05-18",
      currentTime: "17:30",
      profile,
      rhythm,
      tasks,
    });

    expect(capacity).toMatchObject({
      availableMinutes: 240,
      isEnough: true,
      requiredMinutes: 40,
    });
  });
});
