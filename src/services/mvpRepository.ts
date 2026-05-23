import {
  mockExamSubjects,
  mockFamilyDailyRhythm,
  mockParentReassurance,
  mockRoutineRules,
  mockStudentProfile,
  mockStudentToday,
} from "@/data/mock";
import type {
  ExamSubject,
  FamilyDailyRhythm,
  FamilyRhythmBlock,
  CoachState,
  MissionLevel,
  ParentReassuranceView,
  RoutineRule,
  StudentProfile,
  StudentTodayView,
  StudyTask,
  StudyTaskStatus,
  TimeBlock,
  TimeBlockType,
} from "@/types/study";

export type MvpDataSource = "mock" | "supabase";

export type StudentTodaySeed = {
  currentDate: string;
  currentTime: string;
  examEndDate: string;
  examName: string;
  examStartDate: string;
  familyRhythm: FamilyDailyRhythm;
  profile: StudentProfile;
  routineRules: RoutineRule[];
  savedCoach?: CoachState | null;
  savedTasks?: StudyTask[];
  savedTimeBlocks?: TimeBlock[];
  studentId: string;
  studentName?: string;
  subjects: ExamSubject[];
  fallbackView: StudentTodayView;
};

export type MvpReadRepository = {
  getParentReassuranceView(): Promise<ParentReassuranceView>;
  getStudentTodaySeed(): Promise<StudentTodaySeed>;
};

export function getMvpDataSource(): MvpDataSource {
  return process.env.HARUNY_DATA_SOURCE === "supabase" ? "supabase" : "mock";
}

export function getMvpReadRepository(): MvpReadRepository {
  const dataSource = getMvpDataSource();

  if (dataSource === "supabase") {
    return supabaseRepositoryPlaceholder;
  }

  return mockMvpRepository;
}

export function getSupabasePublicConfig():
  | { anonKey: string; url: string }
  | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { anonKey, url };
}

const mockMvpRepository: MvpReadRepository = {
  async getParentReassuranceView() {
    return mockParentReassurance;
  },
  async getStudentTodaySeed() {
    return {
      currentDate: "2026-07-23",
      currentTime: "19:30",
      examEndDate: "2026-08-22",
      examName: "8월 기말고사",
      examStartDate: "2026-08-20",
      familyRhythm: mockFamilyDailyRhythm,
      fallbackView: mockStudentToday,
      profile: mockStudentProfile,
      routineRules: mockRoutineRules,
      studentId: "user-student-minjun",
      subjects: mockExamSubjects,
    };
  },
};

const supabaseRepositoryPlaceholder: MvpReadRepository = {
  async getParentReassuranceView() {
    const today = await getSupabaseStudentTodaySeed();
    const tasks = today.savedTasks ?? today.fallbackView.tasks;
    const coach = today.savedCoach ?? today.fallbackView.coach;
    const completedMinutes = tasks
      .filter((task) => task.status === "done")
      .reduce((sum, task) => sum + task.estimatedMinutes, 0);
    const remainingMinutes = tasks
      .filter((task) => task.status !== "done" && task.status !== "moved")
      .reduce((sum, task) => sum + task.estimatedMinutes, 0);

    return {
      ...mockParentReassurance,
      completedMinutes,
      dateLabel: formatKoreanDateLabel(today.currentDate),
      headline: coach.currentStatus === "impossible" ? "조정이 필요해요" : "아직 괜찮아요",
      interventionLevel: getParentInterventionLevel(coach.currentStatus),
      interventionMessage: getParentInterventionMessage(coach.currentStatus),
      nextHelpfulAction: createNextHelpfulAction(tasks),
      oneLineSummary: `${today.studentName ?? mockParentReassurance.studentName}이는 오늘 필수 미션 ${countTasks(tasks, "required")}개를 이어가고 있어요.`,
      recoveryMessage: coach.recoveryMessage,
      remainingMinutes,
      studentName: today.studentName ?? mockParentReassurance.studentName,
    };
  },
  async getStudentTodaySeed() {
    return getSupabaseStudentTodaySeed();
  },
};

type AppUserRow = {
  id: string;
  family_id: string;
  name: string;
  role: "student" | "parent";
  timezone: string;
};

type StudentProfileRow = {
  default_sleep_time: string;
  default_wake_time: string;
  id: string;
  school_end_time: string;
  school_start_time: string;
  user_id: string;
};

type FamilyRhythmBlockRow = {
  end_at: string;
  id: string;
  start_at: string;
  title: string;
  type: "academy" | "meal";
  weekdays: number[];
};

type RoutineRuleRow = {
  estimated_minutes: number;
  id: string;
  priority: number;
  repeat_type: "weekly" | "daily";
  subject: string;
  title: string;
  weekdays: number[];
};

type ExamScheduleRow = {
  exam_end_date: string;
  exam_name: string;
  exam_start_date: string;
  id: string;
  prep_start_date: string;
};

