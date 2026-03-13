import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";

import { TabSelector } from "./TabSelector";

const SEGMENT_ITEMS = [
  { label: "요약", value: "summary" },
  { label: "상세", value: "detail" },
  { label: "메모", value: "notes" },
] as const;

const STATUS_ITEMS = [
  { label: "관심 공고", value: "saved" },
  { label: "서류 제출", value: "applied" },
  { label: "서류 통과", value: "docs-passed" },
  { label: "면접 중", value: "interviewing" },
  { label: "최종 합격", value: "offered" },
  { label: "불합격", value: "rejected" },
] as const;

const meta = {
  component: TabSelector,
  tags: ["autodocs"],
  title: "UI/TabSelector",
} satisfies Meta<typeof TabSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    "aria-label": "섹션 선택",
    items: SEGMENT_ITEMS,
  },
  render: (args) => {
    const [value, setValue] = useState("summary");

    return (
      <div className="max-w-md">
        <TabSelector {...args} onValueChange={setValue} value={value} />
      </div>
    );
  },
};

export const WrappedStatus: Story = {
  args: {
    activeItemClassName: "border-foreground bg-foreground text-background",
    "aria-label": "지원 상태 선택",
    inactiveItemClassName:
      "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
    itemClassName:
      "min-h-10 flex-none rounded-full border px-4 py-2 font-medium shadow-none",
    items: STATUS_ITEMS,
    listClassName:
      "flex flex-wrap gap-2 rounded-none border-0 bg-transparent p-0",
  },
  render: (args) => {
    const [value, setValue] = useState("saved");

    return (
      <div className="max-w-xl space-y-3">
        <TabSelector {...args} onValueChange={setValue} value={value} />
        <p className="text-sm text-muted-foreground">현재 값: {value}</p>
      </div>
    );
  },
};
