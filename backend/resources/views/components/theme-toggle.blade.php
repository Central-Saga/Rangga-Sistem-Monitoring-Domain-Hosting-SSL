@props(['variant' => 'rail'])

<button
    type="button"
    onclick="toggleTheme()"
    aria-label="Ganti mode gelap/terang"
    class="{{ $variant === 'ghost'
        ? 'border border-white/15 bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white'
        : 'border border-rail-line bg-rail-hover p-2 text-rail-soft transition hover:border-rail-soft/50 hover:text-white' }} rounded-lg"
>
    <svg class="h-4 w-4 dark:hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
    <svg class="hidden h-4 w-4 dark:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="4"/>
        <path stroke-linecap="round" d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41"/>
    </svg>
</button>
