"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle({
  variant = "solid",
  className,
}: {
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const styles =
    variant === "ghost"
      ? "border-line bg-transparent text-soft hover:bg-subtle hover:text-ink"
      : "border-line bg-card text-ink hover:bg-subtle";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Aktifkan mode terang" : "Aktifkan mode gelap"}
      title={isDark ? "Mode terang" : "Mode gelap"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition duration-200 ${styles} ${className ?? ""}`}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M12 2.5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V3.5a1 1 0 0 1 1-1Zm0 15a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 2a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1Zm9.5-7.5a1 1 0 0 1-1 1H19a1 1 0 1 1 0-2h1.5a1 1 0 0 1 1 1ZM6 12a1 1 0 0 1-1 1H3.5a1 1 0 1 1 0-2H5a1 1 0 0 1 1 1Zm12.02-6.52a1 1 0 0 1 0 1.42l-1.06 1.06a1 1 0 0 1-1.42-1.42l1.06-1.06a1 1 0 0 1 1.42 0ZM8.46 15.54a1 1 0 0 1 0 1.41l-1.06 1.06a1 1 0 0 1-1.42-1.41l1.06-1.06a1 1 0 0 1 1.42 0Zm9.08 2.47a1 1 0 0 1-1.42 1.42l-1.06-1.06a1 1 0 0 1 1.42-1.42l1.06 1.06ZM8.46 8.46 7.4 9.52A1 1 0 0 1 5.98 8.1l1.06-1.06A1 1 0 0 1 8.46 8.46Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
          <path d="M21.64 13a1 1 0 0 0-1.05-.21 7.5 7.5 0 0 1-9.38-9.38 1 1 0 0 0-1.26-1.26 9.5 9.5 0 1 0 11.9 11.9 1 1 0 0 0-.21-1.05Z" />
        </svg>
      )}
    </button>
  );
}
