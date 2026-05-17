import Link from "next/link";
import type {
  NotificationRule,
  ParentDayEndSummaryView,
  ParentNotificationSettingsView,
  ParentReassuranceView,
  ParentTodayAdjustmentView,
  ParentWeekAdjustmentView,
  StudyTask,
  WeeklySubjectFocus,
} from "@/types/study";

export function ParentReassuranceScreen({
  reassurance,
}: {
  reassurance: ParentReassuranceView;
}) {
  return (
    <ParentFrame eyebrow={`${reassurance.studentName}이의 오늘`} title="안심">
      <HeroCard
        eyebrow={reassurance.dateLabel}
        title={reassurance.headline}
        body={reassurance.oneLineSummary}
      />
      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="끝낸 공부" value={`${reassurance.completedMinutes}분`} hint="오늘 누적" />
        <MetricCard label="남은 공부" value={`${reassurance.remainingMinutes}분`} hint="필수 중심" />
      </section>
      <MessageCard
        accent="개입 판단"
        title={interventionTitle(reassurance.interventionLevel)}
        body={reassurance.interventionMessage}
      />
      <MessageCard
        accent="회복 가능성"
        title={reassurance.recoveryMessage}
        body={reassurance.nextHelpfulAction}
      />
      <PrimaryLink href="/parent/today-adjustment">오늘 조정 보기</PrimaryLink>
    </ParentFrame>
  );
}

export function ParentTodayAdjustmentScreen({
  adjustment,
}: {
  adjustment: ParentTodayAdjustmentView;
}) {
  return (
    <ParentFrame eyebrow={`${adjustment.studentName}이의 조정`} title="오늘 계획 조정">
      <HeroCard
        eyebrow="현실성 확인"
        title={adjustment.headline}
        body={adjustment.realityMessage}
      />
      <MessageCard
        accent="추천 조정"
        title={adjustment.recommendedChange}
        body="오늘은 작게 성공하는 쪽으로 줄여요."
      />
      <TaskListCard
        accent="학생 화면 미리보기"
        body={adjustment.studentPreviewMessage}
        tasks={adjustment.adjustedTasks}
        title="조정 후 오늘 할 일"
      />
      <PrimaryLink href="/parent/week-adjustment">이번 주 균형 보기</PrimaryLink>
    </ParentFrame>
  );
}

export function ParentWeekAdjustmentScreen({
  week,
}: {
  week: ParentWeekAdjustmentView;
}) {
  return (
    <ParentFrame eyebrow={`${week.studentName}이의 이번 주`} title="이번 주 조정">
      <HeroCard eyebrow="주간 균형" title={week.headline} body={week.balanceMessage} />
      <SubjectLoadCard subjects={week.subjectLoads} />
      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">요일 부담</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          무거운 날만 살짝 덜어요
        </h2>
        <div className="mt-4 space-y-2">
          {week.dayLoads.map((day) => (
            <SoftRow
              key={day.dayLabel}
              label={`${day.dayLabel}요일 ${day.minutes}분 · ${moodLabel(day.mood)}`}
            />
          ))}
        </div>
      </section>
      <PrimaryLink href="/parent/day-summary">하루 마감 보기</PrimaryLink>
    </ParentFrame>
  );
}

export function ParentDayEndSummaryScreen({
  summary,
}: {
  summary: ParentDayEndSummaryView;
}) {
  return (
    <ParentFrame eyebrow={`${summary.studentName}이의 마감`} title="하루 마감 요약">
      <HeroCard eyebrow="오늘 정리" title={summary.headline} body={summary.parentNote} />
      <SummaryCard accent="끝낸 것" items={summary.completed} title="오늘 해낸 공부" />
      <SummaryCard accent="내일로" items={summary.movedToTomorrow} title="가볍게 옮긴 공부" />
      <MessageCard
        accent="내일 첫 행동"
        title={summary.tomorrowFirstTask}
        body="다음 날은 이 미션부터 시작하면 흐름이 이어져요."
      />
      <PrimaryLink href="/parent/notifications">알림 약속 보기</PrimaryLink>
    </ParentFrame>
  );
}

export function ParentNotificationSettingsScreen({
  settings,
}: {
  settings: ParentNotificationSettingsView;
}) {
  return (
    <ParentFrame eyebrow={`${settings.studentName}이의 약속`} title="약속 알림">
      <HeroCard eyebrow="알림 기준" title={settings.headline} body={settings.subcopy} />
      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">알림 조건</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          필요한 순간만 켜두기
        </h2>
        <div className="mt-4 space-y-2">
          {settings.rules.map((rule) => (
            <NotificationRow key={rule.id} rule={rule} />
          ))}
        </div>
      </section>
      <MessageCard
        accent="피로도 제한"
        title="반복해서 보내지 않아요"
        body={settings.fatigueLimitMessage}
      />
      <MessageCard
        accent="앱 전환"
        title="채널만 바꿀 수 있게"
        body={settings.channelSwitchMessage}
      />
      <PrimaryLink href="/">오늘 화면으로</PrimaryLink>
    </ParentFrame>
  );
}

