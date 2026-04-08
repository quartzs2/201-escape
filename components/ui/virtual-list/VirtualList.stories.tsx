import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { useEffect, useRef, useState } from "react";

import type { VirtualListHandle } from "./VirtualList";

import { VirtualList } from "./VirtualList";

// ---
// 스토리 전용 데이터 / 헬퍼
// ---

type SimpleItem = {
  id: string;
  label: string;
};

function makeItems(count: number): SimpleItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    label: `아이템 ${i + 1}`,
  }));
}

function SimpleRow({ label }: { label: string }) {
  return (
    <div className="flex items-center border-b border-gray-100 px-4 py-3 text-sm text-gray-800">
      {label}
    </div>
  );
}

// ---

// VirtualList는 제네릭 컴포넌트라 StoryObj가 required props를 args로 요구합니다.
// meta에 stub args를 제공해 story 레벨에서 args가 불필요하게 합니다.
// 실제 렌더링은 각 story의 render 함수에서 VirtualList<SimpleItem>으로 직접 수행합니다.
const meta = {
  args: {
    estimatedItemHeight: 45,
    items: [],
    keyExtractor: () => "",
    renderItem: () => null,
  },
  component: VirtualList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "UI/VirtualList",
} satisfies Meta<typeof VirtualList>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---
// Stories
// ---

/**
 * 200개 아이템을 렌더링합니다.
 * 개발자 도구 Elements 탭에서 실제로 소수의 DOM 노드만 존재하는 것을 확인할 수 있습니다.
 */
export const Default: Story = {
  render: () => {
    const items = makeItems(200);

    return (
      <VirtualList<SimpleItem>
        className="h-100 w-80 rounded-lg border border-gray-200"
        estimatedItemHeight={45}
        items={items}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <SimpleRow label={item.label} />}
      />
    );
  },
};

/**
 * 아이템이 없을 때 emptyState를 표시합니다.
 */
export const Empty: Story = {
  render: () => {
    return (
      <VirtualList<SimpleItem>
        className="h-100 w-80 rounded-lg border border-gray-200"
        emptyState={
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-400">
            <span>표시할 아이템이 없습니다</span>
          </div>
        }
        estimatedItemHeight={45}
        items={[]}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <SimpleRow label={item.label} />}
      />
    );
  },
};

// 1줄 / 2줄 / 3줄짜리 텍스트를 순환해 높이 차이를 명확히 드러냅니다.
const VARIABLE_LABELS = [
  "한 줄짜리 짧은 항목",
  "두 줄로 넘어가는 항목입니다. 텍스트가 길어지면 ResizeObserver가 실제 높이를 측정합니다.",
  "세 줄 이상을 차지하는 항목입니다. 동적 높이 가상화에서는 각 아이템을 렌더링한 뒤 실측하기 때문에 이런 아이템도 정확하게 배치할 수 있습니다.",
];

/**
 * 아이템마다 높이가 달라도 ResizeObserver가 실측해 오프셋을 보정합니다.
 * 스크롤 시 아이템이 겹치거나 빈 공간이 생기지 않는 것을 확인할 수 있습니다.
 */
export const VariableHeight: Story = {
  render: () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      id: String(i),
      label: `${i + 1}. ${VARIABLE_LABELS[i % VARIABLE_LABELS.length]}`,
    }));

    return (
      <VirtualList<SimpleItem>
        className="h-100 w-80 rounded-lg border border-gray-200"
        estimatedItemHeight={45}
        items={items}
        keyExtractor={(item) => item.id}
        renderItem={(item) => (
          <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-800">
            {item.label}
          </div>
        )}
      />
    );
  },
};

/**
 * paddingTop / paddingBottom으로 리스트 상하에 여백을 추가합니다.
 * 여백은 CSS padding이 아니라 오프셋 계산에 직접 반영됩니다.
 */
export const WithPadding: Story = {
  render: () => {
    const items = makeItems(100);

    return (
      <VirtualList<SimpleItem>
        className="h-100 w-80 rounded-lg border border-gray-200"
        estimatedItemHeight={45}
        items={items}
        keyExtractor={(item) => item.id}
        paddingBottom={80}
        paddingTop={16}
        renderItem={(item) => <SimpleRow label={item.label} />}
      />
    );
  },
};

/**
 * onRangeChange로 현재 화면에 보이는 아이템 범위를 추적합니다.
 * overscan은 포함하지 않는 실제 가시 범위를 반환합니다.
 */
export const WithRangeChange: Story = {
  render: () => {
    const items = makeItems(200);
    const [range, setRange] = useState({ end: 0, start: 0 });

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-500">
          가시 범위:{" "}
          <span className="font-mono font-semibold text-gray-800">
            {range.start} – {range.end}
          </span>
        </p>
        <VirtualList<SimpleItem>
          className="h-100 w-80 rounded-lg border border-gray-200"
          estimatedItemHeight={45}
          items={items}
          keyExtractor={(item) => item.id}
          onRangeChange={(start, end) => setRange({ end, start })}
          renderItem={(item) => <SimpleRow label={item.label} />}
        />
      </div>
    );
  },
};

