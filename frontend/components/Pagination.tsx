"use client";

import { FC } from "react";

export interface PaginationProps {
  page: number;
  lastPage: number;
  total?: number;
  onPage: (page: number) => void;
  className?: string;
}

export const Pagination: FC<PaginationProps> = ({
  page,
  lastPage,
  total,
  onPage,
  className,
}) => {
  if (lastPage <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  const delta = 1;

  if (lastPage <= 7) {
    for (let i = 1; i <= lastPage; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("ellipsis");

    const start = Math.max(2, page - delta);
    const end = Math.min(lastPage - 1, page + delta);
    for (let i = start; i <= end; i++) pages.push(i);

    if (page < lastPage - 2) pages.push("ellipsis");
    pages.push(lastPage);
  }

  const btn =
    "min-w-9 rounded-lg border border-line px-3 py-1.5 text-sm text-soft transition duration-200 hover:bg-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-3 ${className ?? ""}`}
    >
      <p className="text-xs text-mute">
        {typeof total === "number" ? `${total} data` : ""}
      </p>

      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Navigasi halaman">
        <button
          type="button"
          className={btn}
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
        >
          ← Sebelumnya
        </button>

        {pages.map((item, index) => {
          if (item === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="px-1 text-mute">
                …
              </span>
            );
          }

          return (
            <button
              key={item}
              type="button"
              onClick={() => onPage(item)}
              disabled={item === page}
              aria-current={item === page ? "page" : undefined}
              className={
                item === page
                  ? "min-w-9 rounded-lg border border-accent bg-accent px-3 py-1.5 text-sm font-semibold text-on-accent"
                  : btn
              }
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          className={btn}
          onClick={() => onPage(page + 1)}
          disabled={page >= lastPage}
        >
          Selanjutnya →
        </button>
      </nav>
    </div>
  );
};
