-- Haruny Supabase test DB MVP write grants
-- 서버 action에서 publishable key로 테스트 저장까지 검증할 때만 실행한다.
-- 운영 DB에는 사용하지 않는다. 운영에서는 service role key를 서버에서만 사용하고 RLS를 가족 단위로 좁힌다.

grant usage on schema public to anon, authenticated;

grant insert, update on
  long_term_study_plans,
  exam_schedules,
  exam_subjects,
  routine_rules,
  day_plans,
  study_tasks,
  time_blocks,
  coach_states
to anon, authenticated;
