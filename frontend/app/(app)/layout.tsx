"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { Spinner } from "@/components/Spinner";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", roles: ["admin", "staff", "client"] },
  { href: "/clients", label: "Klien", icon: "🏢", roles: ["admin", "staff"] },
  { href: "/projects", label: "Proyek", icon: "📁", roles: ["admin", "staff", "client"] },
  { href: "/assets", label: "Aset Infra", icon: "🖥️", roles: ["admin", "staff", "client"] },
  { href: "/notifications", label: "Notifikasi", icon: "🔔", roles: ["admin", "staff"] },
  { href: "/users", label: "Pengguna", icon: "👥", roles: ["admin"] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!user || user.role === "client") return;
    api
      .get<{ unread_count: number }>("/notifications?per_page=1")
      .then((res) => setUnread(res.unread_count))
      .catch(() => {});
  }, [user, pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen md:flex">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-rail px-4 text-white md:hidden">
        <span className="flex items-center gap-2 font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm text-on-accent shadow-lg shadow-accent/40">
            ⏱
          </span>
          Monitoring Infra
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="app-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-rail-line px-3 py-1.5 text-sm text-rail-soft transition hover:bg-rail-hover hover:text-rail-ink"
          >
            {menuOpen ? "Tutup" : "Menu"}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        id="app-navigation"
        className={`${
          menuOpen ? "flex" : "hidden"
        } fixed inset-x-0 top-14 bottom-0 z-40 flex-col bg-rail text-rail-ink md:inset-y-0 md:right-auto md:top-0 md:flex md:w-64 animate-fade-in`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-rail-line px-6">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-lg text-on-accent shadow-lg shadow-accent/40 sheen">
            ⏱
          </span>
          <div>
            <p className="text-sm font-bold text-white">Monitoring Infra</p>
            <p className="text-[11px] text-rail-mute">Domain · Hosting · SSL · VPS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition duration-200 ${
                  active
                    ? "bg-gradient-to-r from-accent to-accent-2 font-semibold text-on-accent shadow-lg shadow-accent/30"
                    : "text-rail-soft hover:-translate-y-px hover:bg-rail-hover hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
                {item.href === "/notifications" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-on-accent">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-rail-line p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{user.name}</p>
              <p className="truncate text-xs text-rail-mute">{user.role_label}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={logout}
            className="w-full rounded-xl border border-rail-line bg-rail-hover py-2 text-sm text-rail-soft transition hover:-translate-y-px hover:border-rail-soft/50 hover:text-white"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten */}
      <main className="min-w-0 flex-1 p-4 sm:p-6 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
