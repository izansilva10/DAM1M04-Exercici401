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

// Configurar botons quan el DOM estigui llest
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    
    const btnLight = document.getElementById('themeLight');
    const btnDark = document.getElementById('themeDark');
    const btnHigh = document.getElementById('themeHighContrast');
    
    if (btnLight) btnLight.addEventListener('click', () => setTheme(themes.light));
    if (btnDark) btnDark.addEventListener('click', () => setTheme(themes.dark));
    if (btnHigh) btnHigh.addEventListener('click', () => setTheme(themes.highContrast));
});