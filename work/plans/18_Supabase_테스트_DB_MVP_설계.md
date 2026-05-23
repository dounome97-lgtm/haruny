# Supabase 테스트 DB 기반 MVP 설계

## 목적

mock 데이터만 보던 MVP를 테스트 Supabase 프로젝트의 데모 데이터로 조회/저장해 본다.
이 단계는 운영 DB 확정이 아니라 저장/조회 흐름 검증이다.
실제 학생/가족 개인정보는 넣지 않는다.

## 현재 기준

- 배포 URL: `https://haruny.vercel.app`
- 기준 커밋: `8f35dc49e6b55e382e60280c1141b5f958a39098`
- 스키마 SQL 초안: `work/db/2026-05-22_supabase_mvp_schema.sql`
- 이미 스키마를 실행한 뒤 Data API SELECT 권한만 추가할 때: `work/db/2026-05-23_supabase_mvp_read_grants.sql`
- publishable key로 테스트 저장까지 검증할 때: `work/db/2026-05-24_supabase_mvp_write_grants.sql`
- 화면 응답 타입: `src/types/study.ts`
- 현재 mock 데이터: `src/data/mock.ts`
- 현재 화면 서비스:
  - `src/services/studentToday.ts`
  - `src/services/parentPlan.ts`

## 환경변수

로컬 `.env.local`에 둔다. `.env*`는 gitignore 대상이므로 커밋하지 않는다.

```text
HARUNY_DATA_SOURCE=mock
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

서버 전용 write path를 만들 때만 아래 값을 추가한다.
클라이언트 번들에 노출하면 안 된다.

```text
SUPABASE_SERVICE_ROLE_KEY=
```

현재 테스트 저장 서비스는 서버 action에서 실행되며, `SUPABASE_SERVICE_ROLE_KEY`가 있으면 그 키를 우선 사용한다.
키가 없으면 publishable key를 사용하므로, 이 경우 테스트 프로젝트에만 `work/db/2026-05-24_supabase_mvp_write_grants.sql`을 추가 실행해야 한다.

Vercel에는 preview 환경부터 같은 이름으로 등록한다.
초기값은 `HARUNY_DATA_SOURCE=mock`으로 두고, Supabase 조회 코드가 붙은 뒤 preview에서만 `supabase`로 바꾼다.

## 최소 테이블 범위

1차 연결에 필요한 범위만 먼저 사용한다.

- `families`
- `app_users`
- `student_profiles`
- `family_rhythm_blocks`
- `long_term_study_plans`
- `exam_schedules`
- `exam_subjects`
- `routine_rules`
- `day_plans`
- `study_tasks`
- `time_blocks`
- `study_sessions`
- `coach_states`
- `notification_rules`

나중에 필요할 때 붙일 범위:

- `notification_events`
- `plan_adjustment_requests`

## 첫 연결 순서

1. Supabase 테스트 프로젝트를 만든다.
2. SQL Editor에서 `work/db/2026-05-22_supabase_mvp_schema.sql`을 검토 후 실행한다.
3. `Automatically expose new tables`를 꺼둔 프로젝트라면 SQL Editor에서 `work/db/2026-05-23_supabase_mvp_read_grants.sql`을 추가 실행한다.
4. 로컬 `.env.local`에 Supabase URL과 publishable key 또는 legacy anon key를 넣는다.
5. `HARUNY_DATA_SOURCE=mock` 상태에서 기존 화면이 그대로 뜨는지 확인한다.
6. Supabase read repository를 추가한다.
7. 학생 `오늘` 화면 조회를 Supabase로 전환한다.
8. 부모 `안심` 화면 조회를 Supabase로 전환한다.
9. 시험 준비 생성 저장은 서버 action으로 붙인다.
10. publishable key로 저장 검증을 할 경우 `work/db/2026-05-24_supabase_mvp_write_grants.sql`을 테스트 프로젝트에만 실행한다.
11. 평시 루틴 생성은 서버 action 또는 route handler로 저장 경계를 만든 뒤 붙인다.

## 서비스 전환 원칙

화면 컴포넌트는 지금처럼 `StudentTodayView`, `ParentReassuranceView` 같은 view model만 받는다.
Supabase row shape는 컴포넌트로 넘기지 않는다.

권장 구조:

```text
src/services/
  studentToday.ts        현재 화면용 view service
  parentPlan.ts          현재 화면용 view service
  dataSource.ts          mock/supabase 선택
  mockRepository.ts      기존 mock 데이터 adapter
  supabaseRepository.ts  Supabase row 조회 adapter
  mappers.ts             snake_case row -> camelCase view/domain type
