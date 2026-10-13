/* SWEEP Catch — inline homepage mini-game.
   Self-contained: no-ops on any page without #cgCanvas. Credits the shared
   demo balance (sessionStorage 'sweep_bal') so winnings carry into the lobby. */
(function () {
  var cv = document.getElementById('cgCanvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- shared demo balance ----
  function getBal() { var b; try { b = parseFloat(sessionStorage.getItem('sweep_bal')); } catch (e) {} if (!b || isNaN(b)) b = 1000; return b; }
  function addBal(d) { try { sessionStorage.setItem('sweep_bal', (getBal() + d).toFixed(2)); } catch (e) {} }
  function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // ---- dom ----
  var el = {
    score: document.getElementById('cgScore'), earn: document.getElementById('cgEarn'),
    combo: document.getElementById('cgCombo'), lives: document.getElementById('cgLives'),
    start: document.getElementById('cgStart'), over: document.getElementById('cgOver'),
    play: document.getElementById('cgPlay'), again: document.getElementById('cgAgain'),
    oTitle: document.getElementById('cgOverTitle'), oMsg: document.getElementById('cgOverMsg'),
    oEarn: document.getElementById('cgOverEarn'), oScore: document.getElementById('cgOverScore'),
    oCombo: document.getElementById('cgOverCombo'), oBal: document.getElementById('cgOverBal'),
    oEmoji: document.getElementById('cgOverEmoji')
  };

  // ---- types ----
  var TYPES = [
    { k: 'coin', r: 16, c: '#f5b63d', c2: '#ffd98a', pts: 10, w: 60, shape: 'coin' },
    { k: 'gem',  r: 15, c: '#39d98a', c2: '#9ff7cf', pts: 50, w: 16, shape: 'gem' },
    { k: 'big',  r: 20, c: '#7c5cff', c2: '#c3b4ff', pts: 150, w: 4, shape: 'star' },
    { k: 'bomb', r: 16, c: '#ff5470', c2: '#ff9db0', pts: 0, w: 7, shape: 'bomb', bomb: true }
  ];
  var WTOTAL = TYPES.reduce(function (s, t) { return s + t.w; }, 0);
  function pick() { var r = Math.random() * WTOTAL, a = 0; for (var i = 0; i < TYPES.length; i++) { a += TYPES[i].w; if (r <= a) return TYPES[i]; } return TYPES[0]; }

  // ---- state ----
  var paddle = { x: W / 2, w: 128, h: 16, y: H - 30 };
  var items, parts, floats, running = false, raf = 0, last = 0, acc = 0, elapsed, shake;
  var score, earn, combo, bestCombo, streak, lives;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function reset() {
    items = []; parts = []; floats = []; elapsed = 0; acc = 0; shake = 0;
    score = 0; earn = 0; combo = 1; bestCombo = 1; streak = 0; lives = 5;
    paddle.x = W / 2; hud();
  }

  function hud() {
    el.score.textContent = score;
    el.earn.textContent = fmt(earn);
    el.combo.textContent = '×' + combo;
    el.lives.textContent = Array(lives + 1).join('♥ ').trim() || '—';
  }

  function spawn() {
    var t = pick();
    var spd = rand(2.6, 3.8) + elapsed / 14000; // ramps with time
    items.push({ t: t, x: rand(t.r + 6, W - t.r - 6), y: -t.r, vy: spd, rot: 0, vr: rand(-0.08, 0.08) });
  }

  function burst(x, y, c, n) {
    if (reduce) return;
    for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: rand(-3.4, 3.4), vy: rand(-4.2, 1), life: 1, c: c, r: rand(1.5, 3.5) });
  }
  function floatTxt(x, y, txt, c) { floats.push({ x: x, y: y, txt: txt, c: c, life: 1 }); }

  function catchItem(it) {
    var x = it.x, y = it.y;
    if (it.t.bomb) {
      lives--; combo = 1; streak = 0; shake = 12;
      burst(x, y, '#ff5470', 22); floatTxt(x, y, 'BOOM', '#ff5470');
      if (lives <= 0) return end();
    } else {
      streak++;
      combo = Math.min(6, 1 + Math.floor(streak / 3));
      if (combo > bestCombo) bestCombo = combo;
      var p = it.t.pts * combo;
      score += p; earn += p * 0.01;
      burst(x, y, it.t.c, it.t.k === 'big' ? 24 : 12);
      floatTxt(x, y, '+' + p, it.t.c);
    }
    hud();
  }

  function step(dt) {
    elapsed += dt;
    // spawn pacing (faster over time, min 260ms)
    acc += dt;
    var every = Math.max(320, 760 - elapsed / 90);
    if (acc >= every) { acc = 0; spawn(); if (Math.random() < 0.18) spawn(); }

    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i];
      it.y += it.vy * (dt / 16.67); it.rot += it.vr;
      var hit = it.y + it.t.r >= paddle.y && it.y - it.t.r <= paddle.y + paddle.h &&
        it.x >= paddle.x - paddle.w / 2 - it.t.r * 0.5 && it.x <= paddle.x + paddle.w / 2 + it.t.r * 0.5;
      if (hit) { catchItem(it); items.splice(i, 1); if (!running) return; continue; }
      if (it.y - it.t.r > H) { items.splice(i, 1); if (!it.t.bomb) { streak = 0; combo = 1; hud(); } }
    }
    for (var j = parts.length - 1; j >= 0; j--) {
      var pt = parts[j]; pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.22; pt.life -= dt / 600;
      if (pt.life <= 0) parts.splice(j, 1);
    }
    for (var f = floats.length - 1; f >= 0; f--) {
      var fl = floats[f]; fl.y -= 0.6; fl.life -= dt / 900; if (fl.life <= 0) floats.splice(f, 1);
    }
    if (shake > 0) shake -= dt / 16.67;
  }

  // ---- drawing ----
  function drawShape(it) {
    var t = it.t, x = it.x, y = it.y, r = t.r;
    ctx.save(); ctx.translate(x, y); ctx.rotate(it.rot);
    var g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
    g.addColorStop(0, t.c2); g.addColorStop(1, t.c);
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5;
    ctx.shadowColor = t.c; ctx.shadowBlur = 14;
    if (t.shape === 'coin') {
      ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.35)';
      ctx.font = 'bold ' + (r * 1.05) + 'px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('S', 0, 1);
    } else if (t.shape === 'gem') {
      ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, -r * 0.2); ctx.lineTo(r * 0.6, r); ctx.lineTo(-r * 0.6, r); ctx.lineTo(-r, -r * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (t.shape === 'star') {
      ctx.beginPath();
      for (var k = 0; k < 10; k++) { var ang = Math.PI / 5 * k - Math.PI / 2; var rr = k % 2 ? r * 0.45 : r; ctx[k ? 'lineTo' : 'moveTo'](Math.cos(ang) * rr, Math.sin(ang) * rr); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    } else { // bomb
      ctx.beginPath(); ctx.arc(0, r * 0.15, r * 0.9, 0, 7); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = '#8a4a00'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, -r * 0.7); ctx.quadraticCurveTo(r * 0.5, -r * 1.1, r * 0.7, -r * 0.7); ctx.stroke();
      ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(r * 0.7, -r * 0.7, 2.4, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var ox = shake > 0 ? rand(-shake, shake) : 0, oy = shake > 0 ? rand(-shake, shake) : 0;
    ctx.save(); ctx.translate(ox, oy);
    // bg
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0e1016'); bg.addColorStop(1, '#14171f');
    ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 1;
    for (var gx = 0; gx < W; gx += 45) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    // items
    for (var i = 0; i < items.length; i++) drawShape(items[i]);
    // particles
    for (var j = 0; j < parts.length; j++) { var p = parts[j]; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    // floats
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 18px "JetBrains Mono", monospace';
    for (var f = 0; f < floats.length; f++) { var fl = floats[f]; ctx.globalAlpha = Math.max(0, fl.life); ctx.fillStyle = fl.c; ctx.fillText(fl.txt, fl.x, fl.y); }
    ctx.globalAlpha = 1;
    // paddle
    var px = paddle.x - paddle.w / 2;
    var pg = ctx.createLinearGradient(0, paddle.y, 0, paddle.y + paddle.h);
    pg.addColorStop(0, '#ffd98a'); pg.addColorStop(1, '#f5b63d');
    ctx.fillStyle = pg; ctx.shadowColor = '#f5b63d'; ctx.shadowBlur = 16;
    roundRect(px, paddle.y, paddle.w, paddle.h, 8); ctx.fill();
    ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,.35)';
    roundRect(px + 6, paddle.y + 3, paddle.w - 12, 3, 2); ctx.fill();
    ctx.restore();
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function loop(ts) {
    if (!running) return;
    var dt = Math.min(48, ts - last); last = ts;
    step(dt); if (!running) return; draw();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    reset(); running = true; last = performance ? performance.now() : 0;
    el.start.setAttribute('hidden', ''); el.over.setAttribute('hidden', '');
    cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
  }

  function end() {
    running = false; cancelAnimationFrame(raf);
    if (earn < 12) earn = 12 + Math.round(score * 0.01 * 100) / 100; // everyone leaves a winner
    addBal(earn);
    draw();
    el.oEmoji.textContent = score >= 4000 ? '🚀' : score >= 1500 ? '🏆' : '💰';
    el.oTitle.textContent = score >= 4000 ? 'Legendary haul — you won!' : score >= 1500 ? 'Big win!' : 'You won!';
    el.oEarn.textContent = fmt(earn);
    el.oScore.textContent = score;
    el.oCombo.textContent = '×' + bestCombo;
    el.oBal.textContent = fmt(getBal());
    el.over.removeAttribute('hidden');
  }

  // ---- input ----
  function setX(clientX) {
    var rect = cv.getBoundingClientRect();
    var x = (clientX - rect.left) / rect.width * W;
    paddle.x = Math.max(paddle.w / 2, Math.min(W - paddle.w / 2, x));
  }
  cv.addEventListener('pointermove', function (e) { if (running) setX(e.clientX); });
  cv.addEventListener('touchmove', function (e) { if (running && e.touches[0]) { e.preventDefault(); setX(e.touches[0].clientX); } }, { passive: false });
  if (el.play) el.play.addEventListener('click', start);
  if (el.again) el.again.addEventListener('click', start);

  // "Play SWEEP Catch" CTA on the hero strip: smooth-scroll in, then auto-start
  var heroPlay = document.getElementById('heroPlay');
  if (heroPlay) heroPlay.addEventListener('click', function (e) {
    e.preventDefault();
    var sec = document.getElementById('catchGame');
    if (sec && sec.scrollIntoView) sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    setTimeout(start, reduce ? 0 : 480);
  });

  // idle preview frame so the stage isn't blank before first play
  reset(); draw();
})();