function ParentFrame({
  children,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[430px] flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-foreground">
              {title}
            </h1>
          </div>
          <Link
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-sm font-bold text-accent shadow-sm ring-1 ring-black/5"
            href="/"
          >
            오늘
          </Link>
        </header>
        {children}
      </div>
    </main>
  );
}

function HeroCard({
  body,
  eyebrow,
  title,
}: {
  body: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="rounded-[28px] bg-surface-soft p-6 shadow-sm ring-1 ring-[#dce8dd]">
      <p className="text-sm font-semibold text-accent">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-accent">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{body}</p>
    </section>
  );
}

function MetricCard({
  hint,
  label,
  value,
}: {
  hint: string;
  label: string;
  value: string;
}) {
  return (
    <section className="rounded-[24px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-accent">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </section>
  );
}

function MessageCard({
  accent,
  body,
  title,
}: {
  accent: string;
  body: string;
  title: string;
}) {
  return (
    <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-semibold text-accent">{accent}</p>
      <h2 className="mt-3 text-2xl font-bold leading-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3 text-base leading-7 text-muted">{body}</p>
    </section>
  );
}

function TaskListCard({
  accent,
  body,
  tasks,
  title,
}: {
  accent: string;
  body: string;
  tasks: StudyTask[];
  title: string;
}) {
  return (
    <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
      <p className="text-sm font-semibold text-accent">{accent}</p>
      <h2 className="mt-3 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-base leading-7 text-muted">{body}</p>
      <div className="mt-4 space-y-2">
        {tasks.map((task) => (
          <SoftRow key={task.id} label={`${task.title} · ${task.estimatedMinutes}분`} />
        ))}
      </div>
    </section>
  );
}

function SubjectLoadCard({ subjects }: { subjects: WeeklySubjectFocus[] }) {
  return (
    <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-semibold text-accent">과목 균형</p>
      <h2 className="mt-3 text-2xl font-bold text-foreground">
        많이 몰린 과목 확인
      </h2>
      <div className="mt-4 space-y-2">
        {subjects.map((subject) => (
          <SoftRow
            key={subject.subject}
            label={`${subject.subject} ${subject.minutes}분 · ${subject.note}`}
          />
        ))}
      </div>
    </section>
  );
}

function SummaryCard({
  accent,
  items,
  title,
}: {
  accent: string;
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-semibold text-accent">{accent}</p>
      <h2 className="mt-3 text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <SoftRow key={item} label={item} />
        ))}
      </div>
    </section>
  );
}

function NotificationRow({ rule }: { rule: NotificationRule }) {
  return (
    <div className="rounded-2xl bg-[#f8faf7] px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{ruleLabel(rule.type)}</p>
        <span className="shrink-0 rounded-full bg-[#f0f8ef] px-3 py-1 text-xs font-bold text-[#2f6e42]">
          {rule.enabled ? "켜짐" : "꺼짐"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{rule.messageTemplate}</p>
    </div>
  );
}

function SoftRow({ label }: { label: string }) {
  return (
    <p className="rounded-2xl bg-[#f8faf7] px-4 py-3 text-base font-semibold leading-7 text-foreground">
      {label}
    </p>
  );
}

function PrimaryLink({ children, href }: { children: string; href: string }) {
  return (
    <Link
      className="mt-auto flex min-h-16 items-center justify-center rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
      href={href}
    >
      {children}
    </Link>
  );
}

function interventionTitle(level: ParentReassuranceView["interventionLevel"]) {
  const labels: Record<ParentReassuranceView["interventionLevel"], string> = {
    needed: "한 번 도와주면 좋아요",
    none: "지금은 괜찮아요",
    watch: "조금만 지켜봐요",
  };

  return labels[level];
}

function moodLabel(mood: "light" | "steady" | "heavy") {
  const labels = {
    heavy: "조금 무거움",
    light: "가벼움",
    steady: "적당함",
  };

  return labels[mood];
}

function ruleLabel(type: NotificationRule["type"]) {
  const labels: Record<NotificationRule["type"], string> = {
    parent_summary: "부모 요약",
    play_ending: "놀이 종료 전",
    recovery_needed: "지연 회복",
    study_start_needed: "공부 시작 필요",
  };

  return labels[type];
}
