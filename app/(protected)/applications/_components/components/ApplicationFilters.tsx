"use client";

import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

import type { PeriodPreset, SortValue } from "../constants";

import {
  PERIOD_PRESET_LABELS,
  PERIOD_PRESETS,
  SORT_LABELS,
  SORT_VALUES,
} from "../constants";

type ApplicationFiltersProps = {
  onPeriodChangeAction: (period: PeriodPreset) => void;
  onResetFiltersAction: () => void;
  onSearchSubmitAction: (search: string) => void;
  onSortChangeAction: (sort: SortValue) => void;
  period: PeriodPreset;
  resultCount: number;
  search: string;
  sort: SortValue;
};

export function ApplicationFilters({
  onPeriodChangeAction,
  onResetFiltersAction,
  onSearchSubmitAction,
  onSortChangeAction,
  period,
  resultCount,
  search,
  sort,
}: ApplicationFiltersProps) {
  const [inputValue, setInputValue] = useState(search);

  // URL 상태(뒤로가기 등)로 search prop이 외부에서 바뀔 때 입력창을 동기화
  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const isFiltered =
    search !== "" || period !== "all" || sort !== "applied_at_desc";

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearchSubmitAction(inputValue.trim());
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);
    if (value === "") {
      onSearchSubmitAction("");
    }
  }

  function handleClear() {
    setInputValue("");
    onSearchSubmitAction("");
  }

  return (
    <section className="bg-background/95 px-5 py-5 backdrop-blur-sm sm:px-6">
      <div className="flex flex-col gap-4">
        <div className="grid gap-4">
          <form onSubmit={handleSubmit} role="search">
            <div className="relative">
              <SearchIcon
                aria-hidden="true"
                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <input
                aria-label="회사명 검색"
                className="w-full rounded-2xl border border-border bg-muted/40 py-3 pr-11 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:outline-none"
                id="applications-company-search"
                onChange={handleChange}
                placeholder="회사명으로 현재 목록 좁히기"
                type="text"
                value={inputValue}
              />
              {inputValue !== "" && (
                <button
                  aria-label="검색어 지우기"
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={handleClear}
                  type="button"
                >
                  <XIcon aria-hidden="true" className="size-4" />
                </button>
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
                <button
                  aria-pressed={period === preset}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors",
                    period === preset
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground",
                  )}
                  key={preset}
                  onClick={() => onPeriodChangeAction(preset)}
                  type="button"
                >
                  {PERIOD_PRESET_LABELS[preset]}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative inline-flex shrink-0">
                <select
                  aria-label="정렬"
                  className="appearance-none rounded-full bg-background py-2 pr-8 pl-3.5 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary/10 focus:outline-none sm:min-w-28 sm:pr-10 sm:pl-4"
                  id="applications-sort"
                  onChange={(e) =>
                    onSortChangeAction(e.target.value as SortValue)
                  }
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
                  className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground sm:right-4"
                />
              </div>

              <Button
                aria-hidden={!isFiltered}
                className={cn(
                  "min-w-24 rounded-full px-4",
                  !isFiltered && "pointer-events-none invisible",
                )}
                disabled={!isFiltered}
                onClick={onResetFiltersAction}
                size="sm"
                tabIndex={isFiltered ? 0 : -1}
                variant="outline"
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </div>

        <p aria-atomic="true" aria-live="polite" className="sr-only">
          {resultCount}개의 지원 내역이 있습니다
        </p>
      </div>
    </section>
  );
}
