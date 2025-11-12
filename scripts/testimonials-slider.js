document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.testimonials__slider');
  if (!slider) return;

  const track = slider.querySelector('.testimonials__track');
  const cards = Array.from(track.querySelectorAll('.testimonials__card'));
  const prevButton = slider.querySelector('.testimonials__nav-button--prev');
  const nextButton = slider.querySelector('.testimonials__nav-button--next');

  if (!track || cards.length === 0) return;

  // Количество реальных слайдов (без клонов)
  const realSlidesCount = cards.length - 2; // У нас 5 карточек: 1 клон + 3 оригинала + 1 клон

  // Начинаем с первого оригинального слайда (индекс 1, т.к. 0 - это клон)
  let currentIndex = 1;
  let isAnimating = false;

  // Получаем ширину карточки + gap
  const getCardWidth = () => {
    const card = cards[0];
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    return card.offsetWidth + gap;
  };

  // Обновляем позицию слайдера
  const updateSliderPosition = (animate = true) => {
    const cardWidth = getCardWidth();
    const offset = -currentIndex * cardWidth;

    if (animate) {
      track.style.transition = 'transform 0.5s ease';
    } else {
      track.style.transition = 'none';
    }

    track.style.transform = `translateX(${offset}px)`;
  };

  // Переход к следующему слайду
  const goToNext = () => {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex++;
    updateSliderPosition(true);

    // Если дошли до клона в конце (индекс 4 = последний клон)
    if (currentIndex === cards.length - 1) {
      setTimeout(() => {
        // Моментально перематываем на первый оригинальный слайд (индекс 1)
        currentIndex = 1;
        updateSliderPosition(false);
        isAnimating = false;
      }, 500); // Ждем окончания анимации
    } else {
      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }
  };

  // Переход к предыдущему слайду
  const goToPrev = () => {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex--;
    updateSliderPosition(true);

    // Если дошли до клона в начале (индекс 0 = первый клон)
    if (currentIndex === 0) {
      setTimeout(() => {
        // Моментально перематываем на последний оригинальный слайд (индекс 3)
        currentIndex = realSlidesCount;
        updateSliderPosition(false);
        isAnimating = false;
      }, 500); // Ждем окончания анимации
    } else {
      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }
  };

  // Обработчики событий
  if (nextButton) {
    nextButton.addEventListener('click', goToNext);
  }

  if (prevButton) {
    prevButton.addEventListener('click', goToPrev);
  }

  // Обновляем позицию при изменении размера окна
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateSliderPosition(false);
    }, 100);
  });

  // Swipe для мобильных устройств
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Свайп влево - следующий слайд
        goToNext();
      } else {
        // Свайп вправо - предыдущий слайд
        goToPrev();
      }
    }
  };

  // Инициализация - начинаем с первого оригинального слайда
  updateSliderPosition(false);
});
