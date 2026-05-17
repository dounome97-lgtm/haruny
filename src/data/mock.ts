import type {
  ExamSubject,
  FamilyDailyRhythm,
  FamilySettingsView,
  ParentExamPlanReviewView,
  ParentExamPrepView,
  ParentDayEndSummaryView,
  ParentNotificationSettingsView,
  ParentReassuranceView,
  ParentRoutineCreateView,
  ParentExamSubjectEntryView,
  ParentTodayAdjustmentView,
  ParentWeekAdjustmentView,
  RoutineApplicationPeriod,
  RoutineRule,
  StudentAdjustmentView,
  StudentDayClosingView,
  StudentProfile,
  StudentTodayView,
  StudentWeekView,
  User,
} from "@/types/study";

export const mockUsers: User[] = [
  {
    id: "user-student-minjun",
    familyId: "family-minjun",
    role: "student",
    name: "민준",
    timezone: "Asia/Seoul",
  },
  {
    id: "user-parent",
    familyId: "family-minjun",
    role: "parent",
    name: "보호자",
    timezone: "Asia/Seoul",
  },
];

export const mockStudentProfile: StudentProfile = {
  id: "profile-minjun",
  userId: "user-student-minjun",
  defaultWakeTime: "07:00",
  defaultSleepTime: "22:30",
  schoolStartTime: "08:30",
  schoolEndTime: "15:30",
};

export const mockFamilyDailyRhythm: FamilyDailyRhythm = {
  academyBlocks: [
    {
      endAt: "20:00",
      id: "family-academy-english",
      startAt: "19:30",
      title: "영어 단어 복습",
      type: "academy",
      weekdays: [1, 3, 5],
    },
  ],
  defaultDinnerTime: "18:30",
  defaultSleepTime: "22:30",
  mealBlocks: [
    {
      endAt: "18:30",
      id: "family-dinner",
      startAt: "18:00",
      title: "저녁 식사",
      type: "meal",
      weekdays: [0, 1, 2, 3, 4, 5, 6],
    },
  ],
  schoolEndTime: "15:30",
  schoolStartTime: "08:30",
};

export const mockStudentToday: StudentTodayView = {
  studentName: "민준",
  dateLabel: "5월 17일 일요일",
  headline: "지금 수학 25분부터 시작하면 좋아요",
  subcopy: "학원 전까지 영어 단어까지 끝낼 수 있어요.",
  nextTask: {
    id: "task-math-wrong-answer",
    title: "수학 오답 20개",
    subject: "수학",
    estimatedMinutes: 25,
    missionLevel: "required",
    status: "pending",
    sourceType: "exam_plan",
    studyMode: "wrong_answer",
  },
  tasks: [
    {
      id: "task-math-wrong-answer",
      title: "수학 오답 20개",
      subject: "수학",
      estimatedMinutes: 25,
      missionLevel: "required",
      status: "pending",
      sourceType: "exam_plan",
      studyMode: "wrong_answer",
    },
    {
      id: "task-english-words",
      title: "영어 단어 40개",
      subject: "영어",
      estimatedMinutes: 15,
      missionLevel: "required",
      status: "pending",
      sourceType: "routine",
      studyMode: "memorization",
    },
    {
      id: "task-science-concept",
      title: "과학 개념 3페이지",
      subject: "과학",
      estimatedMinutes: 30,
      missionLevel: "required",
      status: "pending",
      sourceType: "exam_plan",
      studyMode: "concept",
    },
    {
      id: "task-korean-reading",
      title: "국어 독해 2지문",
      subject: "국어",
      estimatedMinutes: 20,
      missionLevel: "extra",
      status: "pending",
      sourceType: "routine",
      studyMode: "problem_solving",
    },
    {
      id: "task-social-memory",
      title: "사회 암기",
      subject: "사회",
      estimatedMinutes: 15,
      missionLevel: "optional",
      status: "pending",
      sourceType: "exam_plan",
      studyMode: "memorization",
    },
  ],
  timeBlocks: [
    {
      id: "block-academy",
      type: "academy",
      title: "영어 단어 복습",
      startAt: "19:30",
      endAt: "20:00",
      isStudyAvailable: false,
    },
    {
      id: "block-sleep",
      type: "sleep",
      title: "취침 준비",
      startAt: "22:30",
      endAt: "07:00",
      isStudyAvailable: false,
    },
  ],
  coach: {
    currentStatus: "on_track",
    nextTaskId: "task-math-wrong-answer",
    latestStartAt: "18:10",
    remainingStudyMinutes: 105,
    remainingAvailableMinutes: 150,
    message: "아직 괜찮아요. 지금 시작하면 오늘 계획을 무리 없이 끝낼 수 있어요.",
    recoveryMessage: "회복 가능해요. 수학 25분만 먼저 잡으면 흐름이 가벼워져요.",
  },
};

