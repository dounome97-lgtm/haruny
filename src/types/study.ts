export type UserRole = "student" | "parent";

export type MissionLevel = "required" | "extra" | "optional";

export type StudyTaskStatus = "pending" | "in_progress" | "done" | "moved";

export type TimeBlockType =
  | "school"
  | "academy"
  | "meal"
  | "play"
  | "rest"
  | "sleep"
  | "free";

export type CoachStatus =
  | "on_track"
  | "start_needed"
  | "delayed"
  | "recovery_needed"
  | "impossible";

export type User = {
  id: string;
  familyId: string;
  role: UserRole;
  name: string;
  timezone: string;
};

export type StudentProfile = {
  id: string;
  userId: string;
  defaultWakeTime: string;
  defaultSleepTime: string;
  schoolStartTime: string;
  schoolEndTime: string;
};

export type FamilyRhythmBlock = {
  id: string;
  type: "academy" | "meal";
  title: string;
  startAt: string;
  endAt: string;
  weekdays: number[];
};

export type FamilyDailyRhythm = {
  schoolStartTime: string;
  schoolEndTime: string;
  defaultDinnerTime: string;
  defaultSleepTime: string;
  academyBlocks: FamilyRhythmBlock[];
  mealBlocks: FamilyRhythmBlock[];
};

export type StudyTask = {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  missionLevel: MissionLevel;
  status: StudyTaskStatus;
  sourceType: "manual" | "routine" | "exam_plan";
  studyMode:
    | "concept"
    | "problem_solving"
    | "review"
    | "memorization"
    | "wrong_answer"
    | "mock";
};

export type TimeBlock = {
  id: string;
  type: TimeBlockType;
  title: string;
  startAt: string;
  endAt: string;
  isStudyAvailable: boolean;
};

export type CoachState = {
  currentStatus: CoachStatus;
  nextTaskId: string;
  latestStartAt: string;
  remainingStudyMinutes: number;
  remainingAvailableMinutes: number;
  message: string;
  recoveryMessage: string;
};

export type StudentTodayView = {
  studentName: string;
  dateLabel: string;
  headline: string;
  subcopy: string;
  nextTask: StudyTask;
  tasks: StudyTask[];
  timeBlocks: TimeBlock[];
  coach: CoachState;
};

export type WeeklySubjectFocus = {
  subject: string;
  note: string;
  minutes: number;
};

export type StudentWeekView = {
  studentName: string;
  dateLabel: string;
  planName: string;
  headline: string;
  subcopy: string;
  keepGoing: string[];
  subjects: WeeklySubjectFocus[];
  todayFirstTask: StudyTask;
  phaseMessages: string[];
  weekendBufferMessage: string;
};

export type StudentDayClosingView = {
  studentName: string;
  dateLabel: string;
  headline: string;
  completed: string[];
  movedToTomorrow: string[];
  tomorrowFirstTask: string;
  coachMessage: string;
};

export type StudentAdjustmentView = {
  studentName: string;
  dateLabel: string;
  headline: string;
  subcopy: string;
  recommendedChange: string;
  remainingPlan: string[];
  reasonOptions: string[];
  parentPreview: string;
};

export type ExamSubjectImportance = "high" | "medium" | "low";

export type ExamSubject = {
  id: string;
  subject: string;
  examDate: string;
  examDayIndex: number;
  importance: ExamSubjectImportance;
  targetMinutes: number;
};

export type LongTermStudyGoal = {
  id: string;
  studentId: string;
  title: string;
  type: "exam" | "assignment" | "routine";
  startDate: string;
  endDate: string;
  status: "draft" | "active" | "paused" | "closed";
};

export type ExamSchedule = {
  id: string;
  longTermPlanId: string;
  examName: string;
  prepStartDate: string;
  examStartDate: string;
  examEndDate: string;
};

export type RoutineRule = {
  id: string;
  title: string;
  subject: string;
  weekdays: number[];
  estimatedMinutes: number;
  repeatType: "weekly" | "daily";
  priority: number;
};

export type RoutineApplicationPeriod = {
  startDate: string;
  endDate: string;
  examPrepSwitchDate: string;
};

export type GeneratedRoutinePlan = {
  weeklyRules: RoutineRule[];
  dailyMemoryRules: RoutineRule[];
  todayTasks: StudyTask[];
  lightenedTasks: StudyTask[];
  totalTodayMinutes: number;
  overloadMessage: string;
  examPrepSwitchMessage: string;
};

