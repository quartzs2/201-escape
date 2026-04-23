import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";

import { Button } from "@/components/ui/button/Button";

import { AlertDialog } from "./AlertDialog";

const meta = {
  args: {
    children: null,
    isOpen: false,
    onClose: () => {},
  },
  component: AlertDialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/AlertDialog",
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>다이얼로그 열기</Button>
        <AlertDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title className="mb-2">
              변경사항을 저장할까요?
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-6 leading-6">
              저장하지 않고 닫으면 입력 중인 내용이 사라집니다.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsOpen(false)} variant="outline">
                취소
              </Button>
              <Button onClick={() => setIsOpen(false)}>저장 후 닫기</Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog>
      </>
    );
  },
};

export const DestructiveAction: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)} variant="destructive">
          지원 삭제 확인 열기
        </Button>
        <AlertDialog isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <AlertDialog.Overlay />
          <AlertDialog.Content>
            <AlertDialog.Title className="mb-2">지원 삭제</AlertDialog.Title>
            <p className="mb-1 flex flex-wrap items-center gap-1.5 text-[15px] font-medium text-muted-foreground">
              <span className="font-medium text-foreground">오픈AI</span>
              <span aria-hidden="true" className="text-muted-foreground/40">
                ·
              </span>
              <span className="font-medium text-foreground">
                프론트엔드 엔지니어
              </span>
            </p>
            <AlertDialog.Description className="mb-4 text-[15px] leading-6 font-medium">
              이 지원 기록과 면접 일정이 모두 삭제됩니다. 이 작업은 되돌릴 수
              없습니다.
            </AlertDialog.Description>
            <p
              className="mb-6 text-sm font-medium text-destructive"
              role="alert"
            >
              예시 오류 메시지: 잠시 후 다시 시도해 주세요.
            </p>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsOpen(false)} variant="outline">
                취소
              </Button>
              <Button onClick={() => setIsOpen(false)} variant="destructive">
                삭제
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog>
      </>
    );
  },
};
