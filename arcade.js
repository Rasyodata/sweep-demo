/* Sweep Arcade games panel — paginated carousel (10 per page, slides left).
   Self-contained: no-ops without #gpTrack. */
(function () {
  var track = document.getElementById('gpTrack');
  if (!track) return;
  var pages = track.querySelectorAll('.gp-page');
  var n = pages.length;
  var dotsWrap = document.getElementById('gpDots');
  var prev = document.getElementById('gpPrev');
  var next = document.getElementById('gpNext');
  if (n <= 1) { var nav = document.querySelector('.gp-nav'); if (nav) nav.style.display = 'none'; return; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var idx = 0, timer = 0, dots = [];

  for (var i = 0; i < n; i++) {
    var d = document.createElement('button');
    d.className = 'gp-dot' + (i === 0 ? ' on' : '');
    d.setAttribute('aria-label', 'Page ' + (i + 1));
    (function (k) { d.addEventListener('click', function () { go(k); }); })(i);
    dotsWrap.appendChild(d); dots.push(d);
  }

  function render() {
    track.style.transform = 'translateX(-' + (idx * 100) + '%)';
    for (var i = 0; i < n; i++) dots[i].classList.toggle('on', i === idx);
  }
  function go(k) { idx = (k + n) % n; render(); schedule(); }
  function schedule() { if (reduce) return; clearTimeout(timer); timer = setTimeout(function () { go(idx + 1); }, 5200); }

  if (prev) prev.addEventListener('click', function () { go(idx - 1); });
  if (next) next.addEventListener('click', function () { go(idx + 1); });
  var panel = track.closest('.gpanel');
  if (panel) {
    panel.addEventListener('mouseenter', function () { clearTimeout(timer); });
    panel.addEventListener('mouseleave', schedule);
  }
  render(); schedule();
})();
