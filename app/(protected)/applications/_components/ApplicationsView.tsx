import { FileTextIcon, LockKeyholeIcon } from "lucide-react";

import { Button } from "@/components/ui";
import { getApplications } from "@/lib/actions";
import { formatKoreanDate } from "@/lib/utils";

import { LazyAddJobTrigger } from "./add-job/LazyAddJobTrigger";
import { ApplicationsPanel } from "./components/ApplicationsPanel";
import {
  buildApplicationsRequestKey,
  getPeriodDateRange,
  PAGE_SIZE,
  parsePeriodParam,
  parseSortParam,
  parseTabParam,
  PERIOD_PARAM,
  SEARCH_PARAM,
  SORT_PARAM,
  TAB_PARAM,
} from "./constants";

type ApplicationsViewErrorProps = {
  code: "AUTH_REQUIRED" | "QUERY_ERROR";
};

type SearchParams = Record<string, string | string[] | undefined>;

const APPLICATIONS_ERROR_META = {
  AUTH_REQUIRED: {
    ctaHref: "/login",
    ctaLabel: "로그인하러 가기",
    description: "지원 목록을 보려면 로그인 상태가 필요합니다.",
    icon: LockKeyholeIcon,
    title: "로그인이 필요합니다",
  },
  QUERY_ERROR: {
    ctaHref: "/dashboard",
    ctaLabel: "대시보드로 이동",
    description: "목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
    icon: FileTextIcon,
    title: "지원 목록을 불러오지 못했습니다",
  },
} as const;

export async function ApplicationsView({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const search = getString(searchParams[SEARCH_PARAM]);
  const period = parsePeriodParam(
    getString(searchParams[PERIOD_PARAM]) || null,
  );
  const sort = parseSortParam(getString(searchParams[SORT_PARAM]) || null);
  const tab = parseTabParam(getString(searchParams[TAB_PARAM]) || null);
  const dateRange = getPeriodDateRange(period);
  const dateLabel = formatKoreanDate(new Date());
  const result = await getApplications({
    limit: PAGE_SIZE,
    offset: 0,
    periodEnd: dateRange?.end,
    periodStart: dateRange?.start,
    search: search || undefined,
    sort,
  });

  if (!result.ok) {
    return <ApplicationsViewError code={result.code} />;
  }

  const requestKey = buildApplicationsRequestKey({ period, search, sort });

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pt-0 pb-10 sm:px-6 lg:gap-20 lg:px-8 lg:pb-12">
        <ApplicationsPanel
          dateLabel={dateLabel}
          initialApplications={result.data.items}
          initialHasNextPage={result.data.hasMore}
          key={requestKey}
          period={period}
          search={search}
          sort={sort}
          tab={tab}
        />
      </div>
      <LazyAddJobTrigger />
    </main>
  );
}

function ApplicationsViewError({ code }: ApplicationsViewErrorProps) {
  const meta = APPLICATIONS_ERROR_META[code];
  const Icon = meta.icon;

  return (
    <main className="min-h-screen bg-background pb-20">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-4xl border border-border/60 bg-background px-6 py-10 text-center shadow-[0_36px_120px_-64px_rgba(23,23,23,0.45)] sm:px-8">
          <div className="mx-auto flex max-w-md flex-col items-center gap-5">
            <div className="flex size-12 items-center justify-center text-muted-foreground">
              <Icon aria-hidden="true" className="size-6" />
            </div>
            <div className="space-y-3">
              <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.02em] text-foreground">
                {meta.title}
              </h1>
              <p className="text-sm leading-6 text-muted-foreground">
                {meta.description}
              </p>
            </div>
            <Button asChild className="h-10 px-4 text-sm">
              <a href={meta.ctaHref}>{meta.ctaLabel}</a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function getString(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}
