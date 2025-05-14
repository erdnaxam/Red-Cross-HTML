async function loadTranslations(lang = 'fr') {
  const res = await fetch(`/Langues/${lang}.json`);
  const translations = await res.json();

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[key]) el.innerText = translations[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[key]) el.setAttribute('placeholder', translations[key]);
  });

  localStorage.setItem('preferredLang', lang);
}

document.addEventListener('DOMContentLoaded', () => {
  const defaultLang = localStorage.getItem('preferredLang') || 'fr';
  loadTranslations(defaultLang);

  const selector = document.getElementById('langSwitcher');
  if (selector) {
    selector.value = defaultLang;
    selector.addEventListener('change', (e) => {
      loadTranslations(e.target.value);
    });
  }
});
