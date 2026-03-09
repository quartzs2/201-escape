import type { Route } from "next";

export const ROUTES = {
  AUTH: {
    CALLBACK: "/auth/callback",
    ERROR: "/auth/auth-code-error",
  },
  HOME: "/",
  LOGIN: "/login",
} as const satisfies Record<string, Record<string, Route | string> | string>;
