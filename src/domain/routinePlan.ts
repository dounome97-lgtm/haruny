import type {
  GeneratedRoutinePlan,
  RoutineApplicationPeriod,
  RoutineRule,
  StudyTask,
} from "@/types/study";

export type GenerateRoutinePlanInput = {
  currentDate: string;
  availableMinutes: number;
  applicationPeriod: RoutineApplicationPeriod;
  rules: RoutineRule[];
};

export function generateRoutinePlan({
  applicationPeriod,
  availableMinutes,
  currentDate,
  rules,
}: GenerateRoutinePlanInput): GeneratedRoutinePlan {
  const weeklyRules = rules.filter((rule) => rule.repeatType === "weekly");
  const dailyMemoryRules = rules.filter((rule) => rule.repeatType === "daily");
  const todayTasks = isWithinPeriod(currentDate, applicationPeriod)
    ? rules
        .filter((rule) => appliesToDate(rule, currentDate))
        .sort((a, b) => a.priority - b.priority)
        .map(createRoutineTask)
    : [];
  const lightenedTasks = lightenRoutineTasks(todayTasks, availableMinutes);

  return {
    dailyMemoryRules,
    examPrepSwitchMessage: `${applicationPeriod.examPrepSwitchDate}부터는 시험 준비 미션을 먼저 두고 평시 루틴은 가볍게 줄여요.`,
    lightenedTasks,
    overloadMessage:
      lightenedTasks.length < todayTasks.length
        ? "오늘은 시간이 빠듯해서 꼭 이어갈 루틴만 남겼어요."
        : "오늘 루틴은 무리 없이 이어갈 수 있어요.",
    todayTasks,
    totalTodayMinutes: todayTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0),
    weeklyRules,
  };
}

export function createRoutineTodayTasks({
  currentDate,
  rules,
}: {
  currentDate: string;
  rules: RoutineRule[];
}): StudyTask[] {
  return rules
    .filter((rule) => appliesToDate(rule, currentDate))
    .sort((a, b) => a.priority - b.priority)
    .map(createRoutineTask);
}

export function lightenRoutineTasks(
  tasks: StudyTask[],
  availableMinutes: number,
): StudyTask[] {
  const keptTasks: StudyTask[] = [];
  let usedMinutes = 0;

  for (const task of tasks) {
    if (usedMinutes + task.estimatedMinutes <= availableMinutes) {
      keptTasks.push(task);
      usedMinutes += task.estimatedMinutes;
    }
  }

  return keptTasks;
}

function createRoutineTask(rule: RoutineRule): StudyTask {
  return {
    estimatedMinutes: rule.estimatedMinutes,
    id: `routine-${rule.id}`,
    missionLevel: rule.repeatType === "daily" ? "required" : "extra",
    sourceType: "routine",
    status: "pending",
    studyMode: rule.repeatType === "daily" ? "memorization" : "problem_solving",
    subject: rule.subject,
    title: rule.title,
  };
}

function appliesToDate(rule: RoutineRule, date: string): boolean {
  if (rule.repeatType === "daily") {
    return true;
  }

  return rule.weekdays.includes(getWeekday(date));
}

function getWeekday(date: string): number {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date value: ${date}`);
  }

  return new Date(year, month - 1, day).getDay();
}

function isWithinPeriod(
  currentDate: string,
  applicationPeriod: RoutineApplicationPeriod,
): boolean {
  return (
    currentDate >= applicationPeriod.startDate &&
    currentDate <= applicationPeriod.endDate
  );
}
