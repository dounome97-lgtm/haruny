"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FamilySettingsView } from "@/types/study";

type UnavailableDraft = {
  date: string;
  id: string;
  repeatType: "once" | "weekly";
  title: string;
  startAt: string;
  endAt: string;
  weekdays: number[];
};

type PreviewBlock = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
const sampleRoutineMinutes = 100;

export function FamilySettingsScreen({
  settings,
}: {
  settings: FamilySettingsView;
}) {
  const [studentName, setStudentName] = useState(settings.studentName);
  const [parentName, setParentName] = useState(settings.parentName);
  const [previewWeekday, setPreviewWeekday] = useState(1);
  const [weekdayStudyStart, setWeekdayStudyStart] = useState("19:00");
  const [weekdayStudyEnd, setWeekdayStudyEnd] = useState("21:30");
  const [weekendStudyStart, setWeekendStudyStart] = useState("10:00");
  const [weekendStudyEnd, setWeekendStudyEnd] = useState("12:00");
  const [unavailableEvents, setUnavailableEvents] = useState<UnavailableDraft[]>([
    {
      endAt: "20:30",
      id: "science-academy",
      repeatType: "weekly",
      startAt: "19:30",
      title: "과학 학원",
      weekdays: [1, 3],
      date: "2026-05-22",
    },
    {
      endAt: "21:00",
      id: "friend-birthday",
      repeatType: "once",
      startAt: "18:30",
      title: "친구 생일",
      weekdays: [5],
      date: "2026-05-22",
    },
  ]);
  const [draftEvent, setDraftEvent] = useState<UnavailableDraft | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [pendingDeleteEvent, setPendingDeleteEvent] =
    useState<UnavailableDraft | null>(null);
  const preview = useMemo(
    () =>
      calculatePreview({
        previewWeekday,
        unavailableEvents,
        weekdayStudyEnd,
        weekdayStudyStart,
        weekendStudyEnd,
        weekendStudyStart,
      }),
    [
      previewWeekday,
      unavailableEvents,
      weekdayStudyEnd,
      weekdayStudyStart,
      weekendStudyEnd,
      weekendStudyStart,
    ],
  );
  const saturdayPreview = calculatePreview({
    previewWeekday: 6,
    unavailableEvents,
    weekdayStudyEnd,
    weekdayStudyStart,
    weekendStudyEnd,
    weekendStudyStart,
  });
  const sundayPreview = calculatePreview({
    previewWeekday: 0,
    unavailableEvents,
    weekdayStudyEnd,
    weekdayStudyStart,
    weekendStudyEnd,
    weekendStudyStart,
  });
  const shortageMinutes = Math.max(0, sampleRoutineMinutes - preview.availableMinutes);
  const weekendBufferMinutes = Math.max(
    0,
    saturdayPreview.availableMinutes + sundayPreview.availableMinutes - 120,
  );
  const draftValidation = draftEvent
    ? validateUnavailableEvent({
        event: draftEvent,
        existingEvents: unavailableEvents,
        ignoreEventId: editingEventId,
        weekdayStudyEnd,
        weekdayStudyStart,
        weekendStudyEnd,
        weekendStudyStart,
      })
    : null;

  function openNewDraftEvent() {
    setEditingEventId(null);
    setDraftEvent({
      endAt: "18:00",
      id: `unavailable-${Date.now()}`,
      repeatType: "weekly",
      startAt: "15:30",
      title: "",
      weekdays: [previewWeekday],
      date: "2026-05-22",
    });
  }

  function registerDraftEvent() {
    if (!draftEvent || !draftValidation?.isValid) {
      return;
    }

    if (editingEventId) {
      setUnavailableEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === editingEventId ? draftEvent : event,
        ),
      );
    } else {
      setUnavailableEvents((currentEvents) => [...currentEvents, draftEvent]);
    }

    setDraftEvent(null);
    setEditingEventId(null);
  }

  function startEditEvent(event: UnavailableDraft) {
    setEditingEventId(event.id);
    setDraftEvent({ ...event });
  }

  function deleteEvent(eventId: string) {
    const targetEvent =
      unavailableEvents.find((event) => event.id === eventId) ?? null;

    if (!targetEvent) {
      return;
    }

    setPendingDeleteEvent(targetEvent);
  }

  function confirmDeleteEvent() {
    if (!pendingDeleteEvent) {
      return;
    }

    setUnavailableEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== pendingDeleteEvent.id),
    );

    if (editingEventId === pendingDeleteEvent.id) {
      setDraftEvent(null);
      setEditingEventId(null);
    }

    setPendingDeleteEvent(null);
  }

  return (
    <main className="min-h-dvh bg-[var(--background)] px-5 py-6">
      <div className="mx-auto flex min-h-[calc(100dvh-48px)] w-full max-w-[430px] flex-col gap-5">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{settings.familyName}</p>
            <h1 className="mt-1 text-3xl font-bold tracking-normal text-foreground">
              가족 설정
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
          <p className="text-sm font-semibold text-accent">생활 리듬</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight tracking-normal text-accent">
            평소 가능한 시간에서 빠지는 일정을 빼요
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            먼저 평일과 주말의 기본 공부 가능 시간을 정하고, 학원이나 약속처럼 빠지는 시간을 더해요.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <MetricCard label="학생" value={studentName} hint="오늘 미션 기준" />
          <MetricCard label="보호자" value={parentName} hint="요약 확인" />
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">기본 정보</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            이름만 가볍게 확인해요
          </h2>
          <div className="mt-4 grid gap-3">
            <TextInput label="학생 이름" onChange={setStudentName} value={studentName} />
            <TextInput label="보호자 이름" onChange={setParentName} value={parentName} />
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">평소 공부 가능 시간</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            보통 공부할 수 있는 구간
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            하교 시간표를 모두 넣기보다, 실제로 공부로 쓸 수 있는 시간을 먼저 잡아요.
          </p>
          <div className="mt-4 grid gap-4">
            <TimeRangeEditor
              endAt={weekdayStudyEnd}
              label="평일"
              onEndAtChange={setWeekdayStudyEnd}
              onStartAtChange={setWeekdayStudyStart}
              startAt={weekdayStudyStart}
            />
            <TimeRangeEditor
              endAt={weekendStudyEnd}
              label="주말"
              onEndAtChange={setWeekendStudyEnd}
              onStartAtChange={setWeekendStudyStart}
              startAt={weekendStudyStart}
            />
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">빠지는 일정</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            공부로 쓰기 어려운 시간을 빼요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            학원, 이동, 병원, 가족 일정, 쉬는 약속처럼 공부가 어려운 시간을 가능 시간에서 제외해요.
          </p>
          <div className="mt-4 space-y-3">
            {unavailableEvents.map((event) => (
              <UnavailableEventSummary
                disabled={editingEventId === event.id}
                event={event}
                key={event.id}
                onDelete={() => deleteEvent(event.id)}
                onEdit={() => startEditEvent(event)}
              />
            ))}
            {draftEvent ? (
              <UnavailableEventEditor
                actionLabel={editingEventId ? "저장" : "등록"}
                event={draftEvent}
                onCancel={() => {
                  setDraftEvent(null);
                  setEditingEventId(null);
                }}
                onChange={(nextEvent) =>
                  setDraftEvent((currentDraft) =>
                    currentDraft ? { ...currentDraft, ...nextEvent } : currentDraft,
                  )
                }
                onRegister={registerDraftEvent}
                validationMessage={draftValidation?.message ?? ""}
                canSubmit={draftValidation?.isValid ?? false}
              />
            ) : (
              <button
                className="flex min-h-14 w-full items-center justify-center rounded-2xl border border-dashed border-[#a8d5b4] bg-[#f8faf7] px-4 text-base font-bold text-accent"
                onClick={openNewDraftEvent}
                type="button"
              >
                빠지는 일정 추가
              </button>
            )}
          </div>
        </section>

        <section className="rounded-[28px] bg-surface-soft p-5 shadow-sm ring-1 ring-[#dce8dd]">
          <p className="text-sm font-semibold text-accent">계산 미리보기</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            {weekdayName(previewWeekday)}요일 실제 가능 시간 {preview.availableMinutes}분
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            기본 가능 시간 {preview.baseMinutes}분에서 빠지는 일정 {preview.blockedMinutes}분을 뺐어요.
          </p>
          <PreviewWeekdayPicker
            onChange={setPreviewWeekday}
            value={previewWeekday}
          />
          <div className="mt-4 space-y-2">
            {preview.blocks.map((block) => (
              <SoftRow
                key={block.id}
                label={`${block.title} · ${block.startAt}-${block.endAt}`}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[28px] bg-surface p-5 shadow-sm ring-1 ring-black/5">
          <p className="text-sm font-semibold text-accent">주말 보정</p>
          <h2 className="mt-3 text-2xl font-bold text-foreground">
            모자라면 주말로 자연스럽게 넘겨요
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">
            루틴 기준 {sampleRoutineMinutes}분으로 봤을 때, 오늘 부족분은 {shortageMinutes}분이에요.
          </p>
          <div className="mt-4 space-y-2">
            <SoftRow
              label={
                shortageMinutes === 0
                  ? "오늘 루틴은 가능 시간 안에 들어와요."
                  : weekendBufferMinutes >= shortageMinutes
                    ? `${shortageMinutes}분은 주말 여유 ${weekendBufferMinutes}분 안에서 보정할 수 있어요.`
                    : "주말 여유도 부족해서 오늘 필수만 남기는 조정이 필요해요."
              }
            />
            <SoftRow
              label={`토요일 ${saturdayPreview.availableMinutes}분 · 일요일 ${sundayPreview.availableMinutes}분 가능`}
            />
          </div>
        </section>

        <Link
          className="mt-auto flex min-h-16 items-center justify-center rounded-[24px] bg-accent-strong px-5 text-xl font-bold text-white shadow-[0_12px_24px_rgba(242,87,69,0.22)]"
          href="/parent/routine?ready=1"
        >
          루틴 만들기로 돌아가기
        </Link>
      </div>
      {pendingDeleteEvent ? (
        <DeleteConfirmModal
          event={pendingDeleteEvent}
          onCancel={() => setPendingDeleteEvent(null)}
          onConfirm={confirmDeleteEvent}
        />
      ) : null}
    </main>
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

function TimeRangeEditor({
  endAt,
  label,
  onEndAtChange,
  onStartAtChange,
  startAt,
}: {
  endAt: string;
  label: string;
  onEndAtChange: (value: string) => void;
  onStartAtChange: (value: string) => void;
  startAt: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f8faf7] p-4">
      <p className="text-base font-bold text-foreground">{label}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <TimeInput label="시작" onChange={onStartAtChange} value={startAt} />
        <TimeInput label="종료" onChange={onEndAtChange} value={endAt} />
      </div>
    </div>
  );
}

function UnavailableEventEditor({
  actionLabel,
  canSubmit,
  event,
  onCancel,
  onChange,
  onRegister,
  validationMessage,
}: {
  actionLabel: string;
  canSubmit: boolean;
  event: UnavailableDraft;
  onCancel: () => void;
  onChange: (event: Partial<UnavailableDraft>) => void;
  onRegister: () => void;
  validationMessage: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f8faf7] p-4">
      <TextInput
        label="일정 이름"
        onChange={(title) => onChange({ title })}
        value={event.title}
      />
      <div className="mt-3">
        <SegmentedControl
          onChange={(repeatType) => onChange({ repeatType })}
          value={event.repeatType}
        />
      </div>
      {event.repeatType === "once" ? (
        <div className="mt-3">
          <DateInput
            label="날짜"
            onChange={(date) =>
              onChange({
                date,
                weekdays: [weekdayFromDate(date)],
              })
            }
            value={event.date}
          />
        </div>
      ) : null}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <TimeInput
          label="시작"
          onChange={(startAt) =>
            onChange({
              endAt: addMinutes(startAt, 60),
              startAt,
            })
          }
          value={event.startAt}
        />
        <TimeInput
          label="종료"
          onChange={(endAt) => onChange({ endAt })}
          value={event.endAt}
        />
      </div>
      <div className="mt-3">
        {event.repeatType === "weekly" ? (
          <WeekdayPicker
            onChange={(weekdays) => onChange({ weekdays })}
            value={event.weekdays}
          />
        ) : (
          <SoftRow label={`${formatShortDate(event.date)} 하루만 빠져요.`} />
        )}
      </div>
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
    </div>
  );
}

function UnavailableEventSummary({
  disabled,
  event,
  onDelete,
  onEdit,
}: {
  disabled: boolean;
  event: UnavailableDraft;
  onDelete: () => void;
  onEdit: () => void;
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
            {event.title}
          </p>
          <p className="mt-0.5 truncate text-sm font-medium text-muted">
            {event.startAt}-{event.endAt} · {eventLabel(event)}
          </p>
        </div>
        <button
          aria-label={`${event.title} 삭제`}
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

function DeleteConfirmModal({
  event,
  onCancel,
  onConfirm,
}: {
  event: UnavailableDraft;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/45 px-6">
      <section className="w-full max-w-[360px] rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
        <p className="text-sm font-semibold text-[#b14a3f]">빠지는 일정 삭제</p>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-foreground">
          이 일정을 삭제할까요?
        </h2>
        <p className="mt-3 text-base leading-7 text-muted">
          {event.title} · {event.startAt}-{event.endAt} ·{" "}
          {weekdayLabel(event.weekdays)}
        </p>
        <p className="mt-3 rounded-2xl bg-[#fff1ef] px-4 py-3 text-sm font-semibold leading-6 text-[#b14a3f]">
          삭제하면 해당 시간은 다시 공부 가능 시간으로 계산돼요.
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

function TextInput({
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

function SegmentedControl({
  onChange,
  value,
}: {
  onChange: (value: "once" | "weekly") => void;
  value: "once" | "weekly";
}) {
  return (
    <div>
      <p className="text-sm font-bold text-muted">반복 방식</p>
      <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#eef7f0] p-1">
        {[
          { label: "반복", value: "weekly" },
          { label: "이번만", value: "once" },
        ].map((item) => (
          <button
            className={
              value === item.value
                ? "min-h-10 rounded-xl bg-accent text-sm font-bold text-white"
                : "min-h-10 rounded-xl text-sm font-bold text-accent"
            }
            key={item.value}
            onClick={() => onChange(item.value as "once" | "weekly")}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimeInput({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="block">
      <span className="text-sm font-bold text-muted">{label}</span>
      <button
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-2xl border border-[#dce8dd] bg-white px-4 text-base font-semibold text-foreground outline-none focus:border-accent"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span>{formatKoreanTime(value)}</span>
        <ClockIcon />
      </button>
      {isOpen ? (
        <TimePickerModal
          onClose={() => setIsOpen(false)}
          onSelect={(nextValue) => {
            onChange(nextValue);
            setIsOpen(false);
          }}
          value={value}
        />
      ) : null}
    </div>
  );
}

function TimePickerModal({
  onClose,
  onSelect,
  value,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  value: string;
}) {
  const [draftValue, setDraftValue] = useState(value);
  const currentMinute = parseClock(draftValue);
  const meridiem = currentMinute < 12 * 60 ? "오전" : "오후";
  const hour12 = toHour12(currentMinute);
  const minute = currentMinute % 60;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-slate-950/35 px-4 pb-4 sm:items-center sm:pb-0">
      <section className="w-full max-w-[360px] rounded-[28px] bg-white p-5 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-accent">시간 선택</p>
            <h2 className="mt-1 text-3xl font-bold text-foreground">
              {formatKoreanTime(draftValue)}
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
          <TimeAdjustButton
            label="-1시간"
            onClick={() => setDraftValue(addMinutes(draftValue, -60))}
          />
          <TimeAdjustButton
            label="+1시간"
            onClick={() => setDraftValue(addMinutes(draftValue, 60))}
          />
          <TimeAdjustButton
            label="-10분"
            onClick={() => setDraftValue(addMinutes(draftValue, -10))}
          />
          <TimeAdjustButton
            label="+10분"
            onClick={() => setDraftValue(addMinutes(draftValue, 10))}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {(["오전", "오후"] as const).map((item) => (
            <button
              className={
                meridiem === item
                  ? "min-h-11 rounded-2xl bg-accent px-4 text-base font-bold text-white"
                  : "min-h-11 rounded-2xl bg-[#f8faf7] px-4 text-base font-bold text-accent"
              }
              key={item}
              onClick={() => setDraftValue(setMeridiem(draftValue, item))}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-muted">시간</p>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
              <button
                className={
                  hour12 === hour
                    ? "min-h-10 rounded-xl bg-accent text-sm font-bold text-white"
                    : "min-h-10 rounded-xl bg-[#f8faf7] text-sm font-bold text-accent"
                }
                key={hour}
                onClick={() => setDraftValue(setHour12(draftValue, hour))}
                type="button"
              >
                {hour}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-muted">분</p>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {[0, 10, 20, 30, 40, 50].map((item) => (
              <button
                className={
                  minute === item
                    ? "min-h-10 rounded-xl bg-accent text-sm font-bold text-white"
                    : "min-h-10 rounded-xl bg-[#f8faf7] text-sm font-bold text-accent"
                }
                key={item}
                onClick={() => setDraftValue(setMinute(draftValue, item))}
                type="button"
              >
                {String(item).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>

        <button
          className="mt-5 min-h-14 w-full rounded-2xl bg-accent-strong px-4 text-lg font-bold text-white"
          onClick={() => onSelect(draftValue)}
          type="button"
        >
          이 시간으로 선택
        </button>
      </section>
    </div>
  );
}

function TimeAdjustButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="min-h-11 rounded-2xl bg-[#f8faf7] px-4 text-base font-bold text-accent ring-1 ring-[#dce8dd]"
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ClockIcon() {
  return (
    <span
      aria-hidden
      className="relative h-6 w-6 rounded-full bg-[#eef7f0] ring-1 ring-[#c9e2cf] before:absolute before:left-[11px] before:top-[5px] before:h-[7px] before:w-[2px] before:rounded-full before:bg-accent after:absolute after:left-[11px] after:top-[11px] after:h-[2px] after:w-[6px] after:rounded-full after:bg-accent"
    />
  );
}

function WeekdayPicker({
  onChange,
  value,
}: {
  onChange: (value: number[]) => void;
  value: number[];
}) {
  return (
    <div>
      <p className="text-sm font-bold text-muted">요일</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {weekdayLabels.map((label, weekday) => (
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

function PreviewWeekdayPicker({
  onChange,
  value,
}: {
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div>
      <p className="text-sm font-bold text-muted">요일</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {weekdayLabels.map((label, weekday) => (
          <button
            className={
              value === weekday
                ? "rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
                : "rounded-full bg-white px-4 py-2 text-sm font-bold text-accent ring-1 ring-[#c9e2cf]"
            }
            key={label}
            onClick={() => onChange(weekday)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
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

function calculatePreview({
  previewWeekday,
  unavailableEvents,
  weekdayStudyEnd,
  weekdayStudyStart,
  weekendStudyEnd,
  weekendStudyStart,
}: {
  previewWeekday: number;
  unavailableEvents: UnavailableDraft[];
  weekdayStudyEnd: string;
  weekdayStudyStart: string;
  weekendStudyEnd: string;
  weekendStudyStart: string;
}): {
  availableMinutes: number;
  baseMinutes: number;
  blockedMinutes: number;
  blocks: PreviewBlock[];
} {
  const isWeekend = previewWeekday === 0 || previewWeekday === 6;
  const baseStart = isWeekend ? weekendStudyStart : weekdayStudyStart;
  const baseEnd = isWeekend ? weekendStudyEnd : weekdayStudyEnd;
  const baseWindow = {
    end: parseClock(baseEnd),
    start: parseClock(baseStart),
  };
  const baseMinutes = Math.max(0, baseWindow.end - baseWindow.start);
  const blocks: PreviewBlock[] = [
    {
      endAt: baseEnd,
      id: "base-study-window",
      startAt: baseStart,
      title: "기본 공부 가능 시간",
    },
  ];
  const blockedMinutes = unavailableEvents
    .filter((event) => event.weekdays.includes(previewWeekday))
    .reduce((sum, event) => {
      const overlap = overlapMinutes(baseWindow, {
        end: parseClock(event.endAt),
        start: parseClock(event.startAt),
      });

      if (overlap > 0) {
        blocks.push({
          endAt: event.endAt,
          id: event.id,
          startAt: event.startAt,
          title: `${event.title}로 빠지는 시간`,
        });
      }

      return sum + overlap;
    }, 0);

  return {
    availableMinutes: Math.max(0, baseMinutes - blockedMinutes),
    baseMinutes,
    blockedMinutes,
    blocks,
  };
}

function validateUnavailableEvent({
  event,
  existingEvents,
  ignoreEventId,
  weekdayStudyEnd,
  weekdayStudyStart,
  weekendStudyEnd,
  weekendStudyStart,
}: {
  event: UnavailableDraft;
  existingEvents: UnavailableDraft[];
  ignoreEventId: string | null;
  weekdayStudyEnd: string;
  weekdayStudyStart: string;
  weekendStudyEnd: string;
  weekendStudyStart: string;
}): {
  isValid: boolean;
  message: string;
} {
  if (event.title.trim().length < 2) {
    return {
      isValid: false,
      message: "일정 이름을 두 글자 이상 입력해 주세요.",
    };
  }

  if (event.weekdays.length === 0) {
    return {
      isValid: false,
      message: "이 일정이 빠지는 요일을 하나 이상 골라 주세요.",
    };
  }

  if (event.repeatType === "once" && !event.date) {
    return {
      isValid: false,
      message: "이번만 일정은 날짜를 골라 주세요.",
    };
  }

  const eventWindow = {
    end: parseClock(event.endAt),
    start: parseClock(event.startAt),
  };

  if (eventWindow.end <= eventWindow.start) {
    return {
      isValid: false,
      message: "종료 시간은 시작 시간보다 늦어야 해요.",
    };
  }

  const outOfStudyWindowDay = event.weekdays.find((weekday) => {
    const studyWindow = studyWindowForWeekday({
      weekday,
      weekdayStudyEnd,
      weekdayStudyStart,
      weekendStudyEnd,
      weekendStudyStart,
    });

    return overlapMinutes(studyWindow, eventWindow) === 0;
  });

  if (outOfStudyWindowDay !== undefined) {
    return {
      isValid: false,
      message: `${weekdayName(outOfStudyWindowDay)}요일 공부 가능 시간과 겹치지 않아요.`,
    };
  }

  const overlappedEvent = existingEvents
    .filter((existingEvent) => existingEvent.id !== ignoreEventId)
    .find((existingEvent) =>
      existingEvent.weekdays.some(
        (weekday) =>
          event.weekdays.includes(weekday) &&
          overlapMinutes(eventWindow, {
            end: parseClock(existingEvent.endAt),
            start: parseClock(existingEvent.startAt),
          }) > 0,
      ),
    );

  if (overlappedEvent) {
    return {
      isValid: false,
      message: `${overlappedEvent.title} 일정과 시간이 겹쳐요.`,
    };
  }

  return {
    isValid: true,
    message: "등록할 수 있는 시간이에요.",
  };
}

function studyWindowForWeekday({
  weekday,
  weekdayStudyEnd,
  weekdayStudyStart,
  weekendStudyEnd,
  weekendStudyStart,
}: {
  weekday: number;
  weekdayStudyEnd: string;
  weekdayStudyStart: string;
  weekendStudyEnd: string;
  weekendStudyStart: string;
}): {
  end: number;
  start: number;
} {
  const isWeekend = weekday === 0 || weekday === 6;

  return {
    end: parseClock(isWeekend ? weekendStudyEnd : weekdayStudyEnd),
    start: parseClock(isWeekend ? weekendStudyStart : weekdayStudyStart),
  };
}

function overlapMinutes(
  a: {
    end: number;
    start: number;
  },
  b: {
    end: number;
    start: number;
  },
): number {
  return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
}

function toggleWeekday(weekdays: number[], weekday: number): number[] {
  if (weekdays.includes(weekday)) {
    return weekdays.filter((item) => item !== weekday);
  }

  return [...weekdays, weekday].sort((a, b) => a - b);
}

function parseClock(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);

  return hours * 60 + minutes;
}

function formatClock(totalMinutes: number): string {
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function addMinutes(clock: string, minutes: number): string {
  return formatClock(parseClock(clock) + minutes);
}

function formatKoreanTime(clock: string): string {
  const totalMinutes = parseClock(clock);
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const meridiem = hour < 12 ? "오전" : "오후";
  const hour12 = toHour12(totalMinutes);

  return `${meridiem} ${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function toHour12(totalMinutes: number): number {
  const hour = Math.floor(totalMinutes / 60) % 24;
  const hour12 = hour % 12;

  return hour12 === 0 ? 12 : hour12;
}

function setMeridiem(clock: string, meridiem: "오전" | "오후"): string {
  const totalMinutes = parseClock(clock);
  const currentHour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const hour12 = currentHour % 12;
  const nextHour =
    meridiem === "오전" ? hour12 : hour12 + 12;

  return formatClock(nextHour * 60 + minute);
}

function setHour12(clock: string, hour12: number): string {
  const totalMinutes = parseClock(clock);
  const currentHour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const isPm = currentHour >= 12;
  const normalizedHour = hour12 === 12 ? 0 : hour12;
  const nextHour = isPm ? normalizedHour + 12 : normalizedHour;

  return formatClock(nextHour * 60 + minute);
}

function setMinute(clock: string, minute: number): string {
  const totalMinutes = parseClock(clock);
  const hour = Math.floor(totalMinutes / 60);

  return formatClock(hour * 60 + minute);
}

function weekdayName(weekday: number): string {
  return weekdayLabels[weekday] ?? "월";
}

function weekdayLabel(weekdays: number[]): string {
  if (weekdays.length === 7) {
    return "매일";
  }

  return `${weekdays.map((weekday) => weekdayLabels[weekday]).join(" · ")} 반복`;
}

function eventLabel(event: UnavailableDraft): string {
  if (event.repeatType === "once") {
    return `${formatShortDate(event.date)} 이번만`;
  }

  return weekdayLabel(event.weekdays);
}

function formatShortDate(date: string): string {
  const [, month, day] = date.split("-");

  return `${Number(month)}월 ${Number(day)}일`;
}

function weekdayFromDate(date: string): number {
  const [year, month, day] = date.split("-").map(Number);

  if (!year || !month || !day) {
    return 1;
  }

  return new Date(year, month - 1, day).getDay();
}
