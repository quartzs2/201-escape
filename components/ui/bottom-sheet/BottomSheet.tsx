"use client";

import React, { createContext, useContext, useId } from "react";

import { Portal } from "@/components/common/Portal";
import { cn } from "@/lib/utils";

import { useBottomSheet } from "./hooks/useBottomSheet";

type BottomSheetContextValue = ReturnType<typeof useBottomSheet> & {
  titleId: string;
};

const BottomSheetContext = createContext<BottomSheetContextValue | null>(null);

type BottomSheetRootProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

function Body({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("flex-1 touch-pan-y overflow-y-auto px-6 pb-10", className)}
      style={style}
    >
      {children}
    </div>
  );
}

function Content({
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"div">) {
  const { sheetRef, titleId } = useBottomSheetContext();

  return (
    <div
      aria-labelledby={titleId}
      aria-modal={true}
      role="dialog"
      tabIndex={-1}
      {...props}
      className={cn(
        "w-full max-w-md rounded-t-[20px] bg-white shadow-2xl",
        "pointer-events-auto relative flex flex-col",
        "max-h-[90vh] min-h-[50vh]",
        "transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        "pb-[env(safe-area-inset-bottom)]",
        "after:absolute after:top-[calc(100%-1px)] after:right-0 after:left-0 after:h-screen after:bg-white",
        className,
      )}
      ref={sheetRef}
      style={{ ...style, transform: "translateY(100%)" }}
    >
      {children}
    </div>
  );
}

function Header({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { handleRef } = useBottomSheetContext();

  return (
    <div
      {...props}
      className={cn(
        "flex w-full cursor-grab touch-none justify-center pt-3 pb-5 select-none active:cursor-grabbing",
        className,
      )}
      ref={handleRef}
    >
      {children ?? (
        <div
          aria-hidden="true"
          className="h-1.5 w-12 rounded-full bg-gray-300"
        />
      )}
    </div>
  );
}

function Overlay({ className, ...props }: React.ComponentProps<"div">) {
  const { handleClose, isVisible } = useBottomSheetContext();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-auto absolute inset-0 bg-black/50 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className,
      )}
      onClick={() => handleClose()}
      {...props}
    />
  );
}

function Root({ children, isOpen, onClose }: BottomSheetRootProps) {
  const bottomSheetLogic = useBottomSheet({ isOpen, onClose });
  const titleId = useId();

  if (!isOpen && !bottomSheetLogic.isVisible) {
    return null;
  }

  return (
    <Portal>
      <BottomSheetContext value={{ ...bottomSheetLogic, titleId }}>
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center">
          {children}
        </div>
      </BottomSheetContext>
    </Portal>
  );
}

function Title({ children, className, ...props }: React.ComponentProps<"h2">) {
  const { titleId } = useBottomSheetContext();

  return (
    <h2
      className={cn("text-lg font-bold", className)}
      id={titleId}
      tabIndex={-1}
      {...props}
    >
      {children}
    </h2>
  );
}

function useBottomSheetContext() {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error(
      "바텀시트 컴포넌트는 BottomSheet 아래에서 사용되어야 합니다.",
    );
  }
  return context;
}

export const BottomSheet = Object.assign(Root, {
  Body,
  Content,
  Header,
  Overlay,
  Title,
});
