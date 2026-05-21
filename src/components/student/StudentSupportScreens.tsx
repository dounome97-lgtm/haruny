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
    <main className="min-h-dvh bg-[var(--background)] px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[430px] flex-col gap-5">
        <header className="flex items-center justify-between">
          <h1 className="text-[42px] font-black tracking-normal text-[#1f2b36]">
            하루 마감
          </h1>
          <Link
            aria-label="오늘 화면으로"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-black/10"
            href="/"
          >
            <SmileIcon />
          </Link>
        </header>

        <section className="relative overflow-hidden rounded-[24px] bg-[#eef6ec] px-6 py-7 shadow-sm ring-1 ring-[#dfeadc]">
          <div className="relative z-10 max-w-[240px]">
            <h2 className="text-[31px] font-black leading-tight text-accent">
              오늘도 여기까지 왔어요
            </h2>
            <p className="mt-5 text-[23px] font-medium leading-9 text-[#48525c]">
              정말 수고했어요!
              <br />
              푹 쉬고, 내일도 잘 해봐요.
            </p>
            <span className="mt-7 block text-3xl text-[#5db36a]">♥</span>
          </div>
          <NightHouseIllustration />
        </section>

        <ClosingSectionHeading icon={<CheckBadgeIcon />} title="끝낸 것" />
        <section className="overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/10">
          {closing.completed.map((item, index) => (
            <ClosingDoneRow item={item} key={item} isLast={index === closing.completed.length - 1} />
          ))}
        </section>

        <ClosingSectionHeading icon={<MoonIcon />} title="내일로 옮길 것" />
        <section className="flex min-h-[84px] items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-sm ring-1 ring-black/10">
          <div className="flex items-center gap-4">
            <BookCircleIcon />
            <div>
              <p className="text-[25px] font-black text-[#1f2b36]">
                {closing.movedToTomorrow[0] ?? closing.tomorrowFirstTask}
              </p>
              <p className="mt-2 text-[18px] font-medium text-[#6f7780]">
                내일 여유가 있을 때 해요.
              </p>
            </div>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf7ff] text-[#2c8bdd]">
            <span className="h-4 w-4 rotate-45 border-r-[4px] border-t-[4px] border-current" />
          </span>
        </section>

        <section className="flex min-h-[100px] items-center justify-between rounded-[22px] bg-[#fff6df] px-5 py-5 shadow-sm">
          <div className="flex items-center gap-4">
            <StarCircleIcon />
            <div>
              <p className="text-[24px] font-black text-[#1f2b36]">
                오늘 계획은 조금 넉넉했어요
              </p>
              <p className="mt-2 text-[18px] font-medium leading-7 text-[#5f6770]">
                계획 대비 여유가 있었어요.
                <br />
                잘 조정했어요!
              </p>
            </div>
          </div>
          <SunIcon />
        </section>

        <section className="flex min-h-[120px] items-center gap-4 rounded-[22px] bg-[#f4faf2] px-5 py-5 shadow-sm ring-1 ring-[#d7ead2]">
          <StudentAvatar />
          <div>
            <p className="text-[29px] font-black leading-tight text-accent">
              오늘도 잘했어요!
            </p>
            <p className="mt-3 text-[18px] font-medium leading-7 text-[#48525c]">
              작은 걸음들이 모여 큰 성장을 만들어요.
              <br />
              오늘 잘 쌓은 집중, 내일도 이어가자!
            </p>
          </div>
          <span className="ml-auto self-end text-3xl text-[#6fbc72]">♥</span>
        </section>

        <section className="mt-auto space-y-3 pb-2">
          <Link
            className="flex min-h-16 items-center justify-center gap-4 rounded-[22px] bg-[#ff5a4f] px-5 text-[29px] font-black text-white shadow-[0_14px_28px_rgba(255,90,79,0.22)]"
            href="/"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#ff5a4f]">
              <span className="h-4 w-7 -rotate-45 border-b-[5px] border-l-[5px] border-current" />
            </span>
            마감하기
          </Link>
          <Link
            className="flex min-h-14 items-center justify-center gap-3 rounded-[18px] bg-[#f1fbfb] px-5 text-[24px] font-black text-[#16a6a4] ring-1 ring-[#bde5e2]"
            href="/student/week"
          >
            <CalendarIcon />
            내일 보기
          </Link>
        </section>
      </div>
    </main>
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

function ClosingSectionHeading({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mt-2 flex items-center gap-3 px-1">
      {icon}
      <h2 className="text-[25px] font-black text-[#1f2b36]">{title}</h2>
    </div>
  );
}

function ClosingDoneRow({ isLast, item }: { isLast: boolean; item: string }) {
  const isEnglish = item.includes("영어");

  return (
    <div
      className={`flex min-h-[88px] items-center justify-between px-5 py-4 ${
        isLast ? "" : "border-b border-[#e8e8e8]"
      }`}
    >
      <div className="flex items-center gap-4">
        {isEnglish ? <EnglishBookIcon /> : <MathBookIcon />}
        <div>
          <p className="text-[25px] font-black text-[#1f2b36]">{item}</p>
          <p className="mt-2 text-[18px] font-medium text-[#6d7480]">
            {isEnglish ? "15분 집중" : "25분 집중"}
          </p>
        </div>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-accent text-accent">
        <span className="h-3 w-6 -rotate-45 border-b-[4px] border-l-[4px] border-current" />
      </span>
    </div>
  );
}

function NightHouseIllustration() {
  return (
    <div className="absolute bottom-0 right-0 h-full w-[46%]" aria-hidden>
      <span className="absolute right-14 top-6 h-20 w-20 rounded-full bg-[#ffd15f]" />
      <span className="absolute right-10 top-3 h-20 w-20 rounded-full bg-[#eef6ec]" />
      <span className="absolute right-4 top-24 h-8 w-16 rounded-full bg-white" />
      <span className="absolute right-[102px] top-11 text-lg text-[#f5c33f]">★</span>
      <span className="absolute right-8 top-20 text-lg text-[#f5c33f]">★</span>
      <span className="absolute bottom-4 right-2 h-20 w-28 rounded-t-xl bg-[#fff8df] shadow-sm" />
      <span className="absolute bottom-[84px] right-1 h-0 w-0 border-x-[58px] border-b-[42px] border-x-transparent border-b-[#68a86a]" />
      <span className="absolute bottom-4 right-16 h-8 w-6 rounded-sm bg-[#ffd15f]" />
      <span className="absolute bottom-4 right-4 h-8 w-6 rounded-sm bg-[#ffd15f]" />
      <span className="absolute bottom-4 right-[112px] h-10 w-16 rounded-t-full bg-[#76b970]" />
      <span className="absolute bottom-4 right-[-8px] h-9 w-14 rounded-t-full bg-[#76b970]" />
    </div>
  );
}

function StudentAvatar() {
  return (
    <span className="relative h-[86px] w-[86px] shrink-0 overflow-hidden rounded-full bg-[#e6f3dc]" aria-hidden>
      <span className="absolute left-[20px] top-[14px] h-12 w-12 rounded-full bg-[#ffc29b]" />
      <span className="absolute left-[17px] top-[12px] h-7 w-16 -rotate-6 rounded-t-full bg-[#6b432a]" />
      <span className="absolute left-[27px] top-[34px] h-1.5 w-1.5 rounded-full bg-[#1f2b36]" />
      <span className="absolute right-[27px] top-[34px] h-1.5 w-1.5 rounded-full bg-[#1f2b36]" />
      <span className="absolute left-[36px] top-[46px] h-2 w-5 rounded-b-full border-b-2 border-[#e96a4b]" />
      <span className="absolute bottom-[-12px] left-[14px] h-14 w-16 rounded-t-[28px] bg-[#67a763]" />
    </span>
  );
}

function SmileIcon() {
  return (
    <span className="relative h-7 w-7 rounded-full bg-[#7ecb86]" aria-hidden>
      <span className="absolute left-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-white" />
      <span className="absolute right-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-white" />
      <span className="absolute bottom-[7px] left-[8px] h-2 w-3 rounded-b-full border-b-2 border-white" />
    </span>
  );
}

function CheckBadgeIcon() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7bc779] text-white" aria-hidden>
      <span className="h-3 w-5 -rotate-45 border-b-[4px] border-l-[4px] border-current" />
    </span>
  );
}

