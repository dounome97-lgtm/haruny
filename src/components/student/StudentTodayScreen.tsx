"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { getTasksByMissionLevel } from "@/services/studentToday";
import type {
  StudentTodayView,
  StudyTask,
  StudyTaskStatus,
} from "@/types/study";

type StudyMode = "today" | "studying";

type CompletionSummary = {
  taskTitle: string;
  durationMinutes: number;
};

export function StudentTodayScreen({ initialToday }: { initialToday: StudentTodayView }) {
  const [mode, setMode] = useState<StudyMode>("today");
  const [tasks, setTasks] = useState(initialToday.tasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [completionSummary, setCompletionSummary] =
    useState<CompletionSummary | null>(null);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [activeTaskId, tasks],
  );
  const nextTask = useMemo(
    () =>
      tasks.find((task) => task.status === "pending") ??
      tasks.find((task) => task.status === "in_progress") ??
      initialToday.nextTask,
    [initialToday.nextTask, tasks],
  );
  const remainingStudyMinutes = tasks
    .filter((task) => task.status !== "done")
    .reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const requiredLeft = tasks.filter(
    (task) => task.missionLevel === "required" && task.status !== "done",
  ).length;

  function updateTaskStatus(taskId: string, status: StudyTaskStatus) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task,
      ),
    );
  }

  function handleStart(taskId: string) {
    setActiveTaskId(taskId);
    updateTaskStatus(taskId, "in_progress");
    setMode("studying");
  }

  function handleComplete() {
    if (!activeTask) {
      return;
    }

    updateTaskStatus(activeTask.id, "done");
    setCompletionSummary({
      taskTitle: activeTask.title,
      durationMinutes: activeTask.estimatedMinutes,
    });
    setActiveTaskId(null);
    setMode("today");
  }

  function handlePause() {
    if (activeTask) {
      updateTaskStatus(activeTask.id, "pending");
    }
    setActiveTaskId(null);
    setMode("today");
  }

  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[430px] flex-col gap-5">
        {mode === "studying" && activeTask ? (
          <StudyingView
            onComplete={handleComplete}
            onPause={handlePause}
            task={activeTask}
          />
        ) : (
          <TodayView
            nextTask={nextTask}
            onStart={handleStart}
            remainingStudyMinutes={remainingStudyMinutes}
            requiredLeft={requiredLeft}
            tasks={tasks}
            today={initialToday}
          />
        )}
      </div>
      {completionSummary ? (
        <CompletionModal
          requiredLeft={requiredLeft}
          summary={completionSummary}
          onClose={() => setCompletionSummary(null)}
        />
      ) : null}
    </main>
  );
}

