"use client";

import Link from "next/link";
import { FormEvent, use, useCallback, useEffect, useState } from "react";
import { api, ApiError, downloadPdf } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Asset } from "@/types";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { Spinner } from "@/components/Spinner";
import { assetTypeColor, expiryColor, expiryText, formatDate, formatRupiah, statusColor } from "@/lib/format";

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const canManage = user?.role !== "client";

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ new_expired_date: "", cost: "", invoice_number: "", payment_method: "transfer", status: "paid", notes: "" });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Asset }>(`/assets/${id}`);
      setAsset(res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function openRenew() {
    if (!asset) return;
    const base = new Date(asset.expired_date);
    base.setFullYear(base.getFullYear() + 1);
    setForm({
      new_expired_date: base.toISOString().slice(0, 10),
      cost: String(parseFloat(asset.renewal_cost)),
      invoice_number: "",
      payment_method: "transfer",
      status: "paid",
      notes: "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmitRenewal(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post(`/assets/${id}/renewals`, {
        ...form,
        cost: Number(form.cost || 0),
      });
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal mencatat perpanjangan.");
    } finally {
      setSaving(false);
    }
  }

  async function downloadInvoice(renewalId: number) {
    await downloadPdf(`/renewals/${renewalId}/invoice/pdf`, `invoice-perpanjangan-${renewalId}.pdf`);
  }

  if (loading) return <Spinner label="Memuat aset..." />;
  if (notFound || !asset) {
    return (
      <div className="py-16 text-center text-soft">
        Aset tidak ditemukan. <Link href="/assets" className="text-accent hover:underline">Kembali</Link>
      </div>
    );
  }

  const infoRows: [string, React.ReactNode][] = [
    ["Proyek", asset.project?.name ?? "-"],
    ["Klien", asset.project?.client?.company ?? asset.project?.client?.name ?? "-"],
    ["Provider", asset.provider ?? "-"],
    ["Siklus Tagihan", asset.billing_cycle_label],
    ["Tanggal Mulai", formatDate(asset.start_date)],
    ["Auto-renew", asset.auto_renew ? "Ya" : "Tidak"],
    ["Biaya Perpanjangan", formatRupiah(asset.renewal_cost)],
    ["Catatan", asset.notes ?? "-"],
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-3 text-sm text-soft">
        <Link href="/assets" className="transition duration-200 hover:text-accent">← Aset</Link>
        <span>/</span>
        <span className="text-ink">{asset.name}</span>
      </div>

      {/* Header kartu */}
      <div className="animate-fade-up rounded-xl bg-card p-6 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-ink">{asset.name}</h1>
              <Badge label={asset.type_label} color={assetTypeColor[asset.type]} />
              <Badge label={asset.status_label} color={statusColor[asset.status]} />
            </div>
            <p className="mt-2 text-soft">
              Kedaluwarsa: <span className="font-medium text-ink">{formatDate(asset.expired_date)}</span>{" "}
              <Badge label={expiryText(asset.days_until_expiry)} color={expiryColor(asset.days_until_expiry, asset.status)} />
            </p>
          </div>
          {canManage && (
            <button
              onClick={openRenew}
              className="rounded-lg bg-ok px-4 py-2 text-sm font-semibold text-on-accent transition duration-200 hover:opacity-90"
            >
              ↻ Catat Perpanjangan
            </button>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 border-t border-line-soft pt-6 text-sm md:grid-cols-4">
          {infoRows.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase text-mute">{label}</dt>
              <dd className="mt-0.5 text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {asset.metadata && Object.keys(asset.metadata).length > 0 && (
          <div className="mt-6 border-t border-line-soft pt-4">
            <p className="mb-2 text-xs uppercase text-mute">Detail Teknis</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(asset.metadata).map(([key, value]) => (
                <span key={key} className="rounded-lg bg-subtle px-3 py-1 text-xs text-soft">
                  <span className="font-medium">{key}:</span>{" "}
                  {Array.isArray(value) ? value.join(", ") : String(value)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Riwayat perpanjangan */}
      <div className="animate-fade-up rounded-xl bg-card shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-semibold text-ink">Riwayat Perpanjangan</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-subtle text-left text-xs uppercase text-soft">
              <th className="px-6 py-3">Tanggal Bayar</th>
              <th className="px-6 py-3">Masa Aktif Lama → Baru</th>
              <th className="px-6 py-3">Biaya</th>
              <th className="px-6 py-3">Invoice</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Dicatat oleh</th>
              {canManage && <th className="px-6 py-3"></th>}
            </tr>
          </thead>
          <tbody>
            {(asset.renewals ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-mute">
                  Belum ada riwayat perpanjangan.
                </td>
              </tr>
            )}
            {(asset.renewals ?? []).map((renewal) => (
              <tr key={renewal.id} className="border-b border-line-soft transition duration-200 hover:bg-subtle">
                <td className="px-6 py-3 text-soft">{formatDate(renewal.renewal_date)}</td>
                <td className="px-6 py-3 text-soft">
                  {formatDate(renewal.previous_expired_date)} → <span className="font-medium">{formatDate(renewal.new_expired_date)}</span>
                </td>
                <td className="px-6 py-3 text-soft">{formatRupiah(renewal.cost)}</td>
                <td className="px-6 py-3 text-soft">{renewal.invoice_number ?? "-"}</td>
                <td className="px-6 py-3">
                  <Badge label={renewal.status_label} color={statusColor[renewal.status]} />
                </td>
                <td className="px-6 py-3 text-soft">{renewal.renewed_by_name ?? "-"}</td>
                {canManage && (
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => downloadInvoice(renewal.id)}
                      className="rounded-lg border border-line px-3 py-1 text-xs text-soft transition duration-200 hover:bg-subtle"
                    >
                      ⬇ PDF
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal perpanjangan */}
      <Modal open={modalOpen} title={`Perpanjang ${asset.name}`} onClose={() => setModalOpen(false)}>
        {error && <div className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <form onSubmit={onSubmitRenewal} className="space-y-3">
          <div className="rounded-lg bg-warn-soft px-3 py-2 text-sm text-warn">
            Masa aktif saat ini: <strong>{formatDate(asset.expired_date)}</strong>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Tanggal Kedaluwarsa Baru *</label>
            <input
              type="date"
              required
              value={form.new_expired_date}
              onChange={(e) => setForm({ ...form, new_expired_date: e.target.value })}
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Biaya (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Metode Bayar</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              >
                <option value="transfer">Transfer Bank</option>
                <option value="qris">QRIS</option>
                <option value="kartu_kredit">Kartu Kredit</option>
                <option value="lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">No. Invoice</label>
              <input
                value={form.invoice_number}
                onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              >
                <option value="paid">Lunas</option>
                <option value="pending">Menunggu Pembayaran</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-ok py-2 text-sm font-semibold text-on-accent transition duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan Perpanjangan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
