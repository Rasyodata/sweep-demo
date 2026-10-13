/* Daily Spin — one free guaranteed-win wheel per day. Credits shared 'sweep_bal'.
   Self-contained: no-ops without #spinCv. */
(function () {
  var cv = document.getElementById('spinCv');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, CX = W / 2, CY = H / 2, R = W / 2 - 8;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var btn = document.getElementById('spinBtn');
  var rewardEl = document.getElementById('spinReward');
  var noteEl = document.getElementById('spinNote');

  function getBal() { var b; try { b = parseFloat(sessionStorage.getItem('sweep_bal')); } catch (e) {} if (!b || isNaN(b)) b = 1000; return b; }
  function addBal(d) { try { sessionStorage.setItem('sweep_bal', (getBal() + d).toFixed(2)); } catch (e) {} }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function spunToday() { try { return localStorage.getItem('sweep_spin_day') === todayKey(); } catch (e) { return false; } }

  var SEG = [
    { t: '$25', v: 25, c: '#f5b63d', w: 18 },
    { t: '$50', v: 50, c: '#7c5cff', w: 16 },
    { t: '×2 · 80', v: 80, c: '#39d98a', w: 12 },
    { t: '$15', v: 15, c: '#f5b63d', w: 18 },
    { t: '$100', v: 100, c: '#7c5cff', w: 9 },
    { t: 'JACKPOT', v: 500, c: '#ff5470', w: 3 },
    { t: '$30', v: 30, c: '#39d98a', w: 17 },
    { t: '×5 · 200', v: 200, c: '#f5b63d', w: 7 }
  ];
  var N = SEG.length, SEGA = 360 / N;
  var rot = -12;

  function rad(d) { return d * Math.PI / 180; }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var segR = R - 16;
    // dark outer rim disc
    ctx.beginPath(); ctx.arc(CX, CY, R, 0, 7); ctx.fillStyle = '#0f1119'; ctx.fill();
    // glossy segments
    for (var i = 0; i < N; i++) {
      var a0 = rad(i * SEGA + rot), a1 = rad((i + 1) * SEGA + rot);
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, segR, a0, a1); ctx.closePath();
      var g = ctx.createRadialGradient(CX, CY, segR * 0.14, CX, CY, segR);
      g.addColorStop(0, shade(SEG[i].c, 30)); g.addColorStop(0.7, SEG[i].c); g.addColorStop(1, shade(SEG[i].c, -24));
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 1.5; ctx.stroke();
      var mid = rad(i * SEGA + SEGA / 2 + rot);
      ctx.save(); ctx.translate(CX + Math.cos(mid) * segR * 0.64, CY + Math.sin(mid) * segR * 0.64);
      ctx.rotate(mid + Math.PI / 2);
      ctx.fillStyle = SEG[i].t === 'JACKPOT' ? '#fff' : '#101218';
      ctx.font = 'bold ' + (SEG[i].t === 'JACKPOT' ? 11 : 13.5) + 'px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(SEG[i].t, 0, 0);
      ctx.restore();
    }
    // ring edges
    ctx.beginPath(); ctx.arc(CX, CY, segR, 0, 7); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY, R - 1, 0, 7); ctx.strokeStyle = 'rgba(245,182,61,.7)'; ctx.lineWidth = 2; ctx.stroke();
    // casino bulb lights on the rim (run while spinning)
    var bulbR = (segR + R) / 2 + 1, NB = 16, phase = Math.floor(rot / 12);
    for (var b = 0; b < NB; b++) {
      var ab = b / NB * Math.PI * 2, bx = CX + Math.cos(ab) * bulbR, by = CY + Math.sin(ab) * bulbR, on = (b + phase) % 2 === 0;
      ctx.fillStyle = on ? '#ffe4a8' : 'rgba(245,182,61,.35)';
      if (on) { ctx.shadowColor = '#f5b63d'; ctx.shadowBlur = 6; }
      ctx.beginPath(); ctx.arc(bx, by, 2.6, 0, 7); ctx.fill(); ctx.shadowBlur = 0;
    }
  }
  function shade(hex, amt) {
    function cl(v) { return Math.max(0, Math.min(255, v)); }
    var n = parseInt(hex.slice(1), 16), r = cl((n >> 16) + amt), g = cl(((n >> 8) & 255) + amt), b = cl((n & 255) + amt);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function pickIndex() {
    var tot = SEG.reduce(function (s, x) { return s + x.w; }, 0), r = Math.random() * tot, a = 0;
    for (var i = 0; i < N; i++) { a += SEG[i].w; if (r <= a) return i; }
    return 0;
  }

  var spinning = false;
  function spin() {
    if (spinning || spunToday()) return;
    spinning = true; btn.disabled = true; rewardEl.textContent = '…';
    var idx = pickIndex();
    var targetCenter = idx * SEGA + SEGA / 2;
    var finalRot = 360 * 6 + (270 - targetCenter); // land segment centre under top pointer
    var startRot = rot, delta = finalRot - ((rot % 360) + 360) % 360, dur = reduce ? 0 : 4200, t0 = null;
    if (reduce) { rot = finalRot; draw(); return done(idx); }
    function anim(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      rot = startRot + delta * e; draw();
      if (p < 1) requestAnimationFrame(anim); else done(idx);
    }
    requestAnimationFrame(anim);
  }
  function done(idx) {
    var r = SEG[idx];
    addBal(r.v);
    try { localStorage.setItem('sweep_spin_day', todayKey()); } catch (e) {}
    rewardEl.textContent = '+$' + r.v;
    rewardEl.animate ? rewardEl.animate([{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1 }, { transform: 'scale(1)' }], { duration: 520 }) : 0;
    if (window.toast) window.toast('🎉 You won ' + r.v + ' $SWEEP! Added to your balance.', 'success');
    confetti();
    spinning = false;
    lock();
  }

  function confetti() {
    if (reduce) return;
    var stage = cv.parentNode, cols = ['#f5b63d', '#39d98a', '#7c5cff', '#ff5470', '#fff'];
    for (var i = 0; i < 46; i++) {
      (function () {
        var p = document.createElement('i');
        var sz = 5 + Math.random() * 6;
        p.style.cssText = 'position:absolute;top:46%;left:50%;width:' + sz + 'px;height:' + sz + 'px;background:' + cols[i % cols.length] + ';border-radius:2px;z-index:5;pointer-events:none';
        stage.appendChild(p);
        var ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 150, rotz = Math.random() * 720 - 360;
        p.animate([
          { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
          { transform: 'translate(' + (Math.cos(ang) * dist) + 'px,' + (Math.sin(ang) * dist + 120) + 'px) rotate(' + rotz + 'deg)', opacity: 0 }
        ], { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.6,.3,1)' }).onfinish = function () { p.remove(); };
      })();
    }
  }

  function lock() {
    btn.disabled = true; btn.textContent = '✓ Claimed today';
    function tick() {
      var now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      var s = Math.max(0, Math.floor((mid - now) / 1000));
      var hh = (s / 3600) | 0, mm = ((s % 3600) / 60) | 0, ss = s % 60;
      noteEl.textContent = 'Come back tomorrow — next free spin in ' + hh + 'h ' + (mm < 10 ? '0' : '') + mm + 'm ' + (ss < 10 ? '0' : '') + ss + 's.';
      if (s > 0 && !reduce) setTimeout(tick, 1000);
    }
    tick();
  }

  btn.addEventListener('click', spin);
  draw();
  if (spunToday()) { rewardEl.textContent = '✓'; lock(); }
})();