function TodayView({
  nextTask,
  onStart,
  remainingStudyMinutes,
  requiredLeft,
  tasks,
  today,
}: {
  nextTask: StudyTask;
  onStart: (taskId: string) => void;
  remainingStudyMinutes: number;
  requiredLeft: number;
  tasks: StudyTask[];
  today: StudentTodayView;
}) {
  const allRequiredDone = requiredLeft === 0;
  const requiredCount = getTasksByMissionLevel(tasks, "required").filter(
    (task) => task.status !== "done",
  ).length;
  const extraCount = getTasksByMissionLevel(tasks, "extra").filter(
    (task) => task.status !== "done",
  ).length;
  const optionalCount = getTasksByMissionLevel(tasks, "optional").filter(
    (task) => task.status !== "done",
  ).length;
  const spareMinutes = Math.max(
    today.coach.remainingAvailableMinutes - remainingStudyMinutes,
    0,
  );

  return (
    <>
      <Header title="오늘" />

      <section className="relative overflow-hidden rounded-[24px] bg-[#eef6ec] px-6 py-6 shadow-sm ring-1 ring-[#e1ece0]">
        <div className="flex min-h-[96px] items-center gap-5">
          <SproutIcon />
          <div className="relative z-10">
            <h2 className="text-[26px] font-extrabold leading-tight text-foreground">
              {allRequiredDone ? "잘 끝냈어!" : "잘하고 있어!"}
            </h2>
            <p className="mt-3 text-[21px] font-medium leading-8 text-[#27313b]">
              {allRequiredDone
                ? "필수 미션은 모두 끝났어. 이제 가볍게 이어가면 돼."
                : "지금 하나만 시작해 보면 충분해."}
            </p>
          </div>
        </div>
        <MascotCard />
      </section>

      <section>
        <h2 className="mb-4 text-[25px] font-extrabold text-[#333]">다음 미션</h2>
        <div className="flex min-h-[142px] items-center gap-4 rounded-[22px] border border-[#cfe3c8] bg-white px-5 py-6 shadow-sm">
          <NotebookIcon />
          <div className="min-w-0">
            <h3 className="text-[32px] font-black leading-tight text-[#232323] min-[420px]:text-[36px]">
              지금 {nextTask.subject} {nextTask.estimatedMinutes}분
            </h3>
            <p className="mt-3 text-[22px] font-semibold leading-8 text-[#777]">
              {nextTask.title.replace(`${nextTask.subject} `, "")}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <button
          className="flex min-h-[112px] items-center justify-center gap-3 rounded-[22px] bg-[#ff5a4f] px-3 text-white shadow-[0_14px_28px_rgba(255,90,79,0.22)] min-[420px]:gap-4 min-[420px]:px-4"
          onClick={() => onStart(nextTask.id)}
          type="button"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#ff5a4f] min-[420px]:h-14 min-[420px]:w-14">
            <span className="ml-1 h-0 w-0 border-y-[11px] border-l-[17px] border-y-transparent border-l-current" />
          </span>
          <span className="text-left">
            <span className="block text-[24px] font-black leading-tight min-[420px]:text-[28px]">바로 시작</span>
            <span className="mt-2 block text-base font-semibold text-white/90">
              지금 바로 집중 모드
            </span>
          </span>
        </button>
          <button
          className="flex min-h-[112px] items-center justify-center gap-3 rounded-[22px] bg-[#eefafa] px-3 text-[#19a9a8] shadow-sm ring-1 ring-[#d3eceb] min-[420px]:gap-4 min-[420px]:px-4"
            type="button"
          >
          <CupIcon />
          <span className="text-left">
            <span className="block text-[24px] font-black leading-tight min-[420px]:text-[28px]">10분 쉬기</span>
            <span className="mt-2 block text-base font-semibold text-[#6f7777]">
              짧게 쉬고 다시 시작
            </span>
          </span>
          </button>
      </section>

      <section className="flex min-h-[76px] items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-sm ring-1 ring-black/10">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#257d34] text-[#257d34]">
            <span className="h-4 w-7 -rotate-45 border-b-[4px] border-l-[4px] border-current" />
          </span>
          <div>
            <p className="text-[24px] font-black text-[#22742e]">회복 가능</p>
            <p className="mt-1 text-[19px] font-medium leading-7 text-[#696f75]">
              지금 시작하면 오늘 계획을 마칠 수 있어요!
            </p>
          </div>
        </div>
        <SunIcon />
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[25px] font-extrabold text-[#333]">오늘 미션</h2>
          <p className="text-[20px] font-extrabold text-accent">필수 {requiredCount}개</p>
        </div>
        <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-[22px] bg-white shadow-sm ring-1 ring-black/10">
          <MissionSummary icon={<BookIcon />} label="필수" value={`${requiredCount}개`} />
          <MissionSummary icon={<PlusIcon />} label="추가" value={`${extraCount}개`} />
          <MissionSummary icon={<StarIcon />} label="남으면" value={`${optionalCount}개`} />
        </div>
      </section>

      <section className="grid min-h-[88px] grid-cols-[1fr_1.15fr_1fr] items-center rounded-[22px] bg-white px-5 py-4 shadow-sm ring-1 ring-black/10">
        <p className="text-[23px] font-black text-[#282828]">남은 시간</p>
        <div className="border-r border-[#e5e5e5] pr-5 text-center">
          <p className="text-base font-semibold text-[#747474]">공부할 시간</p>
          <p className="mt-1 text-[34px] font-black leading-none text-accent">
            {formatMinutes(remainingStudyMinutes)}
          </p>
        </div>
        <div className="pl-5 text-center">
          <p className="text-base font-semibold text-[#747474]">여유 시간</p>
          <p className="mt-1 text-[34px] font-black leading-none text-accent">
            {formatMinutes(spareMinutes)}
          </p>
        </div>
      </section>

      <Link
        className="mb-2 flex min-h-[80px] items-center justify-between rounded-[22px] bg-white px-5 py-4 shadow-sm ring-1 ring-black/10"
        href="/student/week"
      >
        <div className="flex items-center gap-4">
          <CalendarIcon />
          <div>
            <p className="text-lg font-semibold text-[#555]">다음 일정</p>
            <p className="mt-1 text-[24px] font-bold text-[#242424]">
              {today.timeBlocks[0].startAt} {today.timeBlocks[0].title}
            </p>
          </div>
        </div>
        <span className="h-5 w-5 rotate-45 border-r-[4px] border-t-[4px] border-[#777]" />
      </Link>
    </>
  );
}

function StudyingView({
  onComplete,
  onPause,
  task,
}: {
  onComplete: () => void;
  onPause: () => void;
  task: StudyTask;
}) {
  return (
    <>
      <StudyTopBar onPause={onPause} />

      <section className="flex items-center gap-4">
        <StudentAvatar />
        <div className="relative flex-1 rounded-[28px] bg-[#eef6e8] px-6 py-5 shadow-sm ring-1 ring-[#dfeadc] before:absolute before:left-[-14px] before:top-9 before:h-0 before:w-0 before:border-y-[13px] before:border-r-[16px] before:border-y-transparent before:border-r-[#eef6e8]">
          <h2 className="text-[30px] font-black leading-tight text-accent">
            잘하고 있어요!
          </h2>
          <p className="mt-4 text-[22px] font-medium leading-8 text-[#1f2b36]">
            지금 흐름 좋아요.
            <br />
            집중한 시간이 쌓이고 있어요.
          </p>
          <span className="absolute bottom-6 right-7 text-3xl text-[#65b36a]">♥</span>
        </div>
      </section>

      <section className="min-h-[230px] rounded-[28px] bg-white px-6 py-6 shadow-[0_10px_30px_rgba(20,34,49,0.08)] ring-1 ring-black/5">
        <span className="inline-flex rounded-full bg-[#edf8ea] px-5 py-2 text-[22px] font-black text-accent ring-1 ring-[#d8ead2]">
          현재 미션
        </span>
        <h1 className="mt-8 text-[46px] font-black leading-tight text-[#1f2b36]">
          {task.subject} 오답
        </h1>
        <p className="mt-4 text-[27px] font-semibold leading-9 text-[#6e7780]">
          {task.title.replace(`${task.subject} `, "")}
        </p>
        <div className="mt-8">
          <NotebookIcon />
        </div>
      </section>

      <section className="rounded-[28px] bg-[#eef6ec] px-6 py-6 text-center shadow-sm ring-1 ring-[#dfeadc]">
        <div className="flex items-center justify-center gap-3 text-accent">
          <ClockIcon />
          <p className="text-[28px] font-black">남은 시간</p>
        </div>
        <p className="mt-5 text-[82px] font-black leading-none text-accent">
          {formatTimerMinutes(Math.max(task.estimatedMinutes - 8, 1))}
        </p>
        <div className="mx-auto mt-8 h-4 w-[88%] overflow-hidden rounded-full bg-[#dfe5df]">
          <div className="h-full w-[68%] rounded-full bg-[#59b96a]" />
        </div>
        <p className="mt-4 text-[22px] font-semibold text-[#6d747b]">
          총 {task.estimatedMinutes}분
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <button
          className="flex min-h-[98px] items-center justify-center gap-4 rounded-[22px] bg-[#ff5a4f] px-4 text-white shadow-[0_14px_28px_rgba(255,90,79,0.22)]"
          onClick={onComplete}
          type="button"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[#ff5a4f]">
            <span className="h-4 w-7 -rotate-45 border-b-[5px] border-l-[5px] border-current" />
          </span>
          <span className="text-[28px] font-black">끝냈어요</span>
        </button>
        <button
          className="flex min-h-[98px] items-center justify-center gap-4 rounded-[22px] bg-[#eefafa] px-4 text-[#149e9a] shadow-sm ring-1 ring-[#d3eceb]"
          onClick={onPause}
          type="button"
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[#149e9a]">
            <span className="h-7 w-2 rounded-full bg-current" />
            <span className="ml-2 h-7 w-2 rounded-full bg-current" />
          </span>
          <span className="text-[28px] font-black">잠깐 멈춤</span>
        </button>
      </section>

      <section className="mb-2 flex min-h-[92px] items-center justify-between rounded-[24px] border border-[#f4d88c] bg-[#fffdf5] px-6 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <StarIcon />
          <div>
            <p className="text-[22px] font-black text-accent">다음 행동 미리보기</p>
            <p className="mt-2 text-[28px] font-black leading-tight text-[#1f2b36]">
              끝나면 영어 단어
            </p>
          </div>
        </div>
        <SmallBookIcon />
      </section>
    </>
  );
}

function CompletionModal({
  onClose,
  requiredLeft,
  summary,
}: {
  onClose: () => void;
  requiredLeft: number;
  summary: CompletionSummary;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/45 px-6">
      <section className="w-full max-w-[360px] rounded-[32px] bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef7f0] text-3xl font-black text-accent">
          ✓
        </div>
        <h2 className="mt-5 text-2xl font-bold text-foreground">
          좋아요. {summary.taskTitle} 끝!
        </h2>
        <p className="mt-3 text-base leading-7 text-muted">
          {summary.durationMinutes}분 집중했어요. 남은 필수 미션은{" "}
          {requiredLeft}개예요.
        </p>
        <button
          className="mt-6 min-h-14 w-full rounded-2xl bg-accent-strong px-5 text-lg font-bold text-white"
          onClick={onClose}
          type="button"
        >
          확인
        </button>
      </section>
    </div>
  );
}

function Header({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-semibold text-accent">{eyebrow}</p> : null}
        <h1 className="text-[48px] font-black tracking-normal text-[#262626]">
          {title}
        </h1>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-black/10">
        <span className="relative h-7 w-7 rounded-full bg-[#7ecb86]" aria-hidden>
          <span className="absolute left-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute right-[7px] top-[8px] h-1.5 w-1.5 rounded-full bg-white" />
          <span className="absolute bottom-[7px] left-[8px] h-2 w-3 rounded-b-full border-b-2 border-white" />
        </span>
      </div>
    </header>
  );
}

function StudyTopBar({ onPause }: { onPause: () => void }) {
  return (
    <header className="flex min-h-14 items-center justify-between border-b border-black/10 pb-5">
      <button
        aria-label="오늘 화면으로 돌아가기"
        className="flex h-11 w-11 items-center justify-center text-[#1f2b36]"
        onClick={onPause}
        type="button"
      >
        <span className="h-5 w-5 -rotate-45 border-l-[4px] border-t-[4px] border-current" />
      </button>
      <h1 className="text-[38px] font-black text-[#1f2b36]">공부 중</h1>
      <button
        aria-label="설정"
        className="flex h-11 w-11 items-center justify-center text-[#1f2b36]"
        type="button"
      >
        <CogIcon />
      </button>
    </header>
  );
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
  }

  return `${minutes}분`;
}

function formatTimerMinutes(minutes: number) {
  return `${String(minutes).padStart(2, "0")}:00`;
}

function MissionSummary({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-h-[76px] items-center justify-center gap-3 border-r border-[#e8e8e8] px-3 last:border-r-0">
      {icon}
      <div>
        <p className="text-[20px] font-bold text-[#252525]">{label}</p>
        <p className="mt-1 text-[20px] font-semibold text-[#777]">{value}</p>
      </div>
    </div>
  );
}

function StudentAvatar() {
  return (
    <span className="relative h-[112px] w-[112px] shrink-0 overflow-hidden rounded-full bg-[#e6f3dc]" aria-hidden>
      <span className="absolute left-[26px] top-[18px] h-16 w-16 rounded-full bg-[#ffc29b]" />
      <span className="absolute left-[22px] top-[16px] h-8 w-20 -rotate-6 rounded-t-full bg-[#6b432a]" />
      <span className="absolute left-[31px] top-[44px] h-2 w-2 rounded-full bg-[#1f2b36]" />
      <span className="absolute right-[31px] top-[44px] h-2 w-2 rounded-full bg-[#1f2b36]" />
      <span className="absolute left-[46px] top-[56px] h-2 w-5 rounded-b-full border-b-2 border-[#e96a4b]" />
      <span className="absolute bottom-[-12px] left-[18px] h-16 w-20 rounded-t-[32px] bg-[#67a763]" />
      <span className="absolute bottom-4 left-[42px] h-8 w-8 rounded-b-full bg-[#ffc29b]" />
    </span>
  );
}

function SproutIcon() {
  return (
    <span className="relative h-10 w-12 shrink-0" aria-hidden>
      <span className="absolute bottom-0 left-1/2 h-7 w-1 -translate-x-1/2 rounded-full bg-[#81b86a]" />
      <span className="absolute left-1 top-2 h-5 w-8 rotate-12 rounded-tl-full rounded-br-full bg-[#87bd72]" />
      <span className="absolute right-1 top-1 h-5 w-8 -rotate-12 rounded-tr-full rounded-bl-full bg-[#78ae62]" />
    </span>
  );
}

function ClockIcon() {
  return (
    <span className="relative h-8 w-8 rounded-full border-[3px] border-current" aria-hidden>
      <span className="absolute left-1/2 top-1/2 h-3 w-[3px] -translate-x-1/2 -translate-y-full rounded-full bg-current" />
      <span className="absolute left-1/2 top-1/2 h-[3px] w-3 -translate-y-1/2 rounded-full bg-current" />
    </span>
  );
}

function CogIcon() {
  return (
    <span className="relative h-8 w-8 rounded-full border-[4px] border-current" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          className="absolute left-1/2 top-1/2 h-2 w-3 origin-left rounded-full bg-current"
          key={index}
          style={{ transform: `rotate(${index * 45}deg) translate(14px, -4px)` }}
        />
      ))}
      <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
    </span>
  );
}

