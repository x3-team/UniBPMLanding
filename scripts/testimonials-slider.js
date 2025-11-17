document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.testimonials__slider');
  if (!slider) return;

  const track = slider.querySelector('.testimonials__track');
  const originalCards = Array.from(track.querySelectorAll('.testimonials__card'));
  const prevButton = slider.querySelector('.testimonials__nav-button--prev');
  const nextButton = slider.querySelector('.testimonials__nav-button--next');

  if (!track || originalCards.length === 0) return;

  // Клонируем карточки для бесконечного эффекта
  const cloneCount = originalCards.length;

  // Клонируем в начало
  for (let i = originalCards.length - 1; i >= 0; i--) {
    const clone = originalCards[i].cloneNode(true);
    clone.setAttribute('data-clone', 'start');
    track.insertBefore(clone, track.firstChild);
  }

  // Клонируем в конец
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('data-clone', 'end');
    track.appendChild(clone);
  });

  const allCards = Array.from(track.querySelectorAll('.testimonials__card'));

  // Текущий индекс (начинаем с первой настоящей карточки)
  let currentIndex = cloneCount;
  let isAnimating = false;

  // Получаем ширину карточки + gap
  const getCardWidth = () => {
    const card = allCards[0];
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

  // Проверяем и корректируем позицию для бесконечного эффекта
  const checkInfiniteLoop = () => {
    if (currentIndex >= cloneCount + originalCards.length) {
      // Перемещаемся к началу настоящих карточек
      currentIndex = cloneCount;
      updateSliderPosition(false);
    } else if (currentIndex < cloneCount) {
      // Перемещаемся к концу настоящих карточек
      currentIndex = cloneCount + originalCards.length - 1;
      updateSliderPosition(false);
    }
  };

  // Переход к следующему слайду
  const goToNext = () => {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex++;
    updateSliderPosition(true);

    setTimeout(() => {
      checkInfiniteLoop();
      isAnimating = false;
    }, 500);
  };

  // Переход к предыдущему слайду
  const goToPrev = () => {
    if (isAnimating) return;
    isAnimating = true;

    currentIndex--;
    updateSliderPosition(true);

    setTimeout(() => {
      checkInfiniteLoop();
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

  // Инициализация - устанавливаем начальную позицию на первой настоящей карточке
  updateSliderPosition(false);
});