type ExamSubjectRow = {
  exam_date: string;
  exam_day_index: number;
  id: string;
  importance: "high" | "medium" | "low";
  subject: string;
  target_minutes: number;
};

type DayPlanRow = {
  id: string;
  plan_date: string;
  student_id: string;
};

type StudyTaskRow = {
  estimated_minutes: number;
  id: string;
  mission_level: MissionLevel;
  source_type: "manual" | "routine" | "exam_plan";
  status: StudyTaskStatus;
  study_mode: StudyTask["studyMode"];
  subject: string;
  title: string;
};

type TimeBlockRow = {
  end_at: string;
  id: string;
  is_study_available: boolean;
  start_at: string;
  title: string;
  type: TimeBlockType;
};

type CoachStateRow = {
  current_status: CoachState["currentStatus"];
  latest_start_at: string;
  message: string;
  next_task_id: string | null;
  recovery_message: string;
  remaining_available_minutes: number;
  remaining_study_minutes: number;
};

async function getSupabaseStudentTodaySeed(): Promise<StudentTodaySeed> {
  const student = await selectOne<AppUserRow>("app_users", {
    id: "eq.user-student-minjun",
    select: "id,family_id,role,name,timezone",
  });
  const [profile, rhythmRows, routineRows, examSchedule, dayPlan] =
    await Promise.all([
      selectOne<StudentProfileRow>("student_profiles", {
        select:
          "id,user_id,default_wake_time,default_sleep_time,school_start_time,school_end_time",
        user_id: `eq.${student.id}`,
      }),
      selectMany<FamilyRhythmBlockRow>("family_rhythm_blocks", {
        family_id: `eq.${student.family_id}`,
        order: "start_at.asc",
        select: "id,type,title,start_at,end_at,weekdays",
      }),
      selectMany<RoutineRuleRow>("routine_rules", {
        order: "priority.asc",
        select:
          "id,title,subject,weekdays,estimated_minutes,repeat_type,priority",
        student_id: `eq.${student.id}`,
      }),
      selectOne<ExamScheduleRow>("exam_schedules", {
        id: "eq.exam-august-final",
        select: "id,exam_name,prep_start_date,exam_start_date,exam_end_date",
      }),
      selectOne<DayPlanRow>("day_plans", {
        plan_date: "eq.2026-07-23",
        select: "id,student_id,plan_date",
        student_id: `eq.${student.id}`,
      }),
    ]);
  const [subjectRows, taskRows, timeBlockRows, coachRows] = await Promise.all([
    selectMany<ExamSubjectRow>("exam_subjects", {
      exam_schedule_id: `eq.${examSchedule.id}`,
      order: "exam_day_index.asc",
      select:
        "id,exam_date,exam_day_index,subject,importance,target_minutes",
    }),
    selectMany<StudyTaskRow>("study_tasks", {
      day_plan_id: `eq.${dayPlan.id}`,
      order: "priority.asc",
      select:
        "id,title,subject,estimated_minutes,mission_level,study_mode,source_type,status",
    }),
    selectMany<TimeBlockRow>("time_blocks", {
      day_plan_id: `eq.${dayPlan.id}`,
      order: "start_at.asc",
      select: "id,type,title,start_at,end_at,is_study_available",
    }),
    selectMany<CoachStateRow>("coach_states", {
      day_plan_id: `eq.${dayPlan.id}`,
      limit: "1",
      select:
        "current_status,next_task_id,latest_start_at,remaining_study_minutes,remaining_available_minutes,message,recovery_message",
    }),
  ]);

  return {
    currentDate: dayPlan.plan_date,
    currentTime: "19:30",
    examEndDate: examSchedule.exam_end_date,
    examName: examSchedule.exam_name,
    examStartDate: examSchedule.exam_start_date,
    fallbackView: mockStudentToday,
    familyRhythm: mapFamilyRhythm(profile, rhythmRows),
    profile: mapStudentProfile(profile),
    routineRules: routineRows.map(mapRoutineRule),
    savedCoach: coachRows[0] ? mapCoachState(coachRows[0]) : null,
    savedTasks: taskRows.map(mapStudyTask),
    savedTimeBlocks: timeBlockRows.map(mapTimeBlock),
    studentId: student.id,
    studentName: student.name,
    subjects: subjectRows.map(mapExamSubject),
  };
}

