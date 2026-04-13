import { THEME_DATA_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/constants/theme";

const themeScript = `
  (() => {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    try {
      const storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
      let theme;
      if (storedTheme === "light" || storedTheme === "dark") {
        theme = storedTheme;
      } else {
        theme = systemTheme;
      }
      document.documentElement.dataset["${THEME_DATA_ATTRIBUTE}"] = theme;
    } catch {
      document.documentElement.dataset["${THEME_DATA_ATTRIBUTE}"] = systemTheme;
    }
  })();
`;

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: themeScript }}
      suppressHydrationWarning
    />
  );
}
