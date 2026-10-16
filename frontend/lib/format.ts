export function formatRupiah(value: string | number | null | undefined): string {
  const num = Number(value ?? 0);
  return "Rp " + num.toLocaleString("id-ID", { maximumFractionDigits: 0 });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function expiryText(days: number): string {
  if (days < 0) return `Lewat ${Math.abs(days)} hari`;
  if (days === 0) return "Hari ini";
  return `${days} hari lagi`;
}

export function expiryColor(days: number, status: string): string {
  if (status === "expired" || days < 0) return "bg-danger-soft text-danger";
  if (days <= 7) return "bg-danger-soft text-danger";
  if (days <= 30) return "bg-warn-soft text-warn";
  return "bg-ok-soft text-ok";
}

export const assetTypeColor: Record<string, string> = {
  domain: "bg-info-soft text-info",
  hosting: "bg-accent-soft text-accent",
  ssl: "bg-ok-soft text-ok",
  vps: "bg-warn-soft text-warn",
};

export const statusColor: Record<string, string> = {
  active: "bg-ok-soft text-ok",
  expired: "bg-danger-soft text-danger",
  suspended: "bg-subtle text-soft",
  on_hold: "bg-warn-soft text-warn",
  completed: "bg-info-soft text-info",
  paid: "bg-ok-soft text-ok",
  pending: "bg-warn-soft text-warn",
};
