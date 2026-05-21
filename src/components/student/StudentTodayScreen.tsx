"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { getTasksByMissionLevel } from "@/services/studentToday";
import {
  AppFrame,
  AssetImage,
  ButtonText,
  HeroMessageCard,
  IconCircleLink,
  PrimaryActionButton,
  ScreenHeader,
  SecondaryActionButton,
  SummaryMetricCard,
} from "@/components/ui/HarunyAppUI";
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
    <AppFrame>
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
      {completionSummary ? (
        <CompletionModal
          onClose={() => setCompletionSummary(null)}
        />
      ) : null}
    </AppFrame>
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
      <ScreenHeader
        action={<IconCircleLink href="/student/week" src="/assets/haruny/student-today/face-smile-crop.png" />}
        title="오늘"
      />

      <HeroMessageCard
        body={
          allRequiredDone
            ? "필수 미션은 모두 끝났어. 이제 가볍게 이어가면 돼."
            : "지금 하나만 시작해 보면 충분해."
        }
        icon={<AssetImage className="h-11 w-11 shrink-0" height={44} src="/assets/haruny/student-today/sprout-crop.png" width={44} />}
        illustration={
          <AssetImage
            className="translate-x-3"
            height={92}
            priority
            src="/assets/haruny/student-today/white-mascot-cup-crop.png"
            width={118}
          />
        }
        title={allRequiredDone ? "잘 끝냈어!" : "잘하고 있어!"}
      />

      <section>
        <h2 className="mb-4 text-[25px] font-extrabold text-[#333]">다음 미션</h2>
        <div className="flex min-h-[128px] items-center gap-5 rounded-[22px] border border-[#cfe3c8] bg-white px-7 py-5 shadow-sm">
          <AssetImage
            className="h-[98px] w-[98px] shrink-0"
            height={98}
            priority
            src="/assets/haruny/student-today/math-notebook-card.png"
            width={98}
          />
          <div className="min-w-0">
            <h3 className="whitespace-nowrap text-[27px] font-black leading-tight text-[#232323] min-[420px]:text-[32px]">
              지금 {nextTask.subject} {nextTask.estimatedMinutes}분
            </h3>
            <p className="mt-3 text-[19px] font-semibold leading-7 text-[#777] min-[420px]:text-[21px]">
              {nextTask.title.replace(`${nextTask.subject} `, "")}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <PrimaryActionButton
          onClick={() => onStart(nextTask.id)}
          icon={
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[var(--action)] min-[420px]:h-12 min-[420px]:w-12">
              <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-current" />
            </span>
          }
        >
          <ButtonText body="집중 모드" title="바로 시작" />
        </PrimaryActionButton>
        <SecondaryActionButton
          icon={<AssetImage className="h-11 w-11 shrink-0 min-[420px]:h-[52px] min-[420px]:w-[52px]" height={52} src="/assets/haruny/student-today/cup-crop.png" width={52} />}
        >
          <ButtonText body="쉬고 다시 시작" title="10분 쉬기" />
        </SecondaryActionButton>
      </section>

      <SummaryMetricCard className="flex min-h-[76px] items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <AssetImage
            className="shrink-0"
            height={44}
            src="/assets/haruny/student-today/check-circle-crop.png"
            width={44}
          />
          <div className="min-w-0">
            <p className="text-[18px] font-black text-[#22742e] min-[420px]:text-[20px]">회복 가능</p>
            <p className="mt-1 whitespace-nowrap text-[13px] font-medium leading-5 text-[#696f75] min-[420px]:text-[15px]">
              오늘 계획을 마칠 수 있어요!
            </p>
          </div>
        </div>
        <AssetImage className="shrink-0" height={40} src="/assets/haruny/student-today/sun-crop.png" width={40} />
      </SummaryMetricCard>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-[25px] font-extrabold text-[#333]">오늘 미션</h2>
          <p className="text-[20px] font-extrabold text-accent">필수 {requiredCount}개</p>
        </div>
        <SummaryMetricCard className="mt-4 grid grid-cols-3 overflow-hidden">
          <MissionSummary
            icon={<AssetImage height={46} src="/assets/haruny/student-today/book-required-solo.png" width={46} />}
            label="필수"
            value={`${requiredCount}개`}
          />
          <MissionSummary
            icon={<AssetImage height={46} src="/assets/haruny/student-today/plus-extra-solo.png" width={46} />}
            label="추가"
            value={`${extraCount}개`}
          />
          <MissionSummary
            icon={<AssetImage height={46} src="/assets/haruny/student-today/star-optional-solo.png" width={46} />}
            label="남으면"
            value={`${optionalCount}개`}
          />
        </SummaryMetricCard>
      </section>

      <SummaryMetricCard className="grid min-h-[88px] grid-cols-[1.05fr_1fr_1fr] items-center px-5 py-5">
        <p className="whitespace-nowrap text-[18px] font-black text-[#282828] min-[420px]:text-[20px]">남은 시간</p>
        <div className="border-r border-[#e5e5e5] px-3 text-center">
          <p className="text-[14px] font-semibold text-[#747474]">공부할 시간</p>
          <p className="mt-1 whitespace-nowrap text-[20px] font-black leading-tight text-accent min-[420px]:text-[24px]">
            {formatMinutes(remainingStudyMinutes)}
          </p>
        </div>
        <div className="pl-3 text-center">
          <p className="text-[14px] font-semibold text-[#747474]">여유 시간</p>
          <p className="mt-1 whitespace-nowrap text-[20px] font-black leading-tight text-accent min-[420px]:text-[24px]">
            {formatMinutes(spareMinutes)}
          </p>
        </div>
      </SummaryMetricCard>

      <Link
        className="mb-2 flex min-h-[82px] items-center justify-between rounded-[22px] bg-white px-6 py-4 shadow-sm ring-1 ring-black/10"
        href="/student/week"
      >
        <div className="flex items-center gap-4">
          <AssetImage height={50} src="/assets/haruny/student-today/calendar-solo.png" width={50} />
          <div>
            <p className="text-[16px] font-semibold text-[#555]">다음 일정</p>
            <p className="mt-1 text-[20px] font-bold text-[#242424] min-[420px]:text-[22px]">
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

      <section className="flex items-center gap-3">
        <StudentAvatar />
        <div className="relative min-w-0 flex-1 rounded-[24px] bg-[#eef6e8] px-5 py-4 shadow-sm ring-1 ring-[#dfeadc] before:absolute before:left-[-12px] before:top-9 before:h-0 before:w-0 before:border-y-[11px] before:border-r-[14px] before:border-y-transparent before:border-r-[#eef6e8]">
          <h2 className="whitespace-nowrap text-[22px] font-black leading-tight text-accent min-[420px]:text-[24px]">
            잘하고 있어요!
          </h2>
          <p className="mt-3 whitespace-nowrap text-[15px] font-medium leading-6 text-[#1f2b36] min-[420px]:text-[16px]">
            지금 흐름 좋아요.
            <br />
            집중한 시간이 쌓이고 있어요.
          </p>
          <span className="absolute bottom-5 right-5 text-2xl text-[#65b36a]">♥</span>
        </div>
      </section>

      <section className="min-h-[208px] rounded-[26px] bg-white px-6 py-5 shadow-[0_10px_30px_rgba(20,34,49,0.08)] ring-1 ring-black/5">
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#edf8ea] px-4 py-2 text-[16px] font-black text-accent ring-1 ring-[#d8ead2]">
          현재 미션
        </span>
        <h1 className="mt-6 whitespace-nowrap text-[34px] font-black leading-tight text-[#1f2b36] min-[420px]:text-[38px]">
          {task.subject} 오답
        </h1>
        <p className="mt-3 whitespace-nowrap text-[21px] font-semibold leading-8 text-[#6e7780] min-[420px]:text-[23px]">
          {task.title.replace(`${task.subject} `, "")}
        </p>
        <div className="mt-5">
          <NotebookIcon />
        </div>
      </section>

      <section className="rounded-[26px] bg-[#eef6ec] px-6 py-5 text-center shadow-sm ring-1 ring-[#dfeadc]">
        <div className="flex items-center justify-center gap-3 text-accent">
          <ClockIcon />
          <p className="whitespace-nowrap text-[20px] font-black min-[420px]:text-[22px]">남은 시간</p>
        </div>
        <p className="mt-4 whitespace-nowrap text-[62px] font-black leading-none text-accent min-[420px]:text-[68px]">
          {formatTimerMinutes(Math.max(task.estimatedMinutes - 8, 1))}
        </p>
        <div className="mx-auto mt-6 h-3 w-[88%] overflow-hidden rounded-full bg-[#dfe5df]">
          <div className="h-full w-[68%] rounded-full bg-[#59b96a]" />
        </div>
        <p className="mt-3 whitespace-nowrap text-[16px] font-semibold text-[#6d747b]">
          총 {task.estimatedMinutes}분
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 min-[420px]:gap-4">
        <button
          className="flex min-h-[72px] items-center justify-center gap-2 rounded-[20px] bg-[#ff5a4f] px-3 text-white shadow-[0_14px_28px_rgba(255,90,79,0.22)] min-[420px]:gap-3 min-[420px]:px-5"
          onClick={onComplete}
          type="button"
        >
          <AssetImage
            className="h-9 w-9 shrink-0 min-[420px]:h-10 min-[420px]:w-10"
            height={40}
            src="/assets/haruny/common/check-action.svg"
            width={40}
          />
          <span className="whitespace-nowrap text-[18px] font-black min-[420px]:text-[22px]">끝냈어요</span>
        </button>
        <button
          className="flex min-h-[72px] items-center justify-center gap-2 rounded-[20px] bg-[#eefafa] px-3 text-[#149e9a] shadow-sm ring-1 ring-[#d3eceb] min-[420px]:gap-3 min-[420px]:px-5"
          onClick={onPause}
          type="button"
        >
          <AssetImage
            className="h-9 w-9 shrink-0 min-[420px]:h-10 min-[420px]:w-10"
            height={40}
            src="/assets/haruny/common/pause.svg"
            width={40}
          />
          <span className="whitespace-nowrap text-[18px] font-black min-[420px]:text-[22px]">잠깐 멈춤</span>
        </button>
      </section>

      <section className="mb-2 flex min-h-[82px] items-center justify-between gap-3 rounded-[22px] border border-[#f4d88c] bg-[#fffdf5] px-5 py-4 shadow-sm min-[420px]:px-6">
        <div className="flex min-w-0 items-center gap-3 min-[420px]:gap-4">
          <StarIcon />
          <div className="min-w-0">
            <p className="whitespace-nowrap text-[15px] font-black text-accent min-[420px]:text-[17px]">다음 행동 미리보기</p>
            <p className="mt-1 whitespace-nowrap text-[23px] font-black leading-tight text-[#1f2b36] min-[420px]:text-[25px]">
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
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex justify-center overflow-y-auto bg-black/55">
      <button
        aria-label="완료 모달 닫기"
        className="min-h-full w-full max-w-[430px] bg-transparent"
        onClick={onClose}
        type="button"
      >
        <AssetImage
          alt="학생 완료 응원 모달 확정 시안"
          className="h-auto w-full"
          height={1844}
          priority
          src="/assets/haruny/screen-reference/03-student-completion-encouragement-modal-selected.png"
          width={853}
        />
      </button>
    </div>
  );
}

