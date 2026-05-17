import Link from "next/link";
import type {
  StudentAdjustmentView,
  StudentDayClosingView,
  StudentWeekView,
  WeeklySubjectFocus,
} from "@/types/study";

export function StudentWeekScreen({ week }: { week: StudentWeekView }) {
  return (
    <StudentPageFrame eyebrow={`${week.studentName}이의 이번 주`} title="이번 주">
      <HeroCard
        eyebrow={week.dateLabel}
        title={week.headline}
        body={week.subcopy}
      />

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">계속할 것</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {week.keepGoing.map((item) => (
            <span
              className="rounded-full bg-[#f0f8ef] px-4 py-2 text-sm font-semibold text-[#2f6e42]"
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            이번 주 챙길 과목
          </h2>
          <p className="text-sm font-medium text-muted">무리 없이</p>
        </div>
        <div className="mt-4 space-y-3">
          {week.subjects.map((subject) => (
            <SubjectFocus key={subject.subject} subject={subject} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
        <p className="text-sm font-semibold text-accent">오늘 이어갈 것</p>
        <h2 className="mt-3 text-3xl font-bold text-accent">
          {week.todayFirstTask.title}
        </h2>
        <p className="mt-2 text-base text-muted">
          {week.todayFirstTask.estimatedMinutes}분만 먼저 시작해요.
        </p>
      </section>

      <section className="space-y-2 rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        {week.phaseMessages.map((message) => (
          <p
            className="rounded-2xl bg-[#f8faf7] px-4 py-3 text-base font-medium leading-7 text-foreground"
            key={message}
          >
            {message}
          </p>
        ))}
        <p className="rounded-2xl bg-[#fff8ed] px-4 py-3 text-base font-semibold leading-7 text-[#9a5f05]">
          {week.weekendBufferMessage}
        </p>
      </section>

      <PrimaryLink href="/">오늘로 이어가기</PrimaryLink>
    </StudentPageFrame>
  );
}

export function StudentDayClosingScreen({
  closing,
}: {
  closing: StudentDayClosingView;
}) {
  return (
    <StudentPageFrame
      eyebrow={`${closing.studentName}이의 마감`}
      title="하루 마감"
    >
      <HeroCard
        eyebrow={closing.dateLabel}
        title={closing.headline}
        body={closing.coachMessage}
      />

      <SummaryCard
        accent="끝낸 것"
        items={closing.completed}
        title="오늘 해낸 공부"
      />
      <SummaryCard
        accent="내일로"
        items={closing.movedToTomorrow}
        title="가볍게 옮길 것"
      />

      <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
        <p className="text-sm font-semibold text-accent">내일 첫 행동</p>
        <h2 className="mt-3 text-3xl font-bold text-accent">
          {closing.tomorrowFirstTask}
        </h2>
        <p className="mt-2 text-base text-muted">
          내일은 이 작은 미션부터 이어가요.
        </p>
      </section>

      <PrimaryLink href="/">마감하기</PrimaryLink>
    </StudentPageFrame>
  );
}

export function StudentAdjustmentScreen({
  adjustment,
}: {
  adjustment: StudentAdjustmentView;
}) {
  return (
    <StudentPageFrame
      eyebrow={`${adjustment.studentName}이의 요청`}
      title="조정 요청"
    >
      <HeroCard
        eyebrow={adjustment.dateLabel}
        title={adjustment.headline}
        body={adjustment.subcopy}
      />

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">추천 조정</p>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-foreground">
          {adjustment.recommendedChange}
        </h2>
        <p className="mt-4 text-base leading-7 text-muted">
          오늘은 남은 필수만 마무리하고, 무리한 항목은 자연스럽게 옮겨요.
        </p>
      </section>

      <SummaryCard
        accent="오늘 남길 것"
        items={adjustment.remainingPlan}
        title="조정 후 오늘 계획"
      />

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">이유 선택</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {adjustment.reasonOptions.map((reason) => (
            <span
              className="rounded-full bg-[#f0f8ef] px-4 py-2 text-sm font-semibold text-[#2f6e42]"
              key={reason}
            >
              {reason}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-[#fff8ed] p-5 shadow-sm ring-1 ring-[#f4dfb7]">
        <p className="text-sm font-semibold text-[#9a5f05]">
          부모님께 보낼 내용
        </p>
        <p className="mt-3 text-base font-medium leading-7 text-foreground">
          {adjustment.parentPreview}
        </p>
      </section>

      <PrimaryLink href="/">요청 보내기</PrimaryLink>
    </StudentPageFrame>
  );
}

function StudentPageFrame({
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
            <h1 className="mt-1 text-4xl font-bold tracking-normal text-foreground">
              {title}
            </h1>
          </div>
          <Link
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-2xl font-bold text-accent shadow-sm ring-1 ring-black/5"
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

function SubjectFocus({ subject }: { subject: WeeklySubjectFocus }) {
  return (
    <div className="rounded-2xl bg-[#f8faf7] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-foreground">{subject.subject}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{subject.note}</p>
        </div>
        <p className="shrink-0 text-xl font-bold text-accent">
          {subject.minutes}분
        </p>
      </div>
    </div>
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
          <p
            className="rounded-2xl bg-[#f8faf7] px-4 py-3 text-base font-semibold text-foreground"
            key={item}
          >
            {item}
          </p>
        ))}
      </div>
    </section>
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
