-- Haruny Supabase test DB MVP schema
-- 직접 DB에 실행하기 전 검토용 SQL이다.
-- 이 스키마는 테스트 프로젝트와 데모 데이터 전용이며 실제 학생/가족 개인정보를 넣지 않는다.

create table if not exists families (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists app_users (
  id text primary key,
  family_id text not null references families(id) on delete cascade,
  role text not null check (role in ('student', 'parent')),
  name text not null,
  timezone text not null default 'Asia/Seoul',
  created_at timestamptz not null default now()
);

create table if not exists student_profiles (
  id text primary key,
  user_id text not null references app_users(id) on delete cascade,
  default_wake_time time not null,
  default_sleep_time time not null,
  school_start_time time not null,
  school_end_time time not null,
  created_at timestamptz not null default now()
);

create table if not exists family_rhythm_blocks (
  id text primary key,
  family_id text not null references families(id) on delete cascade,
  type text not null check (type in ('academy', 'meal')),
  title text not null,
  start_at time not null,
  end_at time not null,
  weekdays smallint[] not null,
  created_at timestamptz not null default now()
);

create table if not exists long_term_study_plans (
  id text primary key,
  student_id text not null references app_users(id) on delete cascade,
  title text not null,
  type text not null check (type in ('exam', 'assignment', 'routine')),
  start_date date not null,
  end_date date not null,
  status text not null check (status in ('draft', 'active', 'paused', 'closed')),
  created_by text references app_users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists exam_schedules (
  id text primary key,
  long_term_plan_id text not null references long_term_study_plans(id) on delete cascade,
  exam_name text not null,
  prep_start_date date not null,
  exam_start_date date not null,
  exam_end_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists exam_subjects (
  id text primary key,
  exam_schedule_id text not null references exam_schedules(id) on delete cascade,
  exam_date date not null,
  exam_day_index integer not null,
  subject text not null,
  importance text not null check (importance in ('high', 'medium', 'low')),
  target_minutes integer not null check (target_minutes >= 0),
  scope_note text,
  created_at timestamptz not null default now()
);

create table if not exists routine_rules (
  id text primary key,
  long_term_plan_id text references long_term_study_plans(id) on delete cascade,
  family_id text not null references families(id) on delete cascade,
  student_id text not null references app_users(id) on delete cascade,
  title text not null,
  subject text not null,
  weekdays smallint[] not null default '{}',
  estimated_minutes integer not null check (estimated_minutes > 0),
  repeat_type text not null check (repeat_type in ('weekly', 'daily')),
  start_date date not null,
  end_date date not null,
  priority integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists day_plans (
  id text primary key,
  student_id text not null references app_users(id) on delete cascade,
  plan_date date not null,
  status text not null check (status in ('planned', 'active', 'closed')),
  created_by text references app_users(id) on delete set null,
  source_type text not null check (source_type in ('manual', 'routine', 'exam_plan')),
  source_id text,
  created_at timestamptz not null default now(),
  unique (student_id, plan_date)
);

create table if not exists study_tasks (
  id text primary key,
  day_plan_id text not null references day_plans(id) on delete cascade,
  title text not null,
  subject text not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  priority integer not null default 0,
  mission_level text not null check (mission_level in ('required', 'extra', 'optional')),
  study_mode text not null check (
    study_mode in ('concept', 'problem_solving', 'review', 'memorization', 'wrong_answer', 'mock')
  ),
  source_type text not null check (source_type in ('manual', 'routine', 'exam_plan')),
  source_id text,
  status text not null check (status in ('pending', 'in_progress', 'done', 'moved')),
  moved_to_date date,
  created_at timestamptz not null default now()
);

create table if not exists time_blocks (
  id text primary key,
  day_plan_id text not null references day_plans(id) on delete cascade,
  type text not null check (type in ('school', 'academy', 'meal', 'play', 'rest', 'sleep', 'free')),
  title text not null,
  start_at time not null,
  end_at time not null,
  is_study_available boolean not null default false,
  source text not null check (source in ('parent', 'student', 'system')),
  created_at timestamptz not null default now()
);

create table if not exists study_sessions (
  id text primary key,
  study_task_id text not null references study_tasks(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_minutes integer check (duration_minutes is null or duration_minutes >= 0),
  status text not null check (status in ('active', 'completed', 'stopped')),
  created_at timestamptz not null default now()
);

create table if not exists coach_states (
  id text primary key,
  day_plan_id text not null unique references day_plans(id) on delete cascade,
  current_status text not null check (
    current_status in ('on_track', 'start_needed', 'delayed', 'recovery_needed', 'impossible')
  ),
  next_task_id text references study_tasks(id) on delete set null,
  latest_start_at time,
  remaining_study_minutes integer not null default 0,
  remaining_available_minutes integer not null default 0,
  message text not null,
  recovery_message text not null,
  updated_at timestamptz not null default now()
);

create table if not exists notification_rules (
  id text primary key,
  family_id text not null references families(id) on delete cascade,
  student_id text not null references app_users(id) on delete cascade,
  type text not null check (type in ('play_ending', 'study_start_needed', 'recovery_needed', 'parent_summary')),
  channel text not null check (channel in ('web_push', 'mobile_push')),
  enabled boolean not null default true,
  message_template text not null,
  cooldown_minutes integer not null default 60,
  max_per_day integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists notification_events (
  id text primary key,
  day_plan_id text not null references day_plans(id) on delete cascade,
  target_user_id text not null references app_users(id) on delete cascade,
  type text not null check (type in ('play_ending', 'start_needed', 'delayed', 'recovery_needed', 'parent_summary')),
  message text not null,
  reason text not null,
  status text not null check (status in ('pending', 'sent', 'skipped')),
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create table if not exists plan_adjustment_requests (
  id text primary key,
  day_plan_id text not null references day_plans(id) on delete cascade,
  requested_by text not null references app_users(id) on delete cascade,
  reason text not null,
  proposed_change text not null,
  status text not null check (status in ('pending', 'approved', 'rejected')),
  reviewed_by text references app_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists app_users_family_id_idx on app_users(family_id);
create index if not exists day_plans_student_date_idx on day_plans(student_id, plan_date);
create index if not exists study_tasks_day_plan_status_idx on study_tasks(day_plan_id, status);
create index if not exists time_blocks_day_plan_idx on time_blocks(day_plan_id);
create index if not exists routine_rules_student_idx on routine_rules(student_id);
create index if not exists exam_subjects_schedule_idx on exam_subjects(exam_schedule_id);

alter table families enable row level security;
alter table app_users enable row level security;
alter table student_profiles enable row level security;
alter table family_rhythm_blocks enable row level security;
alter table long_term_study_plans enable row level security;
alter table exam_schedules enable row level security;
alter table exam_subjects enable row level security;
alter table routine_rules enable row level security;
alter table day_plans enable row level security;
alter table study_tasks enable row level security;
alter table time_blocks enable row level security;
alter table study_sessions enable row level security;
alter table coach_states enable row level security;
alter table notification_rules enable row level security;
alter table notification_events enable row level security;
alter table plan_adjustment_requests enable row level security;

-- Data API를 쓰려면 RLS 정책과 별개로 Postgres role 권한도 필요하다.
-- 테스트 read path 검증용으로 anon/authenticated role에 SELECT만 부여한다.
grant usage on schema public to anon, authenticated;
grant select on
  families,
  app_users,
  student_profiles,
  family_rhythm_blocks,
  long_term_study_plans,
  exam_schedules,
  exam_subjects,
  routine_rules,
  day_plans,
  study_tasks,
  time_blocks,
  study_sessions,
  coach_states,
  notification_rules,
  notification_events,
  plan_adjustment_requests
to anon, authenticated;

-- 테스트 프로젝트 전용 임시 정책이다.
-- 운영 전에는 가족 초대/인증 기준으로 family_id 접근 정책을 다시 작성한다.
create policy "demo read families" on families for select using (true);
create policy "demo write families" on families for all using (true) with check (true);
create policy "demo read app_users" on app_users for select using (true);
create policy "demo write app_users" on app_users for all using (true) with check (true);
create policy "demo read student_profiles" on student_profiles for select using (true);
create policy "demo write student_profiles" on student_profiles for all using (true) with check (true);
create policy "demo read family_rhythm_blocks" on family_rhythm_blocks for select using (true);
create policy "demo write family_rhythm_blocks" on family_rhythm_blocks for all using (true) with check (true);
create policy "demo read long_term_study_plans" on long_term_study_plans for select using (true);
create policy "demo write long_term_study_plans" on long_term_study_plans for all using (true) with check (true);
create policy "demo read exam_schedules" on exam_schedules for select using (true);
create policy "demo write exam_schedules" on exam_schedules for all using (true) with check (true);
create policy "demo read exam_subjects" on exam_subjects for select using (true);
create policy "demo write exam_subjects" on exam_subjects for all using (true) with check (true);
create policy "demo read routine_rules" on routine_rules for select using (true);
create policy "demo write routine_rules" on routine_rules for all using (true) with check (true);
create policy "demo read day_plans" on day_plans for select using (true);
create policy "demo write day_plans" on day_plans for all using (true) with check (true);
create policy "demo read study_tasks" on study_tasks for select using (true);
create policy "demo write study_tasks" on study_tasks for all using (true) with check (true);
create policy "demo read time_blocks" on time_blocks for select using (true);
create policy "demo write time_blocks" on time_blocks for all using (true) with check (true);
create policy "demo read study_sessions" on study_sessions for select using (true);
create policy "demo write study_sessions" on study_sessions for all using (true) with check (true);
create policy "demo read coach_states" on coach_states for select using (true);
create policy "demo write coach_states" on coach_states for all using (true) with check (true);
create policy "demo read notification_rules" on notification_rules for select using (true);
create policy "demo write notification_rules" on notification_rules for all using (true) with check (true);
create policy "demo read notification_events" on notification_events for select using (true);
create policy "demo write notification_events" on notification_events for all using (true) with check (true);
create policy "demo read plan_adjustment_requests" on plan_adjustment_requests for select using (true);
create policy "demo write plan_adjustment_requests" on plan_adjustment_requests for all using (true) with check (true);

insert into families (id, name)
values ('family-minjun', '민준이네')
on conflict (id) do nothing;

insert into app_users (id, family_id, role, name, timezone)
values
  ('user-student-minjun', 'family-minjun', 'student', '민준', 'Asia/Seoul'),
  ('user-parent', 'family-minjun', 'parent', '보호자', 'Asia/Seoul')
on conflict (id) do nothing;

insert into student_profiles (
  id,
  user_id,
  default_wake_time,
  default_sleep_time,
  school_start_time,
  school_end_time
)
values ('profile-minjun', 'user-student-minjun', '07:00', '22:30', '08:30', '15:30')
on conflict (id) do nothing;

insert into family_rhythm_blocks (id, family_id, type, title, start_at, end_at, weekdays)
values
  ('family-academy-english', 'family-minjun', 'academy', '영어 단어 복습', '19:30', '20:00', array[1,3,5]),
  ('family-dinner', 'family-minjun', 'meal', '저녁 식사', '18:00', '18:30', array[0,1,2,3,4,5,6])
on conflict (id) do nothing;

insert into long_term_study_plans (
  id,
  student_id,
  title,
  type,
  start_date,
  end_date,
  status,
  created_by
)
values
  ('plan-exam-august-final', 'user-student-minjun', '8월 기말고사 준비', 'exam', '2026-07-21', '2026-08-22', 'active', 'user-parent'),
  ('plan-routine-normal', 'user-student-minjun', '평시 루틴', 'routine', '2026-05-18', '2026-07-20', 'active', 'user-parent')
on conflict (id) do nothing;

insert into exam_schedules (
  id,
  long_term_plan_id,
  exam_name,
  prep_start_date,
  exam_start_date,
  exam_end_date
)
values (
  'exam-august-final',
  'plan-exam-august-final',
  '8월 기말고사',
  '2026-07-21',
  '2026-08-20',
  '2026-08-22'
)
on conflict (id) do nothing;

insert into exam_subjects (
  id,
  exam_schedule_id,
  exam_date,
  exam_day_index,
  subject,
  importance,
  target_minutes
)
values
  ('exam-subject-korean', 'exam-august-final', '2026-08-20', 1, '국어', 'medium', 70),
  ('exam-subject-social', 'exam-august-final', '2026-08-20', 1, '사회', 'medium', 60),
  ('exam-subject-ethics', 'exam-august-final', '2026-08-20', 1, '도덕', 'medium', 45),
  ('exam-subject-math', 'exam-august-final', '2026-08-21', 2, '수학', 'high', 160),
  ('exam-subject-science', 'exam-august-final', '2026-08-21', 2, '과학', 'medium', 120),
  ('exam-subject-history', 'exam-august-final', '2026-08-21', 2, '역사', 'medium', 90),
  ('exam-subject-english', 'exam-august-final', '2026-08-22', 3, '영어', 'high', 140),
  ('exam-subject-tech', 'exam-august-final', '2026-08-22', 3, '기술가정', 'medium', 45)
on conflict (id) do nothing;

insert into routine_rules (
  id,
  long_term_plan_id,
  family_id,
  student_id,
  title,
  subject,
  weekdays,
  estimated_minutes,
  repeat_type,
  start_date,
  end_date,
  priority
)
values
  ('routine-math-mon-wed', 'plan-routine-normal', 'family-minjun', 'user-student-minjun', '수학 기본 문제 25분', '수학', array[1,3], 25, 'weekly', '2026-05-18', '2026-07-20', 1),
  ('routine-korean-tue-thu', 'plan-routine-normal', 'family-minjun', 'user-student-minjun', '국어 독해 2지문', '국어', array[2,4], 20, 'weekly', '2026-05-18', '2026-07-20', 2),
  ('routine-english-words', 'plan-routine-normal', 'family-minjun', 'user-student-minjun', '영어 단어 15분', '영어', array[]::smallint[], 15, 'daily', '2026-05-18', '2026-07-20', 0)
on conflict (id) do nothing;

insert into day_plans (
  id,
  student_id,
  plan_date,
  status,
  created_by,
  source_type,
  source_id
)
values (
  'day-plan-minjun-2026-07-23',
  'user-student-minjun',
  '2026-07-23',
  'active',
  'user-parent',
  'exam_plan',
  'plan-exam-august-final'
)
on conflict (id) do nothing;

insert into study_tasks (
  id,
  day_plan_id,
  title,
  subject,
  estimated_minutes,
  priority,
  mission_level,
  study_mode,
  source_type,
  source_id,
  status
)
values
  ('task-math-wrong-answer', 'day-plan-minjun-2026-07-23', '수학 오답 20개', '수학', 25, 1, 'required', 'wrong_answer', 'exam_plan', 'plan-exam-august-final', 'pending'),
  ('task-english-words', 'day-plan-minjun-2026-07-23', '영어 단어 40개', '영어', 15, 2, 'required', 'memorization', 'routine', 'routine-english-words', 'pending'),
  ('task-science-concept', 'day-plan-minjun-2026-07-23', '과학 개념 3페이지', '과학', 30, 3, 'required', 'concept', 'exam_plan', 'plan-exam-august-final', 'pending'),
  ('task-korean-reading', 'day-plan-minjun-2026-07-23', '국어 독해 2지문', '국어', 20, 4, 'extra', 'problem_solving', 'routine', 'routine-korean-tue-thu', 'pending'),
  ('task-social-memory', 'day-plan-minjun-2026-07-23', '사회 암기', '사회', 15, 5, 'optional', 'memorization', 'exam_plan', 'plan-exam-august-final', 'pending')
on conflict (id) do nothing;

insert into time_blocks (
  id,
  day_plan_id,
  type,
  title,
  start_at,
  end_at,
  is_study_available,
  source
)
values
  ('block-school-2026-07-23', 'day-plan-minjun-2026-07-23', 'school', '학교', '08:30', '15:30', false, 'system'),
  ('block-dinner-2026-07-23', 'day-plan-minjun-2026-07-23', 'meal', '저녁 식사', '18:00', '18:30', false, 'parent'),
  ('block-academy-2026-07-23', 'day-plan-minjun-2026-07-23', 'academy', '영어 단어 복습', '19:30', '20:00', false, 'parent'),
  ('block-sleep-2026-07-23', 'day-plan-minjun-2026-07-23', 'sleep', '취침 준비', '22:30', '07:00', false, 'system')
on conflict (id) do nothing;

insert into coach_states (
  id,
  day_plan_id,
  current_status,
  next_task_id,
  latest_start_at,
  remaining_study_minutes,
  remaining_available_minutes,
  message,
  recovery_message
)
values (
  'coach-minjun-2026-07-23',
  'day-plan-minjun-2026-07-23',
  'on_track',
  'task-math-wrong-answer',
  '18:10',
  105,
  150,
  '아직 괜찮아요. 지금 시작하면 오늘 계획을 무리 없이 끝낼 수 있어요.',
  '회복 가능해요. 수학 25분만 먼저 잡으면 흐름이 가벼워져요.'
)
on conflict (id) do nothing;

insert into notification_rules (
  id,
  family_id,
  student_id,
  type,
  channel,
  enabled,
  message_template,
  cooldown_minutes,
  max_per_day
)
values
  ('notice-play-ending', 'family-minjun', 'user-student-minjun', 'play_ending', 'web_push', true, '놀이가 곧 끝나요. 다음 미션으로 천천히 넘어가요.', 60, 2),
  ('notice-study-start', 'family-minjun', 'user-student-minjun', 'study_start_needed', 'web_push', true, '지금 시작하면 오늘 계획을 지킬 수 있어요.', 90, 1),
  ('notice-recovery', 'family-minjun', 'user-student-minjun', 'recovery_needed', 'web_push', true, '오늘은 필수만 남기면 회복할 수 있어요.', 120, 1),
  ('notice-parent-summary', 'family-minjun', 'user-student-minjun', 'parent_summary', 'web_push', true, '오늘 공부 흐름을 짧게 정리했어요.', 720, 1)
on conflict (id) do nothing;
