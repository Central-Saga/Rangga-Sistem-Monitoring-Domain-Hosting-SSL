<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Masuk') · Monitoring Infra</title>
    <script>
        (function () {
            try {
                var theme = localStorage.getItem('theme');
                if (!theme) {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                }
                document.documentElement.style.colorScheme = theme;
            } catch (e) {}
        })();
    </script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-rail">
<div class="relative flex min-h-screen overflow-hidden">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0">
        <div class="animate-float absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl"></div>
        <div class="animate-float-slow absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-accent-2/25 blur-3xl"></div>
        <div class="auth-grid absolute inset-0"></div>
    </div>

    <div class="absolute right-4 top-4 z-20">
        @include('components.theme-toggle', ['variant' => 'ghost'])
    </div>

    <aside class="relative hidden w-[46%] max-w-2xl flex-col justify-between p-12 lg:flex xl:p-16">
        <div class="animate-fade-up flex items-center gap-3">
            <span class="sheen flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-xl text-on-accent shadow-lg shadow-accent/40">⏱</span>
            <div>
                <p class="text-sm font-bold text-white">Monitoring Infra</p>
                <p class="text-xs text-rail-mute">Domain · Hosting · SSL · VPS</p>
            </div>
        </div>

        <div class="animate-fade-up stagger-1">
            <h2 class="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Semua aset infrastruktur Anda dalam satu layar.
            </h2>
            <p class="mt-5 max-w-md text-base leading-relaxed text-rail-soft">
                Pantau masa berlaku domain, hosting, SSL, dan VPS — lengkap dengan
                pengingat perpanjangan sebelum jatuh tempo.
            </p>
            <ul class="mt-8 space-y-3">
                @foreach (['Notifikasi otomatis H-30, H-7, dan saat kedaluwarsa', 'Laporan & invoice PDF siap unduh', 'Multi-role: admin, staff, dan klien'] as $index => $feature)
                    <li class="animate-fade-up stagger-{{ $index + 2 }} flex items-start gap-3 text-sm text-rail-ink">
                        <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="h-3 w-3" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                            </svg>
                        </span>
                        {{ $feature }}
                    </li>
                @endforeach
            </ul>
        </div>

        <p class="text-xs text-rail-mute">© {{ date('Y') }} Monitoring Infra</p>
    </aside>

    <main class="relative flex flex-1 items-center justify-center px-4 py-14 sm:px-8">
        <div class="w-full max-w-md">
            <div class="animate-fade-up mb-6 flex items-center justify-center gap-2.5 lg:hidden">
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg text-on-accent shadow-lg shadow-accent/40">⏱</span>
                <div>
                    <p class="text-sm font-bold text-white">Monitoring Infra</p>
                    <p class="text-[11px] text-rail-mute">Domain · Hosting · SSL · VPS</p>
                </div>
            </div>

            <div class="card animate-fade-up stagger-1 p-7 shadow-pop sm:p-9">
                @if (session('status'))
                    <div class="alert-ok mb-5">{{ session('status') }}</div>
                @endif
                @if ($errors->any())
                    <div class="alert-error mb-5">
                        <ul class="list-disc pl-4">
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif
                @yield('content')
            </div>
        </div>
    </main>
</div>
</body>
</html>
