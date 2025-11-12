/**
 * Управление показом/скрытием хедера при скролле
 */
(function() {
  const header = document.querySelector('.header');

  if (!header) return;

  let lastScrollTop = 0;
  let isScrolling = false;
  const scrollThreshold = 100; // Минимальная прокрутка для активации эффекта

  function handleScroll() {
    if (isScrolling) return;

    isScrolling = true;

    requestAnimationFrame(() => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Если скролл меньше порога, показываем хедер
      if (currentScrollTop < scrollThreshold) {
        header.classList.remove('header--hidden');
        header.classList.remove('header--scrolled');
      }
      // Если скроллим вниз
      else if (currentScrollTop > lastScrollTop && currentScrollTop > scrollThreshold) {
        header.classList.add('header--hidden');
        header.classList.add('header--scrolled');
      }
      // Если скроллим вверх
      else if (currentScrollTop < lastScrollTop) {
        header.classList.remove('header--hidden');
        header.classList.add('header--scrolled');
      }

      lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
      isScrolling = false;
    });
  }

  // Throttle для оптимизации
  let timeout;
  window.addEventListener('scroll', () => {
    if (timeout) {
      window.cancelAnimationFrame(timeout);
    }

    timeout = window.requestAnimationFrame(() => {
      handleScroll();
    });
  }, { passive: true });
})();
