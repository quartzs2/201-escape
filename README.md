# 201 Escape

채용 공고를 한 곳에서 관리하는 모바일 친화적인 지원 현황 대시보드입니다.

**https://201-escape.vercel.app**

지원 상태를 한 곳에서 추적합니다. 회사명과 포지션을 직접 입력하거나, 로컬 환경에서는 원티드·사람인 URL을 붙여넣어 자동 파싱할 수 있습니다.

## 주요 기능

- **직접 입력**: 회사명, 포지션, URL을 직접 입력해 공고 추가
- **공고 자동 파싱** _(로컬 전용)_: 원티드, 사람인 URL에서 회사명, 직책, 공고 내용을 자동으로 추출
- **지원 상태 관리**: 관심 → 서류 제출 → 서류 통과 → 면접 중 → 최종 합격 / 불합격
- **탭 기반 필터링**: 지원 상태별로 목록 필터링
- **무한 스크롤 + 가상 리스트**: 대량 공고도 부드럽게 렌더링
- **지원 상세 페이지**: 공고 원문 편집, 메모 작성, 면접 일정 관리
- **면접 일정 관리**: 면접 유형·회차·일시 등록 및 삭제

## 기술 스택

- **Framework**: Next.js 16 (App Router, TypeScript), React 19
- **Server State**: TanStack Query v5
- **Database & Auth**: Supabase (PostgreSQL, Google OAuth)
- **Styling**: TailwindCSS v4, CVA, tailwind-merge
- **Notifications**: Sonner
- **Validation**: Zod
- **Parsing**: Cheerio (서버 사이드 HTML 파싱)
- **Analytics**: PostHog (이벤트 트래킹, 사용자 식별)
- **Error Tracking**: Sentry
- **Test**: Vitest, Storybook
- **Code Quality**: ESLint, Prettier, Husky, lint-staged

## 시작하기

### 요구 사항

- Node.js 20+
- pnpm

### 환경 변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 변수                                   | 설명                                                                |
| -------------------------------------- | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase 프로젝트 URL                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Publishable Key                                            |
| `NEXT_PUBLIC_ENABLE_PARSING`           | `true`로 설정 시 URL 자동 파싱 활성화 (로컬 전용, 기본값: 비활성화) |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN`    | PostHog 프로젝트 API Key                                            |
| `NEXT_PUBLIC_POSTHOG_HOST`             | PostHog API Host                                                    |
| `NEXT_PUBLIC_SENTRY_DSN`               | Sentry DSN                                                          |
| `NEXT_PUBLIC_ENABLE_BROWSER_SENTRY`    | `true`로 설정 시 브라우저 Sentry 활성화 (기본값: `false`)           |

`NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 Supabase 대시보드의 **Project Settings → API** 페이지에서 확인할 수 있습니다.

> **참고**: `NEXT_PUBLIC_ENABLE_PARSING=true`는 로컬 개발 환경에서만 사용하세요. 배포 환경에서는 이 변수를 설정하지 않거나 `false`로 유지합니다.

### 설치 및 실행

```bash
pnpm install
pnpm dev
```

`http://localhost:3000`에서 확인할 수 있습니다.

## 데이터베이스 스키마

Supabase 프로젝트에 아래 테이블이 필요합니다. `supabase/migrations/` 폴더의 마이그레이션 파일로 적용할 수 있습니다.

| 테이블          | 설명                                            |
| --------------- | ----------------------------------------------- |
| `jobs`          | 채용 공고 원본 정보 (회사명, 직책, URL, 플랫폼) |
| `job_snapshots` | 공고 크롤링 원본 데이터 (JSON)                  |
| `applications`  | 지원 기록 (상태, 지원일, 메모)                  |
| `interviews`    | 면접 일정 (유형, 회차, 일시)                    |

### 지원 상태

```
SAVED → APPLIED → DOCS_PASSED → INTERVIEWING → OFFERED
                                              ↘ REJECTED
```

### 지원 플랫폼

- `WANTED`: 원티드 (자동 파싱, 로컬 전용)
- `SARAMIN`: 사람인 (자동 파싱, 로컬 전용)
- `LINKEDIN`: LinkedIn (수동 입력)
- `MANUAL`: 직접 입력

## 스크립트

