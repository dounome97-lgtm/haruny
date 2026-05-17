import type { CoachState, CoachStatus, StudyTask, TimeBlock } from "@/types/study";

export type DayCoachInput = {
  currentTime: string;
  tasks: StudyTask[];
  timeBlocks: TimeBlock[];
};

type TimeWindow = {
  start: number;
  end: number;
};

const DAY_END = 24 * 60;

export function calculateDayCoach(input: DayCoachInput): CoachState {
  const currentMinute = parseClock(input.currentTime);
  const deadline = findStudyDeadline(input.timeBlocks);
  const remainingStudyMinutes = calculateRemainingStudyMinutes(input.tasks);
  const requiredStudyMinutes = calculateRequiredStudyMinutes(input.tasks);
  const remainingAvailableMinutes = calculateRemainingAvailableMinutes({
    currentMinute,
    deadline,
    timeBlocks: input.timeBlocks,
  });
  const latestStartMinute = calculateLatestStartMinute({
    currentMinute,
    deadline,
    requiredMinutes: remainingStudyMinutes,
    timeBlocks: input.timeBlocks,
  });
  const nextTask = pickNextTask(input.tasks);
  const currentStatus = determineCoachStatus({
    currentMinute,
    latestStartMinute,
    remainingAvailableMinutes,
    remainingStudyMinutes,
    requiredStudyMinutes,
  });

  return {
    currentStatus,
    latestStartAt: formatClock(latestStartMinute),
    message: createStatusMessage(currentStatus, nextTask),
    nextTaskId: nextTask?.id ?? "",
    recoveryMessage: createRecoveryMessage({
      currentStatus,
      nextTask,
      remainingAvailableMinutes,
      remainingStudyMinutes,
    }),
    remainingAvailableMinutes,
    remainingStudyMinutes,
  };
}

export function calculateRemainingStudyMinutes(tasks: StudyTask[]): number {
  return tasks
    .filter((task) => task.status !== "done" && task.status !== "moved")
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

export function calculateRequiredStudyMinutes(tasks: StudyTask[]): number {
  return tasks
    .filter(
      (task) =>
        task.missionLevel === "required" &&
        task.status !== "done" &&
        task.status !== "moved",
    )
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);
}

export function calculateRemainingAvailableMinutes({
  currentMinute,
  deadline,
  timeBlocks,
}: {
  currentMinute: number;
  deadline: number;
  timeBlocks: TimeBlock[];
}): number {
  if (currentMinute >= deadline) {
    return 0;
  }

  const unavailable = getUnavailableWindows(timeBlocks)
    .map((window) => intersectWindow(window, { start: currentMinute, end: deadline }))
    .filter((window): window is TimeWindow => Boolean(window));
  const unavailableMinutes = mergeWindows(unavailable).reduce(
    (sum, window) => sum + (window.end - window.start),
    0,
  );

  return Math.max(0, deadline - currentMinute - unavailableMinutes);
}

export function calculateLatestStartMinute({
  currentMinute,
  deadline,
  requiredMinutes,
  timeBlocks,
}: {
  currentMinute: number;
  deadline: number;
  requiredMinutes: number;
  timeBlocks: TimeBlock[];
}): number {
  if (requiredMinutes <= 0) {
    return currentMinute;
  }

  for (let candidate = deadline; candidate >= currentMinute; candidate -= 1) {
    const available = calculateRemainingAvailableMinutes({
      currentMinute: candidate,
      deadline,
      timeBlocks,
    });

    if (available >= requiredMinutes) {
      return candidate;
    }
  }

  return currentMinute;
}

export function pickNextTask(tasks: StudyTask[]): StudyTask | null {
  return (
    tasks.find(
      (task) => task.missionLevel === "required" && task.status === "pending",
    ) ??
    tasks.find((task) => task.status === "pending") ??
    tasks.find((task) => task.status === "in_progress") ??
    null
  );
}

