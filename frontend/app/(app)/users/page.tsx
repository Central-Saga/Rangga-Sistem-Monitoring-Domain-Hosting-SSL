"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Client, Paginated, User } from "@/types";
import { Badge } from "@/components/Badge";
import { Modal } from "@/components/Modal";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";

  const roleColor: Record<string, string> = {
    admin: "bg-info-soft text-info",
    staff: "bg-info-soft text-info",
    client: "bg-ok-soft text-ok",
  };

const emptyForm = { name: "", email: "", password: "", role: "staff", client_id: "" };

export default function UsersPage() {
  const { user: me, loading: authLoading } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get<Paginated<User>>(`/users?page=${page}`);
      setUsers(res.data);
      setMeta(res.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && me?.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
    if (me?.role === "admin") {
      load(page);
      api.get<Paginated<Client>>("/clients?per_page=100").then((res) => setClients(res.data));
    }
  }, [me, authLoading, page, load, router]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      client_id: user.client_id ? String(user.client_id) : "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload: Record<string, unknown> = {
      name: form.name,
      email: form.email,
      role: form.role,
      client_id: form.role === "client" ? Number(form.client_id) : null,
    };
    if (form.password) payload.password = form.password;
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, payload);
      } else {
        if (!form.password) {
          setError("Password wajib untuk pengguna baru.");
          setSaving(false);
          return;
        }
        payload.password = form.password;
        await api.post("/users", payload);
      }
      setModalOpen(false);
      load(page);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(user: User) {
    if (!confirm(`Hapus pengguna "${user.name}"?`)) return;
    await api.delete(`/users/${user.id}`);
    load(page);
  }

  if (authLoading || me?.role !== "admin") return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Pengguna</h1>
          <p className="text-sm text-soft">Kelola akun admin, staff, dan client.</p>
        </div>
        <button
          onClick={openCreate}
          className="sheen rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-pop"
        >
          + Tambah Pengguna
        </button>
      </div>

      <div className="animate-fade-up rounded-xl border border-line bg-card shadow-card transition duration-200 hover:shadow-pop">
        {loading ? (
          <Spinner />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-subtle text-left text-xs uppercase text-soft">
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Klien Terkait</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-line-soft transition duration-200 hover:-translate-y-px hover:bg-subtle animate-fade-up stagger-${(index % 8) + 1}`}>
                  <td className="px-6 py-3 font-medium text-ink">{user.name}</td>
                  <td className="px-6 py-3 text-soft">{user.email}</td>
                  <td className="px-6 py-3">
                    <Badge label={user.role_label} color={roleColor[user.role]} />
                  </td>
                  <td className="px-6 py-3 text-soft">
                    {user.client?.company ?? user.client?.name ?? "-"}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={() => openEdit(user)}
                      className="mr-2 rounded-lg border border-line px-3 py-1 text-xs text-soft transition duration-200 hover:-translate-y-px hover:bg-subtle hover:text-ink"
                    >
                      Edit
                    </button>
                    {user.id !== me.id && (
                      <button
                        onClick={() => onDelete(user)}
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
        )}
        <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
      </div>

      <Modal open={modalOpen} title={editing ? "Edit Pengguna" : "Tambah Pengguna"} onClose={() => setModalOpen(false)}>
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
            <label className="mb-1 block text-sm font-medium text-ink">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Password {editing ? "(kosongkan jika tidak diubah)" : "*"}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none placeholder:text-mute"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="client">Client</option>
            </select>
          </div>
          {form.role === "client" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Klien Terkait *</label>
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
          )}
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
