"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { ApiError, firstMessages } from "@/lib/api";
import { TextField } from "@/components/auth/TextField";
import { ErrorAlert } from "@/components/ErrorAlert";

export function RegisterForm() {
  const { user, loading, register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !submitting) router.replace("/dashboard");
  }, [loading, user, submitting, router]);

  async function doRegister() {
    setFormError(null);
    setErrors({});
    setSubmitting(true);
    try {
      await register({ name, email, password, passwordConfirmation });
    } catch (err) {
      if (err instanceof ApiError) {
        const messages = firstMessages(err.errors);
        setErrors(messages);
        if (Object.keys(messages).length === 0) setFormError(err.message);
      } else {
        setFormError("Registrasi gagal, coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void doRegister();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">Buat akun baru</h1>
      <p className="mt-1.5 text-sm text-soft">
        Daftar untuk memulai memantau aset infrastruktur Anda.
      </p>

      <ErrorAlert message={formError} className="mt-5" />

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <TextField
          label="Nama lengkap"
          required
          value={name}
          onChange={setName}
          placeholder="John Doe"
          autoComplete="name"
          error={errors.name}
        />
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="contoh@example.com"
          error={errors.email}
        />
        <TextField
          label="Password"
          type="password"
          required
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          error={errors.password}
        />
        <TextField
          label="Konfirmasi password"
          type="password"
          required
          value={passwordConfirmation}
          onChange={setPasswordConfirmation}
          autoComplete="new-password"
          placeholder="Ulangi password"
          error={errors.password_confirmation}
        />

        <button
          type="submit"
          disabled={submitting}
          className="sheen w-full rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-3 text-sm font-semibold text-on-accent shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-pop focus:outline-none focus:ring-4 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Mendaftar..." : "Daftar sekarang"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-soft">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
