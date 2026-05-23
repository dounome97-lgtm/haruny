-- Haruny Supabase test DB MVP read grants
-- 2026-05-22 스키마를 이미 실행한 테스트 프로젝트에 추가로 실행한다.
-- "Automatically expose new tables"를 끈 상태에서 Data API read path를 검증하기 위한 최소 권한이다.

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
