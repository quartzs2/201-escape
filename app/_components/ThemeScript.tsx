import { THEME_STORAGE_KEY } from "@/lib/constants/theme";

const themeScript = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : systemPrefersDark
          ? "dark"
          : "light";

      document.documentElement.dataset.theme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
