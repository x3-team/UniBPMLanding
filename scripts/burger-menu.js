/**
 * Burger menu functionality
 * Handles mobile menu open/close with smooth animations
 */

(function() {
  'use strict';

  // Get DOM elements
  const burgerButton = document.querySelector('.header__burger');
  const mobileMenu = document.querySelector('.header__mobile-menu');
  const mobileMenuOverlay = document.querySelector('.header__mobile-menu-overlay');
  const mobileMenuClose = document.querySelector('.header__mobile-menu-close');
  const mobileMenuLinks = document.querySelectorAll('.header__mobile-menu-link');

  // Check if elements exist
  if (!burgerButton || !mobileMenu) {
    return;
  }

  /**
   * Open mobile menu
   */
  function openMenu() {
    mobileMenu.classList.add('is-open');
    burgerButton.classList.add('is-active');
    document.body.style.overflow = 'hidden'; // Prevent body scroll when menu is open
  }

  /**
   * Close mobile menu
   */
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    burgerButton.classList.remove('is-active');
    document.body.style.overflow = ''; // Restore body scroll
  }

  /**
   * Toggle mobile menu
   */
  function toggleMenu() {
    if (mobileMenu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  // Event listeners
  burgerButton.addEventListener('click', toggleMenu);

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMenu);
  }

  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', closeMenu);
  }

  // Close menu when clicking on menu links
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key press
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Close menu on window resize if it's open and viewport is wider than tablet
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 1023 && mobileMenu.classList.contains('is-open')) {
        closeMenu();
      }
    }, 250);
  });

})();
