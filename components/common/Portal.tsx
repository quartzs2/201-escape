"use client";

import { createPortal } from "react-dom";

import { useIsMounted } from "@/hooks";
import { PORTAL_ROOT_ID } from "@/lib/constants/dom";

type PortalProps = {
  children: React.ReactNode;
};

export function Portal({ children }: PortalProps) {
  const mounted = useIsMounted();

  if (!mounted) {
    return null;
  }

  const portalElement = document.getElementById(PORTAL_ROOT_ID);

  if (portalElement) {
    return createPortal(children, portalElement);
  }

  return createPortal(children, document.body);
}
