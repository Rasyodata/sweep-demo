/* Live Tournaments + Weekly Leaderboard — multiplayer competition with $SWEEP rewards.
   Self-contained: no-ops without #tournGrid / #lbBody. All names are fictional handles. */
(function () {
  var grid = document.getElementById('tournGrid');
  var lbBody = document.getElementById('lbBody');
  var lbReset = document.getElementById('lbReset');
  if (!grid && !lbBody) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function nf(n) { return Math.floor(n).toLocaleString('en-US'); }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function hms(s) { s = Math.max(0, s | 0); return p2((s / 3600) | 0) + ':' + p2(((s % 3600) / 60) | 0) + ':' + p2(s % 60); }
  function dhms(s) { s = Math.max(0, s | 0); return ((s / 86400) | 0) + 'd ' + hms(s % 86400); }

  // ---------- Tournaments ----------
  var T = [
    { ic: '🚀', name: 'Crash Masters', sub: 'Elimination · every 10 min', prize: 25000, joined: 3142, cap: 5000, ends: 2 * 3600 + 14 * 60 + 33, leaders: [['CryptoWhale', 48210], ['NeonTrader', 41980], ['VaultRunner', 39640]] },
    { ic: '💣', name: 'Mines Mayhem', sub: 'Survival · best streak', prize: 12000, joined: 1890, cap: 3000, ends: 1 * 3600 + 48 * 60 + 10, leaders: [['PixelPunter', 22140], ['LunaFX', 20870], ['ZenTrader', 19030]] },
    { ic: '✈️', name: 'Aviator League', sub: 'Highest multiplier wins', prize: 40000, joined: 4201, cap: 6000, ends: 5 * 3600 + 32 * 60, leaders: [['AstroDegen', 91200], ['SweepKing', 88450], ['CryptoWhale', 84110]] },
    { ic: '🎡', name: 'Daily Spin Cup', sub: 'Most rewards claimed', prize: 8000, joined: 2560, cap: 4000, ends: 42 * 60 + 15, leaders: [['SweepKing', 15600], ['LunaFX', 14320], ['MoonMuse', 13780]] }
  ];

  if (grid) {
    T.forEach(function (t) {
      var pct = Math.min(100, Math.round(t.joined / t.cap * 100));
      var lb = t.leaders.map(function (l, j) {
        return '<div class="tlb-row"><span class="r r' + (j + 1) + '">' + (j + 1) + '</span><span class="nm">' + l[0] + '</span><span class="pts" data-pts>' + nf(l[1]) + '</span></div>';
      }).join('');
      var el = document.createElement('div'); el.className = 'tcard';
      el.innerHTML =
        '<div class="tcard-top"><span class="tcard-ic">' + t.ic + '</span><div class="tcard-h"><b>' + t.name + '</b><span>' + t.sub + '</span></div><span class="tcard-live"><i></i>LIVE</span></div>'
        + '<div class="tcard-prize"><span>PRIZE POOL</span><b>$' + nf(t.prize) + '</b></div>'
        + '<div class="tcard-bar"><i style="width:' + pct + '%"></i></div>'
        + '<div class="tcard-pl"><b data-joined>' + nf(t.joined) + '</b> / ' + nf(t.cap) + ' players</div>'
        + '<div class="tcard-lb">' + lb + '</div>'
        + '<div class="tcard-foot"><span class="tcard-timer">Ends in <b data-ends>' + hms(t.ends) + '</b></span><button class="btn gold tjoin">Join →</button></div>';
      grid.appendChild(el);
      el.querySelector('.tjoin').addEventListener('click', function () {
        t.joined = Math.min(t.cap, t.joined + 1);
        if (window.toast) window.toast('🏆 You joined ' + t.name + '! Climb the leaderboard to win $SWEEP.', 'success');
      });
    });
  }

  // ---------- Weekly Leaderboard ----------
  var REW = [25000, 12000, 8000, 5000, 3000, 2000, 1500, 1000];
  var LB = [
    ['CryptoWhale', 418, 982140], ['AstroDegen', 392, 911050], ['SweepKing', 377, 874300],
    ['NeonTrader', 355, 812900], ['LunaFX', 341, 780420], ['VaultRunner', 328, 742110],
    ['PixelPunter', 310, 701890], ['ZenTrader', 298, 668400]
  ];
  function renderLB() {
    if (!lbBody) return;
    LB.sort(function (a, b) { return b[2] - a[2]; });
    var h = '';
    for (var i = 0; i < LB.length; i++) {
      var med = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
      h += '<div class="lb-row' + (i < 3 ? ' top' : '') + '"><span class="lb-rank">' + med + '</span>'
        + '<span class="lb-nm">' + LB[i][0] + '</span><span class="lb-g">' + nf(LB[i][1]) + '</span>'
        + '<span class="lb-sc">' + nf(LB[i][2]) + '</span><span class="lb-rw">$' + nf(REW[i]) + '</span></div>';
    }
    lbBody.innerHTML = h;
  }
  renderLB();

  var weekLeft = 3 * 86400 + 14 * 3600 + 22 * 60 + 8;
  if (lbReset) lbReset.textContent = 'Resets in ' + dhms(weekLeft);

  // ---------- live ticking ----------
  if (reduce) return;
  setInterval(function () {
    for (var i = 0; i < T.length; i++) {
      T[i].ends = Math.max(0, T[i].ends - 1);
      var c = grid && grid.children[i];
      if (c) { var e = c.querySelector('[data-ends]'); if (e) e.textContent = hms(T[i].ends); }
    }
    weekLeft = Math.max(0, weekLeft - 1);
    if (lbReset) lbReset.textContent = 'Resets in ' + dhms(weekLeft);
  }, 1000);

  setInterval(function () {
    for (var i = 0; i < T.length; i++) {
      if (T[i].joined < T[i].cap) T[i].joined += (Math.random() * 3) | 0;
      var c = grid && grid.children[i];
      if (c) {
        var j = c.querySelector('[data-joined]'); if (j) j.textContent = nf(T[i].joined);
        var bar = c.querySelector('.tcard-bar i'); if (bar) bar.style.width = Math.min(100, Math.round(T[i].joined / T[i].cap * 100)) + '%';
        var pts = c.querySelectorAll('[data-pts]');
        for (var k = 0; k < pts.length; k++) { T[i].leaders[k][1] += (Math.random() * 45) | 0; pts[k].textContent = nf(T[i].leaders[k][1]); }
      }
    }
    for (var m = 0; m < LB.length; m++) LB[m][2] += (Math.random() * 130) | 0;
    renderLB();
  }, 1800);
})();