export type ExamPhase =
  | "four_weeks_before"
  | "three_weeks_before"
  | "two_weeks_before"
  | "one_week_before";

export type WeeklySubjectAllocation = {
  subject: string;
  targetMinutes: number;
  plannedMinutes: number;
  priority: number;
};

export type GeneratedWeeklyPlan = {
  weekStartDate: string;
  weekEndDate: string;
  examPhase: ExamPhase;
  intensity: "low" | "medium" | "high" | "very_high";
  strategyNote: string;
  totalTargetMinutes: number;
  weekendBufferMinutes: number;
  allocations: WeeklySubjectAllocation[];
};

export type GeneratedDailyPlan = {
  date: string;
  tasks: StudyTask[];
};

export type GeneratedLongTermPlan = {
  goal: LongTermStudyGoal;
  examSchedule: ExamSchedule;
  weeklyPlan: GeneratedWeeklyPlan;
  todayPlan: GeneratedDailyPlan;
};

export type ParentExamPrepView = {
  studentName: string;
  examName: string;
  examStartDate: string;
  examEndDate: string;
  prepStartDate: string;
  prepDays: number;
  todayMissionCount: number;
  headline: string;
  subcopy: string;
};

export type ParentExamSubjectEntryView = {
  studentName: string;
  examName: string;
  headline: string;
  subcopy: string;
  highSubjects: ExamSubject[];
  mediumSubjects: ExamSubject[];
};

export type ParentExamPlanReviewView = {
  studentName: string;
  examName: string;
  headline: string;
  subcopy: string;
  thisWeekMinutes: number;
  todayMinutes: number;
  weekendBufferMinutes: number;
  weekStrategy: string;
  firstWeekTasks: string[];
  studentPreviewTasks: string[];
};

export type ParentRoutineCreateView = {
  studentName: string;
  headline: string;
  subcopy: string;
  applicationPeriod: RoutineApplicationPeriod;
  weeklyRules: RoutineRule[];
  dailyMemoryRules: RoutineRule[];
  todayTasks: StudyTask[];
  lightenedTasks: StudyTask[];
  totalTodayMinutes: number;
  examPrepSwitchMessage: string;
  overloadMessage: string;
};

export type ParentReassuranceView = {
  studentName: string;
  dateLabel: string;
  headline: string;
  oneLineSummary: string;
  interventionLevel: "none" | "watch" | "needed";
  interventionMessage: string;
  completedMinutes: number;
  remainingMinutes: number;
  recoveryMessage: string;
  nextHelpfulAction: string;
};

export type ParentTodayAdjustmentView = {
  studentName: string;
  headline: string;
  realityMessage: string;
  recommendedChange: string;
  adjustedTasks: StudyTask[];
  studentPreviewMessage: string;
};

export type ParentWeekAdjustmentView = {
  studentName: string;
  headline: string;
  balanceMessage: string;
  subjectLoads: WeeklySubjectFocus[];
  dayLoads: Array<{
    dayLabel: string;
    minutes: number;
    mood: "light" | "steady" | "heavy";
  }>;
};

export type ParentDayEndSummaryView = {
  studentName: string;
  headline: string;
  completed: string[];
  movedToTomorrow: string[];
  tomorrowFirstTask: string;
  parentNote: string;
};

export type NotificationChannel = "web_push" | "mobile_push";

export type NotificationRuleType =
  | "play_ending"
  | "study_start_needed"
  | "recovery_needed"
  | "parent_summary";

export type NotificationRule = {
  id: string;
  type: NotificationRuleType;
  channel: NotificationChannel;
  enabled: boolean;
  messageTemplate: string;
  cooldownMinutes: number;
  maxPerDay: number;
};

export type ParentNotificationSettingsView = {
  studentName: string;
  headline: string;
  subcopy: string;
  rules: NotificationRule[];
  fatigueLimitMessage: string;
  channelSwitchMessage: string;
};

export type FamilySettingsView = {
  familyName: string;
  parentName: string;
  studentName: string;
  headline: string;
  subcopy: string;
  studentProfile: StudentProfile;
  dailyRhythm: FamilyDailyRhythm;
  generatedTimeBlocks: TimeBlock[];
  availableMinutesPreview: number;
  mobileReuseMessage: string;
  pwaScopeMessage: string;
  mobileAppTodo: string[];
};
