import type { ReactNode } from "react";

import { useEffect, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

import type { ScrollToIndexOptions } from "./hooks/useVirtualList";

import { useVirtualList } from "./hooks/useVirtualList";

export type { ScrollToIndexOptions };

export type VirtualListHandle = {
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
};

type VirtualItemMeasurerProps = {
  children: ReactNode;
  index: number;
  offsetTop: number;
  onMeasure: (index: number, height: number) => void;
};

type VirtualListProps<T> = {
  /**
   * 스크롤 컨테이너의 접근성 레이블.
   */
  "aria-label"?: string;
  /**
   * 스크롤 컨테이너에 적용할 추가 클래스. 높이를 반드시 지정해야 합니다 (예: h-full).
   */
  className?: string;
  /**
   * items가 비었을 때 표시할 노드.
   */
  emptyState?: ReactNode;
  /**
   * 실측 전에 사용할 아이템 높이 추정값 (px).
   * 실제 렌더링 높이에 가까울수록 초기 레이아웃 점프가 줄어듭니다.
   */
  estimatedItemHeight: number;
  /**
   * 렌더링할 아이템 배열.
   */
  items: T[];
  /**
   * 각 아이템의 고유 키를 반환하는 함수.
   */
  keyExtractor: (item: T, index: number) => string;
  /**
   * 화면에 보이는 아이템 범위가 바뀔 때 호출됩니다 (overscan 미포함).
   * 무한 스크롤 트리거, 읽음 처리 등에 활용합니다.
   */
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  /**
   * 뷰포트 밖 위아래로 추가 렌더링할 아이템 수. 기본값: 3.
   */
  overscan?: number;
  /**
   * 마지막 아이템 뒤의 여백 (px).
   */
  paddingBottom?: number;
  /**
   * 첫 번째 아이템 앞의 여백 (px).
   */
  paddingTop?: number;
  /**
   * scrollToIndex 메서드를 외부에서 호출하기 위한 ref.
   */
  ref?: React.Ref<VirtualListHandle>;
  /**
   * 아이템을 렌더링하는 함수.
   */
  renderItem: (item: T, index: number) => ReactNode;
};

/**
 * 고정/동적 높이 아이템을 지원하는 가상 스크롤 목록 컴포넌트.
 *
 * 보이는 범위의 아이템만 DOM에 렌더링해 대량 목록의 성능을 보장합니다.
 * 부모에 반드시 고정 높이가 있어야 합니다 (className에 h-full 등 지정).
 *
 * 주의: 키보드 탭 포커스는 렌더링된 아이템(overscan 범위)까지만 이동합니다.
 */
export function VirtualList<T>({
  "aria-label": ariaLabel,
  className,
  emptyState,
  estimatedItemHeight,
  items,
  keyExtractor,
  onRangeChange,
  overscan,
  paddingBottom,
  paddingTop,
  ref,
  renderItem,
}: VirtualListProps<T>) {
  const {
    containerRef,
    handleScroll,
    measureItem,
    scrollToIndex,
    totalHeight,
    virtualItems,
  } = useVirtualList({
    estimatedItemHeight,
    itemCount: items.length,
    onRangeChange,
    overscan,
    paddingBottom,
    paddingTop,
  });

  useImperativeHandle(ref, () => ({ scrollToIndex }), [scrollToIndex]);

  if (items.length === 0) {
    return emptyState ?? null;
  }

  return (
    <div
      aria-label={ariaLabel}
      className={cn("overflow-y-auto", className)}
      onScroll={handleScroll}
      ref={containerRef}
      role="list"
    >
      <div className="relative" style={{ height: totalHeight }}>
        {virtualItems.map(({ index, offsetTop }) => (
          <VirtualItemMeasurer
            index={index}
            key={keyExtractor(items[index], index)}
            offsetTop={offsetTop}
            onMeasure={measureItem}
          >
            {renderItem(items[index], index)}
          </VirtualItemMeasurer>
        ))}
      </div>
    </div>
  );
}

/**
 * 아이템을 렌더링하고 실제 높이를 ResizeObserver로 측정합니다.
 * height를 지정하지 않아 콘텐츠 높이대로 자연스럽게 늘어납니다.
 */
function VirtualItemMeasurer({
  children,
  index,
  offsetTop,
  onMeasure,
}: VirtualItemMeasurerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      onMeasure(index, entry.contentRect.height);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [index, onMeasure]);

  return (
    <div
      className="absolute inset-x-0"
      ref={ref}
      role="listitem"
      style={{ top: offsetTop }}
    >
      {children}
    </div>
  );
}
