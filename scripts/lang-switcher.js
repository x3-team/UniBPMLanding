// Language Switcher
document.addEventListener('DOMContentLoaded', () => {
  const langContainers = document.querySelectorAll('.header__lang');

  langContainers.forEach((container) => {
    const selector = container.querySelector('.header__lang-selector');
    const currentLang = container.querySelector('.header__lang-current');
    const options = container.querySelectorAll('.header__lang-option');

    if (!selector || !currentLang || !options.length) return;

    // Toggle dropdown
    selector.addEventListener('click', (e) => {
      e.stopPropagation();

      // Close other dropdowns
      langContainers.forEach((otherContainer) => {
        if (otherContainer !== container) {
          otherContainer.classList.remove('is-open');
        }
      });

      container.classList.toggle('is-open');
    });

    // Select language option
    options.forEach((option) => {
      const lang = option.dataset.lang;

      // Mark current language as active
      if (lang === currentLang.textContent.toLowerCase()) {
        option.classList.add('is-active');
      }

      option.addEventListener('click', (e) => {
        e.stopPropagation();

        // Update current language text
        currentLang.textContent = option.textContent;

        // Update active state
        options.forEach((opt) => opt.classList.remove('is-active'));
        option.classList.add('is-active');

        // Close dropdown
        container.classList.remove('is-open');

        // Store selected language in localStorage
        localStorage.setItem('selectedLanguage', lang);

        // Here you can add logic to actually change the language
        // For example, reload page with language parameter or update content dynamically
        console.log('Language changed to:', lang);
      });
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    langContainers.forEach((container) => {
      container.classList.remove('is-open');
    });
  });

  // Load saved language from localStorage
  const savedLang = localStorage.getItem('selectedLanguage');
  if (savedLang) {
    langContainers.forEach((container) => {
      const currentLang = container.querySelector('.header__lang-current');
      const options = container.querySelectorAll('.header__lang-option');

      options.forEach((option) => {
        if (option.dataset.lang === savedLang) {
          if (currentLang) {
            currentLang.textContent = option.textContent;
          }
          option.classList.add('is-active');
        } else {
          option.classList.remove('is-active');
        }
      });
    });
  }
});
