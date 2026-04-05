import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import type {
  UpdateApplicationStatusInput,
  UpdateApplicationStatusResult,
} from "@/lib/types/application";
import type { JobStatus } from "@/lib/types/job";

import { ApplicationStatusSelector } from "./ApplicationStatusSelector";

type UpdateStatusAction = (
  input: UpdateApplicationStatusInput,
) => Promise<UpdateApplicationStatusResult>;

const queryClient = new QueryClient({
  defaultOptions: { mutations: { retry: false } },
});

const meta = {
  args: {
    applicationId: "0d3adf78-c8a0-4da4-a5d0-6a557e5e7af1",
    ariaLabel: "지원 상태 선택",
    status: "SAVED" as JobStatus,
    updateStatusAction: async () => ({ ok: true as const }),
  },
  component: ApplicationStatusSelector,
  decorators: [
    (Story: () => React.ReactNode) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ["autodocs"],
  title: "Protected/ApplicationStatusSelector",
} satisfies Meta<typeof ApplicationStatusSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

type StoryStateDemoProps = {
  initialStatus: JobStatus;
  updateStatusAction?: UpdateStatusAction;
};

function StoryStateDemo({
  initialStatus,
  updateStatusAction,
}: StoryStateDemoProps) {
  const [status, setStatus] = useState<JobStatus>(initialStatus);

  return (
    <div className="max-w-xl rounded-3xl border border-border bg-background p-6">
      <ApplicationStatusSelector
        applicationId="0d3adf78-c8a0-4da4-a5d0-6a557e5e7af1"
        ariaLabel="지원 상태 선택"
        onStatusChangeAction={setStatus}
        status={status}
        updateStatusAction={
          updateStatusAction ??
          (async () => {
            return { ok: true };
          })
        }
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <StoryStateDemo initialStatus="SAVED" />,
};

export const Saving: Story = {
  render: () => (
    <StoryStateDemo
      initialStatus="APPLIED"
      updateStatusAction={async () => {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 1200);
        });

        return { ok: true };
      }}
    />
  ),
};

export const Error: Story = {
  render: () => (
    <StoryStateDemo
      initialStatus="INTERVIEWING"
      updateStatusAction={async (input) => {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 400);
        });

        return {
          code: "QUERY_ERROR",
          ok: false,
          reason: `${input.status} 상태로 변경하지 못했습니다.`,
        };
      }}
    />
  ),
};
