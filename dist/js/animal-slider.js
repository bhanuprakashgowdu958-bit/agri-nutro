// NutriAgro Feeds — Interactive 3D Animal Showcase & Carousel
// Smooth sliding across 5 livestock species: Dairy Cattle, Poultry, Goats, Aquaculture, Swine.
// Features 3D mouse parallax tilt, auto-play with pause-on-hover, and mobile touch swipe.

(function() {
  'use strict';

  let currentAnimalSlide = 0;
  const TOTAL_SLIDES = 5;
  const AUTO_PLAY_DELAY = 5000; // 5 seconds
  let autoPlayTimer = null;
  let isHovered = false;

  // Touch Swipe State
  let touchStartX = 0;
  let touchEndX = 0;

  function initAnimalSlider() {
    const stage = document.getElementById('animalCarouselStage');
    if (!stage) return;

    // Start Auto-Play
    startAutoPlay();

    // Pause on Hover
    stage.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoPlay();
    });

    stage.addEventListener('mouseleave', () => {
      isHovered = false;
      resetTilt();
      startAutoPlay();
    });

    // 3D Perspective Tilt on Desktop Mouse Move
    stage.addEventListener('mousemove', handleCardTilt);

    // Mobile Touch Swipe Handling
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
      if (!isHovered) startAutoPlay();
    }, { passive: true });

    // Keyboard Arrow Navigation when in Viewport
    document.addEventListener('keydown', (e) => {
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === 'ArrowLeft') {
        prevAnimalSlide();
      } else if (e.key === 'ArrowRight') {
        nextAnimalSlide();
      }
    });
  }

  function switchAnimalSlide(index, restartTimer = true) {
    const track = document.getElementById('animalCarouselTrack');
    const pills = document.querySelectorAll('.animal-pill-btn');
    const dots = document.querySelectorAll('#animalSliderDots .slider-dot');
    const slides = document.querySelectorAll('.animal-slide');

    if (!track) return;

    // Bound check & Wrap around
    currentAnimalSlide = (index + TOTAL_SLIDES) % TOTAL_SLIDES;

    // Slide Track Animation
    track.style.transform = `translateX(-${currentAnimalSlide * 100}%)`;

    // Active Slide Opacity
    slides.forEach((slide, idx) => {
      slide.classList.toggle('active', idx === currentAnimalSlide);
    });

    // Active Category Pill
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === currentAnimalSlide);
    });

    // Active Indicator Dot
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentAnimalSlide);
    });

    resetTilt();

    if (restartTimer && !isHovered) {
      stopAutoPlay();
      startAutoPlay();
    }
  }

  function nextAnimalSlide() {
    switchAnimalSlide(currentAnimalSlide + 1);
  }

  function prevAnimalSlide() {
    switchAnimalSlide(currentAnimalSlide - 1);
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      nextAnimalSlide();
    }, AUTO_PLAY_DELAY);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  // Subtle interactive parallax depth on mouse movement
  function handleCardTilt(e) {
    if (window.innerWidth < 992) return; // Disable on tablet/mobile

    const stage = document.getElementById('animalCarouselStage');
    if (!stage) return;

    const rect = stage.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize coordinates (-0.5 to 0.5)
    const normalizedX = (mouseX / rect.width) - 0.5;
    const normalizedY = (mouseY / rect.height) - 0.5;

    const moveX = (normalizedX * -12).toFixed(1);
    const moveY = (normalizedY * -8).toFixed(1);

    const activeImg = stage.querySelector('.animal-slide.active .animal-full-banner-img');
    if (activeImg) {
      activeImg.style.transform = `scale(1.03) translate(${moveX}px, ${moveY}px)`;
    }
  }

  function resetTilt() {
    const images = document.querySelectorAll('.animal-full-banner-img');
    images.forEach(img => {
      img.style.transform = 'scale(1) translate(0px, 0px)';
    });
  }

  function handleSwipe() {
    const threshold = 50; // min swipe distance in px
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextAnimalSlide(); // swiped left -> next
      } else {
        prevAnimalSlide(); // swiped right -> prev
      }
    }
  }

  // Expose global methods for inline HTML onclick handlers
  window.switchAnimalSlide = switchAnimalSlide;
  window.nextAnimalSlide = nextAnimalSlide;
  window.prevAnimalSlide = prevAnimalSlide;

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAnimalSlider);
  } else {
    initAnimalSlider();
  }
})();