```

초기에는 read path만 붙인다.
write path는 `공부 시작/완료`, `시험 준비 생성`, `평시 루틴 생성` 순서로 붙인다.

## 조회 설계

학생 `오늘` 화면:

- `app_users`에서 학생 조회
- `student_profiles` 조회
- 해당 날짜의 `day_plans` 조회
- 연결된 `study_tasks` 조회
- 연결된 `time_blocks` 조회
- 저장된 `coach_states`가 있으면 사용
- 없거나 오래되었으면 도메인 함수 `calculateDayCoach`로 재계산

부모 `안심` 화면:

- 학생의 오늘 `day_plans` 조회
- `study_tasks`의 완료/남은 시간 집계
- `coach_states` 조회 또는 재계산
- 부모 화면은 상세 로그 대신 한 문장 요약과 개입 필요 여부만 만든다.

시험 준비 화면:

- 초안 저장 전까지는 현재 reference 화면 유지 가능
- 실제 입력을 붙일 때 `long_term_study_plans`, `exam_schedules`, `exam_subjects`에 저장한다.
- 저장 후 장기 계획 엔진으로 `day_plans`, `study_tasks`를 생성한다.

평시 루틴 화면:

- `routine_rules`에 저장한다.
- 적용 기간과 현재 날짜 기준으로 `day_plans`, `study_tasks`를 생성한다.

## RLS 초안

SQL 파일에는 테스트 프로젝트 전용 임시 permissive 정책을 넣었다.
이 정책은 데모 데이터 검증용이며 운영에 쓰면 안 된다.

운영 전 보강 방향:

- Supabase Auth user id와 `app_users.auth_user_id` 연결
- 부모/학생 모두 자기 `family_id` 안의 데이터만 조회
- 학생은 자기 `day_plans`, `study_tasks`, `study_sessions` 중심으로 제한
- 부모는 같은 가족의 계획/요약/설정만 조회
- service role은 route handler나 server action에서만 사용

## 체크리스트 반영 기준

- `Supabase 테스트 프로젝트 생성`: 사용자가 프로젝트를 만든 뒤 체크
- `Supabase 환경변수 정리`: 이 문서 작성으로 체크 가능
- `Vercel 환경변수 등록 항목 정리`: 이 문서 작성으로 체크 가능
- `기존 mock 데이터 구조 분석`: `src/data/mock.ts`, `src/types/study.ts`, `src/services/*` 확인으로 체크 가능
- `최소 DB 스키마 초안 작성`: SQL 파일 작성으로 체크 가능
- 각 테이블 설계 항목: SQL 파일에 반영되면 체크 가능
- `학생 오늘 화면을 Supabase 데이터로 조회`: 실제 코드 전환 후 체크
- 2026-05-24 기준 `HARUNY_DATA_SOURCE=supabase`로 홈 화면 빌드가 통과했고, Supabase Data API에서 학생/오늘 계획/미션/코치 상태를 읽는 경로가 확인됐다.
- `부모 안심 화면을 Supabase 데이터로 조회`: 2026-05-24 기준 `/parent/reassurance`가 같은 read repository를 통해 부모 요약 view model을 만들고, Supabase 모드 빌드를 통과했다.
- `시험 준비 생성 결과를 Supabase에 저장`: 2026-05-24 기준 서버 action과 upsert 서비스 경계가 구현됐고, Supabase 조회로 `day-plan-minjun-2026-07-23`과 시험 미션 9개 저장을 확인했다.
- `평시 루틴 생성 결과를 Supabase에 저장`: 2026-05-24 기준 서버 action과 upsert 서비스 경계가 구현됐다. 화면의 루틴/기간 상태를 FormData로 받아 `routine_rules`, `day_plans`, `study_tasks`, `time_blocks`, `coach_states`에 저장하며, Supabase 조회로 루틴 계획 1개, 루틴 규칙 4개, 루틴 미션 5개, 코치 상태 1개 저장을 확인했다.
- `새로고침 후에도 테스트 데이터 유지`: Supabase Data API 재조회로 저장된 테스트 데이터 유지 확인
