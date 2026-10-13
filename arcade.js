/* Scrolling games-name ticker — fills #gtickerTrack (duplicated for a seamless loop). */
(function () {
  var tr = document.getElementById('gtickerTrack');
  if (!tr) return;
  var names = ['Market', 'Sport', 'Trade', 'Sweepstake', 'Cases', 'Upgrade', 'Changer', 'Click', 'Boomb', 'Booster', 'Plincoin', 'Flip', 'Tower', 'Fighter', 'Racing', 'Card', 'Crash'];
  function build() {
    var h = '';
    for (var i = 0; i < names.length; i++) h += '<a href="game.html">' + names[i] + '</a><b>◆</b>';
    h += '<a class="gt-perp" href="https://sweep-perp.onrender.com/" target="_blank" rel="noopener">⚡ Sweep Perp</a><b>◆</b>';
    return h;
  }
  tr.innerHTML = build() + build();
})();

/* Live "players online / playing" counter — gentle random walk.
   Drives the panel footer (#gpOnline) and the ticker tag (#gtickerCount). */
(function () {
  var panel = document.getElementById('gpOnline'), tick = document.getElementById('gtickerCount');
  if (!panel && !tick) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var n = 3200 + Math.floor(Math.random() * 900);
  function render() { var s = n.toLocaleString('en-US'); if (panel) panel.textContent = s; if (tick) tick.textContent = s; }
  render();
  if (reduce) return;
  setInterval(function () {
    n += Math.floor(Math.random() * 15) - 6;
    if (n < 2600) n = 2600; if (n > 4800) n = 4800;
    render();
  }, 1400);
})();

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
