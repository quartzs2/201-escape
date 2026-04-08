/**
 * VirtualList vs 일반 목록 초기 렌더 성능 벤치마크
 *
 * 측정 대상: 컴포넌트를 DOM에 마운트하는 데 걸리는 시간
 * 실행 방법: pnpm bench
 *
 * jsdom 제약:
 *   - ResizeObserver가 없으므로 no-op으로 stub합니다.
 *   - getBoundingClientRect가 항상 0을 반환하면 containerHeight = 0이 되어
 *     VirtualList가 아이템 수에 무관하게 overscan 4개만 렌더링합니다.
 *     실제 뷰포트(400px)를 흉내 내도록 mock해야 의미 있는 비교가 됩니다.
 *
 * node 환경(unit 프로젝트)에서는 DOM API가 없으므로 자동으로 스킵됩니다.
 */
import { cleanup, render } from "@testing-library/react";
import { bench, describe, vi } from "vitest";

// vitest bench는 모든 프로젝트에서 bench 파일을 실행합니다.
// unit 프로젝트는 node 환경이라 DOM API가 없으므로 스킵합니다.
const isDomEnvironment = typeof globalThis.Element !== "undefined";

if (isDomEnvironment) {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      disconnect() {}
      observe() {}
      unobserve() {}
    },
  );

  // containerHeight를 400px로 고정해 VirtualList가 실제처럼 가상화하도록 합니다.
  // estimatedItemHeight=45 기준 약 9개 가시 + overscan 6개 = 약 15개 렌더링.
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    bottom: 400,
    height: 400,
    left: 0,
    right: 320,
    toJSON: () => ({}),
    top: 0,
    width: 320,
    x: 0,
    y: 0,
  });
}

import { VirtualList } from "./VirtualList";

type Item = { id: string; label: string };

function makeItems(count: number): Item[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i),
    label: `아이템 ${i + 1}`,
  }));
}

function PlainList({ items }: { items: Item[] }) {
  return (
    <div role="list">
      {items.map((item) => (
        <div key={item.id} role="listitem">
          {item.label}
        </div>
      ))}
    </div>
  );
}

const COUNTS = [100, 500, 1000] as const;

for (const count of COUNTS) {
  const items = makeItems(count);

  describe.skipIf(!isDomEnvironment)(`${count}개 아이템`, () => {
    bench("일반 목록 — 초기 렌더", () => {
      render(<PlainList items={items} />);
      cleanup();
    });

    bench("VirtualList — 초기 렌더", () => {
      render(
        <VirtualList<Item>
          className="h-96"
          estimatedItemHeight={45}
          items={items}
          keyExtractor={(item) => item.id}
          renderItem={(item) => <div>{item.label}</div>}
        />,
      );
      cleanup();
    });
  });
}
