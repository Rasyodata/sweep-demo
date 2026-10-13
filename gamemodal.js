/* Inline game modal — a quick tap-the-$SWEEP game that opens on the homepage
   when any arcade tile's Play is clicked. Exposes window.__openGame(name).
   Self-contained: no-ops without #gameModal. All art is original. */
(function () {
  var modal = document.getElementById('gameModal');
  if (!modal) return;
  var cv = document.getElementById('gmCanvas'), ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var el = {
    title: document.getElementById('gmTitle'), ic: document.getElementById('gmIc'),
    score: document.getElementById('gmScore'), earn: document.getElementById('gmEarn'), time: document.getElementById('gmTime'),
    start: document.getElementById('gmStart'), over: document.getElementById('gmOver'),
    play: document.getElementById('gmPlay'), again: document.getElementById('gmAgain'),
    won: document.getElementById('gmWon'), emoji: document.getElementById('gmEmoji'),
    close: document.getElementById('gmClose'), close2: document.getElementById('gmClose2')
  };

  function getBal() { var b; try { b = parseFloat(sessionStorage.getItem('sweep_bal')); } catch (e) {} if (!b || isNaN(b)) b = 1000; return b; }
  function addBal(d) { try { sessionStorage.setItem('sweep_bal', (getBal() + d).toFixed(2)); } catch (e) {} }
  function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  var ICONS = { Crash: '🚀', Plinko: '🔻', Mines: '💣', Dice: '🎲', Wheel: '🎡', 'Coin Flip': '🪙', Tower: '🗼', Cases: '📦', Upgrade: '⬆️', 'Hi-Lo': '🃏', Racing: '🏇', Fighter: '🥊', Market: '📈', Sport: '⚽', Trade: '💹', Sweepstake: '🎟️', Click: '🖱️', Booster: '🔥', Keno: '🎱', Limbo: '⚡', Baccarat: '🎴', Double: '🔵', Scratch: '🎫', Darts: '🎯', Slots: '🎰', Roulette: '🔴', Blackjack: '🎴', Mining: '⛏️', Aviator: '✈️', Penalty: '⚽', 'Sic Bo': '🎲', Bingo: '🔢', Balloon: '🎈', Diamonds: '💎' };

  var items, parts, floats, running = false, raf = 0, last = 0, acc = 0, timeLeft = 25, score = 0, earn = 0, combo = 1, flash = 0;

  var TYPES = [
    { k: 'coin', r: 20, c: '#f5b63d', c2: '#ffd98a', pts: 10, w: 60 },
    { k: 'gem', r: 18, c: '#39d98a', c2: '#9ff7cf', pts: 30, w: 22 },
    { k: 'bomb', r: 19, c: '#ff5470', c2: '#ff9db0', pts: 0, w: 18, bomb: true }
  ];
  var WT = TYPES.reduce(function (s, t) { return s + t.w; }, 0);
  function pick() { var r = Math.random() * WT, a = 0; for (var i = 0; i < TYPES.length; i++) { a += TYPES[i].w; if (r <= a) return TYPES[i]; } return TYPES[0]; }

  function reset() { items = []; parts = []; floats = []; acc = 0; timeLeft = 25; score = 0; earn = 0; combo = 1; flash = 0; hud(); }
  function hud() { el.score.textContent = score; el.earn.textContent = fmt(earn); el.time.textContent = Math.max(0, Math.ceil(timeLeft)); }

  function spawn() { var t = pick(); items.push({ t: t, x: rand(t.r + 6, W - t.r - 6), y: -t.r, vy: rand(2.2, 3.6), rot: 0, vr: rand(-0.06, 0.06) }); }
  function burst(x, y, c, n) { if (reduce) return; for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: rand(-3.4, 3.4), vy: rand(-4, 1), life: 1, c: c, r: rand(1.5, 3.5) }); }
  function floatTxt(x, y, s, c) { floats.push({ x: x, y: y, txt: s, c: c, life: 1 }); }

  function tap(px, py) {
    for (var i = items.length - 1; i >= 0; i--) {
      var it = items[i], dx = px - it.x, dy = py - it.y;
      if (dx * dx + dy * dy <= (it.t.r + 6) * (it.t.r + 6)) {
        if (it.t.bomb) { timeLeft = Math.max(0, timeLeft - 3); combo = 1; flash = 1; burst(it.x, it.y, '#ff5470', 20); floatTxt(it.x, it.y, '−3s', '#ff5470'); }
        else { combo = Math.min(5, combo + 1); var p = it.t.pts * combo; score += p; earn += p * 0.01; burst(it.x, it.y, it.t.c, 12); floatTxt(it.x, it.y, '+' + p, it.t.c); }
        items.splice(i, 1); hud(); return;
      }
    }
  }

  function step(dt) {
    timeLeft -= dt / 1000; if (timeLeft <= 0) { timeLeft = 0; return end(); }
    acc += dt; var every = Math.max(360, 620 - (25 - timeLeft) * 10);
    if (acc >= every) { acc = 0; spawn(); if (Math.random() < 0.25) spawn(); }
    for (var i = items.length - 1; i >= 0; i--) { var it = items[i]; it.y += it.vy * (dt / 16.67); it.rot += it.vr; if (it.y - it.t.r > H) { items.splice(i, 1); if (!it.t.bomb) combo = 1; } }
    for (var j = parts.length - 1; j >= 0; j--) { var p = parts[j]; p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.life -= dt / 600; if (p.life <= 0) parts.splice(j, 1); }
    for (var f = floats.length - 1; f >= 0; f--) { var fl = floats[f]; fl.y -= 0.6; fl.life -= dt / 850; if (fl.life <= 0) floats.splice(f, 1); }
    if (flash > 0) flash -= dt / 300;
    hud();
  }

  function drawItem(it) {
    var t = it.t, r = t.r; ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
    var g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r); g.addColorStop(0, t.c2); g.addColorStop(1, t.c);
    ctx.fillStyle = g; ctx.shadowColor = t.c; ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5;
    if (t.k === 'coin') { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.font = 'bold ' + r + 'px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S', 0, 1); }
    else if (t.k === 'gem') { ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(r, -r * 0.2); ctx.lineTo(r * 0.6, r); ctx.lineTo(-r * 0.6, r); ctx.lineTo(-r, -r * 0.2); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(0, r * 0.15, r * 0.9, 0, 7); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0; ctx.strokeStyle = '#8a4a00'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r * 0.7); ctx.quadraticCurveTo(r * 0.5, -r * 1.1, r * 0.7, -r * 0.7); ctx.stroke(); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(r * 0.7, -r * 0.7, 2.4, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0e1016'); bg.addColorStop(1, '#14171f'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.03)'; ctx.lineWidth = 1; for (var gx = 0; gx < W; gx += 48) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }
    for (var i = 0; i < items.length; i++) drawItem(items[i]);
    for (var j = 0; j < parts.length; j++) { var p = parts[j]; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 18px "JetBrains Mono", monospace';
    for (var f = 0; f < floats.length; f++) { var fl = floats[f]; ctx.globalAlpha = Math.max(0, fl.life); ctx.fillStyle = fl.c; ctx.fillText(fl.txt, fl.x, fl.y); }
    ctx.globalAlpha = 1;
    if (flash > 0) { ctx.fillStyle = 'rgba(255,84,112,' + (flash * 0.25) + ')'; ctx.fillRect(0, 0, W, H); }
  }

  function loop(ts) { if (!running) return; var dt = Math.min(48, ts - last); last = ts; step(dt); if (!running) return; draw(); raf = requestAnimationFrame(loop); }

  function start() { reset(); running = true; last = performance ? performance.now() : 0; el.start.setAttribute('hidden', ''); el.over.setAttribute('hidden', ''); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }

  function end() {
    running = false; cancelAnimationFrame(raf);
    if (earn < 8) earn = 8 + Math.round(score * 0.01 * 100) / 100;
    addBal(earn); draw();
    el.emoji.textContent = score >= 1200 ? '🚀' : score >= 500 ? '🏆' : '🎉';
    el.won.textContent = fmt(earn);
    el.over.removeAttribute('hidden');
  }

  function open(name) {
    name = name || 'Sweep Arcade';
    el.title.textContent = name;
    el.ic.textContent = ICONS[name] || '🎮';
    reset(); el.over.setAttribute('hidden', ''); el.start.removeAttribute('hidden');
    draw(); modal.removeAttribute('hidden');
    try { document.documentElement.style.overflow = 'hidden'; } catch (e) {}
  }
  function close() { running = false; cancelAnimationFrame(raf); modal.setAttribute('hidden', ''); try { document.documentElement.style.overflow = ''; } catch (e) {} }

  function toLocal(clientX, clientY) { var rect = cv.getBoundingClientRect(); return [(clientX - rect.left) / rect.width * W, (clientY - rect.top) / rect.height * H]; }
  cv.addEventListener('pointerdown', function (e) { if (!running) return; e.preventDefault(); var p = toLocal(e.clientX, e.clientY); tap(p[0], p[1]); });
  if (el.play) el.play.addEventListener('click', start);
  if (el.again) el.again.addEventListener('click', start);
  if (el.close) el.close.addEventListener('click', close);
  if (el.close2) el.close2.addEventListener('click', close);
  modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hasAttribute('hidden')) close(); });

  window.__openGame = open;
})();
