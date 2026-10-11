// NutriAgro Feeds — Cattle & Livestock Hero Background Slider
// Smooth horizontal slide animation (0.65s) with auto-play countdown progress bar,
// mobile touch swipe support, and real-time Google Weather Card color adaptation!

(function() {
  const SLIDES_DATA = [
    {
      tag: 'CATTLE BREEDING & FEEDING',
      title: 'Modern Dairy Cattle Barn • Balanced Nutrition Troughs',
      themeClass: 'theme-slide-0',
      accent: '#f7b731'
    },
    {
      tag: 'PASTURE & RUMINANT HEALTH',
      title: 'Lush Green Pastures • Grazing Dairy Herd at Sunrise',
      themeClass: 'theme-slide-1',
      accent: '#2ed573'
    },
    {
      tag: 'SCIENTIFIC NUTRITION',
      title: 'Fortified Complete Cattle Feed • Maximum Milk Yield & FCR',
      themeClass: 'theme-slide-2',
      accent: '#38bdf8'
    },
    {
      tag: 'HIGH-YIELD DAIRY HERD',
      title: 'Hygienic Ventilated Sheds • Premium Herd Management',
      themeClass: 'theme-slide-3',
      accent: '#fb923c'
    },
    {
      tag: 'NUTRIAGRO INFRASTRUCTURE',
      title: 'Commercial Feed Mill Complex • Direct Farmgate Freight',
      themeClass: 'theme-slide-4',
      accent: '#10b981'
    }
  ];

  let currentSlide = 0;
  let isPaused = false;
  let isHoverPaused = false;
  let progressAnimationId = null;
  let slideStartTime = 0;
  let elapsedBeforePause = 0;
  const SLIDE_DURATION = 4500; // 4.5 seconds per slide (crisp, engaging pace)

  function updateSlide(index, restartTimer = true) {
    const track = document.getElementById('heroBgTrack');
    const dots = document.querySelectorAll('.hero-dot');
    const tagEl = document.getElementById('heroSlideTag');
    const descEl = document.getElementById('heroSlideDesc');
    const slides = document.querySelectorAll('.hero-bg-slide');
    const weatherCard = document.getElementById('googleWeatherCard');
    const progressFill = document.getElementById('heroSlideProgressFill');

    if (!track) return;

    currentSlide = (index + SLIDES_DATA.length) % SLIDES_DATA.length;
    const currentTheme = SLIDES_DATA[currentSlide];

    // Smooth horizontal slide (0.65s cubic-bezier transition in CSS)
    const translatePct = -(currentSlide * 20); // 100% / 5 slides = 20%
    track.style.transform = `translateX(${translatePct}%)`;

    // Active slide styling
    slides.forEach((slide, i) => {
      if (i === currentSlide) slide.classList.add('active');
      else slide.classList.remove('active');
    });

    // Update Dots
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // 🌟 Synchronize Weather Card Theme with Background Palette in Real Time
    if (weatherCard) {
      weatherCard.classList.remove('theme-slide-0', 'theme-slide-1', 'theme-slide-2', 'theme-slide-3', 'theme-slide-4');
      weatherCard.classList.add(currentTheme.themeClass);
    }
    if (typeof window.setWeatherThemeAccent === 'function') {
      window.setWeatherThemeAccent(currentTheme.accent);
    }

    // Dynamic progress bar styling
    if (progressFill) {
      progressFill.style.backgroundColor = currentTheme.accent;
      progressFill.style.boxShadow = `0 0 10px ${currentTheme.accent}`;
    }

    // Update Captions with smooth transition
    if (tagEl && descEl) {
      tagEl.style.opacity = '0';
      descEl.style.opacity = '0';
      setTimeout(() => {
        tagEl.textContent = currentTheme.tag;
        tagEl.style.color = currentTheme.accent;
        descEl.textContent = currentTheme.title;
        tagEl.style.opacity = '1';
        descEl.style.opacity = '1';
      }, 150);
    }

    if (restartTimer) {
      resetAndStartTimer();
    }
  }

  function nextSlide() {
    updateSlide(currentSlide + 1);
  }

  function prevSlide() {
    updateSlide(currentSlide - 1);
  }

  // ── High-Performance Progress Bar Animation Engine ──
  function stepProgress() {
    if (isPaused || isHoverPaused) return;

    const now = performance.now();
    const elapsed = (now - slideStartTime) + elapsedBeforePause;
    const pct = Math.min(100, (elapsed / SLIDE_DURATION) * 100);

    const progressFill = document.getElementById('heroSlideProgressFill');
    if (progressFill) {
      progressFill.style.width = `${pct}%`;
    }

    if (elapsed >= SLIDE_DURATION) {
      // Reached 100% — advance to next slide!
      nextSlide();
    } else {
      progressAnimationId = requestAnimationFrame(stepProgress);
    }
  }

  function resetAndStartTimer() {
    cancelAnimationFrame(progressAnimationId);
    elapsedBeforePause = 0;
    slideStartTime = performance.now();

    const progressFill = document.getElementById('heroSlideProgressFill');
    if (progressFill) {
      progressFill.style.width = '0%';
    }

    if (!isPaused && !isHoverPaused) {
      progressAnimationId = requestAnimationFrame(stepProgress);
    }
  }

  function pauseProgress() {
    cancelAnimationFrame(progressAnimationId);
    const now = performance.now();
    elapsedBeforePause += (now - slideStartTime);
  }

  function resumeProgress() {
    cancelAnimationFrame(progressAnimationId);
    slideStartTime = performance.now();
    if (!isPaused && !isHoverPaused) {
      progressAnimationId = requestAnimationFrame(stepProgress);
    }
  }

  function toggleAutoSlide() {
    isPaused = !isPaused;
    const icon = document.getElementById('heroPlayPauseIcon');
    const btn = document.getElementById('heroPlayPauseBtn');

    if (isPaused) {
      pauseProgress();
      if (icon) icon.textContent = '▶';
      if (btn) btn.setAttribute('title', 'Resume Slideshow');
    } else {
      if (icon) icon.textContent = '❚❚';
      if (btn) btn.setAttribute('title', 'Pause Slideshow');
      resumeProgress();
    }
  }

  function initSlider() {
    const hero = document.getElementById('heroSection');
    const navBar = document.getElementById('heroSliderNav');
    if (!hero) return;

    // 1. Desktop Hover: Pause ONLY when hovering the controls bar itself (never the whole hero section)
    // and ONLY on devices with true mouse pointer (never on mobile touch)
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches && navBar) {
      navBar.addEventListener('mouseenter', () => {
        isHoverPaused = true;
        pauseProgress();
      });

      navBar.addEventListener('mouseleave', () => {
        isHoverPaused = false;
        resumeProgress();
      });
    }

    // 2. Mobile Touch Swipe Gesture Support (Robust & Scroll-Aware)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    hero.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    hero.addEventListener('touchend', (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const deltaTime = Date.now() - touchStartTime;

      // Only treat as horizontal swipe if horizontal movement > 38px and greater than vertical drift
      if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && deltaTime < 900) {
        if (deltaX < 0) {
          // Swiped left -> Next slide
          nextSlide();
        } else {
          // Swiped right -> Previous slide
          prevSlide();
        }
      }
    }, { passive: true });

    // Initial render and start timer
    updateSlide(0, true);
  }

  // ── Public Global Window Bindings ──
  window.nextHeroSlide = function() {
    nextSlide();
  };

  window.prevHeroSlide = function() {
    prevSlide();
  };

  window.goToHeroSlide = function(i) {
    updateSlide(i, true);
  };

  window.toggleHeroAutoSlide = toggleAutoSlide;
  window.initHeroSlider = initSlider;

  // Resilient kickoff: runs whether DOM is already loaded or still loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSlider);
  } else {
    initSlider();
  }
})();
