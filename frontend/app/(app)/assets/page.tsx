"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { ErrorAlert } from "@/components/ErrorAlert";
import { useAuth } from "@/lib/auth";
import type { Asset, Paginated, Project } from "@/types";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import { assetTypeColor, expiryColor, expiryText, formatDate, formatRupiah, statusColor } from "@/lib/format";

const typeTabs = [
  { value: "", label: "Semua" },
  { value: "domain", label: "Domain" },
  { value: "hosting", label: "Hosting" },
  { value: "ssl", label: "SSL" },
  { value: "vps", label: "VPS" },
];

const expiryFilters = [
  { value: "", label: "Semua waktu" },
  { value: "7", label: "≤ 7 hari" },
  { value: "30", label: "≤ 30 hari" },
];

const emptyForm = {
  project_id: "",
  type: "domain",
  name: "",
  provider: "",
  renewal_cost: "",
  billing_cycle: "yearly",
  start_date: "",
  expired_date: "",
  auto_renew: false,
  notes: "",
};

export default function AssetsPage() {
  const { user } = useAuth();
  const canManage = user?.role !== "client";

  const [assets, setAssets] = useState<Asset[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [page, setPage] = useState(1);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [expiringIn, setExpiringIn] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(
    async (page = 1) => {
      setLoading(true);
      setLoadError(null);
      const params = new URLSearchParams({ page: String(page) });
      if (type) params.set("type", type);
      if (status) params.set("status", status);
      if (expiringIn) params.set("expiring_in", expiringIn);
      if (search) params.set("search", search);
      try {
        const res = await api.get<Paginated<Asset>>(`/assets?${params}`);
        setAssets(res.data);
        setMeta(res.meta);
      } catch (err) {
        setLoadError(errorMessage(err, "Gagal memuat aset."));
      } finally {
        setLoading(false);
      }
    },
    [type, status, expiringIn, search]
  );

  useEffect(() => {
    setPage(1);
    load(1);
  }, [type, status, expiringIn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    load(page);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!canManage) return;
    api.get<Paginated<Project>>("/projects?per_page=100")
      .then((res) => setProjects(res.data))
      .catch((err) => setLoadError(errorMessage(err, "Gagal memuat daftar proyek.")));
  }, [canManage]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(asset: Asset) {
    setEditing(asset);
    setForm({
      project_id: String(asset.project_id),
      type: asset.type,
      name: asset.name,
      provider: asset.provider ?? "",
      renewal_cost: String(parseFloat(asset.renewal_cost)),
      billing_cycle: asset.billing_cycle,
      start_date: asset.start_date ?? "",
      expired_date: asset.expired_date,
      auto_renew: asset.auto_renew,
      notes: asset.notes ?? "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      project_id: Number(form.project_id),
      renewal_cost: Number(form.renewal_cost || 0),
      start_date: form.start_date || null,
    };
    try {
      if (editing) {
        await api.put(`/assets/${editing.id}`, payload);
      } else {
        await api.post("/assets", payload);
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      setError(errorMessage(err, "Gagal menyimpan."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(asset: Asset) {
    if (!confirm(`Hapus aset "${asset.name}"?`)) return;
    try {
      await api.delete(`/assets/${asset.id}`);
      load(page);
    } catch (err) {
      setLoadError(errorMessage(err, "Gagal menghapus aset."));
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Aset Infrastruktur</h1>
          <p className="text-sm text-soft">Domain, hosting, SSL, dan VPS seluruh proyek.</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="sheen rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition duration-200 hover:bg-accent-hover"
          >
            + Tambah Aset
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex max-w-full overflow-x-auto rounded-lg border border-line">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setType(tab.value)}
              className={`shrink-0 px-4 py-2 text-sm transition duration-200 ${
                type === tab.value ? "bg-accent font-semibold text-on-accent" : "bg-card text-soft hover:bg-subtle"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
        >
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="expired">Expired</option>
          <option value="suspended">Ditangguhkan</option>
        </select>
        <select
          value={expiringIn}
          onChange={(e) => setExpiringIn(e.target.value)}
          className="rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
        >
          {expiryFilters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load(1);
          }}
          className="flex w-full min-w-0 gap-2 sm:w-auto"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama / provider..."
            className="min-w-0 flex-1 rounded-lg border border-line bg-card text-ink sm:w-56 px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
          />
          <button className="rounded-lg border border-line px-4 py-2 text-sm text-soft transition duration-200 hover:bg-subtle">Cari</button>
        </form>
      </div>

      <ErrorAlert message={loadError} />
      <div className="animate-fade-up rounded-xl bg-card shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto" role="region" aria-label="Daftar aset" tabIndex={0}>
          <table className="min-w-[1050px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle text-left text-xs uppercase text-soft">
                <th className="px-6 py-3">Aset</th>
                <th className="px-6 py-3">Tipe</th>
                <th className="px-6 py-3">Proyek</th>
                <th className="px-6 py-3">Provider</th>
                <th className="px-6 py-3">Kedaluwarsa</th>
                <th className="px-6 py-3">Countdown</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Biaya</th>
                {canManage && <th className="px-6 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-10 text-center text-mute">
                    Tidak ada aset yang cocok dengan filter.
                  </td>
                </tr>
              )}
              {assets.map((asset) => (
                <tr key={asset.id} className="border-b border-line-soft transition duration-200 hover:bg-subtle">
                  <td className="px-6 py-3">
                    <Link href={`/assets/${asset.id}`} className="font-medium text-accent hover:underline">
                      {asset.name}
                    </Link>
                    {asset.auto_renew && <span className="ml-1 text-xs text-ok">↻ auto</span>}
                  </td>
                  <td className="px-6 py-3">
                    <Badge label={asset.type_label} color={assetTypeColor[asset.type]} />
                  </td>
                  <td className="px-6 py-3 text-soft">{asset.project?.name ?? "-"}</td>
                  <td className="px-6 py-3 text-soft">{asset.provider ?? "-"}</td>
                  <td className="px-6 py-3 text-soft">{formatDate(asset.expired_date)}</td>
                  <td className="px-6 py-3">
                    <Badge label={expiryText(asset.days_until_expiry)} color={expiryColor(asset.days_until_expiry, asset.status)} />
                  </td>
                  <td className="px-6 py-3">
                    <Badge label={asset.status_label} color={statusColor[asset.status]} />
                  </td>
                  <td className="px-6 py-3 text-soft">{formatRupiah(asset.renewal_cost)}</td>
                  {canManage && (
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => openEdit(asset)}
                        className="mr-2 rounded-lg border border-line px-3 py-1 text-xs text-soft transition duration-200 hover:bg-subtle"
                      >
                        Edit
                      </button>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => onDelete(asset)}
                          className="rounded-lg border border-danger-line px-3 py-1 text-xs text-danger transition duration-200 hover:bg-danger-soft"
                        >
                          Hapus
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Aset" : "Tambah Aset"} onClose={() => setModalOpen(false)}>
        {error && <div className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Proyek *</label>
              <select
                required
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              >
                <option value="">— Pilih proyek —</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Tipe *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              >
                <option value="domain">Domain</option>
                <option value="hosting">Hosting</option>
                <option value="ssl">SSL</option>
                <option value="vps">VPS</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nama Aset *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="misal: example.com"
              className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Provider</label>
              <input
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Biaya Perpanjangan (Rp)</label>
              <input
                type="number"
                min="0"
                value={form.renewal_cost}
                onChange={(e) => setForm({ ...form, renewal_cost: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Siklus Tagihan</label>
              <select
                value={form.billing_cycle}
                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              >
                <option value="monthly">Bulanan</option>
                <option value="yearly">Tahunan</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Tgl Mulai</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Kedaluwarsa *</label>
              <input
                type="date"
                required
                value={form.expired_date}
                onChange={(e) => setForm({ ...form, expired_date: e.target.value })}
                className="w-full rounded-lg border border-line bg-card px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={form.auto_renew}
              onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })}
              className="h-4 w-4 rounded border-line bg-card"
            />
            Perpanjang otomatis (auto-renew)
          </label>
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
            className="sheen w-full rounded-lg bg-accent py-2 text-sm font-semibold text-on-accent transition duration-200 hover:bg-accent-hover disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
