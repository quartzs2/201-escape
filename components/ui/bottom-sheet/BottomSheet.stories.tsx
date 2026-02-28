import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useState } from "react";

import { Button } from "@/components/ui/button/Button";

import { BottomSheet } from "./BottomSheet";

const meta = {
  args: {
    children: null,
    isOpen: false,
    onClose: () => {},
  },
  component: BottomSheet,
  tags: ["autodocs"],
  title: "UI/BottomSheet",
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>시트 열기</Button>
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <BottomSheet.Overlay />
          <BottomSheet.Content>
            <BottomSheet.Header />
            <div className="px-6 pb-2">
              <BottomSheet.Title>기본 바텀시트</BottomSheet.Title>
            </div>
            <BottomSheet.Body>
              <p className="text-gray-600">바텀시트 본문 내용입니다.</p>
            </BottomSheet.Body>
          </BottomSheet.Content>
        </BottomSheet>
      </>
    );
  },
};

export const WithLongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>긴 컨텐츠 시트 열기</Button>
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <BottomSheet.Overlay />
          <BottomSheet.Content>
            <BottomSheet.Header />
            <div className="px-6 pb-2">
              <BottomSheet.Title>긴 컨텐츠</BottomSheet.Title>
            </div>
            <BottomSheet.Body>
              {Array.from({ length: 20 }, (_, i) => (
                <p className="border-b py-3 text-gray-600" key={i}>
                  항목 {i + 1}
                </p>
              ))}
            </BottomSheet.Body>
          </BottomSheet.Content>
        </BottomSheet>
      </>
    );
  },
};

export const WithCustomHeader: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>커스텀 헤더 시트 열기</Button>
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <BottomSheet.Overlay />
          <BottomSheet.Content>
            <BottomSheet.Header>
              <div className="flex w-full items-center justify-between px-6">
                <BottomSheet.Title>커스텀 헤더</BottomSheet.Title>
                <button
                  className="text-sm text-gray-500"
                  onClick={() => setIsOpen(false)}
                >
                  닫기
                </button>
              </div>
            </BottomSheet.Header>
            <BottomSheet.Body>
              <p className="text-gray-600">
                커스텀 헤더가 있는 바텀시트입니다.
              </p>
            </BottomSheet.Body>
          </BottomSheet.Content>
        </BottomSheet>
      </>
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setIsOpen(true)}>액션 시트 열기</Button>
        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <BottomSheet.Overlay />
          <BottomSheet.Content>
            <BottomSheet.Header />
            <div className="px-6 pb-2">
              <BottomSheet.Title>작업 선택</BottomSheet.Title>
            </div>
            <BottomSheet.Body>
              <div className="flex flex-col gap-3">
                <Button className="w-full" onClick={() => setIsOpen(false)}>
                  확인
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                >
                  취소
                </Button>
              </div>
            </BottomSheet.Body>
          </BottomSheet.Content>
        </BottomSheet>
      </>
    );
  },
};
