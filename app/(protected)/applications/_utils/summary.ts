import type { ApplicationListItem } from "@/lib/types/application";

import { formatAppliedAt } from "@/lib/utils";

import type {
  PeriodPreset,
  SortValue,
  TabValue,
} from "../_components/constants";

import {
  DONE_STATUSES,
  IN_PROGRESS_STATUSES,
  PERIOD_PRESET_LABELS,
  SORT_LABELS,
} from "../_components/constants";

export type ApplicationsOverviewContent = {
  chips: string[];
  description: string;
  eyebrow: string;
  headline: string;
  metrics: ApplicationsOverviewMetric[];
};

export type ApplicationsOverviewMetric = {
  description: string;
  label: string;
  value: string;
};

export function buildApplicationsOverviewContent(params: {
  applications: ApplicationListItem[];
  hasNextPage: boolean;
  period: PeriodPreset;
  search: string;
  sort: SortValue;
  tab: TabValue;
}): ApplicationsOverviewContent {
  const { applications, hasNextPage, period, search, sort, tab } = params;
  const searchKeyword = search.trim();
  const visibleCount = applications.length;
  const activeCount = applications.filter((application) =>
    IN_PROGRESS_STATUSES.includes(application.status),
  ).length;
  const doneCount = applications.filter((application) =>
    DONE_STATUSES.includes(application.status),
  ).length;
  const latestAppliedAt = applications[0]?.appliedAt ?? null;
  const tabLabel = getTabLabel(tab);

  return {
    chips: getScopeChips({ period, searchKeyword, sort, tab }),
    description: getOverviewDescription({
      hasNextPage,
      period,
      searchKeyword,
      sort,
      tabLabel,
      visibleCount,
    }),
    eyebrow: hasNextPage ? "현재 로드된 목록 기준" : "현재 표시 중인 목록 기준",
    headline: getHeadline({ searchKeyword, tab, visibleCount }),
    metrics: [
      {
        description: hasNextPage
          ? "스크롤하면 다음 항목이 이어집니다."
          : "현재 범위의 목록이 모두 표시되었습니다.",
        label: "현재 표시",
        value: formatCount(visibleCount),
      },
      {
        description: "상태 변경이 필요한 흐름을 먼저 확인합니다.",
        label: "진행중",
        value: formatCount(activeCount),
      },
      {
        description: "합격과 불합격까지 마무리된 항목입니다.",
        label: "완료",
        value: formatCount(doneCount),
      },
      {
        description:
          latestAppliedAt === null
            ? "목록이 비어 있습니다."
            : "가장 먼저 보이는 최근 등록 기준입니다.",
        label: "최근 등록",
        value:
          latestAppliedAt === null ? "없음" : formatAppliedAt(latestAppliedAt),
      },
    ],
  };
}

function formatCount(value: number): string {
  return value.toLocaleString("ko-KR");
}

function getHeadline(params: {
  searchKeyword: string;
  tab: TabValue;
  visibleCount: number;
}): string {
  const { searchKeyword, tab, visibleCount } = params;

  if (searchKeyword !== "") {
    return `"${searchKeyword}" 검색 결과 ${formatCount(visibleCount)}건`;
  }

  switch (tab) {
    case "active": {
      return `진행 중인 지원 ${formatCount(visibleCount)}건`;
    }
    case "done": {
      return `완료된 지원 ${formatCount(visibleCount)}건`;
    }
    default: {
      return `현재 지원 파이프라인 ${formatCount(visibleCount)}건`;
    }
  }
}

function getOverviewDescription(params: {
  hasNextPage: boolean;
  period: PeriodPreset;
  searchKeyword: string;
  sort: SortValue;
  tabLabel: string;
  visibleCount: number;
}): string {
  const { hasNextPage, period, searchKeyword, sort, tabLabel, visibleCount } =
    params;
  const countLabel = hasNextPage
    ? `${formatCount(visibleCount)}건이 먼저 로드되어 있고 아래로 더 이어집니다`
    : `${formatCount(visibleCount)}건이 현재 범위에서 모두 표시되어 있습니다`;

  if (searchKeyword !== "") {
    return `${tabLabel}에서 "${searchKeyword}" 회사명을 기준으로 찾은 결과입니다. ${countLabel}. 기간은 ${PERIOD_PRESET_LABELS[period]}, 정렬은 ${SORT_LABELS[sort]}입니다.`;
  }

  return `${tabLabel}을 ${PERIOD_PRESET_LABELS[period]} 범위로 보고 있습니다. ${countLabel}. 정렬은 ${SORT_LABELS[sort]}입니다.`;
}

function getScopeChips(params: {
  period: PeriodPreset;
  searchKeyword: string;
  sort: SortValue;
  tab: TabValue;
}): string[] {
  const { period, searchKeyword, sort, tab } = params;
  const chips = [
    `탭 ${getTabChipLabel(tab)}`,
    `기간 ${PERIOD_PRESET_LABELS[period]}`,
    `정렬 ${SORT_LABELS[sort]}`,
  ];

  if (searchKeyword !== "") {
    chips.push(`검색 ${searchKeyword}`);
  }

  return chips;
}

function getTabChipLabel(tab: TabValue): string {
  switch (tab) {
    case "active": {
      return "진행중";
    }
    case "done": {
      return "완료";
    }
    default: {
      return "전체";
    }
  }
}

function getTabLabel(tab: TabValue): string {
  switch (tab) {
    case "active": {
      return "진행중 탭";
    }
    case "done": {
      return "완료 탭";
    }
    default: {
      return "전체 목록";
    }
  }
}
