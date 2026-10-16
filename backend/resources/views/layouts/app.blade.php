<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') · Monitoring Infra</title>
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
<body>
@php
    $user = auth()->user();
    $isClient = $user->isClient();
    $unread = $isClient ? 0 : $user->unreadNotifications()->count();
    $navItems = [
        ['route' => 'dashboard', 'href' => '/dashboard', 'label' => 'Dashboard', 'icon' => '📊', 'show' => true],
        ['route' => 'clients.*', 'href' => '/clients', 'label' => 'Klien', 'icon' => '🏢', 'show' => ! $isClient],
        ['route' => 'projects.*', 'href' => '/projects', 'label' => 'Proyek', 'icon' => '📁', 'show' => true],
        ['route' => 'assets.*', 'href' => '/assets', 'label' => 'Aset Infra', 'icon' => '🖥️', 'show' => true],
        ['route' => 'notifications.*', 'href' => '/notifications', 'label' => 'Notifikasi', 'icon' => '🔔', 'show' => ! $isClient],
        ['route' => 'users.*', 'href' => '/users', 'label' => 'Pengguna', 'icon' => '👥', 'show' => $user->isAdmin()],
    ];
@endphp

<div class="min-h-screen md:flex">
    <header class="sticky top-0 z-30 flex h-14 items-center justify-between bg-rail px-4 text-white md:hidden">
        <span class="font-semibold">⏱ Monitoring Infra</span>
        <div class="flex items-center gap-2">
            @include('components.theme-toggle')
            <button
                type="button"
                aria-label="Buka menu"
                aria-expanded="false"
                aria-controls="app-navigation"
                x-data="{ open: false }"
                @click="open = !open; document.getElementById('app-navigation').classList.toggle('flex', open); document.getElementById('app-navigation').classList.toggle('hidden', !open); $el.setAttribute('aria-expanded', open)"
                class="rounded-lg border border-rail-line px-3 py-1.5 text-sm text-rail-soft transition hover:bg-rail-hover hover:text-rail-ink"
            >
                Menu
            </button>
        </div>
    </header>

    <aside id="app-navigation" class="animate-fade-in fixed inset-x-0 top-14 bottom-0 z-40 hidden flex-col bg-rail text-rail-ink md:inset-y-0 md:right-auto md:top-0 md:flex md:w-64">
        <div class="flex h-16 items-center gap-2 border-b border-rail-line px-6">
            <span class="text-xl">⏱</span>
            <div>
                <p class="text-sm font-bold text-white">Monitoring Infra</p>
                <p class="text-[11px] text-rail-mute">Domain · Hosting · SSL · VPS</p>
            </div>
        </div>

        <nav class="flex-1 space-y-1 overflow-y-auto p-4">
            @foreach ($navItems as $item)
                @if ($item['show'])
                    @php $active = request()->routeIs($item['route']); @endphp
                    <a href="{{ $item['href'] }}" class="nav-link {{ $active ? 'active' : '' }}">
                        <span>{{ $item['icon'] }}</span>
                        {{ $item['label'] }}
                        @if ($item['route'] === 'notifications.*' && $unread > 0)
                            <span class="ml-auto rounded-full bg-danger px-2 py-0.5 text-[11px] font-bold text-white">{{ $unread }}</span>
                        @endif
                    </a>
                @endif
            @endforeach
        </nav>

        <div class="space-y-3 border-t border-rail-line p-4">
            <div class="flex items-center justify-between gap-2">
                <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-white">{{ $user->name }}</p>
                    <p class="truncate text-xs text-rail-mute">{{ $user->role->label() }}</p>
                </div>
                @include('components.theme-toggle')
            </div>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" class="btn btn-rail w-full">Keluar</button>
            </form>
        </div>
    </aside>

    <main class="min-w-0 flex-1 p-4 sm:p-6 md:ml-64 md:p-8">
        @if (session('success'))
            <div class="alert-ok mb-5 animate-fade-up">{{ session('success') }}</div>
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
    </main>
</div>
</body>
</html>
