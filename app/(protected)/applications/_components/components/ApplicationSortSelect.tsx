"use client";

import type { Route } from "next";
import type { ChangeEvent } from "react";

import { useRouter } from "next/navigation";

import type { PeriodPreset, SortValue, TabValue } from "../constants";

import { buildApplicationsHref } from "../../_utils/route-state";
import { SORT_LABELS, SORT_VALUES } from "../constants";

type ApplicationSortSelectProps = {
  id: string;
  period: PeriodPreset;
  search: string;
  sort: SortValue;
  tab: TabValue;
};

export function ApplicationSortSelect({
  id,
  period,
  search,
  sort,
  tab,
}: ApplicationSortSelectProps) {
  const router = useRouter();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
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
    <select
      className="min-w-28 appearance-none rounded-full bg-transparent py-2 pr-9 pl-1 text-sm font-semibold text-foreground outline-none"
      id={id}
      onChange={handleChange}
      value={sort}
    >
      {SORT_VALUES.map((value) => (
        <option key={value} value={value}>
          {SORT_LABELS[value]}
        </option>
      ))}
    </select>
  );
}