export const mockStudentWeek: StudentWeekView = {
  studentName: "민준",
  dateLabel: "5월 셋째 주",
  planName: "8월 기말고사 준비",
  headline: "이번 주는 루틴을 지키고 개념 빈틈만 확인해요",
  subcopy: "많이 늘리지 않고 수학, 영어, 사회 흐름을 가볍게 이어가요.",
  keepGoing: ["영어 단어 15분", "수학 기본 문제", "사회 개념 읽기"],
  subjects: [
    {
      subject: "수학",
      note: "기본 문제와 오답을 짧게 반복해요.",
      minutes: 80,
    },
    {
      subject: "영어",
      note: "단어 루틴은 매일 이어가요.",
      minutes: 60,
    },
    {
      subject: "사회",
      note: "개념을 읽고 표시만 해둬요.",
      minutes: 40,
    },
  ],
  todayFirstTask: {
    id: "task-math-wrong-answer",
    title: "수학 오답 20개",
    subject: "수학",
    estimatedMinutes: 25,
    missionLevel: "required",
    status: "pending",
    sourceType: "exam_plan",
    studyMode: "wrong_answer",
  },
  phaseMessages: [
    "시험 4주 전이라 루틴 유지가 먼저예요.",
    "시험 2주 전부터는 회독과 오답을 더 늘려요.",
    "시험 1주 전에는 고를 것 없이 반복 미션으로 정리해요.",
  ],
  weekendBufferMessage: "하루가 밀려도 주말에 40분 정도 보정할 수 있어요.",
};

export const mockStudentDayClosing: StudentDayClosingView = {
  studentName: "민준",
  dateLabel: "5월 17일 일요일",
  headline: "오늘은 수학과 영어를 잘 이어갔어요",
  completed: ["수학 오답 20개", "영어 단어 40개"],
  movedToTomorrow: ["과학 개념 3페이지"],
  tomorrowFirstTask: "과학 개념 20분",
  coachMessage:
    "오늘 계획은 조금 넉넉했어요. 내일은 과학부터 시작하면 괜찮아요.",
};

export const mockStudentAdjustment: StudentAdjustmentView = {
  studentName: "민준",
  dateLabel: "5월 17일 일요일",
  headline: "오늘은 전부 끝내기 어려워 보여요",
  subcopy: "수학은 오늘 하고, 과학은 내일로 옮기는 요청을 보낼 수 있어요.",
  recommendedChange: "과학 개념 30분을 내일로 옮기기",
  remainingPlan: ["수학 오답 20개", "영어 단어 40개"],
  reasonOptions: ["시간 부족", "조금 피곤함", "일정 변경"],
  parentPreview:
    "오늘 수학과 영어는 마무리하고, 과학 30분은 내일로 옮기는 안을 요청했어요.",
};

export const mockExamSubjects: ExamSubject[] = [
  {
    id: "exam-subject-korean",
    examDate: "8월 20일",
    examDayIndex: 1,
    importance: "medium",
    subject: "국어",
    targetMinutes: 70,
  },
  {
    id: "exam-subject-social",
    examDate: "8월 20일",
    examDayIndex: 1,
    importance: "medium",
    subject: "사회",
    targetMinutes: 60,
  },
  {
    id: "exam-subject-ethics",
    examDate: "8월 20일",
    examDayIndex: 1,
    importance: "medium",
    subject: "도덕",
    targetMinutes: 45,
  },
  {
    id: "exam-subject-math",
    examDate: "8월 21일",
    examDayIndex: 2,
    importance: "high",
    subject: "수학",
    targetMinutes: 160,
  },
  {
    id: "exam-subject-science",
    examDate: "8월 21일",
    examDayIndex: 2,
    importance: "medium",
    subject: "과학",
    targetMinutes: 120,
  },
  {
    id: "exam-subject-history",
    examDate: "8월 21일",
    examDayIndex: 2,
    importance: "medium",
    subject: "역사",
    targetMinutes: 90,
  },
  {
    id: "exam-subject-english",
    examDate: "8월 22일",
    examDayIndex: 3,
    importance: "high",
    subject: "영어",
    targetMinutes: 140,
  },
  {
    id: "exam-subject-tech",
    examDate: "8월 22일",
    examDayIndex: 3,
    importance: "medium",
    subject: "기술가정",
    targetMinutes: 45,
  },
];

