"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  parseThemeMode,
  resolveIsDark,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from "./theme";

const CHANGE_EVENT = "theme-change";

function readMode(): ThemeMode {
  try {
    return parseThemeMode(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return parseThemeMode(null);
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function applyTheme(mode: ThemeMode): void {
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  document.documentElement.classList.toggle(
    "dark",
    resolveIsDark(mode, systemPrefersDark),
  );
}

export function ThemeSwitcher() {
  const mode = useSyncExternalStore(
    subscribe,
    readMode,
    () => parseThemeMode(null),
  );

  const systemPrefersDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDark = resolveIsDark(mode, systemPrefersDark);

  useEffect(() => {
    applyTheme(mode);

    if (mode !== "system") return;

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(mode);

    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [mode]);

  function toggleTheme() {
    const next: ThemeMode = isDark ? "light" : "dark";

    applyTheme(next);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Theme tetap diterapkan untuk sesi browser saat ini.
    }

    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-lg"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun aria-hidden className="size-4" />
      ) : (
        <Moon aria-hidden className="size-4" />
      )}
    </Button>
  );
}
