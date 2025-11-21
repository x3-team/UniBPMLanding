/**
 * Аккордеон для секции automation-tasks
 * При клике на заголовок открывает описание и меняет картинку с плавной анимацией
 */

document.addEventListener('DOMContentLoaded', () => {
  const accordionItems = document.querySelectorAll('.automation-tasks__item');
  const accordionTriggers = document.querySelectorAll('[data-accordion-trigger]');
  const accordionImage = document.querySelector('[data-accordion-image]');

  // Массив с путями к картинкам для каждого пункта
  // Замените task-1.png, task-2.png и т.д. на свои уникальные картинки
  const images = {
    '1': './images/automation-tasks/task-1.webp',
    '2': './images/automation-tasks/task-2.webp',
    '3': './images/automation-tasks/task-3.webp',
    '4': './images/automation-tasks/task-4.webp',
    '5': './images/automation-tasks/task-5.webp',
    '6': './images/automation-tasks/task-6.webp'
  };

  // Инициализация начального изображения
  const activeItem = document.querySelector('.automation-tasks__item--active [data-accordion-trigger]');
  if (accordionImage && activeItem) {
    const imageId = activeItem.dataset.image;
    if (imageId && images[imageId]) {
      accordionImage.src = images[imageId];
    }
  }

  accordionTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const parentItem = trigger.closest('.automation-tasks__item');
      const imageId = trigger.dataset.image;

      // Если элемент уже активен, не делаем ничего
      if (parentItem.classList.contains('automation-tasks__item--active')) {
        return;
      }

      // Убираем активный класс у всех элементов
      accordionItems.forEach((item) => {
        item.classList.remove('automation-tasks__item--active');
      });

      // Добавляем активный класс текущему элементу
      parentItem.classList.add('automation-tasks__item--active');

      // Меняем картинку с плавным переходом
      if (accordionImage && imageId && images[imageId]) {
        // Добавляем небольшую задержку для синхронизации с анимацией
        accordionImage.style.opacity = '0.7';

        setTimeout(() => {
          accordionImage.src = images[imageId];
          accordionImage.alt = trigger.querySelector('.automation-tasks__item-title').textContent;
          accordionImage.style.opacity = '1';
        }, 150);
      }
    });
  });
});
