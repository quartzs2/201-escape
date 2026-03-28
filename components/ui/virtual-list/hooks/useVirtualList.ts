import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export type ScrollToIndexOptions = {
  align?: "center" | "end" | "start";
  behavior?: ScrollBehavior;
};

export type VirtualItem = {
  index: number;
  offsetTop: number;
};

type UseVirtualListOptions = {
  estimatedItemHeight: number;
  itemCount: number;
  onRangeChange?: (startIndex: number, endIndex: number) => void;
  overscan?: number;
  paddingBottom?: number;
  paddingTop?: number;
};

type UseVirtualListResult = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  measureItem: (index: number, height: number) => void;
  scrollToIndex: (index: number, options?: ScrollToIndexOptions) => void;
  totalHeight: number;
  virtualItems: VirtualItem[];
};

export function useVirtualList({
  estimatedItemHeight,
  itemCount,
  onRangeChange,
  overscan = 3,
  paddingBottom = 0,
  paddingTop = 0,
}: UseVirtualListOptions): UseVirtualListResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<null | number>(null);
  const measuredHeights = useRef<Map<number, number>>(new Map());
  const prevRangeRef = useRef({ endIndex: -1, startIndex: -1 });
  // 최신 onRangeChange를 ref로 유지해 effect deps에 추가하지 않아도 됩니다.
  const onRangeChangeRef = useRef(onRangeChange);
  onRangeChangeRef.current = onRangeChange;

  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  // 측정값 변경 시 리렌더를 트리거하는 용도로만 사용합니다.
  const [, setVersion] = useState(0);

  // 컨테이너 높이를 페인트 전에 동기적으로 읽어, 첫 렌더에서 올바른 visible range를 계산합니다.
  // useEffect를 쓰면 containerHeight=0으로 첫 페인트가 일어나 overscan 범위(4개)만 먼저 보이고
  // 이후 ResizeObserver 콜백에서 나머지 아이템이 깜빡이며 나타납니다.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    setContainerHeight(el.getBoundingClientRect().height);
    // emptyState에서 아이템으로 복귀할 때 컨테이너가 재마운트되면
    // 실제 scrollTop(보통 0)과 state가 어긋날 수 있으므로 동기적으로 맞춥니다.
    setScrollTop(el.scrollTop);

    const observer = new ResizeObserver(([entry]) => {
      const height =
        entry.borderBoxSize?.[0]?.blockSize ??
        (entry.target as HTMLElement).getBoundingClientRect().height;
      setContainerHeight(height);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // e.currentTarget은 이벤트 핸들러 반환 후 null이 되므로
  // scrollTop을 동기적으로 먼저 읽고, rAF로 상태 업데이트를 프레임에 맞춥니다.
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const nextScrollTop = e.currentTarget.scrollTop;

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(nextScrollTop);
      rafRef.current = null;
    });
  }, []);

  const measureItem = useCallback((index: number, height: number) => {
    if (measuredHeights.current.get(index) === height) {
      return;
    }
    measuredHeights.current.set(index, height);
    setVersion((v) => v + 1);
  }, []);

  const scrollToIndex = useCallback(
    (
      index: number,
      { align = "start", behavior = "smooth" }: ScrollToIndexOptions = {},
    ) => {
      const el = containerRef.current;
      if (!el || index < 0 || index >= itemCount) {
        return;
      }

      let offset = paddingTop;
      for (let i = 0; i < index; i++) {
        offset += measuredHeights.current.get(i) ?? estimatedItemHeight;
      }
      const itemH = measuredHeights.current.get(index) ?? estimatedItemHeight;
      const viewportH = el.clientHeight;

      let top: number;
      if (align === "start") {
        top = offset;
      } else if (align === "end") {
        top = offset - viewportH + itemH;
      } else {
        top = offset - viewportH / 2 + itemH / 2;
      }

      el.scrollTo({ behavior, top: Math.max(0, top) });
    },
    [estimatedItemHeight, itemCount, paddingTop],
  );

  // itemCount가 줄어든 경우 범위 밖 인덱스의 측정값을 정리합니다.
  // 필터링 등으로 아이템 수가 줄었을 때 이전 인덱스의 높이가 새 아이템에 잘못 적용되는 것을 막습니다.
  for (const key of measuredHeights.current.keys()) {
    if (key >= itemCount) {
      measuredHeights.current.delete(key);
    }
  }

  // 누적 오프셋 계산 — O(n)
  // 실측값이 있으면 사용하고, 없으면 estimatedItemHeight로 대체합니다.
  const offsets = new Array<number>(itemCount);
  let runningHeight = paddingTop;
  for (let i = 0; i < itemCount; i++) {
    offsets[i] = runningHeight;
    runningHeight += measuredHeights.current.get(i) ?? estimatedItemHeight;
  }
  const totalHeight = runningHeight + paddingBottom;

  // 실제 화면에 보이는 범위 (overscan 미포함)
  const rawStart =
    itemCount > 0 ? findLastIndexAtOrBefore(offsets, scrollTop) : 0;
  let rawEnd = rawStart;
  while (
    rawEnd + 1 < itemCount &&
    offsets[rawEnd + 1] <= scrollTop + containerHeight
  ) {
    rawEnd++;
  }

  // 렌더링 범위 (overscan 포함)
  const startIndex = Math.max(0, rawStart - overscan);
  const endIndex = Math.min(itemCount - 1, rawEnd + overscan);

  const virtualItems: VirtualItem[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({ index: i, offsetTop: offsets[i] });
  }

  // 가시 범위 변경 시 콜백 — overscan을 제외한 실제 화면 범위를 전달합니다.
  useEffect(() => {
    const prev = prevRangeRef.current;
    if (prev.startIndex === rawStart && prev.endIndex === rawEnd) {
      return;
    }
    prevRangeRef.current = { endIndex: rawEnd, startIndex: rawStart };
    onRangeChangeRef.current?.(rawStart, rawEnd);
  }, [rawStart, rawEnd]);

  return {
    containerRef,
    handleScroll,
    measureItem,
    scrollToIndex,
    totalHeight,
    virtualItems,
  };
}

/**
 * 정렬된 오프셋 배열에서 target 이하인 마지막 인덱스를 이진 탐색으로 찾습니다.
 * 스크롤 위치에서 첫 번째 가시 아이템 인덱스를 O(log n)으로 구하는 데 사용합니다.
 */
function findLastIndexAtOrBefore(offsets: number[], target: number): number {
  let lo = 0;
  let hi = offsets.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (offsets[mid] <= target) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}
