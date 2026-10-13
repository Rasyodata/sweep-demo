(function(){
  "use strict";
  var root = document.getElementById('gameRoot');
  if(!root) return;
  var T = window.__t || function(s){ return s; };
  function toast(m, ty){ if(window.toast) window.toast(m, ty); }

  // ---------- Balance ----------
  var bal; try { bal = parseFloat(sessionStorage.getItem('sweep_bal')); } catch(e){}
  if(!bal || isNaN(bal)) bal = 1000;
  function saveBal(){ try { sessionStorage.setItem('sweep_bal', bal.toFixed(2)); } catch(e){} }
  function fmt(n){ return Number(n).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
  function setBal(v){ bal = Math.max(0, v); saveBal(); var e = document.getElementById('balv'); if(e) e.textContent = fmt(bal); }
  setBal(bal);
  var rb = document.getElementById('balReset');
  if(rb) rb.addEventListener('click', function(){ setBal(1000); toast('Demo balance reset to 1,000.00', 'info'); });

  function rand(){ return Math.random(); }
  function ri(a,b){ return a + Math.floor(rand()*(b-a+1)); }

  // ---------- Bet bar helper ----------
  function betbar(label){
    return '<div class="betbar"><div class="bb-amt"><span class="bb-l">Bet (SWEEP)</span>'
      + '<div class="bb-in"><input id="betAmt" type="text" inputmode="decimal" value="10.00" aria-label="Bet amount">'
      + '<button class="bbq" data-q="half">½</button><button class="bbq" data-q="dbl">2×</button><button class="bbq" data-q="max">Max</button></div></div>'
      + '<button class="bb-play" id="playBtn">' + label + '</button></div>';
  }
  function getBet(){ var v = parseFloat((document.getElementById('betAmt')||{}).value); return isNaN(v) ? 0 : v; }
  function wireBet(){
    document.querySelectorAll('.bbq').forEach(function(b){
      b.addEventListener('click', function(){
        var i = document.getElementById('betAmt'), v = getBet(), q = b.getAttribute('data-q');
        if(q==='half') v = v/2; else if(q==='dbl') v = v*2; else if(q==='max') v = bal;
        i.value = (v||0).toFixed(2);
      });
    });
  }
  function stake(){ var b = getBet(); if(b <= 0){ toast('Enter a valid bet amount.', 'error'); return 0; } if(b > bal){ toast('Insufficient balance.', 'error'); return 0; } setBal(bal - b); return b; }
  function settle(payout, bet, mult){
    if(payout > 0) setBal(bal + payout);
    showResult(payout > 0, payout, bet, mult);
  }

  // ---------- Center result modal (engaging) ----------
  var WIN_T = ["You won! 🎉","Winner winner!","Nice hit!","Cha-ching! 💰","Big win!","Let's go! 🚀"];
  var LOSE_T = ["So close!","Almost had it!","Not this time","Shake it off 💪","Unlucky!"];
  var WIN_TIP = ["Ride the streak — go again!","You're on fire 🔥","Quit while ahead… or double it?","The table loves you right now."];
  var LOSE_TIP = ["Your luck is about to turn.","Fortune favors the bold — one more?","Comebacks start with one more round.","Big wins hide behind near-misses."];
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  var resTimer = null;
  function closeResult(){ var ov=document.getElementById('resultModal'); if(ov){ ov.classList.remove('show'); } if(resTimer){ clearTimeout(resTimer); resTimer=null; } }
  function showResult(win, payout, bet, mult){
    var ov = document.getElementById('resultModal');
    if(!ov){ ov = document.createElement('div'); ov.id = 'resultModal'; ov.className = 'result-ov'; document.body.appendChild(ov); }
    var icon = win ? (mult>=5 ? '🤑' : '🎉') : '😮';
    var amt = win ? ('+' + fmt(payout) + ' SWEEP' + (mult!=null && isFinite(mult) ? '  ·  ' + mult.toFixed(2) + '×' : '')) : ('−' + fmt(bet) + ' SWEEP');
    ov.className = 'result-ov ' + (win ? 'win' : 'lose') + ' show';
    ov.innerHTML = '<div class="result-card">'
      + (win ? '<canvas class="confetti" width="420" height="260" aria-hidden="true"></canvas>' : '')
      + '<div class="r-ic">' + icon + '</div>'
      + '<h3 class="r-title">' + pick(win ? WIN_T : LOSE_T) + '</h3>'
      + '<div class="r-amt">' + amt + '</div>'
      + '<p class="r-tip">' + pick(win ? WIN_TIP : LOSE_TIP) + '</p>'
      + '<div class="r-btns"><button class="r-again" id="rAgain">🔄 Play Again</button>'
      + '<a class="r-more" href="game.html">More games →</a></div></div>';
    var card = ov.querySelector('.result-card');
    var again = ov.querySelector('#rAgain');
    again.addEventListener('click', function(e){ e.stopPropagation(); closeResult(); var pb = document.getElementById('playBtn'); if(pb && !pb.disabled) pb.click(); else { var hp=document.getElementById('hiHigh'); if(hp) {} } again.blur(); });
    ov.addEventListener('click', function(e){ if(e.target === ov) closeResult(); });
    setTimeout(function(){ try{ again.focus(); }catch(e){} }, 30);
    if(win) confetti(ov.querySelector('.confetti'));
  }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeResult(); } });
  function confetti(cv){
    if(!cv || reduceMotion) return;
    var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, cols = ['#F5B63D','#35E39B','#7C5CFF','#3B99FC','#FF5C6C','#fff'], ps = [];
    for(var i=0;i<90;i++){ ps.push({x:W/2+(Math.random()-0.5)*80, y:H*0.4, vx:(Math.random()-0.5)*9, vy:(Math.random()-0.9)*11, c:cols[Math.floor(Math.random()*cols.length)], s:3+Math.random()*4, r:Math.random()*6}); }
    var t0 = null;
    function frame(ts){ if(!t0) t0 = ts; var el = ts - t0; ctx.clearRect(0,0,W,H);
      ps.forEach(function(p){ p.vy += 0.3; p.x += p.vx; p.y += p.vy; p.r += 0.2; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.globalAlpha = Math.max(0, 1 - el/1600); ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*1.6); ctx.restore(); });
      if(el < 1600) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ========================================================= GAMES =========================================================
  var G = {};

  // ---- Crash ----
  G.crash = function(r){
    r.innerHTML = '<div class="gcard"><canvas id="crashCv" width="720" height="300"></canvas>'
      + '<div class="crash-mult" id="crashM">1.00×</div></div>' + betbar('Bet');
    wireBet();
    var cv = document.getElementById('crashCv'), ctx = cv.getContext('2d'), W=cv.width, H=cv.height;
    var m = document.getElementById('crashM'), btn = document.getElementById('playBtn');
    var state='idle', mult=1, bust=0, t0, bet=0, cashed=false, pts=[];
    function draw(){
      ctx.clearRect(0,0,W,H);
      var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0e1320'); g.addColorStop(1,'#0a0d15'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(255,255,255,.05)'; for(var x=0;x<W;x+=72){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();} for(var y=0;y<H;y+=50){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      if(pts.length>1){ ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]); for(var i=1;i<pts.length;i++) ctx.lineTo(pts[i][0],pts[i][1]);
        ctx.strokeStyle = state==='bust' ? '#FF5C6C' : '#35E39B'; ctx.lineWidth=3; ctx.stroke();
        var last=pts[pts.length-1]; ctx.fillStyle=state==='bust'?'#FF5C6C':'#35E39B'; ctx.beginPath(); ctx.arc(last[0],last[1],5,0,7); ctx.fill(); }
    }
    function loop(ts){ if(state!=='run') return; if(!t0) t0=ts; var el=(ts-t0)/1000;
      mult = Math.pow(1.0718, el*6); // grows
      var x = Math.min(W-10, 10 + el*90), y = H-10 - Math.min(H-20, (mult-1)*46);
      pts.push([x,y]);
      m.textContent = mult.toFixed(2)+'×'; m.style.color='#35E39B';
      if(mult>=bust){ state='bust'; m.textContent=bust.toFixed(2)+'× BUST'; m.style.color='#FF5C6C'; draw();
        btn.textContent='Bet'; btn.disabled=false; if(!cashed) {} return; }
      draw(); requestAnimationFrame(loop);
    }
    function start(){ bet=stake(); if(!bet){return;} cashed=false; pts=[]; mult=1; t0=0; bust=Math.max(1.01, Math.pow(rand(), -0.42)); // house-edged
      state='run'; btn.textContent='Cash Out'; requestAnimationFrame(loop);
    }
    function cashout(){ if(state!=='run'||cashed) return; cashed=true; state='idle'; var p=bet*mult; settle(p,bet,mult); m.style.color='#F5B63D';
      btn.textContent='Bet'; }
    btn.addEventListener('click', function(){ if(state==='run') cashout(); else start(); });
    draw();
  };

  // ---- Plinko ----
  G.plincoin = function(r){
    r.innerHTML = '<div class="gcard"><canvas id="plkCv" width="560" height="420"></canvas></div>'
      + '<div class="plk-mults" id="plkM"></div>' + betbar('Drop');
    wireBet();
    var cv=document.getElementById('plkCv'), ctx=cv.getContext('2d'), W=cv.width, H=cv.height;
    var rows=12, MULT=[16,9,2,1.4,1.1,0.5,0.3,0.5,1.1,1.4,2,9,16];
    var slotEl=document.getElementById('plkM'); slotEl.innerHTML=MULT.map(function(x){return '<span>'+x+'×</span>';}).join('');
    var pegs=[]; for(var row=0;row<rows;row++){ for(var c=0;c<=row+2;c++){ pegs.push({x: W/2 + (c-(row+2)/2)*34, y: 48+row*28}); } }
    var balls=[];
    function draw(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='#0b0e16'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle='rgba(255,255,255,.35)'; pegs.forEach(function(p){ ctx.beginPath(); ctx.arc(p.x,p.y,3,0,7); ctx.fill(); });
      balls.forEach(function(b){ ctx.fillStyle='#F5B63D'; ctx.beginPath(); ctx.arc(b.x,b.y,6,0,7); ctx.fill(); });
    }
    function step(){ var alive=false;
      balls.forEach(function(b){ if(b.done) return; alive=true; b.vy+=0.28; b.y+=b.vy; b.x+=b.vx; b.vx*=0.99;
        pegs.forEach(function(p){ var dx=b.x-p.x, dy=b.y-p.y, d=Math.hypot(dx,dy); if(d<9){ b.vx += (dx>0?1:-1)*(1.4+rand()); b.vy=Math.max(0.5,b.vy*0.5); b.y=p.y-9; } });
        if(b.x<8){b.x=8;b.vx=Math.abs(b.vx);} if(b.x>W-8){b.x=W-8;b.vx=-Math.abs(b.vx);}
        if(b.y>H-14){ b.done=true; var idx=Math.max(0,Math.min(MULT.length-1, Math.round((b.x/W)*MULT.length-0.5))); var p=b.bet*MULT[idx]; settle(p,b.bet,MULT[idx]);
          var sp=slotEl.children[idx]; if(sp){ sp.classList.add('hit'); setTimeout(function(){sp.classList.remove('hit');},600);} }
      });
      draw(); if(alive) requestAnimationFrame(step);
    }
    document.getElementById('playBtn').addEventListener('click', function(){ var bet=stake(); if(!bet) return; balls.push({x:W/2+(rand()-0.5)*8,y:12,vx:(rand()-0.5)*1.2,vy:0,bet:bet,done:false}); if(balls.filter(function(b){return !b.done;}).length===1) requestAnimationFrame(step); });
    draw();
  };

  // ---- Mines (Boomb) ----
  G.boomb = function(r){
    var N=25, mines=5, picks=0, active=false, bet=0, mult=1, grid=[];
    r.innerHTML = '<div class="gcard mines-top"><div class="mines-cfg"><label>Mines</label><select id="mcnt"><option>3</option><option selected>5</option><option>8</option><option>12</option></select>'
      + '<div class="mines-mult">Next: <b id="mnext">1.00×</b> · Total: <b id="mtot">1.00×</b></div></div>'
      + '<div class="minegrid" id="mgrid"></div></div>' + betbar('Start');
    wireBet();
    var gridEl=document.getElementById('mgrid'), btn=document.getElementById('playBtn');
    function build(){ gridEl.innerHTML=''; for(var i=0;i<N;i++){ var c=document.createElement('button'); c.className='mtile'; c.dataset.i=i; c.addEventListener('click',reveal); gridEl.appendChild(c);} }
    function calcMult(){ var safe=N-mines, m=1; for(var k=0;k<picks;k++){ m *= (N-k)/(safe-k); } return m*0.97; }
    function start(){ bet=stake(); if(!bet) return; mines=parseInt(document.getElementById('mcnt').value,10); picks=0; mult=1; active=true;
      grid=Array(N).fill(0); var placed=0; while(placed<mines){ var p=ri(0,N-1); if(!grid[p]){grid[p]=1;placed++;} }
      build(); btn.textContent='Cash Out'; upd();
    }
    function upd(){ document.getElementById('mtot').textContent=mult.toFixed(2)+'×'; picks0=picks; var nm=1; var safe=N-mines; { nm=1; for(var k=0;k<picks+1;k++){ nm*=(N-k)/(safe-k);} nm*=0.97;} document.getElementById('mnext').textContent=nm.toFixed(2)+'×'; }
    var picks0;
    function reveal(e){ if(!active) return; var c=e.currentTarget, i=+c.dataset.i; if(c.classList.contains('open')) return;
      if(grid[i]){ c.classList.add('bomb'); c.textContent='💣'; active=false; btn.textContent='Start'; revealAll(); settle(0,bet,0); return; }
      c.classList.add('open','safe'); c.textContent='💎'; picks++; mult=calcMult(); upd();
      if(picks===N-mines){ cashout(); }
    }
    function revealAll(){ gridEl.querySelectorAll('.mtile').forEach(function(c){ var i=+c.dataset.i; if(grid[i]&&!c.classList.contains('bomb')){ c.textContent='💣'; c.classList.add('bombfaint'); } }); }
    function cashout(){ if(!active||picks===0){ if(active&&picks===0){ toast('Reveal at least one tile first.','info'); return;} return;} active=false; var p=bet*mult; settle(p,bet,mult); btn.textContent='Start'; revealAll(); }
    btn.addEventListener('click', function(){ if(active) cashout(); else start(); });
    build();
  };

  // ---- Coin Flip ----
  G.flip = function(r){
    r.innerHTML = '<div class="gcard flipc"><div class="coin" id="coin">S</div><div class="flip-pick"><button class="fp on" data-s="H">Heads</button><button class="fp" data-s="T">Tails</button></div></div>' + betbar('Flip');
    wireBet();
    var pick='H'; document.querySelectorAll('.fp').forEach(function(b){ b.addEventListener('click',function(){ document.querySelectorAll('.fp').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); pick=b.dataset.s; }); });
    document.getElementById('playBtn').addEventListener('click', function(){ var bet=stake(); if(!bet) return; var coin=document.getElementById('coin');
      coin.classList.add('spin'); setTimeout(function(){ coin.classList.remove('spin'); var res=rand()<0.5?'H':'T'; coin.textContent=res==='H'?'H':'T'; coin.style.background=res==='H'?'linear-gradient(180deg,#FBD27C,#E7A52B)':'linear-gradient(180deg,#9aa6bd,#5c6678)';
        if(res===pick){ settle(bet*1.96,bet,1.96);} else settle(0,bet,0); },700);
    });
  };

  // ---- Tower ----
  G.tower = function(r){
    var ROWS=8, COLS=3, cur=0, active=false, bet=0, mult=1, bombs=[];
    r.innerHTML='<div class="gcard"><div class="tower" id="tower"></div><div class="mines-mult" style="text-align:center;margin-top:10px">Total: <b id="twM">1.00×</b></div></div>'+betbar('Start');
    wireBet();
    var tEl=document.getElementById('tower'), btn=document.getElementById('playBtn');
    function build(){ tEl.innerHTML=''; for(var r0=ROWS-1;r0>=0;r0--){ var row=document.createElement('div'); row.className='twrow'; row.dataset.r=r0; for(var c=0;c<COLS;c++){ var b=document.createElement('button'); b.className='twtile'; b.dataset.r=r0; b.dataset.c=c; b.addEventListener('click',pick); row.appendChild(b);} tEl.appendChild(row);} mark(); }
    function mark(){ tEl.querySelectorAll('.twrow').forEach(function(row){ var rr=+row.dataset.r; row.classList.toggle('activerow', rr===cur && active); }); }
    function start(){ bet=stake(); if(!bet) return; cur=0; mult=1; active=true; bombs=[]; for(var i=0;i<ROWS;i++) bombs.push(ri(0,COLS-1)); build(); btn.textContent='Cash Out'; document.getElementById('twM').textContent='1.00×'; }
    function pick(e){ if(!active) return; var b=e.currentTarget, rr=+b.dataset.r, cc=+b.dataset.c; if(rr!==cur) return;
      if(bombs[rr]===cc){ b.classList.add('bomb'); b.textContent='💣'; active=false; btn.textContent='Start'; settle(0,bet,0); reveal(); return; }
      b.classList.add('safe'); b.textContent='✓'; mult*=(COLS/(COLS-1))*0.97*1.02; document.getElementById('twM').textContent=mult.toFixed(2)+'×'; cur++; mark();
      if(cur>=ROWS){ cashout(); }
    }
    function reveal(){ tEl.querySelectorAll('.twrow').forEach(function(row){ var rr=+row.dataset.r; var bt=row.children[bombs[rr]]; if(bt&&!bt.classList.contains('bomb')){ bt.textContent='💣'; bt.classList.add('bombfaint'); } }); }
    function cashout(){ if(!active||cur===0){ if(active&&cur===0) toast('Climb at least one row first.','info'); return;} active=false; settle(bet*mult,bet,mult); btn.textContent='Start'; reveal(); }
    btn.addEventListener('click', function(){ if(active) cashout(); else start(); });
    build();
  };

  // ---- Cases ----
  G.cases = function(r){
    var ITEMS=[['Common','#8a94a6',0.4],['Uncommon','#35E39B',1.2],['Rare','#3B99FC',2.5],['Epic','#7C5CFF',6],['Legendary','#F5B63D',15],['Mythic','#FF5C6C',40]];
    r.innerHTML='<div class="gcard"><div class="caseview"><div class="case-marker"></div><div class="case-strip" id="strip"></div></div></div>'+betbar('Open Case');
    wireBet();
    var strip=document.getElementById('strip');
    function cell(it){ return '<div class="citem" style="--c:'+it[1]+'"><span class="cv">'+it[2]+'×</span><span class="cn">'+it[0]+'</span></div>'; }
    function fill(win){ var h=''; for(var i=0;i<40;i++){ var it = (i===36)? win : ITEMS[ri(0,ITEMS.length-1)]; h+=cell(it);} strip.innerHTML=h; }
    fill(ITEMS[0]); strip.style.transform='translateX(0)';
    document.getElementById('playBtn').addEventListener('click', function(){ var bet=stake(); if(!bet) return;
      var rl=rand(), win; if(rl<0.45)win=ITEMS[0]; else if(rl<0.72)win=ITEMS[1]; else if(rl<0.88)win=ITEMS[2]; else if(rl<0.96)win=ITEMS[3]; else if(rl<0.99)win=ITEMS[4]; else win=ITEMS[5];
      fill(win); strip.style.transition='none'; strip.style.transform='translateX(0)'; void strip.offsetWidth;
      var cellW=96, off = 36*cellW - (strip.parentElement.clientWidth/2) + cellW/2 + ri(-20,20);
      strip.style.transition='transform 3.6s cubic-bezier(.12,.75,.1,1)'; strip.style.transform='translateX(-'+off+'px)';
      setTimeout(function(){ settle(bet*win[2],bet,win[2]); }, 3700);
    });
  };

  // ---- Upgrade ----
  G.upgrade = function(r){
    r.innerHTML='<div class="gcard upg"><div class="upg-wheel"><canvas id="upgCv" width="260" height="260"></canvas><div class="upg-ptr">▼</div></div>'
      +'<div class="upg-ctl"><label>Target multiplier</label><div class="upg-mults" id="upgM"></div><div class="upg-chance">Win chance: <b id="upgC">48.5%</b></div></div></div>'+betbar('Upgrade');
    wireBet();
    var mults=[1.5,2,3,5,10,25], target=2;
    var mEl=document.getElementById('upgM'); mEl.innerHTML=mults.map(function(x){return '<button class="um'+(x===2?' on':'')+'" data-m="'+x+'">'+x+'×</button>';}).join('');
    var cv=document.getElementById('upgCv'), ctx=cv.getContext('2d');
    function chance(){ return 0.97/target; }
    function drawWheel(a){ a=a||0; var cx=130,cy=130,R=120, win=chance(); ctx.clearRect(0,0,260,260);
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a,a+win*2*Math.PI); ctx.closePath(); ctx.fillStyle='#35E39B'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a+win*2*Math.PI,a+2*Math.PI); ctx.closePath(); ctx.fillStyle='#1a212c'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx,cy,R*0.62,0,7); ctx.fillStyle='#0b0e16'; ctx.fill();
      ctx.fillStyle='#F5B63D'; ctx.font='800 26px ui-monospace,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(target+'×',cx,cy);
    }
    function setT(v){ target=v; document.getElementById('upgC').textContent=(chance()*100).toFixed(1)+'%'; drawWheel(curA); }
    mEl.querySelectorAll('.um').forEach(function(b){ b.addEventListener('click',function(){ mEl.querySelectorAll('.um').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); setT(parseFloat(b.dataset.m)); }); });
    var curA=0, spinning=false;
    document.getElementById('playBtn').addEventListener('click', function(){ if(spinning) return; var bet=stake(); if(!bet) return; spinning=true;
      var win=rand()<chance(); var land = win ? rand()*chance() : chance()+rand()*(1-chance());
      var target_a = -(land*2*Math.PI) + Math.PI*2*6 - Math.PI/2; var start=curA, t0=null, dur=3000;
      function anim(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3); curA=start+(target_a-start)*e; drawWheel(curA); if(p<1) requestAnimationFrame(anim); else { spinning=false; if(win) settle(bet*target,bet,target); else settle(0,bet,0); } }
      requestAnimationFrame(anim);
    });
    setT(2);
  };

  // ---- Hi-Lo (Card) ----
  G.card = function(r){
    r.innerHTML='<div class="gcard hilo"><div class="hcard" id="hcard">?</div><div class="hilo-mult">Streak: <b id="hiM">1.00×</b></div><div class="hilo-btns"><button class="hb" id="hiHigh">▲ Higher</button><button class="hb" id="hiLow">▼ Lower</button></div><button class="bb-play alt" id="hiCash" disabled>Cash Out</button></div>'+betbar('Deal');
    wireBet();
    var cur=0, mult=1, active=false, bet=0;
    var cEl=document.getElementById('hcard');
    function show(n){ cEl.textContent=n; cEl.style.color = n>=8?'#35E39B':'#FF5C6C'; }
    function deal(){ bet=stake(); if(!bet) return; cur=ri(2,13); mult=1; active=true; show(cur); document.getElementById('hiM').textContent='1.00×'; document.getElementById('hiCash').disabled=false; }
    function guess(hi){ if(!active) return; var n=ri(2,13); var pHi=(13-cur)/12, pLo=(cur-1)/12; var correct = hi ? (n>=cur) : (n<=cur);
      show(n);
      if(correct){ var p = hi? pHi : pLo; var inc = (p>0? (0.97/Math.max(0.08,p)) : 1); mult*=inc; cur=n; document.getElementById('hiM').textContent=mult.toFixed(2)+'×'; }
      else { active=false; document.getElementById('hiCash').disabled=true; settle(0,bet,0); }
    }
    document.getElementById('hiHigh').addEventListener('click',function(){ guess(true); });
    document.getElementById('hiLow').addEventListener('click',function(){ guess(false); });
    document.getElementById('hiCash').addEventListener('click',function(){ if(!active) return; active=false; document.getElementById('hiCash').disabled=true; settle(bet*mult,bet,mult); });
    document.getElementById('playBtn').addEventListener('click', deal);
  };

  // ---- Wheel (Booster) ----
  G.booster = function(r){
    var SEG=[0,1.5,2,0,3,1.5,5,0,2,1.5,10,0]; var COL=['#1a212c','#35E39B','#3B99FC','#1a212c','#7C5CFF','#35E39B','#F5B63D','#1a212c','#3B99FC','#35E39B','#FF5C6C','#1a212c'];
    r.innerHTML='<div class="gcard"><div class="wheelbox"><canvas id="whCv" width="300" height="300"></canvas><div class="wh-ptr">▼</div></div></div>'+betbar('Spin');
    wireBet();
    var cv=document.getElementById('whCv'), ctx=cv.getContext('2d'), n=SEG.length, cx=150,cy=150,R=140, a=0, spin=false;
    function draw(){ ctx.clearRect(0,0,300,300); for(var i=0;i<n;i++){ var s=a+i*2*Math.PI/n, e=s+2*Math.PI/n; ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,s,e); ctx.closePath(); ctx.fillStyle=COL[i]; ctx.fill(); ctx.save(); ctx.translate(cx,cy); ctx.rotate(s+Math.PI/n); ctx.fillStyle='#fff'; ctx.font='700 14px ui-monospace,monospace'; ctx.textAlign='right'; ctx.fillText(SEG[i]+'×',R-10,4); ctx.restore(); }
      ctx.beginPath(); ctx.arc(cx,cy,34,0,7); ctx.fillStyle='#0b0e16'; ctx.fill(); }
    document.getElementById('playBtn').addEventListener('click', function(){ if(spin) return; var bet=stake(); if(!bet) return; spin=true;
      var idx=ri(0,n-1); var target=-(idx*2*Math.PI/n) - Math.PI/n + Math.PI*2*6 - Math.PI/2; var s=a,t0=null,dur=3400;
      function anim(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3); a=s+(target-s)*e; draw(); if(p<1) requestAnimationFrame(anim); else { spin=false; var mx=SEG[idx]; settle(bet*mx,bet,mx); } }
      requestAnimationFrame(anim);
    });
    draw();
  };

  // ---- Dice (Changer) ----
  G.changer = function(r){
    r.innerHTML='<div class="gcard dice"><div class="dice-res" id="dres">—</div><div class="dice-row"><input type="range" id="dslider" min="2" max="98" value="50"><div class="dice-val">Roll under <b id="dtar">50.00</b></div></div><div class="dice-stats"><span>Win chance <b id="dch">50%</b></span><span>Payout <b id="dpay">1.94×</b></span></div></div>'+betbar('Roll Dice');
    wireBet();
    var s=document.getElementById('dslider');
    function upd(){ var t=+s.value; document.getElementById('dtar').textContent=t.toFixed(2); var ch=t/100; document.getElementById('dch').textContent=t+'%'; document.getElementById('dpay').textContent=(0.97/ch).toFixed(2)+'×'; }
    s.addEventListener('input',upd); upd();
    document.getElementById('playBtn').addEventListener('click', function(){ var bet=stake(); if(!bet) return; var t=+s.value, roll=rand()*100; var el=document.getElementById('dres'); el.textContent=roll.toFixed(2);
      if(roll<t){ var mx=0.97/(t/100); el.style.color='#35E39B'; settle(bet*mx,bet,mx);} else { el.style.color='#FF5C6C'; settle(0,bet,0);} });
  };

  // ---- Market / Trade (price direction) ----
  function priceGame(r, longLabel, shortLabel){
    r.innerHTML='<div class="gcard"><canvas id="mkCv" width="720" height="280"></canvas><div class="mk-price" id="mkP">$0.0428</div></div>'
      +'<div class="mk-pick"><button class="mkb up" data-d="1">'+longLabel+' ▲</button><button class="mkb dn" data-d="-1">'+shortLabel+' ▼</button></div>'+betbar('Place');
    wireBet();
    var cv=document.getElementById('mkCv'), ctx=cv.getContext('2d'), W=cv.width,H=cv.height, price=0.0428, hist=[], dir=1, running=false, bet=0, startP=0;
    for(var i=0;i<60;i++){ price+= (rand()-0.5)*0.0006; hist.push(price); }
    document.querySelectorAll('.mkb').forEach(function(b){ b.addEventListener('click',function(){ document.querySelectorAll('.mkb').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); dir=+b.dataset.d; }); });
    document.querySelector('.mkb').classList.add('on');
    function draw(){ ctx.clearRect(0,0,W,H); ctx.fillStyle='#0b0e16'; ctx.fillRect(0,0,W,H); var mx=Math.max.apply(null,hist),mn=Math.min.apply(null,hist),pad=10;
      ctx.beginPath(); hist.forEach(function(p,i){ var x=i/(hist.length-1)*W, y=pad+(mx-p)/((mx-mn)||1)*(H-2*pad); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.strokeStyle='#35E39B'; ctx.lineWidth=2; ctx.stroke();
      document.getElementById('mkP').textContent='$'+price.toFixed(4); }
    function round(){ bet=stake(); if(!bet) return; running=true; startP=price; var ticks=0; var btn=document.getElementById('playBtn'); btn.disabled=true;
      var iv=setInterval(function(){ price+=(rand()-0.48+dir*0.06)*0.0007; hist.push(price); if(hist.length>60)hist.shift(); draw(); ticks++;
        if(ticks>=22){ clearInterval(iv); running=false; btn.disabled=false; var moved=(price-startP)*dir; if(moved>0) settle(bet*1.95,bet,1.95); else settle(0,bet,0); } }, 70);
    }
    document.getElementById('playBtn').addEventListener('click', function(){ if(!running) round(); });
    draw();
  }
  G.market = function(r){ priceGame(r,'Up','Down'); };
  G.trade = function(r){ priceGame(r,'Long','Short'); };

  // ---- Sport ----
  G.sport = function(r){
    var M=[['Falcons','Sharks',1.85,3.4,2.1],['Wolves','Lions',2.3,3.1,1.7],['Titans','Dragons',1.6,3.8,2.5]];
    var m=M[ri(0,M.length-1)], pick=0;
    r.innerHTML='<div class="gcard sport"><div class="sp-match"><span>'+m[0]+'</span><b>VS</b><span>'+m[1]+'</span></div>'
      +'<div class="sp-odds"><button class="spo on" data-p="0">'+m[0]+' <b>'+m[2]+'</b></button><button class="spo" data-p="1">Draw <b>'+m[3]+'</b></button><button class="spo" data-p="2">'+m[1]+' <b>'+m[4]+'</b></button></div>'
      +'<div class="sp-res" id="spRes"></div></div>'+betbar('Bet');
    wireBet();
    document.querySelectorAll('.spo').forEach(function(b){ b.addEventListener('click',function(){ document.querySelectorAll('.spo').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); pick=+b.dataset.p; }); });
    document.getElementById('playBtn').addEventListener('click', function(){ var bet=stake(); if(!bet) return; var rl=rand(), out= rl<0.42?0:(rl<0.58?1:2); var odds=[m[2],m[3],m[4]][pick];
      var names=[m[0],'Draw',m[1]]; document.getElementById('spRes').textContent='Result: '+names[out];
      if(out===pick) settle(bet*odds,bet,odds); else settle(0,bet,0); });
  };

  // ---- Racing ----
  G.racing = function(r){
    var H=['🐎 Red','🐎 Blue','🐎 Green','🐎 Gold'], pick=0;
    r.innerHTML='<div class="gcard"><div class="track" id="rtrack"></div></div><div class="race-pick" id="rpick"></div>'+betbar('Race (4×)');
    wireBet();
    var tr=document.getElementById('rtrack'); tr.innerHTML=H.map(function(h,i){return '<div class="lane"><span class="racer" id="rc'+i+'">🏇</span><span class="rl">'+h+'</span></div>';}).join('');
    var pk=document.getElementById('rpick'); pk.innerHTML=H.map(function(h,i){return '<button class="rpb'+(i===0?' on':'')+'" data-p="'+i+'">'+h+'</button>';}).join('');
    pk.querySelectorAll('.rpb').forEach(function(b){ b.addEventListener('click',function(){ pk.querySelectorAll('.rpb').forEach(function(x){x.classList.remove('on');}); b.classList.add('on'); pick=+b.dataset.p; }); });
    var racing=false;
    document.getElementById('playBtn').addEventListener('click', function(){ if(racing) return; var bet=stake(); if(!bet) return; racing=true; var pos=[0,0,0,0], btn=document.getElementById('playBtn'); btn.disabled=true;
      var iv=setInterval(function(){ var done=-1; for(var i=0;i<4;i++){ pos[i]+=rand()*2.6; document.getElementById('rc'+i).style.transform='translateX('+pos[i]+'%)'; if(pos[i]>=92&&done<0) done=i; }
        if(done>=0){ clearInterval(iv); racing=false; btn.disabled=false; if(done===pick) settle(bet*3.9,bet,3.9); else settle(0,bet,0); } }, 60);
    });
  };

  // ---- Fighter ----
  G.fighter = function(r){
    var F=[['Ryu','🥋',1.9],['Ken','🥊',1.9]]; var pick=0;
    r.innerHTML='<div class="gcard fighter"><div class="fgt"><div class="fcard on" data-p="0"><div class="fe">🥋</div><div>Ryu</div><div class="fo">1.9×</div></div><div class="fvs">VS</div><div class="fcard" data-p="1"><div class="fe">🥊</div><div>Ken</div><div class="fo">1.9×</div></div></div><div class="fbar"><div class="fhp" id="hp0"></div><div class="fhp r" id="hp1"></div></div><div class="sp-res" id="fRes"></div></div>'+betbar('Fight');
    wireBet();
    document.querySelectorAll('.fcard').forEach(function(c){ c.addEventListener('click',function(){ document.querySelectorAll('.fcard').forEach(function(x){x.classList.remove('on');}); c.classList.add('on'); pick=+c.dataset.p; }); });
    document.getElementById('playBtn').addEventListener('click', function(){ var bet=stake(); if(!bet) return; var h=[100,100], btn=document.getElementById('playBtn'); btn.disabled=true;
      var iv=setInterval(function(){ var atk=ri(0,1), dmg=ri(6,18); h[1-atk]-=dmg; h[0]=Math.max(0,h[0]); h[1]=Math.max(0,h[1]); document.getElementById('hp0').style.width=h[0]+'%'; document.getElementById('hp1').style.width=h[1]+'%';
        if(h[0]<=0||h[1]<=0){ clearInterval(iv); btn.disabled=false; var win=h[0]>h[1]?0:1; document.getElementById('fRes').textContent=(win===0?'Ryu':'Ken')+' wins!'; if(win===pick) settle(bet*1.9,bet,1.9); else settle(0,bet,0); } }, 320);
    });
  };

  // ---- Click ----
  G.click = function(r){
    r.innerHTML='<div class="gcard clicker"><div class="clk-mult" id="clkM">1.00×</div><button class="clk-btn" id="clkBtn">TAP!</button><div class="clk-hint">Tap to grow your multiplier — cash out before it busts!</div></div>'+betbar('Start');
    wireBet();
    var active=false, mult=1, bet=0, bust=0;
    var mEl=document.getElementById('clkM'), tap=document.getElementById('clkBtn'), btn=document.getElementById('playBtn');
    tap.addEventListener('click', function(){ if(!active) return; mult+=0.08+rand()*0.06; mEl.textContent=mult.toFixed(2)+'×'; tap.classList.add('pulse'); setTimeout(function(){tap.classList.remove('pulse');},90);
      if(rand()< (0.03 + mult*0.012)){ active=false; mEl.textContent='BUST @ '+mult.toFixed(2)+'×'; mEl.style.color='#FF5C6C'; btn.textContent='Start'; settle(0,bet,0); } });
    btn.addEventListener('click', function(){ if(active){ active=false; btn.textContent='Start'; settle(bet*mult,bet,mult); mEl.style.color='#F5B63D'; return; }
      bet=stake(); if(!bet) return; active=true; mult=1; mEl.textContent='1.00×'; mEl.style.color='#35E39B'; btn.textContent='Cash Out'; });
  };

  // ---- Sweepstake ----
  G.sweepstake = function(r){
    var picks=[];
    r.innerHTML='<div class="gcard"><div class="apane-h">Pick 5 numbers (1–49)</div><div class="lotto" id="lotto"></div><div class="lotto-draw" id="draw"></div><div class="sp-res" id="lRes"></div></div>'+betbar('Draw');
    wireBet();
    var grid=document.getElementById('lotto'); for(var i=1;i<=49;i++){ var b=document.createElement('button'); b.className='ln'; b.textContent=i; b.dataset.n=i; b.addEventListener('click',function(e){ var n=+e.target.dataset.n; var ix=picks.indexOf(n); if(ix>-1){picks.splice(ix,1);e.target.classList.remove('on');} else if(picks.length<5){picks.push(n);e.target.classList.add('on');} }); grid.appendChild(b); }
    document.getElementById('playBtn').addEventListener('click', function(){ if(picks.length!==5){ toast('Pick exactly 5 numbers.','error'); return;} var bet=stake(); if(!bet) return;
      var drawn=[]; while(drawn.length<5){ var n=ri(1,49); if(drawn.indexOf(n)<0) drawn.push(n); }
      document.getElementById('draw').innerHTML=drawn.map(function(n){return '<span class="lb'+(picks.indexOf(n)>-1?' hit':'')+'">'+n+'</span>';}).join('');
      var matches=drawn.filter(function(n){return picks.indexOf(n)>-1;}).length; var pay=[0,0,2,8,50,500][matches];
      document.getElementById('lRes').textContent=matches+' match'+(matches===1?'':'es')+'!'; settle(bet*pay,bet,pay); });
  };

  // ---------- Lobby ----------
  var META=[['crash','Crash','🚀'],['plincoin','Plinko','🔻'],['boomb','Mines','💣'],['changer','Dice','🎲'],['booster','Wheel','🎡'],['flip','Coin Flip','🪙'],['tower','Tower','🗼'],['cases','Cases','📦'],['upgrade','Upgrade','⬆️'],['card','Hi-Lo','🃏'],['racing','Racing','🏇'],['fighter','Fighter','🥊'],['click','Click','👆'],['market','Market','📈'],['trade','Trade','💹'],['sport','Sport','⚽'],['sweepstake','Sweepstake','🎟️']];
  function lobby(){
    document.getElementById('gameTitle').textContent = 'Games';
    var h='<div class="lobby">';
    META.forEach(function(m){ h+='<a class="gtile" href="game.html?g='+m[0]+'"><span class="gt-ic">'+m[2]+'</span><span class="gt-n">'+m[1]+'</span><span class="gt-play">Play →</span></a>'; });
    h+='</div>'; root.innerHTML=h;
  }

  // ---------- Router ----------
  var q = (location.search.match(/[?&]g=([^&]+)/)||[])[1];
  var key = q ? decodeURIComponent(q).toLowerCase() : '';
  var meta = META.filter(function(m){ return m[0]===key; })[0];
  if(key && G[key]){
    document.getElementById('gameTitle').textContent = (meta?meta[1]:key) + (meta?(' '+meta[2]):'');
    G[key](root);
  } else {
    lobby();
  }
})();
