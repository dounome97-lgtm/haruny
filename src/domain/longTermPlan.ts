import type {
  ExamPhase,
  ExamSchedule,
  ExamSubject,
  GeneratedDailyPlan,
  GeneratedLongTermPlan,
  GeneratedWeeklyPlan,
  LongTermStudyGoal,
  MissionLevel,
  RoutineRule,
  StudyTask,
} from "@/types/study";

export type GenerateExamPlanInput = {
  currentDate: string;
  examName: string;
  examStartDate: string;
  examEndDate: string;
  studentId: string;
  subjects: ExamSubject[];
  routineRules?: RoutineRule[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function generateLongTermExamPlan(
  input: GenerateExamPlanInput,
): GeneratedLongTermPlan {
  const prepStartDate = calculatePrepStartDate(input.examStartDate);
  const goal: LongTermStudyGoal = {
    endDate: input.examEndDate,
    id: "goal-exam-plan",
    startDate: prepStartDate,
    status: "active",
    studentId: input.studentId,
    title: input.examName,
    type: "exam",
  };
  const examSchedule: ExamSchedule = {
    examEndDate: input.examEndDate,
    examName: input.examName,
    examStartDate: input.examStartDate,
    id: "exam-schedule",
    longTermPlanId: goal.id,
    prepStartDate,
  };
  const weeklyPlan = generateWeeklyPlan(input);
  const todayPlan = generateDailyPlan({
    currentDate: input.currentDate,
    phase: weeklyPlan.examPhase,
    routineRules: input.routineRules ?? [],
    subjects: input.subjects,
    weeklyPlan,
  });

  return {
    examSchedule,
    goal,
    todayPlan,
    weeklyPlan,
  };
}

export function calculatePrepStartDate(examStartDate: string): string {
  return addDays(examStartDate, -30);
}

export function getExamPhase(currentDate: string, examStartDate: string): ExamPhase {
  const daysUntilExam = differenceInDays(currentDate, examStartDate);

  if (daysUntilExam <= 7) {
    return "one_week_before";
  }

  if (daysUntilExam <= 14) {
    return "two_weeks_before";
  }

  if (daysUntilExam <= 21) {
    return "three_weeks_before";
  }

  return "four_weeks_before";
}

export function generateWeeklyPlan(
  input: GenerateExamPlanInput,
): GeneratedWeeklyPlan {
  const phase = getExamPhase(input.currentDate, input.examStartDate);
  const allocations = input.subjects
    .map((subject, index) => {
      const priority = importancePriority(subject.importance);
      const plannedMinutes = Math.max(
        15,
        Math.round((subject.targetMinutes * phaseStudyRatio(phase)) / 10) * 10,
      );

      return {
        plannedMinutes,
        priority: priority * 10 - index,
        subject: subject.subject,
        targetMinutes: subject.targetMinutes,
      };
    })
    .sort((a, b) => b.priority - a.priority);
  const totalTargetMinutes = allocations.reduce(
    (sum, allocation) => sum + allocation.plannedMinutes,
    0,
  );
  const weekendBufferMinutes = calculateWeekendBufferMinutes(totalTargetMinutes);

  return {
    allocations,
    examPhase: phase,
    intensity: phaseIntensity(phase),
    strategyNote: phaseStrategyNote(phase),
    totalTargetMinutes,
    weekendBufferMinutes,
    weekEndDate: addDays(input.currentDate, 6),
    weekStartDate: input.currentDate,
  };
}

export function generateDailyPlan({
  currentDate,
  phase,
  routineRules,
  subjects,
  weeklyPlan,
}: {
  currentDate: string;
  phase: ExamPhase;
  routineRules: RoutineRule[];
  subjects: ExamSubject[];
  weeklyPlan: GeneratedWeeklyPlan;
}): GeneratedDailyPlan {
  const topAllocations = weeklyPlan.allocations.slice(0, 3);
  const examTasks = topAllocations.map((allocation, index) =>
    createExamStudyTask({
      allocationSubject: allocation.subject,
      estimatedMinutes: index === 0 ? 25 : 15,
      index,
      phase,
      subject: subjects.find((item) => item.subject === allocation.subject),
    }),
  );
  const routineTasks = adjustRoutineRulesForExamPrep(routineRules, subjects)
    .filter((rule) => appliesToDate(rule, currentDate))
    .slice(0, 1)
    .map((rule) => createRoutineTask(rule));

  return {
    date: currentDate,
    tasks: [...examTasks, ...routineTasks],
  };
}

export function adjustRoutineRulesForExamPrep(
  routineRules: RoutineRule[],
  subjects: ExamSubject[],
): RoutineRule[] {
  const examSubjectNames = new Set(subjects.map((subject) => subject.subject));

  return routineRules
    .filter((rule) => rule.repeatType === "daily" || examSubjectNames.has(rule.subject))
    .map((rule) => ({
      ...rule,
      estimatedMinutes: examSubjectNames.has(rule.subject)
        ? rule.estimatedMinutes
        : Math.min(rule.estimatedMinutes, 15),
    }));
}

function createExamStudyTask({
  allocationSubject,
  estimatedMinutes,
  index,
  phase,
  subject,
}: {
  allocationSubject: string;
  estimatedMinutes: number;
  index: number;
  phase: ExamPhase;
  subject?: ExamSubject;
}): StudyTask {
  return {
    estimatedMinutes,
    id: `generated-${allocationSubject}-${index}`,
    missionLevel: missionLevelForIndex(index),
    sourceType: "exam_plan",
    status: "pending",
    studyMode: studyModeForPhase(phase),
    subject: allocationSubject,
    title: `${allocationSubject} ${taskTitleForPhase(phase, subject?.importance)}`,
  };
}

function createRoutineTask(rule: RoutineRule): StudyTask {
  return {
    estimatedMinutes: rule.estimatedMinutes,
    id: `routine-${rule.id}`,
    missionLevel: "required",
    sourceType: "routine",
    status: "pending",
    studyMode: "memorization",
    subject: rule.subject,
    title: rule.title,
  };
}

function missionLevelForIndex(index: number): MissionLevel {
  if (index <= 1) {
    return "required";
  }

  if (index === 2) {
    return "extra";
  }

  return "optional";
}

function studyModeForPhase(phase: ExamPhase): StudyTask["studyMode"] {
  const modes: Record<ExamPhase, StudyTask["studyMode"]> = {
    four_weeks_before: "concept",
    one_week_before: "memorization",
    three_weeks_before: "problem_solving",
    two_weeks_before: "review",
  };

  return modes[phase];
}

function taskTitleForPhase(
  phase: ExamPhase,
  importance: ExamSubject["importance"] | undefined,
): string {
  if (phase === "one_week_before") {
    return importance === "high" ? "오답과 암기 반복" : "핵심 암기";
  }

  if (phase === "two_weeks_before") {
    return "시험범위 회독";
  }

  if (phase === "three_weeks_before") {
    return "대표 문제풀이";
  }

  return "개념 빈틈 확인";
}

function phaseStudyRatio(phase: ExamPhase): number {
  const ratios: Record<ExamPhase, number> = {
    four_weeks_before: 0.28,
    one_week_before: 0.48,
    three_weeks_before: 0.34,
    two_weeks_before: 0.42,
  };

  return ratios[phase];
}

function phaseIntensity(phase: ExamPhase): GeneratedWeeklyPlan["intensity"] {
  const intensities: Record<ExamPhase, GeneratedWeeklyPlan["intensity"]> = {
    four_weeks_before: "low",
    one_week_before: "very_high",
    three_weeks_before: "medium",
    two_weeks_before: "high",
  };

  return intensities[phase];
}

function phaseStrategyNote(phase: ExamPhase): string {
  const notes: Record<ExamPhase, string> = {
    four_weeks_before: "루틴 유지와 개념 빈틈 확인",
    one_week_before: "암기, 오답, 교과서 중심으로 판단 줄이기",
    three_weeks_before: "기본 문제와 대표 유형 시작",
    two_weeks_before: "시험범위 회독과 오답 반복",
  };

  return notes[phase];
}

function importancePriority(importance: ExamSubject["importance"]): number {
  const priorities: Record<ExamSubject["importance"], number> = {
    high: 3,
    low: 1,
    medium: 2,
  };

  return priorities[importance];
}

function appliesToDate(rule: RoutineRule, date: string): boolean {
  if (rule.repeatType === "daily") {
    return true;
  }

  return rule.weekdays.includes(getWeekday(date));
}

function getWeekday(date: string): number {
  const { day, monthIndex, year } = parseDateParts(date);

  return new Date(year, monthIndex, day).getDay();
}

function differenceInDays(from: string, to: string): number {
  return Math.ceil((dateToUtcMs(to) - dateToUtcMs(from)) / DAY_MS);
}

function addDays(date: string, days: number): string {
  const { day, monthIndex, year } = parseDateParts(date);
  const nextDate = new Date(year, monthIndex, day);
  nextDate.setDate(nextDate.getDate() + days);

  return formatDate(nextDate);
}

function calculateWeekendBufferMinutes(totalTargetMinutes: number): number {
  if (totalTargetMinutes === 0) {
    return 0;
  }

  return Math.max(30, Math.round((totalTargetMinutes * 0.18) / 10) * 10);
}

function dateToUtcMs(date: string): number {
  const { day, monthIndex, year } = parseDateParts(date);

  return Date.UTC(year, monthIndex, day);
}

function parseDateParts(date: string): {
  day: number;
  monthIndex: number;
  year: number;
} {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date value: ${date}`);
  }

  return {
    day,
    monthIndex: month - 1,
    year,
  };
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
