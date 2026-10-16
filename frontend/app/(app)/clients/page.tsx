"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ErrorAlert } from "@/components/ErrorAlert";
import type { Client, Paginated } from "@/types";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";

const emptyForm = { name: "", company: "", email: "", phone: "", address: "" };

export default function ClientsPage() {
  const { user } = useAuth();
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.get<Paginated<Client>>(
        `/clients?page=${page}&search=${encodeURIComponent(search)}`
      );
      setClients(res.data);
      setMeta(res.meta);
    } catch (err) {
      setLoadError(errorMessage(err, "Gagal memuat klien."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search);
  }, [page, load]); // eslint-disable-line react-hooks/exhaustive-deps

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({
      name: client.name,
      company: client.company ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await api.put(`/clients/${editing.id}`, form);
      } else {
        await api.post("/clients", form);
      }
      setModalOpen(false);
      load(page, search);
    } catch (err) {
      setError(errorMessage(err, "Gagal menyimpan."));
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(client: Client) {
    if (!confirm(`Hapus klien "${client.name}"? Proyek terkait ikut terhapus.`)) return;
    try {
      await api.delete(`/clients/${client.id}`);
      load(page, search);
    } catch (err) {
      setLoadError(errorMessage(err, "Gagal menghapus klien."));
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Klien</h1>
          <p className="text-sm text-soft">Kelola data klien pemilik proyek.</p>
        </div>
        <button
          onClick={openCreate}
          className="sheen rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-pop"
        >
          + Tambah Klien
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          load(1, search);
        }}
        className="flex w-full gap-2 sm:w-auto"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama / perusahaan..."
          className="min-w-0 flex-1 rounded-lg border border-line sm:w-80 px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
        />
        <button className="rounded-lg border border-line px-4 py-2 text-sm text-soft transition duration-200 hover:-translate-y-px hover:bg-subtle hover:text-ink">
          Cari
        </button>
      </form>

      <ErrorAlert message={loadError} />
      <div className="animate-fade-up rounded-xl border border-line bg-card shadow-card transition duration-200 hover:shadow-pop">
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto" role="region" aria-label="Daftar klien" tabIndex={0}>
          <table className="min-w-[650px] w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle text-left text-xs uppercase text-soft">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Perusahaan</th>
                <th className="px-6 py-3">Kontak</th>
                <th className="px-6 py-3">Proyek</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-mute">
                    Belum ada klien.
                  </td>
                </tr>
              )}
              {clients.map((client, index) => (
                <tr key={client.id} className={`border-b border-line-soft transition duration-200 hover:-translate-y-px hover:bg-subtle animate-fade-up stagger-${(index % 8) + 1}`}>
                  <td className="px-6 py-3 font-medium text-ink">{client.name}</td>
                  <td className="px-6 py-3 text-soft">{client.company ?? "-"}</td>
                  <td className="px-6 py-3 text-soft">
                    {client.email ?? "-"}
                    <span className="block text-xs text-mute">{client.phone}</span>
                  </td>
                  <td className="px-6 py-3 text-soft">{client.projects_count ?? 0} proyek</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(client)}
                      className="mr-2 rounded-lg border border-line px-3 py-1 text-xs text-soft transition duration-200 hover:-translate-y-px hover:bg-subtle hover:text-ink"
                    >
                      Edit
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => onDelete(client)}
                        className="rounded-lg border border-danger-line px-3 py-1 text-xs text-danger transition duration-200 hover:-translate-y-px hover:bg-danger-soft"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
        <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Klien" : "Tambah Klien"} onClose={() => setModalOpen(false)}>
        {error && <div className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nama *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Perusahaan</label>
            <input
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Telepon</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Alamat</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
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
