import type { Route } from "next";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  AUTH: {
    CALLBACK: "/auth/callback",
    ERROR: "/auth/auth-code-error",
  },
} as const satisfies Record<string, string | Record<string, string | Route>>;