function StudyTopBar({ onPause }: { onPause: () => void }) {
  return (
    <header className="flex min-h-12 items-center justify-between border-b border-black/10 pb-4">
      <button
        aria-label="오늘 화면으로 돌아가기"
        className="flex h-10 w-10 items-center justify-center text-[#1f2b36]"
        onClick={onPause}
        type="button"
      >
        <span className="h-5 w-5 -rotate-45 border-l-[4px] border-t-[4px] border-current" />
      </button>
      <h1 className="whitespace-nowrap text-[30px] font-black text-[#1f2b36] min-[420px]:text-[34px]">공부 중</h1>
      <button
        aria-label="설정"
        className="flex h-10 w-10 items-center justify-center text-[#1f2b36]"
        type="button"
      >
        <AssetImage height={34} src="/assets/haruny/common/settings.svg" width={34} />
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
    <div className="flex min-h-[78px] items-center justify-center gap-2 border-r border-[#e8e8e8] px-2 last:border-r-0">
      {icon}
      <div>
        <p className="whitespace-nowrap text-[15px] font-bold text-[#252525] min-[420px]:text-[17px]">{label}</p>
        <p className="mt-1 whitespace-nowrap text-[15px] font-semibold text-[#777] min-[420px]:text-[17px]">{value}</p>
      </div>
    </div>
  );
}

function StudentAvatar() {
  return (
    <AssetImage
      className="h-[88px] w-[88px] shrink-0 min-[420px]:h-[96px] min-[420px]:w-[96px]"
      height={96}
      priority
      src="/assets/haruny/student-studying/student-face-crop.png"
      width={96}
    />
  );
}

function ClockIcon() {
  return (
    <AssetImage className="h-7 w-7 shrink-0" height={28} src="/assets/haruny/common/clock.svg" width={28} />
  );
}

function NotebookIcon() {
  return (
    <AssetImage
      className="h-20 w-20 shrink-0"
      height={80}
      src="/assets/haruny/student-studying/math-notebook-crop.png"
      width={80}
    />
  );
}

function StarIcon() {
  return (
    <AssetImage
      className="h-12 w-12 shrink-0"
      height={48}
      src="/assets/haruny/student-studying/star-crop.png"
      width={48}
    />
  );
}

function SmallBookIcon() {
  return (
    <AssetImage
      className="h-14 w-14 shrink-0"
      height={56}
      src="/assets/haruny/student-studying/english-book-crop.png"
      width={56}
    />
  );
}
