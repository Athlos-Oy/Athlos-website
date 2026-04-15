(function () {
  if (localStorage.getItem('cookies-accepted') || localStorage.getItem('cookies-declined')) return;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML =
    '<p>We use analytics cookies to understand how visitors use this site. <a href="/privacy.html">Privacy Policy</a></p>' +
    '<div class="cookie-banner-buttons">' +
    '<button id="cookie-decline">Decline</button>' +
    '<button id="cookie-accept">Accept</button>' +
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
