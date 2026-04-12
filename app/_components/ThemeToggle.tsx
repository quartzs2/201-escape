"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button/Button";
import { type Theme, THEME_STORAGE_KEY } from "@/lib/constants/theme";

const DEFAULT_THEME: Theme = "light";

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToThemeChange,
    readThemeFromDocument,
    getServerThemeSnapshot,
  );
  const isDark = theme === "dark";

  const handleToggleTheme = () => {
    const nextTheme = getNextTheme(theme);

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    window.dispatchEvent(new CustomEvent("theme-change"));
  };

  return (
    <Button
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      onClick={handleToggleTheme}
      size="icon"
      title={isDark ? "라이트 모드" : "다크 모드"}
      variant="ghost"
    >
      {isDark ? (
        <SunIcon aria-hidden="true" />
      ) : (
        <MoonIcon aria-hidden="true" />
      )}
    </Button>
  );
}

function getNextTheme(theme: Theme) {
  if (theme === "light") {
    return "dark";
  }

  return "light";
}

function getServerThemeSnapshot(): Theme {
  return DEFAULT_THEME;
}

function readThemeFromDocument(): Theme {
  const theme = document.documentElement.dataset.theme;

  if (theme === "dark") {
    return "dark";
  }

  return DEFAULT_THEME;
}

function subscribeToThemeChange(onStoreChange: () => void) {
  window.addEventListener("theme-change", onStoreChange);

  return () => {
    window.removeEventListener("theme-change", onStoreChange);
  };
}
