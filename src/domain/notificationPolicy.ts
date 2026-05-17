import type {
  CoachStatus,
  NotificationChannel,
  NotificationRule,
  NotificationRuleType,
  TimeBlock,
} from "@/types/study";

export type NotificationDecisionInput = {
  currentTime: string;
  coachStatus: CoachStatus;
  timeBlocks: TimeBlock[];
  parentSummaryDue: boolean;
  sentToday: Record<NotificationRuleType, number>;
  minutesSinceLastSent: Partial<Record<NotificationRuleType, number>>;
  rules: NotificationRule[];
};

export type NotificationDecision = {
  rule: NotificationRule;
  shouldSend: boolean;
  reason: string;
};

export type NotificationSender = {
  channel: NotificationChannel;
  send: (message: string) => Promise<void>;
};

export function evaluateNotificationRules(
  input: NotificationDecisionInput,
): NotificationDecision[] {
  return input.rules.map((rule) => {
    if (!rule.enabled) {
      return { reason: "알림이 꺼져 있어요.", rule, shouldSend: false };
    }

    if ((input.sentToday[rule.type] ?? 0) >= rule.maxPerDay) {
      return { reason: "오늘 알림 횟수를 넘기지 않아요.", rule, shouldSend: false };
    }

    if ((input.minutesSinceLastSent[rule.type] ?? Infinity) < rule.cooldownMinutes) {
      return { reason: "방금 보낸 알림은 반복하지 않아요.", rule, shouldSend: false };
    }

    return {
      reason: createReason(rule.type),
      rule,
      shouldSend: matchesCondition(rule.type, input),
    };
  });
}

function matchesCondition(
  type: NotificationRuleType,
  input: NotificationDecisionInput,
): boolean {
  if (type === "play_ending") {
    return isPlayEndingSoon(input.currentTime, input.timeBlocks);
  }

  if (type === "study_start_needed") {
    return input.coachStatus === "start_needed" || input.coachStatus === "delayed";
  }

  if (type === "recovery_needed") {
    return (
      input.coachStatus === "recovery_needed" || input.coachStatus === "impossible"
    );
  }

  return input.parentSummaryDue;
}

function isPlayEndingSoon(currentTime: string, timeBlocks: TimeBlock[]): boolean {
  const currentMinute = parseClock(currentTime);

  return timeBlocks.some((block) => {
    if (block.type !== "play") {
      return false;
    }

    const endMinute = parseClock(block.endAt);

    return endMinute >= currentMinute && endMinute - currentMinute <= 10;
  });
}

function createReason(type: NotificationRuleType): string {
  const reasons: Record<NotificationRuleType, string> = {
    parent_summary: "부모 요약 시간이 되었어요.",
    play_ending: "놀이가 끝나기 전에 부드럽게 알려줘요.",
    recovery_needed: "계획을 줄이면 회복할 수 있어요.",
    study_start_needed: "지금 시작하면 오늘 계획을 지킬 수 있어요.",
  };

  return reasons[type];
}

function parseClock(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);

  if (
    hours === undefined ||
    minutes === undefined ||
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    throw new Error(`Invalid clock value: ${clock}`);
  }

  return hours * 60 + minutes;
}