async function selectMany<T>(
  table: string,
  params: Record<string, string>,
): Promise<T[]> {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase URL and publishable key are required.");
  }

  const url = new URL(`/rest/v1/${table}`, normalizeSupabaseUrl(config.url));

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    cache: "no-store",
    headers: createSupabaseHeaders(config.anonKey),
  });

  if (!response.ok) {
    throw new Error(
      `Supabase read failed for ${table}: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T[]>;
}

function createSupabaseHeaders(apiKey: string): HeadersInit {
  if (apiKey.startsWith("sb_publishable_")) {
    return { apikey: apiKey };
  }

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
  };
}

async function selectOne<T>(
  table: string,
  params: Record<string, string>,
): Promise<T> {
  const rows = await selectMany<T>(table, { ...params, limit: "1" });
  const row = rows[0];

  if (!row) {
    throw new Error(`Supabase row not found: ${table}`);
  }

  return row;
}

function normalizeSupabaseUrl(url: string): string {
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

function mapStudentProfile(row: StudentProfileRow): StudentProfile {
  return {
    defaultSleepTime: toClock(row.default_sleep_time),
    defaultWakeTime: toClock(row.default_wake_time),
    id: row.id,
    schoolEndTime: toClock(row.school_end_time),
    schoolStartTime: toClock(row.school_start_time),
    userId: row.user_id,
  };
}

function mapFamilyRhythm(
  profile: StudentProfileRow,
  rows: FamilyRhythmBlockRow[],
): FamilyDailyRhythm {
  const blocks = rows.map(mapFamilyRhythmBlock);

  return {
    academyBlocks: blocks.filter((block) => block.type === "academy"),
    defaultDinnerTime: blocks.find((block) => block.type === "meal")?.endAt ?? "18:30",
    defaultSleepTime: toClock(profile.default_sleep_time),
    mealBlocks: blocks.filter((block) => block.type === "meal"),
    schoolEndTime: toClock(profile.school_end_time),
    schoolStartTime: toClock(profile.school_start_time),
  };
}

function mapFamilyRhythmBlock(row: FamilyRhythmBlockRow): FamilyRhythmBlock {
  return {
    endAt: toClock(row.end_at),
    id: row.id,
    startAt: toClock(row.start_at),
    title: row.title,
    type: row.type,
    weekdays: row.weekdays,
  };
}

function mapRoutineRule(row: RoutineRuleRow): RoutineRule {
  return {
    estimatedMinutes: row.estimated_minutes,
    id: row.id,
    priority: row.priority,
    repeatType: row.repeat_type,
    subject: row.subject,
    title: row.title,
    weekdays: row.weekdays,
  };
}

function mapExamSubject(row: ExamSubjectRow): ExamSubject {
  return {
    examDate: row.exam_date,
    examDayIndex: row.exam_day_index,
    id: row.id,
    importance: row.importance,
    subject: row.subject,
    targetMinutes: row.target_minutes,
  };
}

function mapStudyTask(row: StudyTaskRow): StudyTask {
  return {
    estimatedMinutes: row.estimated_minutes,
    id: row.id,
    missionLevel: row.mission_level,
    sourceType: row.source_type,
    status: row.status,
    studyMode: row.study_mode,
    subject: row.subject,
    title: row.title,
  };
}

function mapTimeBlock(row: TimeBlockRow): TimeBlock {
  return {
    endAt: toClock(row.end_at),
    id: row.id,
    isStudyAvailable: row.is_study_available,
    startAt: toClock(row.start_at),
    title: row.title,
    type: row.type,
  };
}

function mapCoachState(row: CoachStateRow): CoachState {
  return {
    currentStatus: row.current_status,
    latestStartAt: toClock(row.latest_start_at),
    message: row.message,
    nextTaskId: row.next_task_id ?? "",
    recoveryMessage: row.recovery_message,
    remainingAvailableMinutes: row.remaining_available_minutes,
    remainingStudyMinutes: row.remaining_study_minutes,
  };
}

function toClock(value: string): string {
  return value.slice(0, 5);
}

function formatKoreanDateLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = new Date(year, month - 1, day).getDay();

  return `${month}월 ${day}일 ${weekdays[weekday]}요일`;
}

function countTasks(tasks: StudyTask[], missionLevel: MissionLevel): number {
  return tasks.filter(
    (task) => task.missionLevel === missionLevel && task.status !== "done",
  ).length;
}

function createNextHelpfulAction(tasks: StudyTask[]): string {
  const nextTask = tasks.find(
    (task) => task.missionLevel === "required" && task.status === "pending",
  );

  return nextTask
    ? `${nextTask.subject} ${nextTask.estimatedMinutes}분만 먼저 시작하게 도와주기`
    : "오늘 마무리를 가볍게 칭찬해주기";
}

function getParentInterventionLevel(
  status: CoachState["currentStatus"],
): ParentReassuranceView["interventionLevel"] {
  if (status === "impossible" || status === "recovery_needed") {
    return "needed";
  }

  if (status === "start_needed" || status === "delayed") {
    return "watch";
  }

  return "none";
}

function getParentInterventionMessage(status: CoachState["currentStatus"]): string {
  const messages: Record<CoachState["currentStatus"], string> = {
    delayed: "곧 시작하면 괜찮아요. 한 번만 부드럽게 전환을 도와주세요.",
    impossible: "오늘 전부 끝내기보다 한 가지를 내일로 옮기는 편이 좋아요.",
    on_track: "지금은 지켜봐도 괜찮아요.",
    recovery_needed: "필수 미션 중심으로 줄이는 도움이 필요해요.",
    start_needed: "지금 시작하도록 한 번만 도와주면 좋아요.",
  };

  return messages[status];
}
