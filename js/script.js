/* =====================================================
   ATHLOS HOMEPAGE — JS
   - Hero slideshow with crossfade + Ken Burns
   - Nav scroll state
   - Scroll reveal (Intersection Observer)
   - Mobile nav
===================================================== */

(function () {
  'use strict';

  /* =====================================================
     1. HERO SLIDESHOW
  ===================================================== */
  const slides   = document.querySelectorAll('.hero-slide');
  const dots     = document.querySelectorAll('.hero-dot');
  const INTERVAL = 3500;  // ms between slides
  let   current  = 0;

  function goToSlide(index) {
    if (index === current) return;

    slides[current].classList.remove('active');
    slides[current].classList.add('leaving');
    dots[current].classList.remove('active');

    current = index;
    slides[current].classList.remove('leaving');
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    setTimeout(() => {
      slides.forEach((s, i) => {
        if (i !== current) s.classList.remove('leaving');
      });
    }, 1400);
  }

  function nextSlide() {
    goToSlide((current + 1) % slides.length);
  }

  // Dot click handlers — do not reset interval, just jump to slide
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
    });
  });

  // Hero entry animation
  function initHero() {
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      setTimeout(() => {
        heroEl.classList.add('hero-loaded');
      }, 150);
    }
  }

  // Start unconditional slideshow — never pauses, never stops
  if (slides.length > 1) {
    setInterval(nextSlide, INTERVAL);
  }
  initHero();

  /* =====================================================
     2. NAVIGATION — SCROLL STATE
  ===================================================== */
  const nav = document.getElementById('nav');

  function updateNav() {
    if (!nav) return;
    const scrolled = window.scrollY > 60;
    nav.classList.toggle('scrolled', scrolled);
  }

  // Throttled scroll handler
  let rafNav = null;
  window.addEventListener('scroll', () => {
    if (rafNav) return;
    rafNav = requestAnimationFrame(() => {
      updateNav();
      rafNav = null;
    });
  }, { passive: true });

  updateNav(); // initial

  /* =====================================================
     3. MOBILE NAVIGATION
  ===================================================== */
  const hamburger   = document.querySelector('.nav-hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');
  let   menuOpen    = false;

  function toggleMenu(open) {
    menuOpen = open;
    if (mobileMenu) mobileMenu.classList.toggle('open', open);
    if (hamburger) hamburger.setAttribute('aria-expanded', String(open));

    // Animate hamburger
    if (hamburger) {
      const spans = hamburger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    }
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      toggleMenu(!menuOpen);
    });
  }

  // Close on mobile link click
  document.querySelectorAll('.nav-mobile-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menuOpen && nav && !nav.contains(e.target)) {
      toggleMenu(false);
    }
  });

  /* =====================================================
     3b. PRODUCTS DROPDOWN
  ===================================================== */
  const navItem = document.querySelector('.nav-item.has-dropdown');
  if (navItem) {
    // Touch / click toggle for mobile
    const mainLink = navItem.querySelector('.nav-link');
    mainLink.addEventListener('click', function(e) {
      // On narrow screens, toggle instead of navigate
      if (window.innerWidth <= 768) {
        e.preventDefault();
        navItem.classList.toggle('open');
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!navItem.contains(e.target)) {
        navItem.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') navItem.classList.remove('open');
    });
  }

  /* =====================================================
     4. SCROLL REVEAL
  ===================================================== */
  const revealTargets = document.querySelectorAll('.reveal, [data-animate]');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || el.getAttribute('data-delay') || '0', 10);

      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);

      observer.unobserve(el);
    });
  }, observerOptions);

  revealTargets.forEach(el => observer.observe(el));

  /* =====================================================
     5. SMOOTH ANCHOR SCROLLING (offset for sticky nav)
  ===================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 72;
      const top       = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =====================================================
     6. PERFORMANCE — IMAGE LAZY LOADING FALLBACK
  ===================================================== */
  // Native lazy loading is used in HTML. This adds a small
  // visual fade-in for images as they load.
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 400ms ease';

    if (img.complete) {
      img.style.opacity = '1';
    } else {
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
    }
  });

  // ===================================================
  // AUTOPLAY VIDEO RESCUE
  // Some browsers (Safari, low-power mode, bfcache restores,
  // data-saver) skip autoplay or pause it silently. This kicks
  // any autoplay <video> back into playback whenever it's
  // visible, sets the requested playbackRate, and retries on
  // pause/stalled events.
  // ===================================================
  document.querySelectorAll('video[autoplay]').forEach((video) => {
    const rate = parseFloat(video.dataset.playbackRate) || 1;

    const tryPlay = () => {
      try { video.playbackRate = rate; } catch (_) {}
      const p = video.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => { /* autoplay blocked — will retry on next visibility/event */ });
      }
    };

    // Initial attempt as soon as data is ready
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    // Restart playback whenever the video scrolls into view
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && video.paused) tryPlay();
        });
      }, { threshold: 0.1 });
      io.observe(video);
    }

    // Retry if the browser pauses/stalls/suspends the video
    ['pause', 'stalled', 'suspend', 'emptied'].forEach((evt) => {
      video.addEventListener(evt, () => {
        if (!document.hidden && video.paused) {
          // small delay so we don't fight the user/browser intent
          setTimeout(tryPlay, 250);
        }
      });
    });

    // Re-attempt when the page is restored from back/forward cache
    window.addEventListener('pageshow', (e) => {
      if (e.persisted && video.paused) tryPlay();
    });

    // Re-attempt when the tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && video.paused) tryPlay();
    });
  });

})();
