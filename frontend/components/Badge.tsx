import type { FC } from "react";

type BadgeProps = {
  label: string;
  color?: string;
  className?: string;
};

/**
 * Small pill/badge. `color` accepts a set of Tailwind classes so callers can
 * pass the helpers from `lib/format.ts` (e.g. `bg-danger-soft text-danger`).
 */
export const Badge: FC<BadgeProps> = ({
  label,
  color = "bg-accent-soft text-accent",
  className,
}) => {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ${color} ${className ?? ""}`}
    >
      {label}
    </span>
  );
};
