(function () {
  if (localStorage.getItem('cookies-accepted') || localStorage.getItem('cookies-declined')) return;

  // Localised strings injected by base.njk (window.cookieBannerStrings).
  // English fallback covers the case where this file is loaded outside
  // the Eleventy-rendered site (e.g. cefla.html, which is served as
  // a passthrough English-only page and does not emit the inline
  // strings block).
  var s = (typeof window !== 'undefined' && window.cookieBannerStrings) || {
    body: 'We use analytics cookies to understand how visitors use this site.',
    privacyLinkText: 'Privacy Policy',
    privacyUrl: '/privacy.html',
    decline: 'Decline',
    accept: 'Accept'
  };

  function escAttr(s) { return String(s).replace(/"/g, '&quot;'); }

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML =
    '<p>' + s.body + ' <a href="' + escAttr(s.privacyUrl) + '">' + s.privacyLinkText + '</a></p>' +
    '<div class="cookie-banner-buttons">' +
    '<button id="cookie-decline">' + s.decline + '</button>' +
    '<button id="cookie-accept">' + s.accept + '</button>' +
    '</div>';
  document.body.appendChild(banner);

  function hideBanner() {
    banner.classList.add('cookie-banner--hidden');
    setTimeout(function () { banner.remove(); }, 400);
  }

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem('cookies-accepted', '1');
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {'analytics_storage': 'granted'});
    }
    hideBanner();
  });

  document.getElementById('cookie-decline').addEventListener('click', function () {
    localStorage.setItem('cookies-declined', '1');
    hideBanner();
  });
})();