export const mockParentExamPrep: ParentExamPrepView = {
  studentName: "민준",
  examName: "8월 기말고사",
  examStartDate: "8월 20일",
  examEndDate: "8월 22일",
  prepStartDate: "7월 21일",
  prepDays: 30,
  todayMissionCount: 2,
  headline: "기말 준비를 30일 흐름으로 만들어요",
  subcopy: "시험일과 과목만 넣으면 오늘 공부까지 자연스럽게 내려와요.",
};

export const mockParentExamSubjectEntry: ParentExamSubjectEntryView = {
  studentName: "민준",
  examName: "8월 기말고사 준비",
  headline: "과목별 중요도를 색으로만 가볍게",
  subcopy: "세밀한 점수표 대신 많이 챙길 과목을 부드럽게 표시해요.",
  highSubjects: mockExamSubjects.filter((subject) => subject.importance === "high"),
  mediumSubjects: mockExamSubjects.filter(
    (subject) => subject.importance === "medium",
  ),
};

export const mockParentExamPlanReview: ParentExamPlanReviewView = {
  studentName: "민준",
  examName: "8월 기말고사 준비안",
  headline: "30일 준비안이 무리 없이 잡혔어요",
  subcopy: "이번 주는 루틴을 지키고 개념 빈틈을 확인하는 정도로 시작해요.",
  thisWeekMinutes: 220,
  todayMinutes: 40,
  weekendBufferMinutes: 40,
  weekStrategy: "4주 전: 루틴 유지와 개념 확인",
  firstWeekTasks: ["수학 기본 문제", "영어 단어", "사회 개념"],
  studentPreviewTasks: ["수학 25분", "영어 단어 15분"],
};

export const mockRoutineApplicationPeriod: RoutineApplicationPeriod = {
  startDate: "2026-05-18",
  endDate: "2026-07-20",
  examPrepSwitchDate: "2026-07-21",
};

export const mockRoutineRules: RoutineRule[] = [
  {
    estimatedMinutes: 25,
    id: "routine-math-mon-wed",
    priority: 1,
    repeatType: "weekly",
    subject: "수학",
    title: "수학 기본 문제 25분",
    weekdays: [1, 3],
  },
  {
    estimatedMinutes: 20,
    id: "routine-korean-tue-thu",
    priority: 2,
    repeatType: "weekly",
    subject: "국어",
    title: "국어 독해 2지문",
    weekdays: [2, 4],
  },
  {
    estimatedMinutes: 15,
    id: "routine-english-words",
    priority: 0,
    repeatType: "daily",
    subject: "영어",
    title: "영어 단어 15분",
    weekdays: [],
  },
];

export const mockParentRoutineCreate: ParentRoutineCreateView = {
  applicationPeriod: mockRoutineApplicationPeriod,
  dailyMemoryRules: mockRoutineRules.filter((rule) => rule.repeatType === "daily"),
  examPrepSwitchMessage: "시험 한 달 전부터는 평시 루틴을 줄이고 시험 미션을 먼저 보여줘요.",
  headline: "평일 루틴을 부담 없는 약속으로 만들어요",
  lightenedTasks: [],
  overloadMessage: "무리한 날은 암기 루틴만 남기고 과목 루틴은 다음 날로 넘겨요.",
  studentName: "민준",
  subcopy: "요일별 과목과 매일 암기를 정해두면 오늘 공부로 자동 내려와요.",
  todayTasks: [],
  totalTodayMinutes: 0,
  weeklyRules: mockRoutineRules.filter((rule) => rule.repeatType === "weekly"),
};

export const mockParentReassurance: ParentReassuranceView = {
  completedMinutes: 40,
  dateLabel: "5월 17일 일요일",
  headline: "아직 괜찮아요",
  interventionLevel: "watch",
  interventionMessage: "지금은 지켜봐도 되고, 8시가 지나면 한 번만 도와주세요.",
  nextHelpfulAction: "수학 25분만 먼저 시작하게 도와주기",
  oneLineSummary: "민준이는 오늘 필수 미션 2개 중 1개를 이어가는 중이에요.",
  recoveryMessage: "남은 시간 안에 필수 공부는 회복 가능해요.",
  remainingMinutes: 65,
  studentName: "민준",
};

