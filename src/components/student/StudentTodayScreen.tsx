"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getMissionLevelLabel,
  getTasksByMissionLevel,
} from "@/services/studentToday";
import type {
  MissionLevel,
  StudentTodayView,
  StudyTask,
  StudyTaskStatus,
} from "@/types/study";

type StudyMode = "today" | "studying";

type CompletionSummary = {
  taskTitle: string;
  durationMinutes: number;
};

const missionLevels: MissionLevel[] = ["required", "extra", "optional"];

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

  return (
    <>
      <Header eyebrow={`${today.studentName}이의 오늘`} title="오늘" />

      <section className="rounded-[28px] bg-surface-soft p-6 shadow-sm ring-1 ring-[#dce8dd]">
        <p className="text-sm font-semibold text-accent">{today.dateLabel}</p>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-accent">
          {allRequiredDone ? "필수 미션은 모두 끝났어요" : today.headline}
        </h2>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          {allRequiredDone
            ? "이제 추가 미션은 여유가 있을 때만 가볍게 보면 돼요."
            : today.subcopy}
        </p>
      </section>

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">지금 할 일</p>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-3xl font-bold leading-tight text-foreground">
              {nextTask.title}
            </h3>
            <p className="mt-3 text-base text-muted">
              {nextTask.subject} · {nextTask.estimatedMinutes}분
            </p>
          </div>
          <SubjectBadge task={nextTask} />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            className="min-h-14 rounded-2xl bg-accent-strong px-4 text-lg font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
            onClick={() => onStart(nextTask.id)}
            type="button"
          >
            바로 시작
          </button>
          <button
            className="min-h-14 rounded-2xl border border-[#c9e2cf] bg-white px-4 text-lg font-bold text-accent"
            type="button"
          >
            10분 쉬기
          </button>
        </div>
        <p className="mt-5 rounded-2xl bg-[#f6fbf5] px-4 py-3 text-base font-medium leading-7 text-[#2f6e42]">
          {today.coach.recoveryMessage}
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <TimeSummary
          label="남은 공부"
          value={`${remainingStudyMinutes}분`}
          hint="오늘 계획"
        />
        <TimeSummary
          label="가능 시간"
          value={`${today.coach.remainingAvailableMinutes}분`}
          hint="취침 전까지"
        />
      </section>

      <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">오늘의 미션</h2>
          <p className="text-sm font-medium text-muted">필수부터 가볍게</p>
        </div>
        <div className="mt-4 space-y-4">
          {missionLevels.map((level) => (
            <MissionGroup
              key={level}
              label={getMissionLevelLabel(level)}
              tasks={getTasksByMissionLevel(tasks, level)}
            />
          ))}
        </div>
      </section>

      <section className="mb-2 rounded-[24px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-accent">다음 일정</p>
        <p className="mt-2 text-2xl font-bold text-foreground">
          {today.timeBlocks[0].startAt}
        </p>
        <p className="mt-1 text-base text-muted">{today.timeBlocks[0].title}</p>
      </section>

      <nav className="grid grid-cols-3 gap-2 pb-2">
        <SupportLink href="/student/week" label="이번 주" />
        <SupportLink href="/student/adjustment" label="오늘 줄이기" />
        <SupportLink href="/student/closing" label="하루 마감" />
      </nav>
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
      <Header eyebrow="민준이의 집중 시간" title="공부 중" />
      <section className="rounded-[32px] bg-surface-soft p-6 shadow-sm ring-1 ring-[#dce8dd]">
        <p className="text-sm font-semibold text-accent">현재 미션</p>
        <h1 className="mt-4 text-4xl font-bold leading-tight text-accent">
          {task.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-slate-600">
          끝나면 5분 쉬고 다음 미션으로 넘어가요.
        </p>
      </section>

      <section className="rounded-[32px] bg-surface p-6 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold text-muted">남은 시간</p>
        <p className="mt-4 text-6xl font-black text-accent">
          {task.estimatedMinutes}
          <span className="ml-1 text-3xl">분</span>
        </p>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-[#edf5ec]">
          <div className="h-full w-2/5 rounded-full bg-accent" />
        </div>
        <p className="mt-4 text-base text-muted">
          예상 종료 시각은 지금부터 {task.estimatedMinutes}분 뒤예요.
        </p>
      </section>

      <section className="mt-auto space-y-3 pb-2">
        <button
          className="min-h-16 w-full rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
          onClick={onComplete}
          type="button"
        >
          끝냈어요
        </button>
        <button
          className="min-h-14 w-full rounded-[22px] border border-[#c9e2cf] bg-white px-5 text-lg font-bold text-accent"
          onClick={onPause}
          type="button"
        >
          잠깐 멈춤
        </button>
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

function Header({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-accent">{eyebrow}</p>
        <h1 className="mt-1 text-4xl font-bold tracking-normal text-foreground">
          {title}
        </h1>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface shadow-sm ring-1 ring-black/5">
        <span
          className="relative h-7 w-7 before:absolute before:left-1 before:top-3 before:h-3 before:w-5 before:-rotate-12 before:rounded-full before:bg-accent/80 after:absolute after:right-0 after:top-1 after:h-4 after:w-6 after:-rotate-12 after:rounded-full after:bg-accent"
          aria-hidden
        />
      </div>
    </header>
  );
}

function SubjectBadge({ task }: { task: StudyTask }) {
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-[#eef7f0] text-2xl font-bold text-accent ring-1 ring-[#d7eadb]">
      {task.subject.slice(0, 1)}
    </div>
  );
}

function TimeSummary({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[24px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-accent">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}

function MissionGroup({ label, tasks }: { label: string; tasks: StudyTask[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-accent">{label}</p>
      <div className="mt-2 space-y-2">
        {tasks.map((task) => (
          <div
            className="flex items-center justify-between rounded-2xl bg-[#f8faf7] px-4 py-3"
            key={task.id}
          >
            <span
              className={
                task.status === "done"
                  ? "text-base font-semibold text-muted line-through"
                  : "text-base font-semibold text-foreground"
              }
            >
              {task.title}
            </span>
            <span className="shrink-0 text-sm font-medium text-muted">
              {task.status === "done" ? "완료" : `${task.estimatedMinutes}분`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupportLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="flex min-h-12 items-center justify-center rounded-2xl bg-white px-3 text-sm font-bold text-accent shadow-sm ring-1 ring-[#dce8dd]"
      href={href}
    >
      {label}
    </Link>
  );
}
