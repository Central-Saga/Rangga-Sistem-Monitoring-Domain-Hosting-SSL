"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError, firstMessages } from "@/lib/api";
import { TextField } from "@/components/auth/TextField";
import { ErrorAlert } from "@/components/ErrorAlert";

const demoRoles = [
  {
    key: "admin",
    label: "Admin",
    email: "admin@example.com",
    icon: "🛡️",
    access: "Semua menu, kelola Pengguna, unduh laporan",
  },
  {
    key: "staff",
    label: "Staff",
    email: "staff@example.com",
    icon: "🧰",
    access: "Klien, Proyek, Aset, Notifikasi, laporan",
  },
  {
    key: "client",
    label: "Client",
    email: "client@example.com",
    icon: "👤",
    access: "Dashboard, Proyek & Aset miliknya saja",
  },
] as const;

export function LoginForm() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState<string>(demoRoles[0].email);
  const [password, setPassword] = useState("password");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !submitting) router.replace("/dashboard");
  }, [loading, user, submitting, router]);

  async function doLogin(mail: string, pass: string) {
    setFormError(null);
    setErrors({});
    setSubmitting(true);
    try {
      await login(mail, pass);
    } catch (err) {
      if (err instanceof ApiError) {
        const messages = firstMessages(err.errors);
        setErrors(messages);
        if (Object.keys(messages).length === 0) setFormError(err.message);
      } else {
        setFormError("Login gagal, coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void doLogin(email, password);
  }

  function quickLogin(roleEmail: string) {
    setEmail(roleEmail);
    setPassword("password");
    void doLogin(roleEmail, "password");
  }

  return (
    <div>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Selamat datang kembali</h1>
        <p className="mt-1.5 text-sm text-soft">
          Masuk untuk memantau aset infrastruktur Anda.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-line bg-subtle p-3">
        <p className="mb-2 text-xs font-medium text-mute">
          Akun demo — masuk cepat:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {demoRoles.map((role) => (
            <button
              key={role.key}
              type="button"
              disabled={submitting}
              onClick={() => quickLogin(role.email)}
              title={role.access}
              className="flex flex-col items-center gap-1 rounded-xl border border-line bg-card px-2 py-2 text-xs font-medium text-soft transition duration-200 hover:-translate-y-0.5 hover:border-accent hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-base" aria-hidden>
                {role.icon}
              </span>
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <ErrorAlert message={formError} className="mb-5" />

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="admin@example.com"
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
        />

        <button
          type="submit"
          disabled={submitting}
          className="sheen w-full rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-3 text-sm font-semibold text-on-accent shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-pop focus:outline-none focus:ring-4 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Masuk..." : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-soft">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-accent hover:underline">
          Daftar
        </Link>
      </p>
    </div>
  );
}