function MascotCard() {
  return (
    <div className="absolute bottom-0 right-5 hidden h-28 w-28 sm:block" aria-hidden>
      <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-white shadow-sm" />
      <div className="absolute right-6 top-8 h-2 w-2 rounded-full bg-[#222]" />
      <div className="absolute right-14 top-8 h-2 w-2 rounded-full bg-[#222]" />
      <div className="absolute right-9 top-[52px] h-3 w-6 rounded-b-full border-b-2 border-[#222]" />
      <div className="absolute bottom-4 right-2 h-12 w-11 rounded-lg bg-[#62c28d]" />
      <div className="absolute bottom-5 right-11 h-9 w-4 rounded-full bg-white ring-1 ring-[#e8e8e8]" />
      <div className="absolute right-[82px] top-7 h-2 w-2 rounded-full bg-[#ffbf43]" />
      <div className="absolute right-[74px] top-3 h-5 w-1 rotate-[-18deg] rounded-full bg-[#ffbf43]" />
      <div className="absolute right-[58px] top-1 h-5 w-1 rotate-[-18deg] rounded-full bg-[#ffbf43]" />
    </div>
  );
}

function NotebookIcon() {
  return (
    <span className="relative h-20 w-20 shrink-0 min-[420px]:h-24 min-[420px]:w-24" aria-hidden>
      <span className="absolute left-2 top-4 h-14 w-14 -rotate-6 rounded-lg bg-[#8bb76d] min-[420px]:h-16 min-[420px]:w-16" />
      <span className="absolute left-5 top-1 h-16 w-14 -rotate-6 rounded-lg bg-[#f4f8e9] shadow-sm min-[420px]:h-20 min-[420px]:w-16" />
      <span className="absolute left-3 top-4 grid h-14 content-around">
        <span className="h-2 w-2 rounded-full bg-[#6b9854]" />
        <span className="h-2 w-2 rounded-full bg-[#6b9854]" />
        <span className="h-2 w-2 rounded-full bg-[#6b9854]" />
      </span>
      <span className="absolute left-8 top-6 text-base font-black text-[#87aa60] min-[420px]:left-9 min-[420px]:top-7 min-[420px]:text-lg">2×5=7</span>
      <span className="absolute left-10 top-11 text-base font-black text-[#87aa60] min-[420px]:left-11 min-[420px]:top-12 min-[420px]:text-lg">x=?</span>
      <span className="absolute right-1 top-9 h-14 w-3 rotate-[24deg] rounded-full bg-[#f2c14e] min-[420px]:top-10 min-[420px]:h-16 min-[420px]:w-4" />
      <span className="absolute right-0 top-[62px] h-3 w-4 rotate-[24deg] bg-[#333] min-[420px]:top-[70px] min-[420px]:h-4 min-[420px]:w-5" />
    </span>
  );
}

