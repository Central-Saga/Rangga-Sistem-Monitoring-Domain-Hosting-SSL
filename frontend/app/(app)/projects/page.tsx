"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Client, Paginated, Project } from "@/types";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import { formatDate, statusColor } from "@/lib/format";

const emptyForm = {
  client_id: "",
  name: "",
  description: "",
  status: "active",
  start_date: "",
  end_date: "",
};

export default function ProjectsPage() {
  const { user } = useAuth();
  const canManage = user?.role !== "client";

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get<Paginated<Project>>(`/projects?page=${page}`);
      setProjects(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  useEffect(() => {
    if (!canManage) return;
    api.get<Paginated<Client>>("/clients?per_page=100").then((res) => setClients(res.data));
  }, [canManage]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(project: Project) {
    setEditing(project);
    setForm({
      client_id: String(project.client_id),
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      start_date: project.start_date ?? "",
      end_date: project.end_date ?? "",
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
      client_id: Number(form.client_id),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    };
    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(project: Project) {
    if (!confirm(`Hapus proyek "${project.name}"? Aset terkait ikut terhapus.`)) return;
    await api.delete(`/projects/${project.id}`);
    load(page);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Proyek</h1>
          <p className="text-sm text-soft">Proyek klien beserta aset infrastrukturnya.</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="sheen rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-pop"
          >
            + Tambah Proyek
          </button>
        )}
      </div>

      <div className="animate-fade-up rounded-xl border border-line bg-card shadow-card transition duration-200 hover:shadow-pop">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle text-left text-xs uppercase text-soft">
                <th className="px-6 py-3">Proyek</th>
                {canManage && <th className="px-6 py-3">Klien</th>}
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Aset</th>
                <th className="px-6 py-3">Mulai</th>
                {canManage && <th className="px-6 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-mute">
                    Belum ada proyek.
                  </td>
                </tr>
              )}
              {projects.map((project, index) => (
                <tr key={project.id} className={`border-b border-line-soft transition duration-200 hover:-translate-y-px hover:bg-subtle animate-fade-up stagger-${(index % 8) + 1}`}>
                  <td className="px-6 py-3">
                    <p className="font-medium text-ink">{project.name}</p>
                    {project.description && (
                      <p className="max-w-xs truncate text-xs text-mute">{project.description}</p>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-6 py-3 text-soft">
                      {project.client?.company ?? project.client?.name ?? "-"}
                    </td>
                  )}
                  <td className="px-6 py-3">
                    <Badge label={project.status_label} color={statusColor[project.status]} />
                  </td>
                  <td className="px-6 py-3 text-soft">{project.assets_count ?? 0} aset</td>
                  <td className="px-6 py-3 text-soft">{formatDate(project.start_date)}</td>
                  {canManage && (
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => openEdit(project)}
                        className="mr-2 rounded-lg border border-line px-3 py-1 text-xs text-soft transition duration-200 hover:-translate-y-px hover:bg-subtle hover:text-ink"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(project)}
                        className="rounded-lg border border-danger-line px-3 py-1 text-xs text-danger transition duration-200 hover:-translate-y-px hover:bg-danger-soft"
                      >
                        Hapus
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Proyek" : "Tambah Proyek"} onClose={() => setModalOpen(false)}>
        {error && <div className="mb-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Klien *</label>
            <select
              required
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            >
              <option value="">— Pilih klien —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company ?? client.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Nama Proyek *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
              >
                <option value="active">Aktif</option>
                <option value="on_hold">Ditahan</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Mulai</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Selesai</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
              />
            </div>
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
