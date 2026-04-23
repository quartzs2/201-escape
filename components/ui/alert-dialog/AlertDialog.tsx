"use client";

import React, { createContext, useContext, useId, useRef } from "react";

import { FocusTrap } from "@/components/common/FocusTrap";
import { Portal } from "@/components/common/Portal";
import { useScrollLock } from "@/hooks/useScrollLock";
import { cn } from "@/lib/utils";

type AlertDialogContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>;
  descriptionId: string;
  handleClose: () => void;
  isOpen: boolean;
  titleId: string;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

type AlertDialogRootProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

function Content({
  children,
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"div">) {
  const { contentRef, descriptionId, handleClose, isOpen, titleId } =
    useAlertDialogContext();

  return (
    <div
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      aria-modal={true}
      role="alertdialog"
      tabIndex={-1}
      {...props}
      className={cn(
        "relative z-10 w-full max-w-sm rounded-[28px] border border-border/70 bg-background p-6 shadow-[0_32px_96px_-48px_rgba(23,23,23,0.55)]",
        className,
      )}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          handleClose();
        }

        onKeyDown?.(event);
      }}
      ref={contentRef}
    >
      <FocusTrap containerRef={contentRef} isActive={isOpen}>
        {children}
      </FocusTrap>
    </div>
  );
}

function Description({ className, ...props }: React.ComponentProps<"p">) {
  const { descriptionId } = useAlertDialogContext();

  return (
    <p
      {...props}
      className={cn("text-sm text-muted-foreground", className)}
      id={descriptionId}
    />
  );
}

function Overlay({ className, ...props }: React.ComponentProps<"div">) {
  const { handleClose } = useAlertDialogContext();

  return (
    <div
      aria-hidden="true"
      {...props}
      className={cn(
        "absolute inset-0 bg-black/45 backdrop-blur-[2px]",
        className,
      )}
      onClick={(event) => {
        props.onClick?.(event);

        if (!event.defaultPrevented) {
          handleClose();
        }
      }}
    />
  );
}

function Root({ children, isOpen, onClose }: AlertDialogRootProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(isOpen);

  if (!isOpen) {
    return null;
  }

  return (
    <Portal>
      <AlertDialogContext
        value={{
          contentRef,
          descriptionId,
          handleClose: onClose,
          isOpen,
          titleId,
        }}
      >
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
          {children}
        </div>
      </AlertDialogContext>
    </Portal>
  );
}

function Title({ className, ...props }: React.ComponentProps<"h2">) {
  const { titleId } = useAlertDialogContext();

  return (
    <h2
      {...props}
      className={cn("text-lg font-semibold tracking-tight", className)}
      id={titleId}
      tabIndex={-1}
    />
  );
}

function useAlertDialogContext() {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error(
      "AlertDialog 컴포넌트는 AlertDialog 아래에서 사용되어야 합니다.",
    );
  }

  return context;
}

export const AlertDialog = Object.assign(Root, {
  Content,
  Description,
  Overlay,
  Title,
});
