(function(){
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var T = window.__t || function(s){ return s; };
  function fmtXp(n){ return (n>=1000 ? (n/1000) + 'K' : n) + ' XP'; }

  var userXp = 0;
  var userXpEl = document.getElementById('userXp');
  function addXp(n, label){
    userXp += n;
    if(userXpEl) userXpEl.textContent = userXp.toLocaleString('en-US');
    if(window.toast) window.toast('+' + fmtXp(n) + (label ? ' · ' + label : ''), 'success');
  }

  // ---------- Tasks ----------
  var TASKS = [
    ["Email Verification",200],["Connect X",200],["Connect Google",200],["Connect Wallet",200],
    ["Enable notifications",200],["Send a chat message",20,"30m"],["KYC Verification",2500],
    ["X Follow",100],["Telegram Join",100],["Telegram Announcement",100],["Discord Join",100],
    ["Instagram Follow",100],["YouTube Subscribe",100],["TikTok Follow",100],
    ["Post a Tweet with #SWEEP",150,"24h"],["Post a Sweep meme with #SWEEP",350,"24h"],
    ["Follow @sweepoze",100],["Add \"Sweep\" & 🦈 to your X name",500],
    ["X Like Latest",20,"24h"],["Instagram Like Latest",20,"24h"],["YouTube Like Latest",20,"24h"],["TikTok Like Latest",20,"24h"],
    ["Invite 1 Friend",2500,"0 / 1"],["Invite 10 Friends",5000,"0 / 10"],["Invite 25 Friends",15000,"0 / 25"],["Invite 50 Friends",25000,"0 / 50"]
  ];
  var taskList = document.getElementById('taskList');
  if(taskList){
    TASKS.forEach(function(tk){
      var row = document.createElement('div'); row.className = 'task';
      var note = tk[2] ? '<small>' + tk[2] + '</small>' : '';
      row.innerHTML = '<div class="tname">' + tk[0] + note + '</div><button class="tx">+' + fmtXp(tk[1]) + '</button>';
      var btn = row.querySelector('.tx');
      btn.addEventListener('click', function(){
        if(row.classList.contains('done')) return;
        row.classList.add('done'); btn.textContent = '✓ Done';
        addXp(tk[1], tk[0]);
      });
      taskList.appendChild(row);
    });
  }

  // ---------- Leaderboard ----------
  var PLAYERS = [
    ["0xWolf_9",469],["abhays99",426],["sadkouzhant445061",237],["charlesm328271",219],["rochellet370345",218],
    ["gibihileku825357",218],["vanf497797",215],["daphneo620291",214],["uncle_yasin",213],["denysec922461",213],
    ["marcusv720114",211],["sweepking22",209],["lindak334901",206],["omer_devs",204],["natali889",201],
    ["degenmax",199],["cryptoayse",198],["bruno771",197],["end981342",195],["fineviper651562",190],
    ["richardl140565",190],["patriciar226154",189],["joannag619492",188],["maryw329757",188],["tamekat866556",187],
    ["donnaf111127",184],["fineviper146055",180],["helal199519",179],["davidw364742",178],["patiences890461",177],
    ["thomasn865879",177],["kiarab990354",176],["saraha916033",174],["freshpuma958708",173],["oroo654501",173]
  ];
  function renderLb(el, max){
    if(!el) return; el.innerHTML = '';
    PLAYERS.slice(0, max).forEach(function(p, i){
      var li = document.createElement('li'); li.className = i < 3 ? 'top' + (i+1) : '';
      li.innerHTML = '<span class="rk">' + (i+1) + '</span><span class="usr">@' + p[0] + '</span><span class="sc">' + p[1] + '</span>';
      el.appendChild(li);
    });
  }
  renderLb(document.getElementById('lbSide'), 100);
  renderLb(document.getElementById('lbFull'), 100);

  // ---------- Bird tiers ----------
  var TIERS = [
    ["🥈","Silver Bird","1K XP","0 / 7 Day"],["🥇","Gold Bird","3K XP","0 / 14 Day"],
    ["💎","Diamond Bird","7.5K XP","0 / 30 Day"],["👑","Legendary Bird","15K XP","0 / 60 Day"]
  ];
  var tierList = document.getElementById('tierList');
  if(tierList){
    TIERS.forEach(function(ti){
      var d = document.createElement('div'); d.className = 'tier';
      d.innerHTML = '<div class="medal">' + ti[0] + '</div><div class="tinfo"><div class="tn">' + ti[1] + '</div><div class="tp">' + ti[3] + '</div></div><div class="tgo">' + ti[2] + '</div>';
      tierList.appendChild(d);
    });
  }

  // ---------- Tabs ----------
  document.querySelectorAll('.atab').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.atab').forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on');
      var p = b.getAttribute('data-pane');
      document.getElementById('pane-tasks').hidden = (p !== 'tasks');
      document.getElementById('pane-lb').hidden = (p !== 'lb');
    });
  });
  document.querySelectorAll('.atab2').forEach(function(b){
    b.addEventListener('click', function(){
      document.querySelectorAll('.atab2').forEach(function(x){ x.classList.remove('on'); }); b.classList.add('on');
      var p = b.getAttribute('data-rpane');
      document.getElementById('rpane-birds').hidden = (p !== 'birds');
      document.getElementById('rpane-tiers').hidden = (p !== 'tiers');
    });
  });

  // ---------- Countdown ----------
  var timerEl = document.getElementById('bgTimer');
  if(timerEl && !reduce){
    var secs = 14*3600 + 31*60 + 23;
    setInterval(function(){
      secs = (secs - 1 + 86400) % 86400;
      var h = Math.floor(secs/3600), m = Math.floor(secs%3600/60), s = secs%60;
      timerEl.textContent = (h<10?'0':'') + h + ':' + (m<10?'0':'') + m + ':' + (s<10?'0':'') + s;
    }, 1000);
  }

  // ---------- Sweepbird game ----------
  var cv = document.getElementById('birdCanvas');
  if(cv){
    var ctx = cv.getContext('2d');
    var W = cv.width, H = cv.height;
    var overlay = document.getElementById('bgOverlay');
    var bgTitle = overlay && overlay.querySelector('.bg-title');
    var bgEdition = overlay && overlay.querySelector('.bg-edition');
    var bgPlay = document.getElementById('bgPlay');
    var scoreEl = document.getElementById('bgScore'), bestEl = document.getElementById('bgBest');
    var bird, pipes, score = 0, best = 0, state = 'idle', raf;
    var GAP = 140, PW = 60, SPEED = 2.5, GROUND = 26;

    function reset(){ bird = {x: W*0.28, y: H/2, v: 0, r: 13}; pipes = []; score = 0; if(scoreEl) scoreEl.textContent = '0'; spawn(); }
    function spawn(){ var top = 46 + Math.random() * (H - GAP - 140); pipes.push({x: W + 20, top: top, passed: false}); }
    function start(){ reset(); state = 'play'; if(overlay) overlay.classList.add('hide'); cancelAnimationFrame(raf); loop(); }
    function flap(){ if(state === 'play'){ bird.v = -5.4; } else { start(); } }

    function gameOver(){
      state = 'over'; cancelAnimationFrame(raf);
      best = Math.max(best, score); if(bestEl) bestEl.textContent = best;
      var xp = score * 10;
      if(bgEdition) bgEdition.textContent = T('Score') + ' ' + score + ' · ' + T('Best') + ' ' + best;
      if(bgTitle) bgTitle.innerHTML = T('Game Over');
      if(bgPlay) bgPlay.textContent = '▶ ' + (window.__t ? window.__t('PLAY NOW') : 'PLAY AGAIN');
      if(overlay) overlay.classList.remove('hide');
      if(xp > 0) addXp(xp, 'Sweepbird');
    }

    function draw(){
      var g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#223a66'); g.addColorStop(.55,'#3d5e95'); g.addColorStop(1,'#5f83b4');
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
      // ground
      ctx.fillStyle = '#3a7d3a'; ctx.fillRect(0, H-GROUND, W, GROUND);
      ctx.fillStyle = '#2f6b2f'; ctx.fillRect(0, H-GROUND, W, 5);
      // pipes
      pipes.forEach(function(p){
        ctx.fillStyle = '#2fae57';
        ctx.fillRect(p.x, 0, PW, p.top);
        ctx.fillRect(p.x, p.top + GAP, PW, H - p.top - GAP - GROUND);
        ctx.fillStyle = '#27934a';
        ctx.fillRect(p.x - 3, p.top - 15, PW + 6, 15);
        ctx.fillRect(p.x - 3, p.top + GAP, PW + 6, 15);
      });
      // bird
      ctx.save(); ctx.translate(bird.x, bird.y); ctx.rotate(Math.max(-0.4, Math.min(0.85, bird.v * 0.07)));
      ctx.fillStyle = '#F5B63D'; ctx.beginPath(); ctx.arc(0,0,bird.r,0,7); ctx.fill();
      ctx.fillStyle = '#e8892b'; ctx.beginPath(); ctx.moveTo(bird.r-3,-2); ctx.lineTo(bird.r+7,-4); ctx.lineTo(bird.r+7,3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(5,-4,4,0,7); ctx.fill();
      ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(6,-4,2,0,7); ctx.fill();
      ctx.restore();
      // score
      ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.font = '800 34px ui-monospace,Menlo,monospace'; ctx.textAlign = 'center';
      ctx.fillText(score, W/2, 52);
    }

    function loop(){
      bird.v += 0.33; bird.y += bird.v;
      for(var k=0;k<pipes.length;k++){ pipes[k].x -= SPEED; }
      if(pipes.length && pipes[0].x < -PW - 10) pipes.shift();
      if(pipes.length === 0 || pipes[pipes.length-1].x < W - 235) spawn();
      pipes.forEach(function(p){ if(!p.passed && p.x + PW < bird.x){ p.passed = true; score++; if(scoreEl) scoreEl.textContent = score; } });
      if(bird.y + bird.r > H - GROUND || bird.y - bird.r < 0){ draw(); return gameOver(); }
      for(var i=0;i<pipes.length;i++){ var p = pipes[i];
        if(bird.x + bird.r > p.x && bird.x - bird.r < p.x + PW){
          if(bird.y - bird.r < p.top || bird.y + bird.r > p.top + GAP){ draw(); return gameOver(); }
        }
      }
      draw();
      raf = requestAnimationFrame(loop);
    }

    // initial idle frame
    reset(); draw();
    if(bgPlay) bgPlay.addEventListener('click', function(e){ e.preventDefault(); flap(); });
    cv.addEventListener('mousedown', function(){ flap(); });
    cv.addEventListener('touchstart', function(e){ e.preventDefault(); flap(); }, {passive:false});
    document.addEventListener('keydown', function(e){ if(e.code === 'Space' || e.key === ' '){ if(document.getElementById('birdCanvas')){ e.preventDefault(); flap(); } } });
  }
})();