export function parseClock(clock: string): number {
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

export function formatClock(minutes: number): string {
  const normalized = Math.max(0, Math.min(DAY_END - 1, minutes));
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function determineCoachStatus({
  currentMinute,
  latestStartMinute,
  remainingAvailableMinutes,
  remainingStudyMinutes,
  requiredStudyMinutes,
}: {
  currentMinute: number;
  latestStartMinute: number;
  remainingAvailableMinutes: number;
  remainingStudyMinutes: number;
  requiredStudyMinutes: number;
}): CoachStatus {
  if (remainingStudyMinutes <= 0) {
    return "on_track";
  }

  if (remainingAvailableMinutes < requiredStudyMinutes) {
    return "impossible";
  }

  if (remainingAvailableMinutes < remainingStudyMinutes) {
    return "recovery_needed";
  }

  if (currentMinute >= latestStartMinute) {
    return "start_needed";
  }

  if (latestStartMinute - currentMinute <= 15) {
    return "delayed";
  }

  return "on_track";
}

function findStudyDeadline(timeBlocks: TimeBlock[]): number {
  const sleepStart = timeBlocks
    .filter((block) => block.type === "sleep")
    .map((block) => parseClock(block.startAt))
    .sort((a, b) => a - b)[0];

  return sleepStart ?? DAY_END;
}

function getUnavailableWindows(timeBlocks: TimeBlock[]): TimeWindow[] {
  return timeBlocks
    .filter((block) => !block.isStudyAvailable && block.type !== "sleep")
    .map((block) => normalizeWindow(parseClock(block.startAt), parseClock(block.endAt)));
}

function normalizeWindow(start: number, end: number): TimeWindow {
  return {
    start,
    end: end <= start ? DAY_END : end,
  };
}

function intersectWindow(a: TimeWindow, b: TimeWindow): TimeWindow | null {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);

  if (start >= end) {
    return null;
  }

  return { start, end };
}

function mergeWindows(windows: TimeWindow[]): TimeWindow[] {
  const sorted = [...windows].sort((a, b) => a.start - b.start);
  const merged: TimeWindow[] = [];

  for (const window of sorted) {
    const previous = merged.at(-1);

    if (!previous || window.start > previous.end) {
      merged.push({ ...window });
    } else {
      previous.end = Math.max(previous.end, window.end);
    }
  }

  return merged;
}

function createStatusMessage(
  status: CoachStatus,
  nextTask: StudyTask | null,
): string {
  if (!nextTask) {
    return "오늘 필요한 미션은 모두 정리됐어요.";
  }

  const messages: Record<CoachStatus, string> = {
    delayed: `조금 서두르면 괜찮아요. ${nextTask.title}부터 시작해요.`,
    impossible: "오늘 전부 끝내기는 어려워 보여요. 조정 요청을 보내도 괜찮아요.",
    on_track: `지금 ${nextTask.title}부터 시작하면 좋아요.`,
    recovery_needed: "오늘은 필수 미션 중심으로 줄이면 회복할 수 있어요.",
    start_needed: `지금 ${nextTask.title}부터 시작하면 오늘 계획을 지킬 수 있어요.`,
  };

  return messages[status];
}

function createRecoveryMessage({
  currentStatus,
  nextTask,
  remainingAvailableMinutes,
  remainingStudyMinutes,
}: {
  currentStatus: CoachStatus;
  nextTask: StudyTask | null;
  remainingAvailableMinutes: number;
  remainingStudyMinutes: number;
}): string {
  if (!nextTask) {
    return "오늘은 마무리해도 좋아요. 내일 첫 미션만 가볍게 보면 돼요.";
  }

  if (currentStatus === "impossible") {
    return "전부 하려 하기보다 한 가지를 내일로 옮기는 게 좋아요.";
  }

  if (currentStatus === "recovery_needed") {
    return `${nextTask.title}만 먼저 하고, 추가 미션은 내일로 옮길 수 있어요.`;
  }

  return `회복 가능해요. 남은 ${remainingAvailableMinutes}분 안에 ${remainingStudyMinutes}분 공부를 나눠서 할 수 있어요.`;
}
