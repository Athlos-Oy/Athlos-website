/* Language switcher — click-to-open for touch + keyboard, outside-click close.
   Loaded on every page (homepage, product pages, cefla, etc.) so the switcher
   works regardless of which other script the page uses. */
(function () {
  'use strict';

  document.querySelectorAll('[data-lang-switcher]').forEach((sw) => {
    const trigger = sw.querySelector('.lang-switcher-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = sw.hasAttribute('data-open');
      if (open) {
        sw.removeAttribute('data-open');
        trigger.setAttribute('aria-expanded', 'false');
      } else {
        sw.setAttribute('data-open', '');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', (e) => {
    document.querySelectorAll('[data-lang-switcher][data-open]').forEach((sw) => {
      if (!sw.contains(e.target)) {
        sw.removeAttribute('data-open');
        const trig = sw.querySelector('.lang-switcher-trigger');
        if (trig) trig.setAttribute('aria-expanded', 'false');
      }
    });
  });

})();
