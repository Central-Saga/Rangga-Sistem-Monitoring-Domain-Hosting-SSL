import { ThemeToggle } from "@/components/ThemeToggle";

const features = [
  "Notifikasi otomatis H-30, H-7, dan saat kedaluwarsa",
  "Laporan & invoice PDF siap unduh",
  "Multi-role: admin, staff, dan klien",
];

const stats = [
  { value: "4", label: "Jenis aset" },
  { value: "24/7", label: "Pemantauan" },
  { value: "100%", label: "Riwayat tercatat" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 animate-float rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute -bottom-32 -right-16 h-96 w-96 animate-float-slow rounded-full bg-accent-2/25 blur-3xl" />
        <div className="absolute right-1/3 top-1/4 h-64 w-64 animate-float rounded-full bg-info/20 blur-3xl" />
      </div>

      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle variant="ghost" />
      </div>

      <aside className="relative z-10 flex flex-1 flex-col justify-center gap-8 p-8 lg:w-[46%] lg:max-w-2xl lg:flex-none lg:justify-between lg:p-12 xl:p-16">
        <div className="flex animate-fade-up items-center gap-3">
          <span className="sheen flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-xl text-on-accent shadow-lg shadow-accent/40">
            ⏱
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Monitoring Infra</p>
            <p className="text-xs text-mute">Domain · Hosting · SSL · VPS</p>
          </div>
        </div>

        <div className="animate-fade-up stagger-1">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-soft backdrop-blur">
            <span className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-ok" />
            Sistem monitoring aktif
          </span>

          <h2 className="mt-5 text-3xl font-bold leading-tight text-ink sm:text-4xl xl:text-5xl">
            Pantau semua <span className="gradient-text">aset infrastruktur</span> Anda dalam satu
            layar.
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-soft sm:text-base">
            <span className="font-semibold text-ink">Monitoring Infra</span> adalah platform untuk
            mencatat dan melacak masa berlaku domain, hosting, SSL, serta VPS milik setiap klien.
            Sistem menghitung sisa waktu secara otomatis dan mengirim pengingat sebelum jatuh
            tempo — sehingga tidak ada layanan yang kedaluwarsa tanpa terdeteksi.
          </p>

          <ul className="mt-6 space-y-2.5">
            {features.map((feature, index) => (
              <li
                key={feature}
                className={`flex animate-fade-up items-start gap-3 text-sm text-soft stagger-${index + 2}`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    className="h-3 w-3"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`animate-fade-up rounded-2xl border border-line bg-card px-3 py-3 text-center shadow-card stagger-${index + 3}`}
              >
                <dt className="text-lg font-bold text-ink">{stat.value}</dt>
                <dd className="mt-0.5 text-[11px] text-mute">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="hidden text-xs text-mute lg:block">© 2026 Monitoring Infra</p>
      </aside>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:py-14">
        <div className="w-full max-w-md">
          <div className="animate-fade-up rounded-3xl border border-line bg-card p-7 shadow-pop stagger-1 sm:p-9">
            {children}
          </div>
          <p className="mt-5 text-center text-xs text-mute">
            Website ini mendukung mode terang & gelap — coba tombol di kanan atas.
          </p>
        </div>
      </main>
    </div>
  );
}
