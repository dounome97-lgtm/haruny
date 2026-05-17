import { calculateRemainingAvailableMinutes, parseClock } from "./dayCoach";
import type {
  FamilyDailyRhythm,
  StudentProfile,
  StudyTask,
  TimeBlock,
} from "@/types/study";

export type FamilyScheduleInput = {
  currentDate: string;
  profile: StudentProfile;
  rhythm: FamilyDailyRhythm;
};

export function createFamilyTimeBlocks({
  currentDate,
  profile,
  rhythm,
}: FamilyScheduleInput): TimeBlock[] {
  const weekday = getWeekday(currentDate);
  const dailyBlocks = [...rhythm.mealBlocks, ...rhythm.academyBlocks]
    .filter((block) => block.weekdays.includes(weekday))
    .map((block): TimeBlock => ({
      endAt: block.endAt,
      id: block.id,
      isStudyAvailable: false,
      startAt: block.startAt,
      title: block.title,
      type: block.type,
    }));

  const timeBlocks: TimeBlock[] = [
    {
      endAt: profile.schoolEndTime,
      id: "family-school",
      isStudyAvailable: false,
      startAt: profile.schoolStartTime,
      title: "학교",
      type: "school",
    },
    ...dailyBlocks,
    {
      endAt: profile.defaultWakeTime,
      id: "family-sleep",
      isStudyAvailable: false,
      startAt: profile.defaultSleepTime,
      title: "취침",
      type: "sleep",
    },
  ];

  return timeBlocks.sort((a, b) => parseClock(a.startAt) - parseClock(b.startAt));
}

export function calculateAvailableMinutesFromFamilySettings({
  currentDate,
  currentTime,
  profile,
  rhythm,
}: FamilyScheduleInput & {
  currentTime: string;
}): number {
  const blocks = createFamilyTimeBlocks({ currentDate, profile, rhythm });
  const sleepBlock = blocks.find((block) => block.type === "sleep");
  const deadline = sleepBlock ? parseClock(sleepBlock.startAt) : 24 * 60;

  return calculateRemainingAvailableMinutes({
    currentMinute: parseClock(currentTime),
    deadline,
    timeBlocks: blocks,
  });
}

export function summarizeTodayCapacity({
  currentDate,
  currentTime,
  profile,
  rhythm,
  tasks,
}: FamilyScheduleInput & {
  currentTime: string;
  tasks: StudyTask[];
}): {
  availableMinutes: number;
  requiredMinutes: number;
  isEnough: boolean;
} {
  const availableMinutes = calculateAvailableMinutesFromFamilySettings({
    currentDate,
    currentTime,
    profile,
    rhythm,
  });
  const requiredMinutes = tasks
    .filter((task) => task.status !== "done" && task.status !== "moved")
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);

  return {
    availableMinutes,
    isEnough: availableMinutes >= requiredMinutes,
    requiredMinutes,
  };
}

function getWeekday(date: string): number {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date value: ${date}`);
  }

  return new Date(year, month - 1, day).getDay();
}
