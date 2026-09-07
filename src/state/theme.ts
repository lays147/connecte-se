const STORAGE_KEY = "color-theme";

export type ThemeChoice = "light" | "dark";

const listeners = new Set<(theme: ThemeChoice) => void>();

export function getStoredTheme(): ThemeChoice | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "light" || value === "dark" ? value : null;
}

function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveTheme(): ThemeChoice {
  return getStoredTheme() ?? (systemPrefersDark() ? "dark" : "light");
}

export function applyTheme(theme: ThemeChoice): void {
  document.documentElement.setAttribute("data-theme", theme);
  for (const listener of listeners) listener(theme);
}

export function setStoredTheme(theme: ThemeChoice): void {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
}

export function onThemeChange(listener: (theme: ThemeChoice) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initTheme(): void {
  applyTheme(resolveTheme());

  if (getStoredTheme() === null) {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (getStoredTheme() === null) applyTheme(e.matches ? "dark" : "light");
    });
  }
}