/**
 * 아이템이 버튼일 때 키보드 Tab 포커스를 확인합니다.
 * 단, 가상화 특성상 DOM에 없는 아이템(overscan 바깥)으로는 포커스가 이동하지 않습니다.
 * 이는 모든 가상화 라이브러리의 공통 제약입니다.
 */
export const WithKeyboardFocus: Story = {
  render: () => {
    const items = makeItems(200);
    const [selected, setSelected] = useState<null | string>(null);

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-gray-500">
          선택된 항목:{" "}
          <span className="font-mono font-semibold text-gray-800">
            {selected ?? "없음"}
          </span>
        </p>
        <VirtualList<SimpleItem>
          aria-label="선택 가능한 목록"
          className="h-100 w-80 rounded-lg border border-gray-200"
          estimatedItemHeight={45}
          items={items}
          keyExtractor={(item) => item.id}
          renderItem={(item) => (
            <button
              className="flex w-full items-center border-b border-gray-100 px-4 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 focus-visible:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none focus-visible:ring-inset"
              onClick={() => setSelected(item.label)}
              type="button"
            >
              {item.label}
            </button>
          )}
        />
      </div>
    );
  },
};

/**
 * ref를 통해 scrollToIndex를 호출합니다.
 * align 옵션으로 아이템을 뷰포트 상단 / 중앙 / 하단에 정렬할 수 있습니다.
 */
export const WithScrollToIndex: Story = {
  render: () => {
    const items = makeItems(200);
    const listRef = useRef<VirtualListHandle>(null);

    const buttons: {
      align: "center" | "end" | "start";
      index: number;
      label: string;
    }[] = [
      { align: "start", index: 0, label: "맨 위 (start)" },
      { align: "center", index: 99, label: "중간 (center)" },
      { align: "end", index: 199, label: "맨 아래 (end)" },
    ];

    return (
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {buttons.map(({ align, index, label }) => (
            <button
              className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              key={label}
              onClick={() => listRef.current?.scrollToIndex(index, { align })}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <VirtualList<SimpleItem>
          className="h-100 w-80 rounded-lg border border-gray-200"
          estimatedItemHeight={45}
          items={items}
          keyExtractor={(item) => item.id}
          ref={listRef}
          renderItem={(item) => <SimpleRow label={item.label} />}
        />
      </div>
    );
  },
};

const COMPARISON_ITEM_COUNT = 500;
const COMPARISON_ITEMS = makeItems(COMPARISON_ITEM_COUNT);

type ComparisonPanelProps = {
  children: React.ReactNode;
  domCount: number;
  label: string;
  variant: "after" | "before";
};

function ComparisonPanel({
  children,
  domCount,
  label,
  variant,
}: ComparisonPanelProps) {
  const badgeClass =
    variant === "before"
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`rounded px-2 py-0.5 font-mono text-xs ${badgeClass}`}>
          DOM {domCount}개
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * 500개 아이템 기준으로 일반 목록과 가상화 목록의 DOM 노드 수를 나란히 비교합니다.
 *
 * - 일반 목록: 전체 500개 노드가 항상 DOM에 존재합니다.
 * - 가상화 목록: 화면에 보이는 아이템만 렌더링하며, 스크롤해도 DOM 노드 수가 일정하게 유지됩니다.
 *
 * 스크롤 시 가상화 목록의 카운터가 실시간으로 변하는 것을 확인할 수 있습니다.
 */
export const BeforeAfterComparison: Story = {
  render: () => {
    const [virtualDomCount, setVirtualDomCount] = useState(0);
    const virtualWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const wrapper = virtualWrapperRef.current;
      if (!wrapper) {
        return;
      }

      const updateCount = () => {
        setVirtualDomCount(
          wrapper.querySelectorAll('[role="listitem"]').length,
        );
      };

      updateCount();

      const observer = new MutationObserver(updateCount);
      // listitem은 wrapper 3단계 아래에 있으므로 subtree가 필요합니다.
      observer.observe(wrapper, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <div className="flex gap-6">
        <ComparisonPanel
          domCount={COMPARISON_ITEM_COUNT}
          label="일반 목록 (Before)"
          variant="before"
        >
          <div
            className="h-100 w-72 overflow-y-auto rounded-lg border border-gray-200"
            role="list"
          >
            {COMPARISON_ITEMS.map((item) => (
              <SimpleRow key={item.id} label={item.label} />
            ))}
          </div>
        </ComparisonPanel>

        <ComparisonPanel
          domCount={virtualDomCount}
          label="가상화 목록 (After)"
          variant="after"
        >
          <div ref={virtualWrapperRef}>
            <VirtualList<SimpleItem>
              className="h-100 w-72 rounded-lg border border-gray-200"
              estimatedItemHeight={45}
              items={COMPARISON_ITEMS}
              keyExtractor={(item) => item.id}
              renderItem={(item) => <SimpleRow label={item.label} />}
            />
          </div>
        </ComparisonPanel>
      </div>
    );
  },
};
