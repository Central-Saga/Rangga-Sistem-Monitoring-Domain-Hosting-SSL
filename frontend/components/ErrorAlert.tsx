import type { FC } from "react";

export const ErrorAlert: FC<{ message: string | null; className?: string }> = ({
  message,
  className,
}) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger ${className ?? ""}`}
    >
      <span aria-hidden>⚠</span>
      <span>{message}</span>
    </div>
  );
};