export const mockParentTodayAdjustment: ParentTodayAdjustmentView = {
  adjustedTasks: mockStudentToday.tasks.slice(0, 2),
  headline: "오늘은 과학을 내일로 옮기면 현실적이에요",
  realityMessage: "남은 시간 65분 안에 전부 끝내기보다 필수 2개를 마무리하는 편이 좋아요.",
  recommendedChange: "과학 개념 30분을 내일 첫 미션으로 이동",
  studentName: "민준",
  studentPreviewMessage: "학생 화면에는 수학 25분, 영어 단어 15분만 먼저 보여줘요.",
};

export const mockParentWeekAdjustment: ParentWeekAdjustmentView = {
  balanceMessage: "수학과 영어가 조금 무겁고, 금요일은 가볍게 비워두는 편이 좋아요.",
  dayLoads: [
    { dayLabel: "월", minutes: 55, mood: "steady" },
    { dayLabel: "화", minutes: 35, mood: "light" },
    { dayLabel: "수", minutes: 65, mood: "heavy" },
    { dayLabel: "목", minutes: 40, mood: "steady" },
    { dayLabel: "금", minutes: 25, mood: "light" },
  ],
  headline: "이번 주는 수요일만 조금 덜어내요",
  studentName: "민준",
  subjectLoads: mockStudentWeek.subjects,
};

export const mockParentDayEndSummary: ParentDayEndSummaryView = {
  completed: mockStudentDayClosing.completed,
  headline: "오늘은 핵심 루틴을 지켰어요",
  movedToTomorrow: mockStudentDayClosing.movedToTomorrow,
  parentNote: "내일은 과학부터 시작하면 오늘 밀린 흐름을 무리 없이 회복할 수 있어요.",
  studentName: "민준",
  tomorrowFirstTask: mockStudentDayClosing.tomorrowFirstTask,
};

export const mockParentNotificationSettings: ParentNotificationSettingsView = {
  channelSwitchMessage: "현재는 웹 푸시 형태로 검증하고, 모바일 앱에서는 같은 규칙을 앱 푸시로 바꿔요.",
  fatigueLimitMessage: "같은 종류 알림은 일정 시간 안에 반복하지 않고, 하루 최대 횟수를 넘기지 않아요.",
  headline: "잔소리 대신 필요한 순간만 알려줘요",
  rules: [
    {
      channel: "web_push",
      cooldownMinutes: 60,
      enabled: true,
      id: "notice-play-ending",
      maxPerDay: 2,
      messageTemplate: "놀이가 곧 끝나요. 다음 미션으로 천천히 넘어가요.",
      type: "play_ending",
    },
    {
      channel: "web_push",
      cooldownMinutes: 90,
      enabled: true,
      id: "notice-study-start",
      maxPerDay: 1,
      messageTemplate: "지금 시작하면 오늘 계획을 지킬 수 있어요.",
      type: "study_start_needed",
    },
    {
      channel: "web_push",
      cooldownMinutes: 120,
      enabled: true,
      id: "notice-recovery",
      maxPerDay: 1,
      messageTemplate: "오늘은 필수만 남기면 회복할 수 있어요.",
      type: "recovery_needed",
    },
    {
      channel: "web_push",
      cooldownMinutes: 720,
      enabled: true,
      id: "notice-parent-summary",
      maxPerDay: 1,
      messageTemplate: "오늘 공부 흐름을 짧게 정리했어요.",
      type: "parent_summary",
    },
  ],
  studentName: "민준",
  subcopy: "알림은 감시가 아니라 전환과 회복을 돕는 약속으로만 써요.",
};

export const mockFamilySettings: FamilySettingsView = {
  availableMinutesPreview: 0,
  dailyRhythm: mockFamilyDailyRhythm,
  familyName: "민준이네",
  generatedTimeBlocks: [],
  headline: "생활 리듬이 오늘 공부 시간을 정해요",
  mobileAppTodo: [
    "앱 푸시 권한 요청 화면",
    "iOS/Android 백그라운드 알림 확인",
    "앱 로그인과 가족 초대 흐름",
    "홈 화면 위젯 또는 빠른 시작 버튼 검토",
  ],
  mobileReuseMessage:
    "계산 엔진, 알림 정책, 서비스 응답 타입은 웹 UI 밖에서 재사용할 수 있게 유지해요.",
  parentName: "보호자",
  pwaScopeMessage:
    "PWA는 홈 화면 설치와 웹 푸시 검증까지 사용하고, 확실한 생활 알림은 모바일 앱 단계에서 다뤄요.",
  studentName: "민준",
  studentProfile: mockStudentProfile,
  subcopy: "등교, 학원, 식사, 취침 시간을 정하면 남은 시간이 자동으로 계산돼요.",
};
