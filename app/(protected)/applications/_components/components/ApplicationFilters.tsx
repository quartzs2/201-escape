"use client";

import type { Route } from "next";
import type { ChangeEvent, FormEvent } from "react";

import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

import type { PeriodPreset, SortValue, TabValue } from "../constants";

import { buildApplicationsHref } from "../../_utils/route-state";
import {
  PERIOD_PRESET_LABELS,
  PERIOD_PRESETS,
  SORT_LABELS,
  SORT_VALUES,
} from "../constants";

type ApplicationFiltersProps = {
  period: PeriodPreset;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

export function ApplicationFilters({
  period,
  search,
  sort,
  tab,
}: ApplicationFiltersProps) {
  const router = useRouter();
  const isFiltered =
    search !== "" || period !== "all" || sort !== "applied_at_desc";
  const resetHref = buildApplicationsHref({
    period: "all",
    previewApplicationId: null,
    search: "",
    sort: "applied_at_desc",
    tab: "all",
  }) as Route;

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextSearch = String(formData.get("q") ?? "").trim();
    const nextHref = buildApplicationsHref({
      period,
      previewApplicationId: null,
      search: nextSearch,
      sort,
      tab,
    }) as Route;

    router.push(nextHref, { scroll: false });
  }

  function handleSortChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextSort = event.target.value as SortValue;
    const nextHref = buildApplicationsHref({
      period,
      previewApplicationId: null,
      search,
      sort: nextSort,
      tab,
    }) as Route;

    router.push(nextHref, { scroll: false });
  }

  return (
    <section className="bg-background/95 px-5 py-5 backdrop-blur-sm sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4">
          <form onSubmit={handleSearchSubmit} role="search">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                aria-label="회사명 검색"
                className="w-full rounded-2xl border border-border bg-muted/40 py-3 pr-11 pl-11 text-base text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:outline-none sm:text-sm"
                defaultValue={search}
                id="applications-company-search"
                key={search}
                name="q"
                placeholder="회사명으로 현재 목록 좁히기"
                type="text"
              />
              <button className="sr-only" type="submit">
                회사명 검색
              </button>
              {search !== "" && (
                <Link
                  aria-label="검색어 지우기"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  href={
                    buildApplicationsHref({
                      period,
                      previewApplicationId: null,
                      search: "",
                      sort,
                      tab,
                    }) as Route
                  }
                  scroll={false}
                >
                  <XIcon aria-hidden="true" className="size-4" />
                </Link>
              )}
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            <div
              aria-label="기간 필터"
              className="flex flex-wrap gap-2"
              role="group"
            >
              {PERIOD_PRESETS.map((preset) => (
                <Link
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                    period === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                  data-state={period === preset ? "active" : "inactive"}
                  href={
                    buildApplicationsHref({
                      period: preset,
                      previewApplicationId: null,
                      search,
                      sort,
                      tab,
                    }) as Route
                  }
                  key={preset}
                  scroll={false}
                >
                  {PERIOD_PRESET_LABELS[preset]}
                  {period === preset ? (
                    <span className="sr-only"> 선택됨</span>
                  ) : null}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label
                className="flex items-center gap-2 rounded-full border border-border bg-background pl-4"
                htmlFor="applications-sort"
              >
                <span className="text-sm font-semibold text-muted-foreground">
                  정렬
                </span>
                <div className="relative">
                  <select
                    className="min-w-28 appearance-none rounded-full bg-transparent py-2 pr-9 pl-1 text-sm font-semibold text-foreground outline-none"
                    id="applications-sort"
                    onChange={handleSortChange}
                    value={sort}
                  >
                    {SORT_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {SORT_LABELS[value]}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                </div>
              </label>

              <Link
                className={cn(
                  "min-w-24 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  isFiltered
                    ? "border-border bg-background text-foreground hover:border-primary/30 hover:text-primary"
                    : "pointer-events-none invisible",
                )}
                href={resetHref}
                scroll={false}
                tabIndex={isFiltered ? 0 : -1}
              >
                필터 초기화
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
