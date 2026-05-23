import Link from "next/link";
import type {
  ExamSubject,
  ParentExamPlanReviewView,
  ParentExamPrepView,
  ParentExamSubjectEntryView,
} from "@/types/study";

export function ParentExamPrepCreateScreen({
  prep,
}: {
  prep: ParentExamPrepView;
}) {
  return (
    <ParentPageFrame eyebrow={`${prep.studentName}이의 시험`} title="시험 준비 만들기">
      <HeroCard
        body={prep.subcopy}
        eyebrow={prep.examName}
        title={prep.headline}
      />

      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="준비 기간" value={`${prep.prepDays}일`} hint="자동 제안" />
        <MetricCard
          label="오늘 반영"
          value={`${prep.todayMissionCount}개`}
          hint="첫 미션 생성"
        />
      </section>

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">첫 단계</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          시험 이름과 날짜
        </h2>
        <p className="mt-2 text-base leading-7 text-muted">
          기말고사 시작일을 먼저 정해요.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>{prep.examName}</Chip>
          <Chip>{prep.examStartDate} 시작</Chip>
          <Chip>{prep.examEndDate} 종료</Chip>
        </div>
      </section>

      <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
        <p className="text-sm font-semibold text-accent">자동 제안</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          한 달 전부터 가볍게
        </h2>
        <p className="mt-2 text-base leading-7 text-muted">
          {prep.prepStartDate}부터 시작하고, 주차별 강도를 바꿔요.
        </p>
        <div className="mt-4 space-y-2">
          <SoftRow label="4주 전 개념 확인" />
          <SoftRow label="2주 전 시험 모드" />
        </div>
      </section>

      <PrimaryLink href="/parent/exam-prep/subjects">
        준비안 만들기
      </PrimaryLink>
    </ParentPageFrame>
  );
}

export function ParentExamSubjectEntryScreen({
  entry,
}: {
  entry: ParentExamSubjectEntryView;
}) {
  return (
    <ParentPageFrame eyebrow={`${entry.studentName}이의 준비`} title="시험 과목 입력">
      <HeroCard body={entry.subcopy} eyebrow={entry.examName} title={entry.headline} />

      <section className="grid grid-cols-2 gap-3">
        <MetricCard label="높음" value={`${entry.highSubjects.length}과목`} hint="수학 영어" />
        <MetricCard
          label="보통"
          value={`${entry.mediumSubjects.length}과목`}
          hint="균형 유지"
        />
      </section>

      <SubjectGroup
        accent="많이 챙김"
        body="시간이 큰 과목은 주중에 조금씩 분산해요."
        subjects={entry.highSubjects}
        title="수학과 영어"
      />
      <SubjectGroup
        accent="가볍게 유지"
        body="암기 과목은 짧은 반복으로 쪼개요."
        subjects={entry.mediumSubjects}
        title="사회 · 도덕 · 기술가정"
      />

      <PrimaryLink href="/parent/exam-prep/review">균형 확인하기</PrimaryLink>
    </ParentPageFrame>
  );
}

export function ParentExamPlanReviewScreen({
  onStartAction,
  review,
}: {
  onStartAction?: () => Promise<void>;
  review: ParentExamPlanReviewView;
}) {
  return (
    <ParentPageFrame
      eyebrow={`${review.studentName}이의 준비안`}
      title="시험 준비안 확인"
    >
      <HeroCard body={review.subcopy} eyebrow={review.examName} title={review.headline} />

      <section className="grid grid-cols-2 gap-3">
        <MetricCard
          label="이번 주"
          value={`${review.thisWeekMinutes}분`}
          hint="전체 공부"
        />
        <MetricCard label="오늘" value={`${review.todayMinutes}분`} hint="첫 미션" />
      </section>

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">4주 전</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          루틴 유지와 개념 확인
        </h2>
        <p className="mt-2 text-base leading-7 text-muted">
          첫 주는 많이 늘리지 않고 시작하는 흐름이에요.
        </p>
        <div className="mt-4 space-y-2">
          <SoftRow label={`주말 보정 ${review.weekendBufferMinutes}분`} />
          {review.firstWeekTasks.map((task) => (
            <SoftRow key={task} label={task} />
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
        <p className="text-sm font-semibold text-accent">학생에게</p>
        <h2 className="mt-3 text-2xl font-bold text-foreground">
          오늘은 두 가지만
        </h2>
        <p className="mt-2 text-base leading-7 text-muted">
          월간표 전체가 아니라 오늘 할 일로 내려가요.
        </p>
        <div className="mt-4 space-y-2">
          {review.studentPreviewTasks.map((task) => (
            <SoftRow key={task} label={task} />
          ))}
        </div>
      </section>

      {onStartAction ? (
        <PrimaryFormAction action={onStartAction}>이 준비안으로 시작</PrimaryFormAction>
      ) : (
        <PrimaryLink href="/">이 준비안으로 시작</PrimaryLink>
      )}
    </ParentPageFrame>
  );
}

function ParentPageFrame({
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

function SubjectGroup({
  accent,
  body,
  subjects,
  title,
}: {
  accent: string;
  body: string;
  subjects: ExamSubject[];
  title: string;
}) {
  return (
    <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-semibold text-accent">{accent}</p>
      <h2 className="mt-3 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-base leading-7 text-muted">{body}</p>
      <div className="mt-4 space-y-2">
        {subjects.map((subject) => (
          <div
            className="flex items-center justify-between rounded-2xl bg-[#f8faf7] px-4 py-3"
            key={subject.id}
          >
            <span className="font-semibold text-foreground">
              {subject.subject} {importanceLabel(subject.importance)}
            </span>
            <span className="text-sm font-medium text-muted">
              {subject.targetMinutes}분
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f0f8ef] px-4 py-2 text-sm font-semibold text-[#2f6e42]">
      {children}
    </span>
  );
}

function SoftRow({ label }: { label: string }) {
  return (
    <p className="rounded-2xl bg-[#f8faf7] px-4 py-3 text-base font-semibold text-foreground">
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

function PrimaryFormAction({
  action,
  children,
}: {
  action: () => Promise<void>;
  children: string;
}) {
  return (
    <form action={action} className="mt-auto">
      <button
        className="flex min-h-16 w-full items-center justify-center rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
        type="submit"
      >
        {children}
      </button>
    </form>
  );
}

function importanceLabel(importance: ExamSubject["importance"]) {
  const labels: Record<ExamSubject["importance"], string> = {
    high: "높음",
    low: "가볍게",
    medium: "보통",
  };

  return labels[importance];
}