function CupIcon() {
  return (
    <span className="relative h-12 w-14 shrink-0" aria-hidden>
      <span className="absolute bottom-0 left-1 h-9 w-10 rounded-b-xl border-[4px] border-[#19a9a8]" />
      <span className="absolute bottom-3 right-0 h-5 w-5 rounded-r-full border-[4px] border-l-0 border-[#19a9a8]" />
      <span className="absolute left-4 top-0 h-4 w-1 rounded-full bg-[#19a9a8]" />
      <span className="absolute left-7 top-0 h-4 w-1 rounded-full bg-[#19a9a8]" />
    </span>
  );
}

function SunIcon() {
  return (
    <span className="relative h-14 w-14 shrink-0 rounded-full bg-[#ffd66b]" aria-hidden>
      {Array.from({ length: 8 }).map((_, index) => (
        <span
          className="absolute left-1/2 top-1/2 h-1.5 w-5 origin-left rounded-full bg-[#f7b52c]"
          key={index}
          style={{ transform: `rotate(${index * 45}deg) translate(22px, -3px)` }}
        />
      ))}
    </span>
  );
}

function BookIcon() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5f1df] text-[#2e7d37]" aria-hidden>
      <span className="h-7 w-8 rounded-sm border-[3px] border-current border-l-[5px]" />
    </span>
  );
}

