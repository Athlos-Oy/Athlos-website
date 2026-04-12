(function () {
  if (localStorage.getItem('cookies-accepted')) return;

  var banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML =
    '<p>This site uses cookies for essential functionality. By continuing to use this site, you accept our use of cookies. <a href="/privacy.html">Privacy Policy</a></p>' +
    '<button id="cookie-accept">Accept</button>';
  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem('cookies-accepted', '1');
    banner.classList.add('cookie-banner--hidden');
    setTimeout(function () { banner.remove(); }, 400);
  });
})();
