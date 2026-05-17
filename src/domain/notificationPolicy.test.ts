import { describe, expect, it } from "vitest";
import { evaluateNotificationRules } from "./notificationPolicy";
import type { NotificationRule, TimeBlock } from "@/types/study";

const rules: NotificationRule[] = [
  {
    channel: "web_push",
    cooldownMinutes: 60,
    enabled: true,
    id: "play",
    maxPerDay: 2,
    messageTemplate: "놀이가 곧 끝나요.",
    type: "play_ending",
  },
  {
    channel: "mobile_push",
    cooldownMinutes: 120,
    enabled: true,
    id: "start",
    maxPerDay: 1,
    messageTemplate: "지금 시작하면 괜찮아요.",
    type: "study_start_needed",
  },
];

const timeBlocks: TimeBlock[] = [
  {
    endAt: "19:00",
    id: "play",
    isStudyAvailable: false,
    startAt: "18:00",
    title: "놀이",
    type: "play",
  },
];

describe("notificationPolicy", () => {
  it("detects play ending and study start notifications", () => {
    const decisions = evaluateNotificationRules({
      coachStatus: "start_needed",
      currentTime: "18:55",
      minutesSinceLastSent: {},
      parentSummaryDue: false,
      rules,
      sentToday: {
        parent_summary: 0,
        play_ending: 0,
        recovery_needed: 0,
        study_start_needed: 0,
      },
      timeBlocks,
    });

    expect(decisions.map((decision) => decision.shouldSend)).toEqual([true, true]);
  });

  it("respects daily fatigue limits and cooldown", () => {
    const decisions = evaluateNotificationRules({
      coachStatus: "start_needed",
      currentTime: "18:55",
      minutesSinceLastSent: { study_start_needed: 10 },
      parentSummaryDue: false,
      rules,
      sentToday: {
        parent_summary: 0,
        play_ending: 2,
        recovery_needed: 0,
        study_start_needed: 0,
      },
      timeBlocks,
    });

    expect(decisions.map((decision) => decision.shouldSend)).toEqual([false, false]);
  });
});
