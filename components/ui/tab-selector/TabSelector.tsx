"use client";

import { ComponentProps, ReactNode, useState } from "react";

import { cn } from "@/lib/utils/cn";

export type TabSelectorItem = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

/**
 * `aria-label` 또는 `aria-labelledby`를 반드시 전달해야 합니다.
 * role="radiogroup"은 접근 가능한 레이블이 필요합니다.
 */
export type TabSelectorProps = Omit<ComponentProps<"div">, "children"> & {
  activeItemClassName?: string;
  defaultValue?: string;
  disabled?: boolean;
  inactiveItemClassName?: string;
  itemClassName?: string;
  items: readonly TabSelectorItem[];
  listClassName?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  value?: string;
};

const getFirstEnabledValue = (items: readonly TabSelectorItem[]) => {
  return items.find((item) => !item.disabled)?.value;
};

const resolveSelectedValue = ({
  items,
  providedValue,
}: {
  items: readonly TabSelectorItem[];
  providedValue?: string;
}) => {
  if (!providedValue) {
    return getFirstEnabledValue(items);
  }

  const matchedItem = items.find((item) => item.value === providedValue);

  if (!matchedItem || matchedItem.disabled) {
    return getFirstEnabledValue(items);
  }

  return providedValue;
};

function TabSelector({
  activeItemClassName,
  className,
  defaultValue,
  disabled = false,
  inactiveItemClassName,
  itemClassName,
  items,
  listClassName,
  onKeyDown,
  onValueChange,
  orientation = "horizontal",
  value,
  ...props
}: TabSelectorProps) {
  const [internalValue, setInternalValue] = useState(() =>
    resolveSelectedValue({
      items,
      providedValue: defaultValue,
    }),
  );
  const isControlled = value !== undefined;
  const currentValue = resolveSelectedValue({
    items,
    providedValue: isControlled ? value : internalValue,
  });

  const setValue = (nextValue: string) => {
    if (currentValue === nextValue) {
      return;
    }

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  const handleKeyDown: TabSelectorProps["onKeyDown"] = (event) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const triggers = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(
        "[data-tab-selector-item]:not([disabled])",
      ),
    );

    if (triggers.length === 0) {
      return;
    }

    const focusedTrigger = (
      event.target as HTMLElement | null
    )?.closest<HTMLButtonElement>("[data-tab-selector-item]");
    const currentIndex = focusedTrigger ? triggers.indexOf(focusedTrigger) : -1;

    if (currentIndex < 0) {
      return;
    }

    const nextKey = orientation === "horizontal" ? "ArrowRight" : "ArrowDown";
    const prevKey = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp";

    const keyMap: Record<string, () => number> = {
      End: () => triggers.length - 1,
      Home: () => 0,
      [nextKey]: () => (currentIndex + 1) % triggers.length,
      [prevKey]: () => (currentIndex - 1 + triggers.length) % triggers.length,
    };

    const resolveNextIndex = keyMap[event.key];

    if (!resolveNextIndex) {
      return;
    }

    const nextIndex = resolveNextIndex();
    const nextTrigger = triggers[nextIndex];

    if (!nextTrigger) {
      return;
    }

    event.preventDefault();
    nextTrigger.focus();

    const nextValue = nextTrigger.dataset.value;
    if (nextValue) {
      setValue(nextValue);
    }
  };

  return (
    <div
      aria-disabled={disabled || undefined}
      aria-orientation={orientation}
      className={cn("w-full", className)}
      onKeyDown={handleKeyDown}
      role="radiogroup"
      {...props}
    >
      <div
        className={cn(
          "inline-flex w-full items-center gap-1 rounded-2xl border border-border/70 bg-muted/40 p-1",
          listClassName,
        )}
      >
        {items.map((item) => {
          const isSelected = currentValue === item.value;
          const isItemDisabled = disabled || item.disabled;
          const stateClassName = isSelected
            ? activeItemClassName
            : inactiveItemClassName;
          const defaultStateClassName = isSelected
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground";

          return (
            <button
              aria-checked={isSelected}
              className={cn(
                "flex min-w-0 flex-1 cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                defaultStateClassName,
                itemClassName,
                stateClassName,
              )}
              data-state={isSelected ? "active" : "inactive"}
              data-tab-selector-item
              data-value={item.value}
              disabled={isItemDisabled}
              key={item.value}
              onClick={() => setValue(item.value)}
              role="radio"
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

TabSelector.displayName = "TabSelector";

export { TabSelector };
