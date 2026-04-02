/* =====================================================
   ATHLOS PRODUCTS — JS
   Extends script.js for product pages.
   - Nav scroll state
   - Scroll reveal
   - Smooth anchor scrolling
===================================================== */
(function () {
  'use strict';

  /* Nav scroll */
  const nav = document.getElementById('nav');
  const hasSubnav = !!document.querySelector('.product-subnav');
  function updateNav() {
    if (!nav) return;
    // Pages with a subnav always keep the white scrolled state
    if (hasSubnav) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    }
  }
  let raf = null;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { updateNav(); raf = null; });
  }, { passive: true });
  updateNav();

  /* Mobile nav */
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;
  function toggleMenu(open) {
    menuOpen = open;
    if (mobileMenu) mobileMenu.classList.toggle('open', open);
    if (hamburger) hamburger.setAttribute('aria-expanded', String(open));
    if (hamburger) {
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
      spans[1].style.opacity   = open ? '0' : '';
      spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
    }
  }
  if (hamburger) hamburger.addEventListener('click', () => toggleMenu(!menuOpen));
  document.querySelectorAll('.nav-mobile-link').forEach(l => l.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('click', e => {
    if (menuOpen && nav && !nav.contains(e.target)) toggleMenu(false);
  });

  /* Products dropdown */
  const navItem = document.querySelector('.nav-item.has-dropdown');
  if (navItem) {
    const mainLink = navItem.querySelector('.nav-link');
    mainLink.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        navItem.classList.toggle('open');
      }
    });
    document.addEventListener('click', (e) => {
      if (!navItem.contains(e.target)) navItem.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') navItem.classList.remove('open');
    });
  }

  /* Scroll reveal */
  const targets = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay || '0', 10);
      setTimeout(() => e.target.classList.add('is-visible'), delay);
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  targets.forEach(t => io.observe(t));

  /* Smooth scroll with nav+subnav offset */
  const navH    = (nav ? nav.offsetHeight : 72) + 48 + 2; // nav + subnav + accent bar
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
    });
  });

  /* Lazy image fade-in */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.style.opacity = '0';
    img.style.transition = 'opacity 400ms ease';
    if (img.complete) { img.style.opacity = '1'; }
    else { img.addEventListener('load', () => { img.style.opacity = '1'; }); }
  });

  /* Gallery image lazy load (class-based) */
  document.querySelectorAll('.gallery-item img, .simple-gallery-item img, .mfg-gallery-item img').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); }
    else { img.addEventListener('load', () => img.classList.add('loaded')); }
  });

  /* Gallery tabs */
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const galleryPanels = document.querySelectorAll('.gallery-panel');
  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      galleryTabs.forEach(t => t.classList.remove('active'));
      galleryPanels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`.gallery-panel[data-panel="${target}"]`)?.classList.add('active');
    });
  });

  /* Lightbox */
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = lightbox?.querySelector('.gallery-lightbox-img');
  document.querySelectorAll('.gallery-item, .simple-gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (lightbox && lightboxImg && img) {
        lightboxImg.src = img.src;
        lightbox.classList.add('open');
      }
    });
  });
  lightbox?.querySelector('.gallery-lightbox-close')?.addEventListener('click', () => {
    lightbox.classList.remove('open');
  });
  lightbox?.addEventListener('click', e => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });

})();
