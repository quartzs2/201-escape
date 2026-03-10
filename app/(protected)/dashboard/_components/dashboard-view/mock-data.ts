import type { ApplicationItem } from "./types";

export const MOCK_APPLICATIONS: ApplicationItem[] = [
  {
    appliedAt: "2026-03-09",
    companyName: "토스",
    id: "1",
    platform: "WANTED",
    positionTitle: "프론트엔드 엔지니어",
    status: "APPLIED",
  },
  {
    appliedAt: "2026-03-11",
    companyName: "카카오",
    id: "2",
    platform: "SARAMIN",
    positionTitle: "백엔드 엔지니어",
    status: "INTERVIEWING",
  },
  {
    appliedAt: "2026-03-08",
    companyName: "네이버",
    id: "3",
    platform: "LINKEDIN",
    positionTitle: "UI/UX 디자이너",
    status: "DOCS_PASSED",
  },
  {
    appliedAt: "2026-03-10",
    companyName: "라인",
    id: "4",
    platform: "WANTED",
    positionTitle: "프론트엔드 엔지니어",
    status: "OFFERED",
  },
  {
    appliedAt: "2026-03-06",
    companyName: "쿠팡",
    id: "5",
    platform: "MANUAL",
    positionTitle: "백엔드 엔지니어",
    status: "REJECTED",
  },
  {
    appliedAt: "2026-03-11",
    companyName: "당근",
    id: "6",
    platform: "LINKEDIN",
    positionTitle: "프로덕트 매니저",
    status: "INTERVIEWING",
  },
  {
    appliedAt: "2026-03-11",
    companyName: "배달의민족",
    id: "7",
    platform: "SARAMIN",
    positionTitle: "iOS 개발자",
    status: "APPLIED",
  },
];

export const STATS = [
  { label: "전체", value: MOCK_APPLICATIONS.length },
  {
    label: "서류",
    value: MOCK_APPLICATIONS.filter(
      (a) => a.status === "APPLIED" || a.status === "DOCS_PASSED",
    ).length,
  },
  {
    label: "면접",
    value: MOCK_APPLICATIONS.filter((a) => a.status === "INTERVIEWING").length,
  },
  {
    label: "합격",
    value: MOCK_APPLICATIONS.filter((a) => a.status === "OFFERED").length,
  },
];
