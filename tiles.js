/* Arcade tiles — each tile shows a tiny live, self-playing preview of its game.
   All motifs are original (charts, pegs, grids, spinners) — no third-party art.
   Self-contained: no-ops without .gtile elements. */
(function () {
  var tiles = document.querySelectorAll('.gtile');
  if (!tiles.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MAP = {
    'Crash': 'chart', 'Market': 'chart', 'Trade': 'chart',
    'Plinko': 'plinko', 'Mines': 'grid', 'Cases': 'grid',
    'Dice': 'dice', 'Wheel': 'wheel', 'Racing': 'race',
    'Coin Flip': 'flip', 'Hi-Lo': 'card', 'Tower': 'stack',
    'Upgrade': 'arc', 'Booster': 'rocket', 'Sport': 'pulse',
    'Fighter': 'pulse', 'Click': 'pulse', 'Sweepstake': 'ticket',
    'Scratch': 'scratch', 'Darts': 'darts', 'Slots': 'slots',
    'Roulette': 'wheel', 'Blackjack': 'card',
    'Keno': 'keno', 'Limbo': 'limbo', 'Baccarat': 'card', 'Double': 'wheel',
    'Watch & Earn': 'video', 'Mining': 'mining'
  };
  var GOLD = '#f5b63d', GREEN = '#39d98a', RED = '#ff5470', VIO = '#7c5cff';

  var insts = [];
  tiles.forEach(function (t) {
    var name = (t.querySelector('b') || {}).textContent || '';
    var type = MAP[name] || 'chart';
    var ic = t.querySelector('.gt-ic');
    var cv = document.createElement('canvas'); cv.width = 180; cv.height = 76; cv.className = 'gt-cv'; cv.setAttribute('aria-hidden', 'true');
    if (ic) { ic.parentNode.replaceChild(cv, ic); } else { t.insertBefore(cv, t.firstChild); }
    var live = document.createElement('span'); live.className = 'gt-live'; live.innerHTML = '<i></i>LIVE'; t.appendChild(live);
    insts.push({ ctx: cv.getContext('2d'), W: cv.width, H: cv.height, type: type, seed: Math.random() * 1000, st: {} });
  });

  // Watch & Earn tile → scroll to the video, reward 25 $SWEEP (once per session)
  (function () {
    var we = null;
    tiles.forEach(function (t) { if (((t.querySelector('b') || {}).textContent || '').trim() === 'Watch & Earn') we = t; });
    if (!we) return;
    we.addEventListener('click', function (e) {
      e.preventDefault();
      var v = document.getElementById('whatis');
      if (v && v.scrollIntoView) v.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      try { if (sessionStorage.getItem('sweep_watch_earned')) { if (window.toast) window.toast('You already claimed your watch reward. 🎬', 'info'); return; } } catch (e2) {}
      if (window.toast) window.toast('▶ Enjoy the video — your 25 $SWEEP is on the way…', 'info');
      setTimeout(function () {
        try { var b = parseFloat(sessionStorage.getItem('sweep_bal')); if (!b || isNaN(b)) b = 1000; sessionStorage.setItem('sweep_bal', (b + 25).toFixed(2)); sessionStorage.setItem('sweep_watch_earned', '1'); } catch (e3) {}
        if (window.toast) window.toast('🎉 You earned 25 $SWEEP for watching!', 'success');
      }, reduce ? 300 : 5000);
    });
  })();

  function rand(a, b) { return a + Math.random() * (b - a); }

  function chart(g, c, W, H, tm) {
    var pts = 26, step = W / (pts - 1);
    c.lineWidth = 2; c.strokeStyle = GREEN; c.beginPath();
    var last = 0;
    for (var i = 0; i < pts; i++) {
      var ph = tm * 0.0022 + g.seed + i * 0.42;
      var y = H * 0.72 - (Math.sin(ph) * 0.5 + 0.5) * (H * 0.5) * (0.4 + i / pts);
      if (i === 0) c.moveTo(0, y); else c.lineTo(i * step, y);
      if (i === pts - 1) last = y;
    }
    c.stroke();
    c.lineTo(W, H); c.lineTo(0, H); c.closePath();
    c.fillStyle = 'rgba(57,217,138,.12)'; c.fill();
    c.fillStyle = GOLD; c.beginPath(); c.arc(W - 2, last, 3, 0, 7); c.fill();
  }
  function plinko(g, c, W, H, tm) {
    c.fillStyle = 'rgba(255,255,255,.18)';
    for (var r = 0; r < 4; r++) for (var i = 0; i <= r + 2; i++) { var px = W / 2 + (i - (r + 2) / 2) * 16; var py = 14 + r * 13; c.beginPath(); c.arc(px, py, 1.6, 0, 7); c.fill(); }
    var p = (tm * 0.0012 + g.seed) % 1;
    var by = 6 + p * (H - 12);
    var bx = W / 2 + Math.sin(p * 10 + g.seed) * 20;
    c.fillStyle = GOLD; c.shadowColor = GOLD; c.shadowBlur = 8; c.beginPath(); c.arc(bx, by, 4, 0, 7); c.fill(); c.shadowBlur = 0;
  }
  function grid(g, c, W, H, tm) {
    var n = 3, gap = 5, s = (Math.min(W, H + 20) - gap * (n + 1)) / n, ox = (W - (s * n + gap * (n - 1))) / 2, oy = (H - (s * n + gap * (n - 1))) / 2;
    for (var i = 0; i < n * n; i++) {
      var x = ox + (i % n) * (s + gap), y = oy + ((i / n) | 0) * (s + gap);
      var lit = (Math.sin(tm * 0.003 + g.seed + i * 1.7) > 0.4);
      c.fillStyle = lit ? (i % 5 === 0 ? RED : GOLD) : 'rgba(255,255,255,.08)';
      c.beginPath(); c.roundRect ? c.roundRect(x, y, s, s, 3) : c.rect(x, y, s, s); c.fill();
    }
  }
  function dice(g, c, W, H, tm) {
    var v = 1 + (Math.floor(tm / 700 + g.seed) % 6);
    var s = 34, x = (W - s) / 2, y = (H - s) / 2;
    c.fillStyle = '#eef1f6'; c.beginPath(); c.roundRect ? c.roundRect(x, y, s, s, 6) : c.rect(x, y, s, s); c.fill();
    c.fillStyle = '#16181c';
    var pos = { 1: [[.5, .5]], 2: [[.28, .28], [.72, .72]], 3: [[.28, .28], [.5, .5], [.72, .72]], 4: [[.28, .28], [.72, .28], [.28, .72], [.72, .72]], 5: [[.28, .28], [.72, .28], [.5, .5], [.28, .72], [.72, .72]], 6: [[.28, .25], [.72, .25], [.28, .5], [.72, .5], [.28, .75], [.72, .75]] };
    pos[v].forEach(function (p) { c.beginPath(); c.arc(x + p[0] * s, y + p[1] * s, 2.6, 0, 7); c.fill(); });
  }
  function wheel(g, c, W, H, tm) {
    var cxp = W / 2, cyp = H / 2 + 2, r = Math.min(W, H) / 2 - 6, a = tm * 0.002 + g.seed, cols = [GOLD, VIO, GREEN, RED, '#eef1f6', GOLD];
    for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(cxp, cyp); c.arc(cxp, cyp, r, a + i * Math.PI / 3, a + (i + 1) * Math.PI / 3); c.closePath(); c.fillStyle = cols[i]; c.globalAlpha = .85; c.fill(); }
    c.globalAlpha = 1; c.fillStyle = '#eef1f6'; c.beginPath(); c.moveTo(cxp, cyp - r - 1); c.lineTo(cxp - 4, cyp - r + 6); c.lineTo(cxp + 4, cyp - r + 6); c.closePath(); c.fill();
  }
  function race(g, c, W, H, tm) {
    for (var l = 0; l < 3; l++) { var y = 18 + l * 18; c.strokeStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(0, y + 6); c.lineTo(W, y + 6); c.stroke(); var p = ((tm * (0.00018 + l * 0.00006) + g.seed + l * 0.3) % 1); c.fillStyle = [GOLD, GREEN, VIO][l]; c.beginPath(); c.arc(p * (W - 10) + 5, y, 4, 0, 7); c.fill(); }
  }
  function flip(g, c, W, H, tm) {
    var sx = Math.cos(tm * 0.004 + g.seed); var s = 30;
    c.save(); c.translate(W / 2, H / 2); c.scale(Math.abs(sx) + 0.05, 1);
    var g2 = c.createLinearGradient(-s / 2, 0, s / 2, 0); g2.addColorStop(0, '#ffd98a'); g2.addColorStop(1, GOLD);
    c.fillStyle = sx >= 0 ? g2 : '#2a2f3a'; c.beginPath(); c.arc(0, 0, s / 2, 0, 7); c.fill();
    c.fillStyle = sx >= 0 ? 'rgba(0,0,0,.35)' : GOLD; c.font = 'bold 16px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sx >= 0 ? 'S' : '$', 0, 1);
    c.restore();
  }
  function card(g, c, W, H, tm) {
    var sx = Math.cos(tm * 0.0035 + g.seed); var w = 26, h = 38;
    c.save(); c.translate(W / 2, H / 2); c.scale(Math.abs(sx) + 0.05, 1);
    c.fillStyle = '#eef1f6'; c.beginPath(); c.roundRect ? c.roundRect(-w / 2, -h / 2, w, h, 4) : c.rect(-w / 2, -h / 2, w, h); c.fill();
    c.fillStyle = sx >= 0 ? RED : '#16181c'; c.font = 'bold 13px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(sx >= 0 ? 'A' : 'K', 0, 0);
    c.restore();
  }
  function stack(g, c, W, H, tm) {
    var n = 5, bw = 16, p = (tm * 0.0015 + g.seed) % 1.4, lit = Math.floor(p * n);
    for (var i = 0; i < n; i++) { var y = H - 8 - i * 12; c.fillStyle = i < lit ? GOLD : 'rgba(255,255,255,.1)'; c.beginPath(); c.roundRect ? c.roundRect(W / 2 - bw / 2, y - 9, bw, 9, 2) : c.rect(W / 2 - bw / 2, y - 9, bw, 9); c.fill(); }
  }
  function arc(g, c, W, H, tm) {
    var cxp = W / 2, cyp = H - 8, r = Math.min(W / 2, H) - 8;
    c.lineWidth = 6; c.strokeStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.arc(cxp, cyp, r, Math.PI, 0); c.stroke();
    var f = (Math.sin(tm * 0.0025 + g.seed) * 0.5 + 0.5);
    c.strokeStyle = GREEN; c.beginPath(); c.arc(cxp, cyp, r, Math.PI, Math.PI + f * Math.PI); c.stroke();
    var a = Math.PI + f * Math.PI; c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.moveTo(cxp, cyp); c.lineTo(cxp + Math.cos(a) * r, cyp + Math.sin(a) * r); c.stroke();
  }
  function rocket(g, c, W, H, tm) {
    var p = (tm * 0.0016 + g.seed) % 1; var x = 10 + p * (W - 20), y = H - 8 - p * (H - 20);
    c.strokeStyle = 'rgba(245,182,61,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, H - 8); c.lineTo(x, y); c.stroke();
    c.fillStyle = RED; c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill();
    c.fillStyle = GOLD; c.font = 'bold 11px "JetBrains Mono", monospace'; c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('x' + (1 + p * 8).toFixed(2), W - 4, 3);
  }
  function pulse(g, c, W, H, tm) {
    var cxp = W / 2, cyp = H / 2, p = (tm * 0.0018 + g.seed) % 1;
    for (var k = 0; k < 3; k++) { var pp = (p + k / 3) % 1; c.globalAlpha = (1 - pp) * 0.7; c.strokeStyle = GOLD; c.lineWidth = 2; c.beginPath(); c.arc(cxp, cyp, 4 + pp * 26, 0, 7); c.stroke(); }
    c.globalAlpha = 1; c.fillStyle = GOLD; c.beginPath(); c.arc(cxp, cyp, 4, 0, 7); c.fill();
  }
  function ticket(g, c, W, H, tm) {
    c.font = 'bold 15px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var i = 0; i < 4; i++) { var d = Math.floor((tm * 0.01 + g.seed * 10 + i * 7)) % 10; c.fillStyle = i === 3 ? GOLD : '#cfd5e2'; c.fillText(d, W / 2 - 24 + i * 16, H / 2); }
  }

  function rr(c, x, y, w, h, r) { c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h); }
  function scratch(g, c, W, H, tm) {
    var w = 80, h = 48, x = (W - w) / 2, y = (H - h) / 2;
    c.fillStyle = '#20242e'; rr(c, x, y, w, h, 6); c.fill(); c.strokeStyle = 'rgba(245,182,61,.35)'; c.lineWidth = 1; c.stroke();
    c.fillStyle = GOLD; c.font = 'bold 18px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$50', W / 2, H / 2);
    var rev = Math.min(1, (tm * 0.0009 + g.seed) % 1.5);
    c.fillStyle = '#9aa0ad'; c.fillRect(x + w * rev, y, w * (1 - rev), h);
    c.fillStyle = 'rgba(255,255,255,.4)'; for (var i = 0; i < 5; i++) c.fillRect(x + w * rev - 2, y + 5 + i * 9, 3, 3);
  }
  function darts(g, c, W, H, tm) {
    var cxp = W / 2, cyp = H / 2, rings = [[20, '#2a2f3a'], [15, '#eef1f6'], [11, RED], [6, '#16181c'], [3, GOLD]];
    rings.forEach(function (ri) { c.fillStyle = ri[1]; c.beginPath(); c.arc(cxp, cyp, ri[0], 0, 7); c.fill(); });
    var p = (tm * 0.0013 + g.seed) % 1, d = (1 - Math.min(1, p * 1.5)) * 42, dx = cxp + d * 0.7, dy = cyp - d;
    c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(dx + 8, dy - 8); c.lineTo(dx, dy); c.stroke();
    c.fillStyle = GREEN; c.beginPath(); c.arc(dx, dy, 2.6, 0, 7); c.fill();
  }
  function slots(g, c, W, H, tm) {
    var syms = ['7', '$', '◆', '★', 'S'], cols = [GOLD, GREEN, VIO];
    for (var r = 0; r < 3; r++) {
      var x = W / 2 - 28 + r * 28;
      c.fillStyle = 'rgba(255,255,255,.05)'; rr(c, x - 12, H / 2 - 17, 24, 34, 4); c.fill(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 1; c.stroke();
      var idx = Math.floor(tm * 0.006 + g.seed * 13 + r * 4) % syms.length;
      c.fillStyle = cols[r]; c.font = 'bold 16px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(syms[idx], x, H / 2);
    }
  }

  function keno(g, c, W, H, tm) {
    var cols = 5, rows = 2, cw = (W - 18) / cols, ch = (H - 12) / rows, ox = 9, oy = 6;
    for (var i = 0; i < cols * rows; i++) {
      var x = ox + (i % cols) * cw, y = oy + ((i / cols) | 0) * ch;
      var hit = Math.sin(tm * 0.0024 + g.seed + i * 1.3) > 0.5;
      c.fillStyle = hit ? GOLD : 'rgba(255,255,255,.07)'; rr(c, x + 2, y + 2, cw - 4, ch - 4, 3); c.fill();
      c.fillStyle = hit ? '#101218' : 'rgba(255,255,255,.3)'; c.font = 'bold 11px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(i + 1, x + cw / 2, y + ch / 2);
    }
  }
  function limbo(g, c, W, H, tm) {
    var p = (tm * 0.0009 + g.seed) % 1, mult = 1 + p * p * 8;
    c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(10, H - 10); c.lineTo(W - 10, H - 10); c.stroke();
    c.fillStyle = mult > 4 ? GREEN : GOLD; c.font = 'bold 26px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(mult.toFixed(2) + 'x', W / 2, H / 2 - 2);
  }

  function video(g, c, W, H, tm) {
    var cxp = W / 2, cyp = H / 2 - 4, p = (tm * 0.0018 + g.seed) % 1;
    for (var k = 0; k < 2; k++) { var pp = (p + k / 2) % 1; c.globalAlpha = (1 - pp) * 0.55; c.strokeStyle = RED; c.lineWidth = 2; c.beginPath(); c.arc(cxp, cyp, 13 + pp * 20, 0, 7); c.stroke(); }
    c.globalAlpha = 1;
    c.fillStyle = RED; c.beginPath(); c.arc(cxp, cyp, 15, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(cxp - 5, cyp - 7); c.lineTo(cxp - 5, cyp + 7); c.lineTo(cxp + 8, cyp); c.closePath(); c.fill();
    c.fillStyle = GOLD; c.font = 'bold 11px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WATCH → +25 $SWEEP', W / 2, H - 11);
  }

  function mining(g, c, W, H, tm) {
    var rx = W / 2 + 6, ry = H / 2 + 8, p = tm * 0.004 + g.seed, hit = Math.sin(p);
    // rock
    c.fillStyle = '#39414f'; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(rx - 20, ry + 10); c.lineTo(rx - 22, ry - 6); c.lineTo(rx - 8, ry - 16); c.lineTo(rx + 14, ry - 14); c.lineTo(rx + 22, ry + 2); c.lineTo(rx + 16, ry + 14); c.closePath(); c.fill(); c.stroke();
    // gold vein in rock
    c.fillStyle = GOLD; c.beginPath(); c.arc(rx + 1, ry - 2, 3, 0, 7); c.fill(); c.beginPath(); c.arc(rx - 7, ry + 4, 2, 0, 7); c.fill();
    // SWEEP coins rising out of the rock
    for (var i = 0; i < 3; i++) {
      var cp = (p * 0.16 + i / 3 + g.seed) % 1, cy = ry - 10 - cp * 28, cx = rx + Math.sin(i * 2 + p) * 9;
      c.globalAlpha = 1 - cp; c.fillStyle = GOLD; c.shadowColor = GOLD; c.shadowBlur = 5;
      c.beginPath(); c.arc(cx, cy, 4, 0, 7); c.fill(); c.shadowBlur = 0;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.font = 'bold 5px "JetBrains Mono", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('S', cx, cy + 0.5);
    }
    c.globalAlpha = 1;
    // swinging pickaxe
    var ang = -0.5 + Math.max(0, hit) * 0.7;
    c.save(); c.translate(rx - 22, ry - 20); c.rotate(ang);
    c.strokeStyle = '#caa15a'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(15, -15); c.stroke();
    c.strokeStyle = '#d7dbe2'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(9, -21); c.lineTo(21, -9); c.stroke();
    c.restore(); c.lineCap = 'butt';
  }

  var FN = { chart: chart, plinko: plinko, grid: grid, dice: dice, wheel: wheel, race: race, flip: flip, card: card, stack: stack, arc: arc, rocket: rocket, pulse: pulse, ticket: ticket, scratch: scratch, darts: darts, slots: slots, keno: keno, limbo: limbo, video: video, mining: mining };

  function render(g, tm) {
    var c = g.ctx, W = g.W, H = g.H;
    c.clearRect(0, 0, W, H);
    var bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0c1016'); bg.addColorStop(1, '#0a0d12');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    (FN[g.type] || chart)(g, c, W, H, tm);
  }

  if (reduce) { for (var i = 0; i < insts.length; i++) render(insts[i], 1200 + i * 90); return; }
  var raf = 0;
  function frame(ts) { for (var i = 0; i < insts.length; i++) render(insts[i], ts); raf = requestAnimationFrame(frame); }
  raf = requestAnimationFrame(frame);
})();
