document.addEventListener('DOMContentLoaded', () => {
    const btn     = document.getElementById('themeBtn');
    const icon    = document.getElementById('theme-icon');
    const favicon = document.getElementById('favicon');

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    if (btn) {
        btn.addEventListener('click', () => {
            const current = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
            applyTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    function applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);
        localStorage.setItem('theme', theme);
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        if (favicon) {
            favicon.href = theme === 'dark' ? 'img/smLogo2.png' : 'img/smLogo1.png';
        }
    }
});
