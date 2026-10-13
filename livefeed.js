/* Sweep Arcade — hero LIVE gameplay feed.
   Attract mode: plays itself (auto-aim shooter) with community winnings
   raining top-to-bottom and a live winnings counter. Click → real game.
   Self-contained: no-ops without #lfCanvas. All figures are original art. */
(function () {
  var cv = document.getElementById('lfCanvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, GROUND = H - 16;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  var targets = [], parts = [], coins = [], wins = [];
  var cx = W / 2, cy = H * 0.5, cool = 0, muzzle = 0, shake = 0;
  var tSpawn = 0, cSpawn = 0, wSpawn = 0, elapsed = 0, last = 0, raf = 0;
  var won = 284137 + ((Math.random() * 5000) | 0);
  var lanes = [0.12, 0.26, 0.40, 0.54, 0.68, 0.82, 0.93];

  function spawnTarget() {
    var bomber = Math.random() < 0.28;
    var lane = lanes[(Math.random() * lanes.length) | 0];
    for (var i = 0; i < targets.length; i++) if (Math.abs(targets[i].lane - lane) < 0.001 && targets[i].reveal > 0.1) return;
    targets.push({ kind: bomber ? 'bomber' : 'bandit', lane: lane, x: lane * W, w: 40, h: 64, age: 0, life: rand(900, 1500), reveal: 0, dead: false });
  }
  function spawnCoin() {
    var gem = Math.random() < 0.14;
    coins.push({ x: rand(12, W - 12), y: -12, vy: rand(1.5, 3.2), r: gem ? rand(6, 9) : rand(7, 12), rot: 0, vr: rand(-0.11, 0.11), gem: gem });
  }
  function spawnWin() {
    wins.push({ x: rand(48, W - 48), y: -6, vy: rand(1.1, 2.0), txt: '+$' + rand(4, 140).toFixed(2), life: 1.1 });
  }
  function burst(x, y, c, n) { if (reduce) return; for (var i = 0; i < n; i++) parts.push({ x: x, y: y, vx: rand(-3, 3), vy: rand(-3.6, 1), life: 1, c: c, r: rand(1.4, 3) }); }

  function targetTop(t) { return GROUND - t.h * t.reveal; }

  function autopilot(dt) {
    // pick nearest revealed target
    var best = null, bd = 1e9;
    for (var i = 0; i < targets.length; i++) {
      var t = targets[i]; if (t.dead || t.reveal < 0.55) continue;
      var d = Math.abs(t.x - cx);
      if (d < bd) { bd = d; best = t; }
    }
    if (best) {
      var tx = best.x, ty = targetTop(best) + best.h * 0.26;
      cx += (tx - cx) * Math.min(1, dt / 90);
      cy += (ty - cy) * Math.min(1, dt / 110);
      if (cool <= 0 && Math.abs(cx - tx) < 9 && Math.abs(cy - ty) < 10) {
        best.dead = true; muzzle = 1; cool = rand(230, 420); shake = 3;
        burst(best.x, targetTop(best) + 16, best.kind === 'bomber' ? '#ff9f40' : '#ff5470', best.kind === 'bomber' ? 16 : 10);
        var amt = best.kind === 'bomber' ? 100 : 50; won += amt;
        wins.push({ x: best.x, y: targetTop(best), vy: rand(0.8, 1.4), txt: '+$' + amt + '.00', life: 1.2 });
      }
    }
    if (cool > 0) cool -= dt;
  }

  function step(dt) {
    elapsed += dt;
    tSpawn += dt; if (tSpawn > Math.max(520, 900 - elapsed / 200)) { tSpawn = 0; spawnTarget(); }
    cSpawn += dt; if (cSpawn > 150) { cSpawn = 0; spawnCoin(); if (Math.random() < 0.5) spawnCoin(); }
    wSpawn += dt; if (wSpawn > 620) { wSpawn = 0; spawnWin(); }
    autopilot(dt);
    for (var i = targets.length - 1; i >= 0; i--) {
      var t = targets[i]; t.age += dt; var rise = 170, fall = 200;
      if (t.age < rise) t.reveal = t.age / rise;
      else if (t.age < t.life + rise) t.reveal = 1;
      else if (t.age < t.life + rise + fall) t.reveal = 1 - (t.age - t.life - rise) / fall;
      else targets.splice(i, 1);
    }
    for (var c = coins.length - 1; c >= 0; c--) { var co = coins[c]; co.y += co.vy; co.rot += co.vr; if (co.y > H + 16) coins.splice(c, 1); }
    for (var w = wins.length - 1; w >= 0; w--) { var wn = wins[w]; wn.y += wn.vy; wn.life -= dt / 2200; if (wn.y > H + 10 || wn.life <= 0) wins.splice(w, 1); }
    for (var p = parts.length - 1; p >= 0; p--) { var pp = parts[p]; pp.x += pp.vx; pp.y += pp.vy; pp.vy += 0.2; pp.life -= dt / 550; if (pp.life <= 0) parts.splice(p, 1); }
    if (muzzle > 0) muzzle -= dt / 90;
    if (shake > 0) shake -= dt / 16.67;
  }

  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function drawFigure(t) {
    var top = targetTop(t), c = t.x;
    ctx.save();
    ctx.beginPath(); ctx.rect(c - t.w / 2 - 4, top - 20, t.w + 8, GROUND - (top - 20)); ctx.clip();
    var body = t.kind === 'bomber' ? '#3a2b1a' : '#2a2f3a';
    var mask = t.kind === 'bomber' ? '#ff9f40' : '#ff5470';
    ctx.fillStyle = body; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.2;
    roundRect(c - 15, top + 24, 30, 48, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#cdb79e'; ctx.beginPath(); ctx.arc(c, top + 14, 12, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = mask; ctx.fillRect(c - 12, top + 10, 24, 6);
    ctx.fillStyle = '#0c0e12'; ctx.fillRect(c - 7, top + 11, 4, 3); ctx.fillRect(c + 3, top + 11, 4, 3);
    ctx.restore();
  }

  function drawCoin(co) {
    ctx.save(); ctx.translate(co.x, co.y); ctx.rotate(co.rot);
    var g = ctx.createRadialGradient(-co.r * 0.3, -co.r * 0.3, co.r * 0.2, 0, 0, co.r);
    if (co.gem) { g.addColorStop(0, '#9ff7cf'); g.addColorStop(1, '#39d98a'); } else { g.addColorStop(0, '#ffd98a'); g.addColorStop(1, '#f5b63d'); }
    ctx.fillStyle = g; ctx.shadowColor = co.gem ? '#39d98a' : '#f5b63d'; ctx.shadowBlur = 8;
    if (co.gem) { ctx.beginPath(); ctx.moveTo(0, -co.r); ctx.lineTo(co.r, -co.r * 0.2); ctx.lineTo(co.r * 0.6, co.r); ctx.lineTo(-co.r * 0.6, co.r); ctx.lineTo(-co.r, -co.r * 0.2); ctx.closePath(); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0, 0, co.r, 0, 7); ctx.fill(); ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.font = 'bold ' + co.r + 'px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('S', 0, 1); }
    ctx.restore();
  }

  function draw() {
    var ox = shake > 0 ? rand(-shake, shake) : 0;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(ox, 0);
    var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#0c1016'); bg.addColorStop(1, '#0a0d12');
    ctx.fillStyle = bg; ctx.fillRect(-10, -10, W + 20, H + 20);
    // targets
    for (var i = 0; i < targets.length; i++) drawFigure(targets[i]);
    // booth
    var bt = ctx.createLinearGradient(0, GROUND, 0, H); bt.addColorStop(0, '#1b2130'); bt.addColorStop(1, '#0d1118');
    ctx.fillStyle = bt; ctx.fillRect(-10, GROUND, W + 20, H);
    ctx.strokeStyle = 'rgba(245,182,61,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, GROUND); ctx.lineTo(W, GROUND); ctx.stroke();
    // coins raining (winnings pouring top -> bottom)
    for (var c = 0; c < coins.length; c++) drawCoin(coins[c]);
    // muzzle + tracer
    if (muzzle > 0) { ctx.globalAlpha = muzzle; ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2, H); ctx.lineTo(cx, cy); ctx.stroke(); ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(W / 2, H - 2, 12 * muzzle, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    // particles
    for (var p = 0; p < parts.length; p++) { var pp = parts[p]; ctx.globalAlpha = Math.max(0, pp.life); ctx.fillStyle = pp.c; ctx.beginPath(); ctx.arc(pp.x, pp.y, pp.r, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    // crosshair
    ctx.strokeStyle = muzzle > 0 ? '#ff5470' : '#f5b63d'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx, cy, 11, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 16, cy); ctx.lineTo(cx - 4, cy); ctx.moveTo(cx + 4, cy); ctx.lineTo(cx + 16, cy); ctx.moveTo(cx, cy - 16); ctx.lineTo(cx, cy - 4); ctx.moveTo(cx, cy + 4); ctx.lineTo(cx, cy + 16); ctx.stroke();
    // winning amounts falling
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'bold 14px "JetBrains Mono", monospace';
    for (var w = 0; w < wins.length; w++) { var wn = wins[w]; ctx.globalAlpha = Math.max(0, Math.min(1, wn.life)); ctx.fillStyle = '#39d98a'; ctx.fillText(wn.txt, wn.x, wn.y); }
    ctx.globalAlpha = 1;
    ctx.restore();
    // --- live-cam overlay ---
    ctx.globalAlpha = 0.05; ctx.fillStyle = '#000'; for (var y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1); ctx.globalAlpha = 1;
    var vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; var cc = 18, m = 10;
    [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(function (k) { ctx.beginPath(); ctx.moveTo(k[0] + k[2] * cc, k[1]); ctx.lineTo(k[0], k[1]); ctx.lineTo(k[0], k[1] + k[3] * cc); ctx.stroke(); });
    // live winnings counter (top-left)
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '10px "JetBrains Mono", monospace'; ctx.fillText('LIVE COMMUNITY WINNINGS', 22, 26);
    ctx.fillStyle = '#39d98a'; ctx.font = 'bold 20px "JetBrains Mono", monospace';
    ctx.fillText('$' + Math.floor(won).toLocaleString('en-US'), 22, 48);
    // timestamp (top-right)
    var d = new Date();
    var ts = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '11px "JetBrains Mono", monospace';
    var recOn = reduce ? true : (((last / 600) | 0) % 2 === 0);
    if (recOn) { ctx.fillStyle = '#ff5470'; ctx.beginPath(); ctx.arc(W - 70, 20, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText('REC  ' + ts, W - 22, 25);
  }

  function loop(ts) { var dt = Math.min(48, ts - last); last = ts; step(dt); draw(); raf = requestAnimationFrame(loop); }

  if (reduce) { for (var i = 0; i < 3; i++) spawnTarget(); for (var c = 0; c < 18; c++) { spawnCoin(); coins[coins.length - 1].y = rand(0, H); } draw(); }
  else { for (var k = 0; k < 10; k++) { spawnCoin(); coins[coins.length - 1].y = rand(0, H); } last = performance ? performance.now() : 0; raf = requestAnimationFrame(loop); }
})();
