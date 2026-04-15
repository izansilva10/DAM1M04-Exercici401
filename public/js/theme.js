// Temes disponibles
const themes = {
    light: 'light',
    dark: 'dark',
    highContrast: 'high-contrast'
};

// Funció per aplicar tema
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Carregar tema guardat
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && themes[savedTheme]) {
        setTheme(savedTheme);
    } else {
        setTheme(themes.light);
    }
}

// Configurar botons
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    
    document.getElementById('themeLight')?.addEventListener('click', () => setTheme(themes.light));
    document.getElementById('themeDark')?.addEventListener('click', () => setTheme(themes.dark));
    document.getElementById('themeHighContrast')?.addEventListener('click', () => setTheme(themes.highContrast));
});