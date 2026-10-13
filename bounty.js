/* SWEEP Bounty — inline homepage shooting-gallery mini-game.
   Styled as a live security-camera feed (REC / LIVE / timestamp / scanlines).
   Self-contained: no-ops without #btCanvas. Credits shared 'sweep_bal'. */
(function () {
  var cv = document.getElementById('btCanvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, GROUND = H - 34;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function getBal() { var b; try { b = parseFloat(sessionStorage.getItem('sweep_bal')); } catch (e) {} if (!b || isNaN(b)) b = 1000; return b; }
  function addBal(d) { try { sessionStorage.setItem('sweep_bal', (getBal() + d).toFixed(2)); } catch (e) {} }
  function fmt(n) { return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  var el = {
    score: document.getElementById('btScore'), earn: document.getElementById('btEarn'),
    combo: document.getElementById('btCombo'), ammo: document.getElementById('btAmmo'),
    lives: document.getElementById('btLives'),
    start: document.getElementById('btStart'), over: document.getElementById('btOver'),
    play: document.getElementById('btPlay'), again: document.getElementById('btAgain'),
    oTitle: document.getElementById('btOverTitle'), oEarn: document.getElementById('btOverEarn'),
    oScore: document.getElementById('btOverScore'), oAcc: document.getElementById('btOverAcc'),
    oBal: document.getElementById('btOverBal'), oEmoji: document.getElementById('btOverEmoji')
  };

  var AMMO_MAX = 6, RELOAD_MS = 850;
  var lanes = [0.10, 0.24, 0.38, 0.5, 0.62, 0.76, 0.90];
  var targets, parts, floats, shots, crossX, crossY, muzzle, shake;
  var score, earn, combo, bestCombo, lives, ammo, reloading, reloadT, fired, hit, running = false, raf = 0, last = 0, acc, elapsed;

  function reset() {
    targets = []; parts = []; floats = []; shots = []; muzzle = 0; shake = 0;
    crossX = W / 2; crossY = H / 2; acc = 0; elapsed = 0;
    score = 0; earn = 0; combo = 1; bestCombo = 1; lives = 5;
    ammo = AMMO_MAX; reloading = false; reloadT = 0; fired = 0; hit = 0;
    hud();
  }

  function hud() {
    el.score.textContent = score;
    el.earn.textContent = fmt(earn);
    el.combo.textContent = '×' + combo;
    el.lives.textContent = Array(lives + 1).join('♥ ').trim() || '—';
    var pips = '';
    for (var i = 0; i < AMMO_MAX; i++) pips += i < ammo ? '●' : '○';
    el.ammo.textContent = reloading ? 'RELOAD' : pips;
  }

  function spawn() {
    var r = Math.random();
    var bomberW = Math.min(0.22, 0.12 + elapsed / 120000);
    var civW = Math.min(0.20, 0.12 + elapsed / 110000);
    var kind = r < bomberW ? 'bomber' : (r < bomberW + civW ? 'civ' : 'bandit');
    var lane = lanes[(Math.random() * lanes.length) | 0];
    // avoid two targets sharing a lane
    for (var i = 0; i < targets.length; i++) if (Math.abs(targets[i].lane - lane) < 0.001 && targets[i].reveal > 0.1) return;
    var life = Math.max(680, 1500 - elapsed / 60); // shrinks over time
    targets.push({ kind: kind, lane: lane, x: lane * W, w: 58, h: 96, age: 0, life: life, reveal: 0, dead: false });
  }

  function burst(x, y, c, n) { if (reduce) { return; } for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: rand(-3.6, 3.6), vy: rand(-4.4, 1), life: 1, c: c, r: rand(1.5, 3.6) }); }
  function floatTxt(x, y, txt, c) { floats.push({ x: x, y: y, txt: txt, c: c, life: 1 }); }

  function targetBox(t) {
    var top = GROUND - t.h * t.reveal; // visible top
    return { x1: t.x - t.w / 2, x2: t.x + t.w / 2, y1: top, y2: GROUND, top: GROUND - t.h };
  }

  function shoot() {
    if (!running || reloading || ammo <= 0) return;
    ammo--; fired++; muzzle = 1; shake = Math.max(shake, 4);
    shots.push({ x1: W / 2, y1: H, x2: crossX, y2: crossY, life: 1 });
    // topmost revealed target under crosshair
    var best = null;
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i]; if (t.dead || t.reveal < 0.45) continue;
      var b = targetBox(t);
      if (crossX >= b.x1 && crossX <= b.x2 && crossY >= b.y1 && crossY <= b.y2) {
        if (!best || t.reveal > best.reveal) best = t;
      }
    }
    if (!best) { combo = 1; if (ammo <= 0) startReload(); hud(); return; }
    var b2 = targetBox(best);
    var head = crossY <= b2.y1 + best.h * 0.34;
    if (best.kind === 'civ') {
      lives--; combo = 1; best.dead = true;
      burst(best.x, b2.y1 + 30, '#39d98a', 16); floatTxt(best.x, b2.y1 + 10, '−1 LIFE', '#ff5470'); shake = 11;
      if (lives <= 0) { hud(); return end(); }
    } else {
      hit++; best.dead = true;
      var base = best.kind === 'bomber' ? 100 : 50;
      var p = base * combo * (head ? 2 : 1);
      score += p; earn += p * 0.01; combo = Math.min(8, combo + 1); if (combo > bestCombo) bestCombo = combo;
      burst(best.x, b2.y1 + 24, best.kind === 'bomber' ? '#ff9f40' : '#ff5470', best.kind === 'bomber' ? 22 : 13);
      floatTxt(best.x, b2.y1 + 6, (head ? '◎ ' : '+') + p, head ? '#f5b63d' : (best.kind === 'bomber' ? '#ff9f40' : '#fff'));
    }
    if (ammo <= 0) startReload();
    hud();
  }
  function startReload() { reloading = true; reloadT = RELOAD_MS; hud(); }

  function step(dt) {
    elapsed += dt;
    if (reloading) { reloadT -= dt; if (reloadT <= 0) { reloading = false; ammo = AMMO_MAX; hud(); } }
    acc += dt;
    var every = Math.max(560, 1150 - elapsed / 50);
    if (acc >= every) { acc = 0; spawn(); }

    for (var i = targets.length - 1; i >= 0; i--) {
      var t = targets[i]; t.age += dt;
      var rise = 190, fall = 220;
      if (t.age < rise) t.reveal = t.age / rise;
      else if (t.age < t.life + rise) t.reveal = 1;
      else if (t.age < t.life + rise + fall) t.reveal = 1 - (t.age - t.life - rise) / fall;
      else {
        // escaped
        if (!t.dead) {
          if (t.kind === 'bomber') { lives--; combo = 1; burst(t.x, GROUND - 40, '#ff9f40', 20); shake = 12; floatTxt(t.x, GROUND - 60, 'BOOM −1', '#ff5470'); if (lives <= 0) { hud(); end(); } }
          else if (t.kind === 'bandit') { combo = 1; }
          hud();
        }
        targets.splice(i, 1); continue;
      }
    }
    for (var j = parts.length - 1; j >= 0; j--) { var p = parts[j]; p.x += p.vx; p.y += p.vy; p.vy += 0.22; p.life -= dt / 600; if (p.life <= 0) parts.splice(j, 1); }
    for (var f = floats.length - 1; f >= 0; f--) { var fl = floats[f]; fl.y -= 0.55; fl.life -= dt / 1000; if (fl.life <= 0) floats.splice(f, 1); }
    for (var s = shots.length - 1; s >= 0; s--) { shots[s].life -= dt / 90; if (shots[s].life <= 0) shots.splice(s, 1); }
    if (muzzle > 0) muzzle -= dt / 90;
    if (shake > 0) shake -= dt / 16.67;
  }

  // ---- figures (original stylised characters, no gore) ----
  function drawFigure(t) {
    var b = targetBox(t);
    ctx.save();
    // clip so figure rises from behind the booth line
    ctx.beginPath(); ctx.rect(b.x1 - 6, b.top - 30, t.w + 12, GROUND - (b.top - 30)); ctx.clip();
    var topY = b.y1; // where the head is this frame
    var cx = t.x;
    var body, mask, mark, markC;
    if (t.kind === 'bandit') { body = '#2a2f3a'; mask = '#ff5470'; mark = '▲'; markC = '#ff5470'; }
    else if (t.kind === 'bomber') { body = '#3a2b1a'; mask = '#ff9f40'; mark = '◉'; markC = '#ff9f40'; }
    else { body = '#17352e'; mask = '#39d98a'; mark = '●'; markC = '#39d98a'; }
    // body
    ctx.fillStyle = body; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5;
    roundRect(cx - 22, topY + 34, 44, 72, 12); ctx.fill(); ctx.stroke();
    // head
    ctx.fillStyle = '#cdb79e'; ctx.beginPath(); ctx.arc(cx, topY + 20, 18, 0, 7); ctx.fill(); ctx.stroke();
    // mask / cap band
    ctx.fillStyle = mask;
    if (t.kind === 'civ') { // cap
      ctx.beginPath(); ctx.arc(cx, topY + 14, 18, Math.PI, 0); ctx.fill();
      ctx.fillRect(cx - 18, topY + 13, 36, 4);
      // smile
      ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, topY + 22, 7, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    } else { // eye mask
      ctx.fillRect(cx - 18, topY + 14, 36, 9);
      ctx.fillStyle = '#0c0e12'; ctx.fillRect(cx - 11, topY + 16, 6, 4); ctx.fillRect(cx + 5, topY + 16, 6, 4);
    }
    // bomber: bomb with fuse + countdown ring
    if (t.kind === 'bomber') {
      var bx = cx + 20, by = topY + 66;
      ctx.fillStyle = '#15171d'; ctx.beginPath(); ctx.arc(bx, by, 11, 0, 7); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#ff9f40'; ctx.lineWidth = 3;
      var frac = Math.max(0, 1 - (t.age - 190) / t.life);
      ctx.beginPath(); ctx.arc(bx, by, 15, -Math.PI / 2, -Math.PI / 2 + frac * 7, false); ctx.stroke();
      ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(bx + 7, by - 11, 2.4, 0, 7); ctx.fill();
    }
    ctx.restore();
    // marker above head (not clipped)
    if (t.reveal > 0.6) {
      ctx.globalAlpha = (t.reveal - 0.6) / 0.4;
      ctx.fillStyle = markC; ctx.font = 'bold 13px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(mark, cx, topY - 4);
      ctx.globalAlpha = 1;
    }
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawCrosshair() {
    var x = crossX, y = crossY, r = 15;
    ctx.strokeStyle = muzzle > 0 ? '#ff5470' : '#f5b63d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - r - 6, y); ctx.lineTo(x - 4, y); ctx.moveTo(x + 4, y); ctx.lineTo(x + r + 6, y);
    ctx.moveTo(x, y - r - 6); ctx.lineTo(x, y - 4); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + r + 6);
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill();
  }

  function drawCam() {
    // scanlines
    ctx.globalAlpha = 0.05; ctx.fillStyle = '#000';
    for (var y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
    ctx.globalAlpha = 1;
    // vignette
    var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.42)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // corner brackets
    ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; var c = 22, m = 12;
    corner(m, m, 1, 1); corner(W - m, m, -1, 1); corner(m, H - m, 1, -1); corner(W - m, H - m, -1, -1);
    function corner(x, y, sx, sy) { ctx.beginPath(); ctx.moveTo(x + sx * c, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * c); ctx.stroke(); }
    // REC + LIVE + timestamp
    ctx.textBaseline = 'middle';
    var recOn = reduce ? true : (((last / 600) | 0) % 2 === 0);
    ctx.textAlign = 'left'; ctx.font = 'bold 12px "JetBrains Mono", monospace';
    if (recOn) { ctx.fillStyle = '#ff5470'; ctx.beginPath(); ctx.arc(26, H - 46, 5, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillText('REC', 36, H - 46);
    ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText('CAM 07 · SWEEP-BOUNTY', 66, H - 46);
    // live badge
    ctx.fillStyle = '#39d98a'; ctx.beginPath(); ctx.arc(26, H - 26, 4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = 'bold 11px "JetBrains Mono", monospace'; ctx.fillText('● LIVE', 34, H - 26);
    // timestamp (real clock)
    var d = new Date();
    var ts = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '  ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText(ts, W - 26, H - 26);
  }

  function draw() {
    var ox = shake > 0 ? rand(-shake, shake) : 0, oy = shake > 0 ? rand(-shake, shake) : 0;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox, oy);
    // bg
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#0c1016'); bg.addColorStop(0.7, '#11161f'); bg.addColorStop(1, '#0a0d12');
    ctx.fillStyle = bg; ctx.fillRect(-20, -20, W + 40, H + 40);
    // floor line
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, GROUND + 2); ctx.lineTo(W, GROUND + 2); ctx.stroke();
    // targets
    for (var i = 0; i < targets.length; i++) drawFigure(targets[i]);
    // booth (hides lower part of figures)
    var bt = ctx.createLinearGradient(0, GROUND, 0, H);
    bt.addColorStop(0, '#1b2130'); bt.addColorStop(1, '#0d1118');
    ctx.fillStyle = bt; ctx.fillRect(-20, GROUND + 2, W + 40, H);
    ctx.strokeStyle = 'rgba(245,182,61,.25)'; ctx.beginPath(); ctx.moveTo(0, GROUND + 2); ctx.lineTo(W, GROUND + 2); ctx.stroke();
    // tracers / muzzle
    for (var s = 0; s < shots.length; s++) { var sh = shots[s]; ctx.globalAlpha = Math.max(0, sh.life) * 0.7; ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sh.x1, sh.y1); ctx.lineTo(sh.x2, sh.y2); ctx.stroke(); }
    ctx.globalAlpha = 1;
    if (muzzle > 0) { ctx.globalAlpha = muzzle; ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(W / 2, H - 4, 16 * muzzle, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    // particles
    for (var j = 0; j < parts.length; j++) { var p = parts[j]; ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    // floats
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 17px "JetBrains Mono", monospace';
    for (var f = 0; f < floats.length; f++) { var fl = floats[f]; ctx.globalAlpha = Math.max(0, fl.life); ctx.fillStyle = fl.c; ctx.fillText(fl.txt, fl.x, fl.y); }
    ctx.globalAlpha = 1;
    drawCrosshair();
    ctx.restore();
    drawCam();
  }

  function loop(ts) { if (!running) return; var dt = Math.min(48, ts - last); last = ts; step(dt); if (!running) return; draw(); raf = requestAnimationFrame(loop); }

  function start() { reset(); running = true; last = performance ? performance.now() : 0; el.start.setAttribute('hidden', ''); el.over.setAttribute('hidden', ''); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }

  function end() {
    running = false; cancelAnimationFrame(raf);
    if (earn < 15) earn = 15 + Math.round(score * 0.01 * 100) / 100; // everyone leaves a winner
    addBal(earn);
    draw();
    var a = fired ? Math.max(72, Math.round(hit / fired * 100)) : 100;
    el.oEmoji.textContent = score >= 3000 ? '🏅' : score >= 1200 ? '🎯' : '💰';
    el.oTitle.textContent = score >= 3000 ? 'Elite marksman — you won!' : score >= 1200 ? 'Bounty collected!' : 'You won!';
    el.oEarn.textContent = fmt(earn); el.oScore.textContent = score; el.oAcc.textContent = a + '%'; el.oBal.textContent = fmt(getBal());
    el.over.removeAttribute('hidden');
  }

  function setCross(clientX, clientY) {
    var r = cv.getBoundingClientRect();
    crossX = Math.max(0, Math.min(W, (clientX - r.left) / r.width * W));
    crossY = Math.max(0, Math.min(H, (clientY - r.top) / r.height * H));
  }
  cv.addEventListener('pointermove', function (e) { if (running) setCross(e.clientX, e.clientY); });
  cv.addEventListener('pointerdown', function (e) { if (!running) return; e.preventDefault(); setCross(e.clientX, e.clientY); shoot(); });
  cv.addEventListener('touchmove', function (e) { if (running && e.touches[0]) { e.preventDefault(); setCross(e.touches[0].clientX, e.touches[0].clientY); } }, { passive: false });
  if (el.play) el.play.addEventListener('click', start);
  if (el.again) el.again.addEventListener('click', start);

  reset(); draw();
})();
