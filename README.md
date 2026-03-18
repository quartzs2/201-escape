# 201 Escape

채용 공고를 한 곳에서 관리하는 모바일 친화적인 지원 현황 대시보드입니다.

**https://201-escape.vercel.app**

지원 상태를 한 곳에서 추적합니다. 회사명과 포지션을 직접 입력하거나, 로컬 환경에서는 원티드·사람인 URL을 붙여넣어 자동 파싱할 수 있습니다.

## 주요 기능

- **직접 입력**: 회사명, 포지션, URL을 직접 입력해 공고 추가
- **공고 자동 파싱** _(로컬 전용)_: 원티드, 사람인 URL에서 회사명, 직책, 공고 내용을 자동으로 추출
- **지원 상태 관리**: 관심 → 서류 제출 → 서류 통과 → 면접 중 → 최종 합격 / 불합격
- **바텀 시트 프리뷰**: 목록에서 공고를 탭하면 상세 정보를 빠르게 확인
- **탭 기반 필터링**: 지원 상태별로 목록 필터링

## 기술 스택

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database & Auth**: Supabase (PostgreSQL, Google OAuth)
- **Styling**: TailwindCSS v4
- **Validation**: Zod
- **Parsing**: Cheerio (서버 사이드 HTML 파싱)

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
pnpm dev           # 개발 서버 실행
pnpm build         # 프로덕션 빌드
pnpm start         # 프로덕션 서버 실행
pnpm lint          # ESLint 실행
pnpm test          # Vitest 테스트 실행
pnpm storybook     # Storybook 실행 (포트 6006)
```

## 프로젝트 구조

```
app/
├── (protected)/        # 인증 필요 라우트
│   ├── dashboard/      # 지원 현황 대시보드
│   └── applications/   # 지원 상세 페이지
├── auth/               # OAuth 콜백 처리
└── login/              # 로그인 페이지

components/
├── ui/                 # 재사용 UI 컴포넌트 (Button, Tabs, BottomSheet 등)
└── common/             # Portal, FocusTrap 등 유틸리티 컴포넌트

lib/
├── actions/            # Server Actions
├── adapters/           # 플랫폼별 공고 파서 (Adapter 패턴)
├── types/              # 타입 정의 및 Zod 스키마
└── supabase/           # Supabase 클라이언트 (서버/클라이언트 분리)
```