function PlusIcon() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e5f6fb] text-[#139bb3]" aria-hidden>
      <span className="relative h-7 w-7 rounded-full border-[3px] border-current">
        <span className="absolute left-1/2 top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
        <span className="absolute left-1/2 top-1/2 h-[3px] w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
      </span>
    </span>
  );
}

function StarIcon() {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0ca] text-[#f1bd2f]" aria-hidden>
      <span className="text-3xl leading-none">★</span>
    </span>
  );
}

function CalendarIcon() {
  return (
    <span className="relative h-12 w-12 shrink-0 rounded-lg border-[4px] border-[#1fb7b2]" aria-hidden>
      <span className="absolute -top-2 left-2 h-4 w-1.5 rounded-full bg-[#1fb7b2]" />
      <span className="absolute -top-2 right-2 h-4 w-1.5 rounded-full bg-[#1fb7b2]" />
      <span className="absolute left-0 top-3 h-1 w-full bg-[#1fb7b2]" />
      <span className="absolute left-2 top-6 h-1.5 w-1.5 rounded-full bg-[#1fb7b2]" />
      <span className="absolute left-5 top-6 h-1.5 w-1.5 rounded-full bg-[#1fb7b2]" />
      <span className="absolute right-2 top-6 h-1.5 w-1.5 rounded-full bg-[#1fb7b2]" />
    </span>
  );
}

function SmallBookIcon() {
  return (
    <span className="relative h-14 w-12 shrink-0" aria-hidden>
      <span className="absolute inset-x-1 top-1 h-12 rounded-md bg-[#58b982]" />
      <span className="absolute inset-x-2 top-0 h-12 rounded-md bg-[#6fc999] shadow-sm" />
      <span className="absolute left-3 top-1 h-10 w-1 rounded-full bg-white/45" />
      <span className="absolute right-4 top-3 text-2xl font-black text-white">A</span>
      <span className="absolute bottom-0 left-2 h-2 w-8 rounded-b-md bg-[#e9f7ec]" />
    </span>
  );
}
