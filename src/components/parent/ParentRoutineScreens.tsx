"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ParentRoutineCreateView, RoutineRule, StudyTask } from "@/types/study";

type RoutineDraft = RoutineRule;

const routineCapacities = [
  { day: "월", minutes: 90, weekday: 1 },
  { day: "화", minutes: 150, weekday: 2 },
  { day: "수", minutes: 90, weekday: 3 },
  { day: "목", minutes: 150, weekday: 4 },
];

export function ParentRoutineCreateScreen({
  isFamilyRhythmConfirmed,
  onStartAction,
  routine,
}: {
  isFamilyRhythmConfirmed: boolean;
  onStartAction?: (formData: FormData) => Promise<void>;
  routine: ParentRoutineCreateView;
}) {
  const [routineRules, setRoutineRules] = useState<RoutineDraft[]>([
    ...routine.weeklyRules,
    ...routine.dailyMemoryRules,
  ]);
  const [draftRoutine, setDraftRoutine] = useState<RoutineDraft | null>(null);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [pendingDeleteRoutine, setPendingDeleteRoutine] =
    useState<RoutineDraft | null>(null);
  const [startDate, setStartDate] = useState(routine.applicationPeriod.startDate);
  const [endDate, setEndDate] = useState(routine.applicationPeriod.endDate);
  const [switchDate, setSwitchDate] = useState(
    routine.applicationPeriod.examPrepSwitchDate,
  );
  const [periodMode, setPeriodMode] = useState<"steady" | "exam-aware">(
    "exam-aware",
  );
  const previewTasks = useMemo(
    () => createPreviewTasksFromRules(routineRules),
    [routineRules],
  );
  const previewMinutes = previewTasks.reduce(
    (sum, task) => sum + task.estimatedMinutes,
    0,
  );
  const visibleRoutineRules = useMemo(
    () =>
      mergeDraftRoutine({
        draftRoutine,
        editingRoutineId,
        routineRules,
      }),
    [draftRoutine, editingRoutineId, routineRules],
  );
  const routineLoads = useMemo(
    () => calculateRoutineLoads(visibleRoutineRules),
    [visibleRoutineRules],
  );
  const overflowMessage = firstOverflowMessage(routineLoads);
  const draftValidation = draftRoutine
    ? validateRoutine({
        editingRoutineId,
        routineRules,
        rule: draftRoutine,
      })
    : null;

  function openNewDraftRoutine() {
    setEditingRoutineId(null);
    setDraftRoutine({
      estimatedMinutes: 20,
      id: `routine-custom-${Date.now()}`,
      priority: routineRules.length + 1,
      repeatType: "weekly",
      subject: "",
      title: "",
      weekdays: [1],
    });
  }

  function startEditRoutine(rule: RoutineDraft) {
    setEditingRoutineId(rule.id);
    setDraftRoutine({ ...rule });
  }

  function saveDraftRoutine() {
    if (!draftRoutine || !draftValidation?.isValid) {
      return;
    }

    if (editingRoutineId) {
      setRoutineRules((currentRules) =>
        currentRules.map((rule) =>
          rule.id === editingRoutineId ? draftRoutine : rule,
        ),
      );
    } else {
      setRoutineRules((currentRules) => [...currentRules, draftRoutine]);
    }

    setDraftRoutine(null);
    setEditingRoutineId(null);
  }

  function requestDeleteRoutine(rule: RoutineDraft) {
    setPendingDeleteRoutine(rule);
  }

  function confirmDeleteRoutine() {
    if (!pendingDeleteRoutine) {
      return;
    }

    setRoutineRules((currentRules) =>
      currentRules.filter((rule) => rule.id !== pendingDeleteRoutine.id),
    );

    if (editingRoutineId === pendingDeleteRoutine.id) {
      setDraftRoutine(null);
      setEditingRoutineId(null);
    }

    setPendingDeleteRoutine(null);
  }

  if (!isFamilyRhythmConfirmed) {
    return <RoutinePrerequisiteScreen studentName={routine.studentName} />;
  }

  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[430px] flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">
              {routine.studentName}이의 평시 흐름
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-foreground">
              평시 루틴 만들기
            </h1>
          </div>
          <Link
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-sm font-bold text-accent shadow-sm ring-1 ring-black/5"
            href="/"
          >
            오늘
          </Link>
        </header>

        <section className="rounded-[28px] bg-surface-soft p-6 shadow-sm ring-1 ring-[#dce8dd]">
          <p className="text-sm font-semibold text-accent">가능 시간 확인됨</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-accent">
            {routine.headline}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">{routine.subcopy}</p>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">요일별 가능 시간</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            이 시간 안에서 루틴을 잡아요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            가족 설정의 등교, 학원, 식사, 취침 시간을 기준으로 계산한 뒤 루틴 시간을 입력해요.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {routineCapacities.map((capacity) => (
              <CapacityPill
                day={capacity.day}
                key={capacity.weekday}
                minutes={capacity.minutes}
                usedMinutes={routineLoads[capacity.weekday] ?? 0}
              />
            ))}
          </div>
          {overflowMessage ? (
            <p className="mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold leading-6 text-[#b14a3f]">
              {overflowMessage}
            </p>
          ) : null}
          <Link
            className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-[#f0f8ef] px-4 text-sm font-bold text-accent"
            href="/family"
          >
            가족 설정 다시 보기
          </Link>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">처음 만들기</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            루틴 약속을 하나씩 잡아요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            빠지는 일정처럼 목록에서 고치고, 아래 입력칸에서 바로 저장해요.
          </p>
          <div className="mt-4 space-y-3">
            {routineRules.map((rule) => (
              <RoutineRuleSummary
                disabled={editingRoutineId === rule.id}
                key={rule.id}
                onDelete={() => requestDeleteRoutine(rule)}
                onEdit={() => startEditRoutine(rule)}
                rule={rule}
              />
            ))}
            {draftRoutine ? (
              <RoutineRuleEditor
                actionLabel={editingRoutineId ? "저장" : "등록"}
                canSubmit={draftValidation?.isValid ?? false}
                recommendations={[...routine.weeklyRules, ...routine.dailyMemoryRules]}
                routineLoads={routineLoads}
                rule={draftRoutine}
                validationMessage={draftValidation?.message ?? ""}
                onCancel={() => {
                  setDraftRoutine(null);
                  setEditingRoutineId(null);
                }}
                onChange={(nextRule) =>
                  setDraftRoutine((currentDraft) =>
                    currentDraft ? { ...currentDraft, ...nextRule } : currentDraft,
                  )
                }
                onRegister={saveDraftRoutine}
              />
            ) : (
              <button
                className="flex min-h-14 w-full items-center justify-center rounded-2xl border border-dashed border-[#a8d5b4] bg-[#f8faf7] px-4 text-base font-bold text-accent"
                onClick={openNewDraftRoutine}
                type="button"
              >
                루틴 약속 추가
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">적용 기간</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            언제까지 평시 루틴으로 볼까요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            시작일과 종료일을 정하고, 시험 준비로 넘어갈 날짜를 골라요.
          </p>
          <div className="mt-4 grid w-full gap-3">
            <DateInput label="시작일" onChange={setStartDate} value={startDate} />
            <DateInput label="평시 종료일" onChange={setEndDate} value={endDate} />
            <DateInput
              label="시험 전환일"
              onChange={setSwitchDate}
              value={switchDate}
            />
          </div>
          <RecommendationRow label="추천">
            <SuggestionChip
              label={`${formatShortDate(routine.applicationPeriod.startDate)} 시작`}
              onClick={() => setStartDate(routine.applicationPeriod.startDate)}
            />
            <SuggestionChip
              label={`${formatShortDate(routine.applicationPeriod.examPrepSwitchDate)} 전환`}
              onClick={() => {
                setPeriodMode("exam-aware");
                setSwitchDate(routine.applicationPeriod.examPrepSwitchDate);
              }}
            />
          </RecommendationRow>
          <div className="mt-3 flex flex-wrap gap-2">
            <ToggleChip
              active={periodMode === "exam-aware"}
              label="시험 전환 사용"
              onClick={() => setPeriodMode("exam-aware")}
            />
            <ToggleChip
              active={periodMode === "steady"}
              label="전환 없이 유지"
              onClick={() => setPeriodMode("steady")}
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard
            label="오늘 루틴"
            value={`${previewMinutes}분`}
            hint={`${previewTasks.length}개 미션`}
          />
          <MetricCard
            label="적용 기간"
            value={periodMode === "exam-aware" ? "자동 전환" : "평시"}
            hint={`${formatShortDate(startDate)} 시작`}
          />
        </section>

        <RoutineTextPreview
          accent="요일별 과목"
          body="요일마다 한 과목만 가볍게 잡아두고, 학생 화면에는 오늘 할 일로만 내려가요."
          title={routinePreviewText(routineRules, "weekly")}
        />

        <RoutineTextPreview
          accent="매일 반복"
          body="외우는 루틴은 짧게 유지해서 시험 전에도 끊기지 않게 해요."
          title={routinePreviewText(routineRules, "daily")}
        />

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">오늘로 내려가기</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            오늘은 이렇게 보여요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            루틴표 전체가 아니라 학생이 바로 시작할 수 있는 미션만 보여줘요.
          </p>
          <div className="mt-4 space-y-2">
            {previewTasks.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
            {previewTasks.length === 0 ? (
              <SoftRow label="요일별 과목이나 매일 암기를 하나 골라주세요." />
            ) : null}
          </div>
        </section>

        <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
          <p className="text-sm font-semibold text-accent">무리한 날</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            꼭 이어갈 것만 남겨요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            {routine.overloadMessage}
          </p>
          <div className="mt-4 space-y-2">
            {routine.lightenedTasks.map((task) => (
              <SoftRow key={task.id} label={`${task.subject} ${task.estimatedMinutes}분`} />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">시험 전환</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            시험 한 달 전엔 자동으로 가볍게
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            {routine.examPrepSwitchMessage}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip>{formatShortDate(endDate)}까지 평시</Chip>
            <Chip>
              {periodMode === "exam-aware"
                ? `${formatShortDate(switchDate)} 전환`
                : "전환 없이 유지"}
            </Chip>
          </div>
        </section>

        {onStartAction ? (
          <RoutineStartForm
            action={onStartAction}
            draft={{
              applicationPeriod: {
                endDate,
                examPrepSwitchDate: switchDate,
                startDate,
              },
              rules: routineRules.map((rule, index) => ({
                ...rule,
                priority: index,
              })),
            }}
          />
        ) : (
          <Link
            className="mt-auto flex min-h-16 items-center justify-center rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
            href="/"
          >
            이 루틴으로 시작
          </Link>
        )}
      </div>
      {pendingDeleteRoutine ? (
        <RoutineDeleteConfirmModal
          onCancel={() => setPendingDeleteRoutine(null)}
          onConfirm={confirmDeleteRoutine}
          rule={pendingDeleteRoutine}
        />
      ) : null}
    </main>
  );
}

function RoutineStartForm({
  action,
  draft,
}: {
  action: (formData: FormData) => Promise<void>;
  draft: {
    applicationPeriod: {
      endDate: string;
      examPrepSwitchDate: string;
      startDate: string;
    };
    rules: RoutineDraft[];
  };
}) {
  return (
    <form action={action} className="mt-auto">
      <input name="routineDraft" type="hidden" value={JSON.stringify(draft)} />
      <button
        className="flex min-h-16 w-full items-center justify-center rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
        type="submit"
      >
        이 루틴으로 시작
      </button>
    </form>
  );
}

function RoutinePrerequisiteScreen({ studentName }: { studentName: string }) {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[430px] flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">
              {studentName}이의 평시 흐름
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-foreground">
              평시 루틴 만들기
            </h1>
          </div>
          <Link
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-sm font-bold text-accent shadow-sm ring-1 ring-black/5"
            href="/"
          >
            오늘
          </Link>
        </header>

        <section className="rounded-[28px] bg-surface-soft p-6 shadow-sm ring-1 ring-[#dce8dd]">
          <p className="text-sm font-semibold text-accent">먼저 확인할 것</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-accent">
            요일별 공부 가능 시간을 먼저 정해요
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            루틴 시간은 등교, 학원, 식사, 취침 시간이 빠진 뒤에야 현실적으로 잡을 수 있어요.
          </p>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">진행 순서</p>
          <div className="mt-4 space-y-2">
            <SoftRow label="1. 가족 설정에서 등교, 학원, 식사, 취침 시간 확인" />
            <SoftRow label="2. 요일별 공부 가능 시간 계산" />
            <SoftRow label="3. 가능 시간 안에서 요일별 과목과 암기 루틴 입력" />
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">예시</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <CapacityPill day="월" minutes={90} />
            <CapacityPill day="화" minutes={150} />
            <CapacityPill day="수" minutes={90} />
            <CapacityPill day="목" minutes={150} />
          </div>
        </section>

        <Link
          className="mt-auto flex min-h-16 items-center justify-center rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
          href="/family"
        >
          가족 설정 먼저 확인
        </Link>
      </div>
    </main>
  );
}

function CapacityPill({
  day,
  minutes,
  usedMinutes = 0,
}: {
  day: string;
  minutes: number;
  usedMinutes?: number;
}) {
  const remainingMinutes = minutes - usedMinutes;
  const isOverflow = remainingMinutes < 0;

  return (
    <div
      className={
        isOverflow
          ? "rounded-2xl bg-[#fff1ef] px-4 py-3 ring-1 ring-[#f1c4bd]"
          : "rounded-2xl bg-[#f8faf7] px-4 py-3"
      }
    >
      <p className="text-base font-bold text-foreground">
        {day}요일 {minutes}분
      </p>
      <p
        className={
          isOverflow
            ? "mt-1 text-sm font-semibold text-[#b14a3f]"
            : "mt-1 text-sm font-semibold text-accent"
        }
      >
        {isOverflow
          ? `${Math.abs(remainingMinutes)}분 초과`
          : `남은 ${remainingMinutes}분`}
      </p>
    </div>
  );
}

function RoutineRuleSummary({
  disabled,
  onDelete,
  onEdit,
  rule,
}: {
  disabled: boolean;
  onDelete: () => void;
  onEdit: () => void;
  rule: RoutineDraft;
}) {
  return (
    <div
      className={
        disabled
          ? "w-full rounded-2xl bg-[#eef6ef] px-3 py-2 text-left ring-1 ring-[#c9e2cf]"
          : "w-full cursor-pointer rounded-2xl bg-[#f8faf7] px-3 py-2 text-left"
      }
      onClick={disabled ? undefined : onEdit}
      onKeyDown={(keyboardEvent) => {
        if (disabled) {
          return;
        }

        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault();
          onEdit();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">
            {rule.title}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-muted">
            {routineRuleLabel(rule)} · {rule.estimatedMinutes}분
          </p>
        </div>
        <button
          aria-label={`${rule.title} 삭제`}
          className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4c7c1] shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_1px_2px_rgba(20,34,49,0.12)] ring-1 ring-[#e7aaa2] disabled:opacity-50"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          title="삭제"
          type="button"
        >
          <span className="absolute h-[3px] w-4 rounded-full bg-white shadow-[0_1px_1px_rgba(20,34,49,0.16)]" />
        </button>
      </div>
    </div>
  );
}

function RoutineRuleEditor({
  actionLabel,
  canSubmit,
  onCancel,
  onChange,
  onRegister,
  recommendations,
  routineLoads,
  rule,
  validationMessage,
}: {
  actionLabel: string;
  canSubmit: boolean;
  onCancel: () => void;
  onChange: (rule: Partial<RoutineDraft>) => void;
  onRegister: () => void;
  recommendations: RoutineDraft[];
  routineLoads: Record<number, number>;
  rule: RoutineDraft;
  validationMessage: string;
}) {
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-[#f8faf7] p-4">
      <TextInput
        label="루틴 이름"
        onChange={(title) =>
          onChange({
            subject: rule.subject || inferSubject(title) || "",
            title,
          })
        }
        placeholder="예: 수학 기본 문제"
        value={rule.title}
      />
      <div className="mt-3 grid grid-cols-[1fr_112px] gap-3">
        <SubjectPicker
          label="과목"
          onClick={() => setIsSubjectModalOpen(true)}
          value={rule.subject}
        />
        <NumberInput
          label="예상 시간"
          onChange={(estimatedMinutes) => onChange({ estimatedMinutes })}
          value={rule.estimatedMinutes}
        />
      </div>
      <div className="mt-3">
        <RoutineKindSegmented
          onChange={(repeatType) =>
            onChange({
              repeatType,
              weekdays: repeatType === "daily" ? [] : rule.weekdays.length ? rule.weekdays : [1],
            })
          }
          value={rule.repeatType}
        />
      </div>
      <div className="mt-3">
        {rule.repeatType === "weekly" ? (
          <>
            <WeekdayPicker
              onChange={(weekdays) => onChange({ weekdays })}
              value={rule.weekdays}
            />
            <RoutineRemainingHint
              routineLoads={routineLoads}
              weekdays={rule.weekdays}
            />
          </>
        ) : (
          <>
            <SoftRow label="매일 학생 화면에 짧은 암기 미션으로 내려가요." />
            <RoutineRemainingHint
              routineLoads={routineLoads}
              weekdays={routineCapacities.map((capacity) => capacity.weekday)}
            />
          </>
        )}
      </div>
      <RecommendationRow label="추천">
        {recommendations.map((recommendation) => (
          <SuggestionChip
            key={recommendation.id}
            label={`${routineRuleLabel(recommendation)} ${recommendation.title}`}
          onClick={() => onChange({ ...recommendation, id: rule.id })}
          />
        ))}
      </RecommendationRow>
      {validationMessage ? (
        <p
          className={
            canSubmit
              ? "mt-3 rounded-2xl bg-[#eef7f0] px-4 py-3 text-sm font-semibold leading-6 text-accent"
              : "mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold leading-6 text-[#b14a3f]"
          }
        >
          {validationMessage}
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="min-h-12 rounded-2xl bg-accent px-4 text-base font-bold text-white disabled:bg-[#bddbc5] disabled:text-white/80"
          disabled={!canSubmit}
          onClick={onRegister}
          type="button"
        >
          {actionLabel}
        </button>
        <button
          className="min-h-12 rounded-2xl bg-white px-4 text-base font-bold text-accent ring-1 ring-[#c9e2cf]"
          onClick={onCancel}
          type="button"
        >
          취소
        </button>
      </div>
      {isSubjectModalOpen ? (
        <SubjectPickerModal
          onClose={() => setIsSubjectModalOpen(false)}
          onSelect={(subject) => {
            onChange({ subject });
            setIsSubjectModalOpen(false);
          }}
          value={rule.subject}
        />
      ) : null}
    </div>
  );
}

function SubjectPicker({
  label,
  onClick,
  value,
}: {
  label: string;
  onClick: () => void;
  value: string;
}) {
  return (
    <div className="block">
      <span className="text-sm font-bold text-muted">{label}</span>
      <button
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border border-[#dce8dd] bg-white px-4 text-base font-semibold text-foreground outline-none focus:border-accent"
        onClick={onClick}
        type="button"
      >
        <span>{value || "과목 선택"}</span>
        <span aria-hidden className="text-accent">⌄</span>
      </button>
    </div>
  );
}

function SubjectPickerModal({
  onClose,
  onSelect,
  value,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  value: string;
}) {
  const subjects = [
    "수학",
    "국어",
    "영어",
    "과학",
    "사회",
    "역사",
    "도덕",
    "기술가정",
    "정보",
    "한문",
    "기타",
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 px-4 pb-4 sm:items-center sm:pb-0">
      <section className="w-full max-w-[360px] rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent">과목 선택</p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              통계에 쓸 과목을 골라요
            </h2>
          </div>
          <button
            className="rounded-2xl bg-[#f8faf7] px-4 py-2 text-sm font-bold text-accent"
            onClick={onClose}
            type="button"
          >
            닫기
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          {subjects.map((subject) => (
            <button
              className={
                value === subject
                  ? "min-h-12 rounded-2xl bg-accent px-4 text-base font-bold text-white"
                  : "min-h-12 rounded-2xl bg-[#f8faf7] px-4 text-base font-bold text-accent ring-1 ring-[#dce8dd]"
              }
              key={subject}
              onClick={() => onSelect(subject)}
              type="button"
            >
              {subject}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function RoutineKindSegmented({
  onChange,
  value,
}: {
  onChange: (value: RoutineDraft["repeatType"]) => void;
  value: RoutineDraft["repeatType"];
}) {
  return (
    <div>
      <p className="text-sm font-bold text-muted">반복 방식</p>
      <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#eef7f0] p-1">
        {[
          { label: "요일별", value: "weekly" },
          { label: "매일", value: "daily" },
        ].map((item) => (
          <button
            className={
              value === item.value
                ? "min-h-10 rounded-xl bg-accent text-sm font-bold text-white"
                : "min-h-10 rounded-xl text-sm font-bold text-accent"
            }
            key={item.value}
            onClick={() => onChange(item.value as RoutineDraft["repeatType"])}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function WeekdayPicker({
  onChange,
  value,
}: {
  onChange: (value: number[]) => void;
  value: number[];
}) {
  const labels = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div>
      <p className="text-sm font-bold text-muted">요일</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {labels.map((label, weekday) => (
          <button
            className={
              value.includes(weekday)
                ? "rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
                : "rounded-full bg-white px-4 py-2 text-sm font-bold text-accent ring-1 ring-[#c9e2cf]"
            }
            key={label}
            onClick={() => onChange(toggleWeekday(value, weekday))}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoutineRemainingHint({
  routineLoads,
  weekdays,
}: {
  routineLoads: Record<number, number>;
  weekdays: number[];
}) {
  const selectedCapacities = routineCapacities.filter((capacity) =>
    weekdays.includes(capacity.weekday),
  );

  if (selectedCapacities.length === 0) {
    return null;
  }

  const mostLimited = selectedCapacities.reduce((limited, capacity) => {
    const limitedRemaining =
      limited.minutes - (routineLoads[limited.weekday] ?? 0);
    const capacityRemaining =
      capacity.minutes - (routineLoads[capacity.weekday] ?? 0);

    return capacityRemaining < limitedRemaining ? capacity : limited;
  }, selectedCapacities[0]);
  const usedMinutes = routineLoads[mostLimited.weekday] ?? 0;
  const remainingMinutes = mostLimited.minutes - usedMinutes;
  const isOverflow = remainingMinutes < 0;

  return (
    <p
      className={
        isOverflow
          ? "mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold leading-6 text-[#b14a3f]"
          : "mt-3 rounded-2xl bg-[#eef7f0] px-4 py-3 text-sm font-semibold leading-6 text-accent"
      }
    >
      {isOverflow
        ? `${mostLimited.day}요일 가능 시간보다 ${Math.abs(remainingMinutes)}분 많아요.`
        : `선택한 요일 중 ${mostLimited.day}요일 남은 시간 ${remainingMinutes}분`}
    </p>
  );
}

function RoutineDeleteConfirmModal({
  onCancel,
  onConfirm,
  rule,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  rule: RoutineDraft;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 px-6">
      <section className="w-full max-w-[360px] rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <p className="text-sm font-semibold text-[#b14a3f]">루틴 약속 삭제</p>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-foreground">
          이 루틴을 삭제할까요?
        </h2>
        <p className="mt-3 text-base leading-7 text-muted">
          {rule.title} · {routineRuleLabel(rule)} · {rule.estimatedMinutes}분
        </p>
        <p className="mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold leading-6 text-[#b14a3f]">
          삭제하면 오늘 미션 미리보기에서도 빠져요.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            className="min-h-12 rounded-2xl bg-[#d95749] px-4 text-base font-bold text-white"
            onClick={onConfirm}
            type="button"
          >
            삭제하기
          </button>
          <button
            className="min-h-12 rounded-2xl bg-white px-4 text-base font-bold text-accent ring-1 ring-[#c9e2cf]"
            onClick={onCancel}
            type="button"
          >
            취소
          </button>
        </div>
      </section>
    </div>
  );
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={
        active
          ? "rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
          : "rounded-full bg-white px-4 py-2 text-sm font-bold text-accent ring-1 ring-[#c9e2cf]"
      }
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function SuggestionChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="rounded-full bg-white px-4 py-2 text-sm font-bold text-accent ring-1 ring-[#c9e2cf]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function TextInput({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block w-full">
      <span className="text-sm font-bold text-muted">{label}</span>
      <input
        className="mt-2 min-h-12 w-full rounded-2xl border border-[#dce8dd] bg-white px-4 text-base font-semibold text-foreground outline-none focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function NumberInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted">{label}</span>
      <input
        className="mt-2 min-h-12 w-full rounded-2xl border border-[#dce8dd] bg-white px-4 text-base font-semibold text-foreground outline-none focus:border-accent"
        min={5}
        onChange={(event) => onChange(Number(event.target.value))}
        step={5}
        type="number"
        value={value}
      />
    </label>
  );
}

function DateInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-muted">{label}</span>
      <input
        className="mt-2 min-h-12 w-full rounded-2xl border border-[#dce8dd] bg-white px-4 text-base font-semibold text-foreground outline-none focus:border-accent"
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </label>
  );
}

function RecommendationRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-bold text-accent">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
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

function RoutineTextPreview({
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
      <h2 className="mt-3 text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-base leading-7 text-muted">{body}</p>
    </section>
  );
}

function TaskRow({ task }: { task: StudyTask }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#f8faf7] px-4 py-3">
      <span className="font-semibold text-foreground">{task.title}</span>
      <span className="text-sm font-medium text-muted">
        {task.estimatedMinutes}분
      </span>
    </div>
  );
}

function SoftRow({ label }: { label: string }) {
  return (
    <p className="rounded-2xl bg-[#f8faf7] px-4 py-3 text-base font-semibold text-foreground">
      {label}
    </p>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#f0f8ef] px-4 py-2 text-sm font-semibold text-[#2f6e42]">
      {children}
    </span>
  );
}

function weekdayLabel(rule: RoutineRule): string {
  if (rule.repeatType === "daily") {
    return "매일";
  }

  const labels = ["일", "월", "화", "수", "목", "금", "토"];

  return rule.weekdays.map((weekday) => labels[weekday]).join("");
}

function routineRuleLabel(rule: RoutineDraft): string {
  if (rule.repeatType === "daily") {
    return "매일 반복";
  }

  return `${weekdayLabel(rule)} 반복`;
}

function routinePreviewText(
  rules: RoutineDraft[],
  repeatType: RoutineDraft["repeatType"],
): string {
  const matchingRules = rules.filter((rule) => rule.repeatType === repeatType);

  if (matchingRules.length === 0) {
    return repeatType === "daily"
      ? "매일 암기를 입력해 주세요"
      : "요일별 과목을 입력해 주세요";
  }

  return matchingRules
    .map((rule) => `${routineRuleLabel(rule)} ${rule.title}`)
    .join(", ");
}

function validateRoutine({
  editingRoutineId,
  routineRules,
  rule,
}: {
  editingRoutineId: string | null;
  routineRules: RoutineDraft[];
  rule: RoutineDraft;
}): {
  isValid: boolean;
  message: string;
} {
  if (rule.title.trim().length < 2) {
    return {
      isValid: false,
      message: "루틴 이름을 두 글자 이상 입력해 주세요.",
    };
  }

  if (rule.subject.trim().length < 1) {
    return {
      isValid: false,
      message: "과목이나 암기 종류를 입력해 주세요.",
    };
  }

  if (!Number.isFinite(rule.estimatedMinutes) || rule.estimatedMinutes < 5) {
    return {
      isValid: false,
      message: "시간은 5분 이상으로 입력해 주세요.",
    };
  }

  if (rule.repeatType === "weekly" && rule.weekdays.length === 0) {
    return {
      isValid: false,
      message: "요일별 루틴은 요일을 하나 이상 골라 주세요.",
    };
  }

  const nextLoads = calculateRoutineLoads(
    mergeDraftRoutine({
      draftRoutine: rule,
      editingRoutineId,
      routineRules,
    }),
  );
  const overflow = firstOverflowMessage(nextLoads);

  if (overflow) {
    return {
      isValid: false,
      message: overflow,
    };
  }

  return {
    isValid: true,
    message: "등록할 수 있는 루틴이에요.",
  };
}

function mergeDraftRoutine({
  draftRoutine,
  editingRoutineId,
  routineRules,
}: {
  draftRoutine: RoutineDraft | null;
  editingRoutineId: string | null;
  routineRules: RoutineDraft[];
}): RoutineDraft[] {
  if (!draftRoutine) {
    return routineRules;
  }

  if (editingRoutineId) {
    return routineRules.map((rule) =>
      rule.id === editingRoutineId ? draftRoutine : rule,
    );
  }

  return [...routineRules, draftRoutine];
}

function calculateRoutineLoads(rules: RoutineDraft[]): Record<number, number> {
  return routineCapacities.reduce<Record<number, number>>((loads, capacity) => {
    loads[capacity.weekday] = rules.reduce((sum, rule) => {
      if (rule.repeatType === "daily") {
        return sum + rule.estimatedMinutes;
      }

      if (rule.weekdays.includes(capacity.weekday)) {
        return sum + rule.estimatedMinutes;
      }

      return sum;
    }, 0);

    return loads;
  }, {});
}

function firstOverflowMessage(loads: Record<number, number>): string {
  const overflowCapacity = routineCapacities.find(
    (capacity) => (loads[capacity.weekday] ?? 0) > capacity.minutes,
  );

  if (!overflowCapacity) {
    return "";
  }

  const usedMinutes = loads[overflowCapacity.weekday] ?? 0;

  return `${overflowCapacity.day}요일 가능 시간보다 ${usedMinutes - overflowCapacity.minutes}분 많아요. 예상 시간을 줄이거나 다른 요일로 나눠 주세요.`;
}

function toggleWeekday(weekdays: number[], weekday: number): number[] {
  if (weekdays.includes(weekday)) {
    return weekdays.filter((item) => item !== weekday);
  }

  return [...weekdays, weekday].sort((a, b) => a - b);
}

function formatShortDate(date: string): string {
  const [, month, day] = date.split("-");

  return `${Number(month)}월 ${Number(day)}일`;
}

function createPreviewTasksFromRules(rules: RoutineDraft[]): StudyTask[] {
  return rules.map((rule) => ({
    estimatedMinutes: rule.estimatedMinutes,
    id: `preview-${rule.id}`,
    missionLevel: rule.repeatType === "daily" ? "required" : "extra",
    sourceType: "routine",
    status: "pending",
    studyMode: rule.repeatType === "daily" ? "memorization" : "problem_solving",
    subject: rule.subject,
    title: rule.title,
  }));
}

function inferSubject(text: string): string | null {
  const subjects = ["수학", "국어", "영어", "과학", "사회", "도덕", "역사"];

  return subjects.find((subject) => text.includes(subject)) ?? null;
}