```bash
pnpm dev             # 개발 서버 실행
pnpm build           # 프로덕션 빌드
pnpm start           # 프로덕션 서버 실행
pnpm lint            # ESLint 실행
pnpm test            # Vitest 테스트 실행
pnpm storybook       # Storybook 실행 (포트 6006)
pnpm build-storybook # Storybook 정적 빌드
```

## 이벤트 트래킹

[PostHog](https://posthog.com)를 사용해 핵심 사용자 행동을 측정합니다. 페이지뷰는 `PostHogProvider`가 적용된 화면에서 수동으로 수집하며, 아래 이벤트는 코드에서 명시적으로 발송합니다.

### 이벤트 목록

| 이벤트명                     | 발생 시점                      | 프로퍼티                           |
| ---------------------------- | ------------------------------ | ---------------------------------- |
| `login_attempted`            | Google 로그인 버튼 클릭        | -                                  |
| `application_add_opened`     | 공고 추가 FAB 클릭             | -                                  |
| `application_add_submitted`  | 수동 폼 제출 → 리뷰 단계 진입  | `has_url: boolean`                 |
| `application_add_saved`      | 공고 저장 완료                 | -                                  |
| `application_add_reset`      | 리뷰 단계에서 "다시 입력" 클릭 | -                                  |
| `application_preview_opened` | 대시보드에서 지원 행 클릭      | -                                  |
| `application_status_changed` | 지원 상태 변경 성공            | `from_status`, `to_status`         |
| `application_deleted`        | 지원 삭제 완료                 | -                                  |
| `interview_added`            | 면접 일정 추가 완료            | `interview_type`, `round`          |
| `interview_edited`           | 면접 일정 수정 완료            | `interview_type`, `round`          |
| `interview_deleted`          | 면접 일정 삭제 완료            | -                                  |
| `job_description_saved`      | 공고 설명 저장 완료            | -                                  |
| `memo_saved`                 | 개인 메모 저장 완료            | -                                  |
| `applications_tab_changed`   | 지원 목록 탭 전환              | `tab: 'all' \| 'active' \| 'done'` |

### 공고 추가 퍼널 설정 (PostHog 대시보드)

1. PostHog → **Insights** → **New insight** → **Funnels**
2. Step 1: `application_add_opened`
3. Step 2: `application_add_submitted`
4. Step 3: `application_add_saved`

이 퍼널로 FAB 클릭 → 폼 제출 → 저장 완료 각 단계의 이탈률을 확인할 수 있습니다.

### 사용자 식별

`applications` 라우트에서는 로그인한 Supabase user ID를 PostHog `distinct_id`로 사용합니다(`PostHogUserSync` 컴포넌트). 세션이 해제되면 `posthog.reset()`으로 식별 정보를 초기화합니다.

## 프로젝트 구조

```
app/
├── (protected)/            # 인증 필요 라우트
│   ├── _components/        # 공유 컴포넌트 (ApplicationStatusSelector 등)
│   ├── dashboard/          # 지원 현황 대시보드 (목록, 탭 필터, 공고 추가)
│   └── applications/       # 지원 상세 페이지 (메모, 면접 일정, 공고 원문)
├── auth/                   # OAuth 콜백 처리
├── login/                  # 로그인 페이지
└── providers.tsx           # 루트 래퍼

components/
├── ui/                     # 재사용 UI 컴포넌트
│   ├── bottom-sheet/       # 바텀 시트
│   ├── button/             # 버튼
│   ├── skeleton/           # 스켈레톤 로딩
│   ├── tab-selector/       # 탭 셀렉터
│   ├── tabs/               # 탭
│   └── virtual-list/       # 가상 리스트
├── common/                 # Portal, FocusTrap 등 유틸리티 컴포넌트
└── icons/                  # SVG 아이콘 컴포넌트

hooks/                      # 공유 커스텀 훅 (useDrag, useScrollLock 등)

lib/
├── actions/                # Server Actions
├── adapters/               # 플랫폼별 공고 파서 (Adapter 패턴)
├── constants/              # 상태·플랫폼·인터뷰 타입 상수
├── types/                  # 타입 정의 및 Zod 스키마
├── utils/                  # 순수 유틸리티 함수 (날짜 포맷, cn 등)
└── supabase/               # Supabase 클라이언트 (서버/클라이언트 분리)
```
