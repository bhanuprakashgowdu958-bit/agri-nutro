// NutriAgro Feeds — Interactive 3D Animal Showcase & Carousel
// Seamless infinite forward sliding across 5 livestock species: Dairy Cattle, Poultry, Goats, Aquaculture, Swine.
// Auto-slides automatically every 0.5 seconds with continuous forward flow.

(function() {
  'use strict';

  let currentAnimalSlide = 0;
  const TOTAL_SLIDES = 5;
  const AUTO_PLAY_DELAY = 500; // 0.5 seconds per slide (500ms)
  const TRANSITION_DURATION = 450; // 0.45s smooth slide
  let autoPlayTimer = null;

  // Touch Swipe State
  let touchStartX = 0;
  let touchEndX = 0;

  function initAnimalSlider() {
    const stage = document.getElementById('animalCarouselStage');
    const track = document.getElementById('animalCarouselTrack');
    if (!stage || !track) return;

    // Clone first slide to the end for seamless infinite forward loop
    const firstSlide = track.querySelector('.animal-slide[data-index="0"]');
    if (firstSlide && !track.querySelector('.animal-slide-clone')) {
      const clone = firstSlide.cloneNode(true);
      clone.classList.add('animal-slide-clone');
      clone.classList.remove('active');
      track.appendChild(clone);
    }

    // Configure transition style
    track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;

    // Seamless loop reset listener on transition end
    track.addEventListener('transitionend', (e) => {
      if (e.target !== track) return;
      if (currentAnimalSlide >= TOTAL_SLIDES) {
        // Instantly snap to real slide 0 without animation
        track.style.transition = 'none';
        currentAnimalSlide = 0;
        track.style.transform = 'translateX(0%)';
        void track.offsetHeight; // Force reflow
        track.style.transition = `transform ${TRANSITION_DURATION}ms ease-in-out`;
        updateActiveSlideClass(0);
      }
    });

    // Start auto-play every 0.5 seconds
    startAutoPlay();

    // Mobile Touch Swipe Handling
    stage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
  }

  function updateActiveSlideClass(idx) {
    const slides = document.querySelectorAll('.animal-carousel-track .animal-slide');
    const realIndex = idx % TOTAL_SLIDES;
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', (i % TOTAL_SLIDES) === realIndex);
    });
  }

  function nextAnimalSlide() {
    const track = document.getElementById('animalCarouselTrack');
    if (!track) return;

    currentAnimalSlide++;
    track.style.transform = `translateX(-${currentAnimalSlide * 100}%)`;
    updateActiveSlideClass(currentAnimalSlide);
  }

  function prevAnimalSlide() {
    const track = document.getElementById('animalCarouselTrack');
    if (!track) return;

    if (currentAnimalSlide <= 0) {
      currentAnimalSlide = TOTAL_SLIDES - 1;
    } else {
      currentAnimalSlide--;
    }
    track.style.transform = `translateX(-${currentAnimalSlide * 100}%)`;
    updateActiveSlideClass(currentAnimalSlide);
  }

  function switchAnimalSlide(index) {
    const track = document.getElementById('animalCarouselTrack');
    if (!track) return;
    currentAnimalSlide = index % TOTAL_SLIDES;
    track.style.transform = `translateX(-${currentAnimalSlide * 100}%)`;
    updateActiveSlideClass(currentAnimalSlide);
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

  function handleSwipe() {
    const threshold = 40; // min swipe distance in px
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextAnimalSlide();
      } else {
        prevAnimalSlide();
      }
    }
  }

  // Expose global methods
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
