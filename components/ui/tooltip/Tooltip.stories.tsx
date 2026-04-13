import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ComponentProps } from "react";

import { Tooltip } from "./Tooltip";

const meta = {
  argTypes: {
    open: {
      control: "boolean",
    },
  },
  component: Tooltip,
  tags: ["autodocs"],
  title: "UI/Tooltip",
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

function TooltipPreview(args: ComponentProps<typeof Tooltip>) {
  return (
    <div className="relative h-56 w-[320px] rounded-3xl border border-dashed border-border bg-muted/20 p-6">
      <div className="absolute inset-x-6 bottom-6 rounded-2xl bg-background px-4 py-3 text-sm text-muted-foreground shadow-sm">
        차트나 데이터 포인트 위에 뜨는 공용 툴팁 미리보기
      </div>
      <Tooltip {...args} />
    </div>
  );
}

export const Default: Story = {
  args: {
    description: "2026년 4월 기준 지원 기록",
    open: true,
    title: "4월",
    value: "12건",
    x: 160,
    y: 96,
  },
  render: (args) => {
    return <TooltipPreview {...args} />;
  },
};

export const WithoutDescription: Story = {
  args: {
    open: true,
    title: "합격",
    value: "3건",
    x: 160,
    y: 108,
  },
  render: (args) => {
    return <TooltipPreview {...args} />;
  },
};

export const Hidden: Story = {
  args: {
    description: "open이 false면 렌더링되지 않습니다.",
    open: false,
    title: "서류 통과",
    value: "7건",
    x: 160,
    y: 108,
  },
  render: (args) => {
    return <TooltipPreview {...args} />;
  },
};
