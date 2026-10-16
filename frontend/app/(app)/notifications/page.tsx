"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AppNotification } from "@/types";
import { Badge } from "@/components/Badge";
import { Pagination } from "@/components/Pagination";
import { Spinner } from "@/components/Spinner";
import { formatDate } from "@/lib/format";

const levelColor: Record<string, string> = {
    h30: "bg-warn-soft text-warn",
    h7: "bg-warn-soft text-warn",
    expired: "bg-danger-soft text-danger",
  };

const levelLabel: Record<string, string> = {
  h30: "H-30",
  h7: "H-7",
  expired: "EXPIRED",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get<{
        data: AppNotification[];
        meta: { current_page: number; last_page: number; total: number };
        unread_count: number;
      }>(`/notifications?page=${page}`);
      setNotifications(res.data);
      setMeta(res.meta);
      setUnread(res.unread_count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [page, load]);

  async function markAsRead(notification: AppNotification) {
    if (notification.read_at) return;
    await api.post(`/notifications/${notification.id}/read`);
    load(page);
  }

  async function markAll() {
    await api.post("/notifications/read-all");
    load(page);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifikasi</h1>
          <p className="text-sm text-soft">
            Alert kedaluwarsa aset. {unread > 0 ? `${unread} belum dibaca.` : "Semua sudah dibaca."}
          </p>
        </div>
        {unread > 0 && (
          <button
            onClick={markAll}
            className="sheen rounded-lg border border-line px-4 py-2 text-sm text-soft transition duration-200 hover:-translate-y-px hover:bg-subtle hover:text-ink"
          >
            Tandai semua dibaca
          </button>
        )}
      </div>

      <div className="animate-fade-up rounded-xl border border-line bg-card shadow-card transition duration-200 hover:shadow-pop">
        {loading ? (
          <Spinner />
        ) : notifications.length === 0 ? (
          <p className="px-6 py-16 text-center text-mute">
            Belum ada notifikasi. Alert dikirim otomatis H-30 dan H-7 sebelum aset kedaluwarsa.
          </p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {notifications.map((notification, index) => (
              <li
                key={notification.id}
                className={`flex items-start gap-4 px-6 py-4 transition duration-200 animate-fade-up stagger-${(index % 8) + 1} hover:bg-subtle ${notification.read_at ? "opacity-60" : "bg-accent-soft"}`}
              >
                <div className="pt-0.5">
                  <Badge
                    label={levelLabel[notification.data.level] ?? notification.data.level}
                    color={levelColor[notification.data.level] ?? "bg-subtle text-soft"}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{notification.data.message}</p>
                  <p className="mt-0.5 text-xs text-soft">
                    Proyek {notification.data.project_name} · Kedaluwarsa {formatDate(notification.data.expired_date)} ·{" "}
                    {new Date(notification.created_at).toLocaleString("id-ID")}
                  </p>
                  <Link
                    href={`/assets/${notification.data.asset_id}`}
                    className="mt-1 inline-block text-xs font-medium text-accent hover:underline"
                  >
                    Lihat aset →
                  </Link>
                </div>
                {!notification.read_at && (
                  <button
                    onClick={() => markAsRead(notification)}
                    className="rounded-lg border border-line px-3 py-1 text-xs text-soft transition duration-200 hover:-translate-y-px hover:bg-subtle hover:text-ink"
                  >
                    Tandai dibaca
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        <Pagination page={meta.current_page} lastPage={meta.last_page} total={meta.total} onPage={setPage} />
      </div>
    </div>
  );
}
