import Alpine from 'alpinejs';

window.toggleTheme = function () {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
        /* storage tidak tersedia */
    }
};

window.addEventListener('storage', (event) => {
    if (event.key !== 'theme' || !event.newValue) return;
    document.documentElement.classList.toggle('dark', event.newValue === 'dark');
    document.documentElement.style.colorScheme = event.newValue;
});

window.Alpine = Alpine;
Alpine.start();
