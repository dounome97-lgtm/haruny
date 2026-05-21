# 시안 asset 분리와 재구현 계획

이 문서는 확정 시안의 시각 품질을 구현 화면에 반영하기 위한 asset 분리와 재구현 순서를 정리한다.
현재 구현에 들어간 CSS 도형 일러스트는 임시 보정으로 보고, 최종적으로는 고품질 asset 기반으로 교체한다.

## 문제 정의

- `work/design/screens/*-selected*.png` 시안은 고품질 일러스트와 카드 질감을 포함한다.
- 현재 구현은 텍스트와 레이아웃은 일부 맞췄지만, 일러스트를 CSS 도형으로 그려 시안보다 품질이 낮다.
- 이 상태로 계속 화면을 추가하면 전체 앱이 시안보다 저렴해 보일 수 있다.
- 따라서 Supabase 연동 전에 디자인 스펙과 asset 정책을 먼저 확정하고, 학생 화면부터 다시 재구현한다.

## 목표

- 텍스트, 버튼, 데이터는 실제 HTML/React로 유지한다.
- 시각 품질이 중요한 캐릭터/책/집/장식 요소는 asset으로 사용한다.
- 화면 전체 이미지를 배경으로 쓰지 않는다.
- 화면별 확정 시안의 정보 구조와 시각 인상을 유지한다.
- 이후 모바일 앱 전환 시 asset과 토큰을 재사용할 수 있게 정리한다.

## asset 저장 구조

```text
public/
  assets/
    haruny/
      common/
      student-today/
      student-studying/
      completion-modal/
      student-closing/
      student-week/
      student-adjustment/
      parent/
      planning/
      family/
```

## 공통 asset 후보

| asset id | 용도 | 우선순위 | 비고 |
| --- | --- | --- | --- |
| `face-smile` | 상단 얼굴 아이콘 | 높음 | 학생/마감 공통 |
| `student-face` | 학생 얼굴/코치 카드 | 높음 | 공부 중, 마감 |
| `sprout` | 응원/성장 상징 | 중간 | 오늘, 완료 모달 |
| `math-notebook` | 수학 미션 | 높음 | 오늘, 공부 중, 마감 |
| `english-book` | 영어 단어/다음 행동 | 높음 | 공부 중, 마감 |
| `reading-book` | 독서/내일로 옮길 것 | 중간 | 마감 |
| `cup` | 10분 쉬기 | 높음 | 오늘 |
| `sun` | 회복 가능/계획 현실성 | 중간 | 오늘, 마감 |
| `calendar` | 다음 일정/내일 보기 | 중간 | 오늘, 마감 |
| `check-success` | 완료/확인 | 높음 | 완료 모달, 버튼 |
| `night-house` | 하루 마감 히어로 | 높음 | 마감 |

## asset 확보 방식

1. 원본 디자인 파일이 있으면 Figma 또는 원본 레이어에서 export한다.
2. 원본 파일이 없으면 기존 PNG에서 임시 crop asset을 만든다.
3. crop 품질이 낮으면 image generation으로 동일 톤의 투명 배경 asset을 재생성한다.
4. asset은 WebP 또는 PNG로 저장한다.
5. 단색 기능 아이콘은 SVG 또는 CSS가 가능하지만, 시안의 질감이 필요한 경우 이미지 asset을 우선한다.

## 구현 원칙

- 각 asset은 `<Image>` 또는 `img`로 렌더링한다.
- asset에는 대체 텍스트를 빈 문자열로 두거나 `aria-hidden` 처리한다.
- 핵심 정보는 이미지가 아니라 텍스트로 노출한다.
- asset 로딩 실패 시에도 텍스트와 버튼 흐름은 유지되어야 한다.
- CSS 도형 일러스트는 최종 화면에서 제거한다.
- 코드 컴포넌트는 화면별로 너무 커지지 않게 `components/ui` 또는 화면 전용 하위 컴포넌트로 분리한다.

## 재구현 순서

### 1. 디자인 토큰 재정리

- `src/styles/designTokens.ts`를 `00_figma_like_design_spec.md` 기준으로 보강한다.
- `src/app/globals.css`의 CSS 변수도 같은 색상 기준으로 맞춘다.
- 카드 radius, shadow, action, rest, surfaceSoft 토큰을 명확히 둔다.

### 2. 공통 컴포넌트 만들기

- `AppFrame`
- `ScreenHeader`
- `HeroMessageCard`
- `PrimaryMissionCard`
- `ActionPair`
- `SummaryMetricCard`
- `CoachMessageCard`
- `BottomPrimaryAction`

### 3. asset 기반 학생 화면 재구현

- 학생 `오늘`
- 학생 `공부 중`
- 학생 완료 모달
- 학생 `하루 마감`
- 학생 `이번 주`
- 학생 `오늘 줄이기`

### 4. 부모/계획/가족 화면 재구현

- 부모 `안심`
- 부모 `하루 마감 요약`
- 부모 `오늘 계획 조정`
- 부모 `이번 주 조정`
- 시험 준비 만들기
- 시험 과목/일차 입력
- 시험 준비안 확인
- 평시 루틴 만들기
- 알림 설정
- 가족 설정

## 학생 화면별 asset 매핑

### 01 학생 오늘

- [x] `common/face-smile`
- [x] `common/sprout`
- [x] `student-today/white-mascot-cup`
- [x] `common/math-notebook`
- [x] `common/cup`
- [x] `common/sun`
- [x] `common/calendar`
- [x] `common/book-required`
- [x] `common/plus-extra`
- [x] `common/star-optional`

### 02 학생 공부 중

- [x] `common/student-face`
- [x] `common/math-notebook`
- [x] `common/clock`
- [x] `common/check-action`
- [x] `common/pause`
- [x] `common/star-optional`
- [x] `common/english-book`
- [x] `common/settings`
- [x] `student-studying/student-face-crop.png` - 시안 PNG에서 crop
- [x] `student-studying/math-notebook-crop.png` - 시안 PNG에서 crop
- [x] `student-studying/english-book-crop.png` - 시안 PNG에서 crop
- [x] `student-studying/star-crop.png` - 시안 PNG에서 crop

### 03 완료 모달

- `completion-modal/success-garden`
- `common/clock`
- `completion-modal/checklist`

### 04 학생 하루 마감

- `student-closing/night-house`
- `common/math-notebook`
- `common/english-book`
- `common/reading-book`
- `common/star-optional`
- `common/sun`
- `common/student-face`
- `common/calendar`

### 05 학생 이번 주

- `student-week/week-flow`
- `common/student-face`
- `common/book-required`
- `common/calendar`

### 06 학생 오늘 줄이기

- `student-adjustment/relief-message`
- `common/student-face`
- `common/calendar`
- `common/check-action`

## 완료 기준

- 화면별 CSS 도형 일러스트 제거.
- asset 파일 경로와 사용 컴포넌트가 문서와 일치.
- Vercel 배포 화면이 PNG 시안과 비슷한 시각 품질을 갖춤.
- `npm.cmd run lint` 통과.
- `npm.cmd run build` 통과.
- 실제 휴대폰 폭에서 주요 텍스트와 버튼이 깨지지 않음.

## 보류

- 진짜 Figma 파일 생성/연동은 별도 작업으로 둔다.
- 디자인 원본이 없는 상태에서는 문서형 스펙과 asset 폴더 구조를 우선한다.
- 운영 데이터 연동과 Supabase 작업은 학생/부모 주요 화면의 시각 기준을 먼저 회복한 뒤 진행한다.
