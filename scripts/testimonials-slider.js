document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.testimonials__slider');
  if (!slider) return;

  const track = slider.querySelector('.testimonials__track');
  const cards = Array.from(track.querySelectorAll('.testimonials__card:not([data-clone])'));
  const prevButton = slider.querySelector('.testimonials__nav-button--prev');
  const nextButton = slider.querySelector('.testimonials__nav-button--next');

  if (!track || cards.length === 0) return;

  // Текущий индекс (начинаем с 0)
  let currentIndex = 0;
  let isAnimating = false;

  // Получаем ширину карточки + gap
  const getCardWidth = () => {
    const card = cards[0];
    const gap = parseInt(getComputedStyle(track).gap) || 24;
    return card.offsetWidth + gap;
  };

  // Обновляем состояние кнопок
  const updateButtonsState = () => {
    if (prevButton) {
      if (currentIndex === 0) {
        prevButton.disabled = true;
        prevButton.style.opacity = '0.5';
        prevButton.style.cursor = 'not-allowed';
      } else {
        prevButton.disabled = false;
        prevButton.style.opacity = '1';
        prevButton.style.cursor = 'pointer';
      }
    }

    if (nextButton) {
      if (currentIndex >= cards.length - 1) {
        nextButton.disabled = true;
        nextButton.style.opacity = '0.5';
        nextButton.style.cursor = 'not-allowed';
      } else {
        nextButton.disabled = false;
        nextButton.style.opacity = '1';
        nextButton.style.cursor = 'pointer';
      }
    }
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
    updateButtonsState();
  };

  // Переход к следующему слайду
  const goToNext = () => {
    if (isAnimating || currentIndex >= cards.length - 1) return;
    isAnimating = true;

    currentIndex++;
    updateSliderPosition(true);

    setTimeout(() => {
      isAnimating = false;
    }, 500);
  };

  // Переход к предыдущему слайду
  const goToPrev = () => {
    if (isAnimating || currentIndex === 0) return;
    isAnimating = true;

    currentIndex--;
    updateSliderPosition(true);

    setTimeout(() => {
      isAnimating = false;
    }, 500);
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

  // Инициализация
  updateSliderPosition(false);
});
