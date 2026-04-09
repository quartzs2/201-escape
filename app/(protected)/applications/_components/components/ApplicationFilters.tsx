"use client";

import { ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
  onSearchSubmitAction: (search: string) => void;
  onSortChangeAction: (sort: SortValue) => void;
  period: PeriodPreset;
  resultCount: number;
  search: string;
  sort: SortValue;
};

export function ApplicationFilters({
  onPeriodChangeAction,
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

  const isFiltered = search !== "" || period !== "all";

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
    <div className="flex flex-col gap-3 px-5 pt-4 pb-2">
      {/* 1행: 검색 */}
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <SearchIcon
            aria-hidden="true"
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            aria-label="회사명 검색"
            className="w-full rounded-xl border border-border bg-muted/50 py-2 pr-9 pl-9 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10 focus:outline-none"
            onChange={handleChange}
            placeholder="회사명 검색"
            type="text"
            value={inputValue}
          />
          {inputValue !== "" && (
            <button
              aria-label="검색어 지우기"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
      </form>

      {/* 2행: 기간 필터 + 정렬 */}
      <div className="flex items-center justify-between gap-2">
        <div aria-label="기간 필터" className="flex gap-2" role="group">
          {PERIOD_PRESETS.map((preset) => (
            <button
              aria-pressed={period === preset}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                period === preset
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              key={preset}
              onClick={() => onPeriodChangeAction(preset)}
              type="button"
            >
              {PERIOD_PRESET_LABELS[preset]}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <select
            aria-label="정렬"
            className="appearance-none bg-transparent py-1 pr-6 pl-0 text-sm font-semibold text-muted-foreground focus:outline-none"
            onChange={(e) => onSortChangeAction(e.target.value as SortValue)}
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
            className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          />
        </div>
      </div>

      {isFiltered && (
        <p aria-atomic="true" aria-live="polite" className="sr-only">
          {resultCount}개의 지원 내역이 있습니다
        </p>
      )}
    </div>
  );
}