function MoonIcon() {
  return (
    <span className="relative h-9 w-9 rounded-full bg-[#4aa4e8]" aria-hidden>
      <span className="absolute right-0 top-0 h-8 w-8 rounded-full bg-[var(--background)]" />
      <span className="absolute bottom-1 right-1 text-xs text-[#4aa4e8]">z</span>
    </span>
  );
}

function MathBookIcon() {
  return (
    <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#edf6e8]" aria-hidden>
      <span className="h-12 w-11 -rotate-3 rounded-lg bg-[#68b776] text-center text-2xl font-black leading-[48px] text-white">
        +-
      </span>
    </span>
  );
}

function EnglishBookIcon() {
  return (
    <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#edf6e8]" aria-hidden>
      <span className="h-12 w-10 rotate-3 rounded-md bg-[#62b991] text-center text-3xl font-black leading-[48px] text-white">
        A
      </span>
      <span className="absolute bottom-2 right-3 h-4 w-1 rounded-full bg-[#e75a51]" />
    </span>
  );
}

function BookCircleIcon() {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e9f4ff] text-[#338cd8]" aria-hidden>
      <span className="h-9 w-11 rounded-sm border-[4px] border-current border-l-[6px]" />
    </span>
  );
}

function StarCircleIcon() {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-[#f1bd2f]" aria-hidden>
      <span className="text-4xl leading-none">★</span>
    </span>
  );
}

function SunIcon() {
  return (
    <span className="relative h-12 w-12 shrink-0 rounded-full bg-[#ffd66b]" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          className="absolute left-1/2 top-1/2 h-1.5 w-4 origin-left rounded-full bg-[#f7b52c]"
          key={index}
          style={{ transform: `rotate(${index * 45}deg) translate(19px, -3px)` }}
        />
      ))}
    </span>
  );
}

function CalendarIcon() {
  return (
    <span className="relative h-8 w-8 shrink-0 rounded-md border-[3px] border-current" aria-hidden>
      <span className="absolute -top-1.5 left-1.5 h-3 w-1 rounded-full bg-current" />
      <span className="absolute -top-1.5 right-1.5 h-3 w-1 rounded-full bg-current" />
      <span className="absolute left-0 top-2.5 h-0.5 w-full bg-current" />
      <span className="absolute left-1.5 top-[18px] h-1.5 w-1.5 rounded-full bg-current" />
      <span className="absolute left-[14px] top-[18px] h-1.5 w-1.5 rounded-full bg-current" />
      <span className="absolute right-1.5 top-[18px] h-1.5 w-1.5 rounded-full bg-current" />
    </span>
  );
}
