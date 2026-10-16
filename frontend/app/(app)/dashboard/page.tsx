"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, downloadPdf } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Asset, DashboardSummary } from "@/types";
import { Badge } from "@/components/Badge";
import { Spinner } from "@/components/Spinner";
import { assetTypeColor, expiryColor, expiryText, formatDate, formatRupiah, statusColor } from "@/lib/format";

const typeOrder = ["domain", "hosting", "ssl", "vps"] as const;
const typeChartColor: Record<string, string> = {
  domain: "var(--accent)",
  hosting: "var(--accent-2)",
  ssl: "var(--info)",
  vps: "var(--ok)",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [countdown, setCountdown] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ summary: DashboardSummary; countdown: { data: Asset[] } | Asset[] }>("/dashboard/summary")
      .then((res) => {
        setSummary(res.summary);
        setCountdown(Array.isArray(res.countdown) ? res.countdown : res.countdown.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) return <Spinner label="Memuat dashboard..." />;

  const cards = [
    {
      label: "Total Aset",
      value: summary.assets_total,
      icon: "🖥️",
      tile: "from-accent to-accent-2",
    },
    {
      label: "Kedaluwarsa ≤ 30 hari",
      value: summary.expiring_in_30_days,
      icon: "⚠️",
      tile: "from-info to-accent-2",
    },
    {
      label: "Kedaluwarsa ≤ 7 hari",
      value: summary.expiring_in_7_days,
      icon: "🔥",
      tile: "from-warn to-danger",
    },
    {
      label: "Sudah Expired",
      value: summary.expired,
      icon: "⛔",
      tile: "from-danger to-accent",
    },
  ];

  const typeCounts = typeOrder.map((type) => ({
    type,
    label: type.toUpperCase(),
    value: summary.assets_by_type[type] ?? 0,
    color: typeChartColor[type],
  }));
  const typeTotal = typeCounts.reduce((sum, item) => sum + item.value, 0);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;
  const segments = typeCounts.map((item) => {
    const fraction = typeTotal > 0 ? item.value / typeTotal : 0;
    const length = fraction * circumference;
    const segment = { ...item, length, offset: cursor, fraction };
    cursor += length;
    return segment;
  });

  const health = [
    { label: "Aman", value: Math.max(summary.assets_total - summary.expiring_in_30_days - summary.expired, 0), color: "bg-ok" },
    { label: "≤ 30 hari", value: Math.max(summary.expiring_in_30_days - summary.expiring_in_7_days, 0), color: "bg-info" },
    { label: "≤ 7 hari", value: summary.expiring_in_7_days, color: "bg-warn" },
    { label: "Expired", value: summary.expired, color: "bg-danger" },
  ];
  const healthTotal = health.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="animate-fade-up space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="text-sm text-soft">
            Selamat datang, {user?.name} — pantau masa aktif aset infrastruktur.
          </p>
        </div>
        {user?.role !== "client" && (
          <button
            type="button"
            onClick={() => downloadPdf("/reports/expiring-assets/pdf?days=30", "laporan-aset-kedaluwarsa-30-hari.pdf")}
            className="sheen rounded-xl border border-line bg-card px-4 py-2 text-sm font-medium text-ink shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-subtle"
          >
            ⬇ Unduh Laporan PDF
          </button>
        )}
      </div>

      {/* Kartu statistik */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={`animate-fade-up stagger-${(index % 8) + 1} flex items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-pop`}
          >
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tile} text-2xl shadow-lg shadow-accent/25 sheen`}>
              {card.icon}
            </span>
            <div className="min-w-0">
              <p className="text-3xl font-bold tracking-tight text-ink">{card.value}</p>
              <p className="truncate text-sm text-soft">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grafik lingkaran */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="animate-fade-up rounded-2xl border border-line bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="font-semibold text-ink">Aset per Tipe</h2>
          <p className="text-xs text-mute">Distribusi {typeTotal} aset terdaftar</p>

          <div className="mt-4 flex items-center gap-6">
            <div className="relative shrink-0">
              <svg viewBox="0 0 140 140" className="h-36 w-36 -rotate-90">
                <circle cx="70" cy="70" r={radius} fill="none" stroke="var(--line)" strokeWidth="14" />
                {segments.map((segment) =>
                  segment.length > 0 ? (
                    <circle
                      key={segment.type}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={segment.color}
                      strokeWidth="14"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.max(segment.length - 2, 0)} ${circumference}`}
                      strokeDashoffset={-segment.offset}
                    />
                  ) : null,
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-ink">{typeTotal}</span>
                <span className="text-[11px] text-mute">total</span>
              </div>
            </div>

            <ul className="flex-1 space-y-2">
              {typeCounts.map((item) => (
                <li key={item.type} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
                  <span className="flex-1 text-soft">{item.label}</span>
                  <span className="font-semibold text-ink">{item.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="animate-fade-up rounded-2xl border border-line bg-card p-6 shadow-card stagger-1 lg:col-span-3">
          <h2 className="font-semibold text-ink">Kesehatan Aset</h2>
          <p className="text-xs text-mute">Status masa berlaku seluruh aset</p>

          <div className="mt-5 flex h-3.5 w-full overflow-hidden rounded-full bg-subtle">
            {health.map((item) =>
              item.value > 0 ? (
                <div
                  key={item.label}
                  className={`${item.color} h-full transition-all duration-500`}
                  style={{ width: `${healthTotal > 0 ? (item.value / healthTotal) * 100 : 0}%` }}
                />
              ) : null,
            )}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {health.map((item) => (
              <div key={item.label} className="rounded-xl border border-line-soft bg-subtle px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <p className="text-2xl font-bold text-ink">{item.value}</p>
                </div>
                <p className="mt-1 text-xs text-soft">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabel countdown */}
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="flex items-center gap-2.5 font-semibold text-ink">
            <span className="animate-pulse-dot h-2 w-2 rounded-full bg-danger" />
            Countdown Kedaluwarsa (≤ 30 hari)
          </h2>
          <Link href="/assets" className="text-sm font-medium text-accent transition hover:text-info hover:underline">
            Lihat semua aset →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle text-left text-xs uppercase text-soft">
                <th className="px-6 py-3">Aset</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Proyek / Klien</th>
                <th className="px-6 py-3">Kedaluwarsa</th>
                <th className="px-6 py-3">Countdown</th>
                <th className="px-6 py-3">Biaya Perpanjangan</th>
              </tr>
            </thead>
            <tbody>
              {countdown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-mute">
                    🎉 Tidak ada aset yang akan kedaluwarsa dalam 30 hari.
                  </td>
                </tr>
              )}
              {countdown.map((asset, index) => (
                <tr
                  key={asset.id}
                  className={`animate-fade-up stagger-${(index % 8) + 1} border-b border-line-soft transition duration-200 hover:-translate-y-px hover:bg-subtle`}
                >
                  <td className="px-6 py-3">
                    <Link href={`/assets/${asset.id}`} className="font-medium text-accent hover:underline">
                      {asset.name}
                    </Link>
                    {asset.status === "expired" && (
                      <span className="ml-2"><Badge label="Expired" color={statusColor.expired} /></span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <Badge label={asset.type_label} color={assetTypeColor[asset.type]} />
                  </td>
                  <td className="px-6 py-3 text-soft">
                    {asset.project?.name}
                    <span className="block text-xs text-mute">
                      {asset.project?.client?.company ?? asset.project?.client?.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-soft">{formatDate(asset.expired_date)}</td>
                  <td className="px-6 py-3">
                    <Badge
                      label={expiryText(asset.days_until_expiry)}
                      color={expiryColor(asset.days_until_expiry, asset.status)}
                    />
                  </td>
                  <td className="px-6 py-3 text-soft">{formatRupiah(asset.renewal_cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}