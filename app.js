(function(){
  "use strict";
  // ---- Favicon (Sweep) ----
  (function(){
    if(document.querySelector('link[rel="icon"][data-sweep]')) return;
    function mk(rel, href, attrs){ var l = document.createElement('link'); l.rel = rel; l.href = href; l.setAttribute('data-sweep',''); if(attrs){ for(var k in attrs) l.setAttribute(k, attrs[k]); } document.head.appendChild(l); }
    mk('icon', 'favicon.ico', {sizes:'48x48'});
    mk('icon', 'favicon-white.png', {type:'image/png', media:'(prefers-color-scheme: dark)'});
    mk('icon', 'favicon-dark.png', {type:'image/png', media:'(prefers-color-scheme: light)'});
    mk('apple-touch-icon', 'favicon-white.png');
  })();

  // ---- Header miner animation (live community mining counter) ----
  (function(){
    var search = document.querySelector('.search');
    if(!search || document.getElementById('miner')) return;
    var m = document.createElement('div'); m.className = 'miner'; m.id = 'miner'; m.title = 'SWEEP mined by the community';
    m.innerHTML = '<span class="miner-pick">⛏️</span><div class="miner-txt"><span class="miner-lbl">MINING</span><span class="miner-num" id="minerNum">0</span></div><span class="miner-spark" id="minerSpark"></span>';
    search.insertAdjacentElement('afterend', m);
    var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var n = 1248000 + Math.floor(Math.random() * 60000);
    var el = document.getElementById('minerNum');
    function render(){ el.textContent = n.toLocaleString('en-US'); }
    render();
    if(!rm){
      setInterval(function(){
        n += 1 + Math.floor(Math.random() * 4); render();
        var sp = document.getElementById('minerSpark');
        if(sp){ sp.classList.remove('pop'); void sp.offsetWidth; sp.classList.add('pop'); }
      }, 820);
    }
  })();
  // Build the scrolling game nav (duplicated for seamless loop)
  var games = ["Market","Sport","Trade","Sweepstake","Cases","Upgrade","Changer","Click","Boomb","Booster","Plincoin","Flip","Tower","Fighter","Racing","Card","Crash"];
  var hot = {"Crash":1,"Cases":1,"Plincoin":1,"Sweepstake":1};
  var track = document.getElementById("gtrack");
  var html = "";
  for(var r=0;r<2;r++){
    html += '<a class="pill perp-pill" target="_blank" rel="noopener">⚡ Sweep Perp</a>';
    for(var i=0;i<games.length;i++){
      var g = games[i];
      html += '<a class="pill'+(hot[g]?' hot':'')+'" href="#">'+g+'</a>';
    }
  }
  track.innerHTML = html;

  // Buy tabs toggle (visual)
  var tabBtns = document.querySelectorAll('.tabs button');
  tabBtns.forEach(function(b){
    b.addEventListener('click', function(){
      tabBtns.forEach(function(x){x.classList.remove('on'); x.setAttribute('aria-selected','false');});
      b.classList.add('on'); b.setAttribute('aria-selected','true');
    });
  });

  // Ensure the hero video keeps playing (autoplay guard)
  var v = document.querySelector('.stage video');
  if(v){
    var tryPlay = function(){ var p = v.play(); if(p && p.catch){ p.catch(function(){}); } };
    v.addEventListener('canplay', tryPlay);
    v.addEventListener('pause', function(){ if(!v.ended){ tryPlay(); } });
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) tryPlay(); });
    tryPlay();
  }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Video sound toggle ----
  var vsound = document.getElementById('vsound');
  if(vsound && v){
    vsound.addEventListener('click', function(){
      v.muted = !v.muted;
      var on = !v.muted;
      if(on){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }
      document.getElementById('vsIc').textContent = on ? '🔊' : '🔇';
      document.getElementById('vsLbl').textContent = on ? t('Sound on') : t('Sound off');
      vsound.setAttribute('aria-pressed', on ? 'true' : 'false');
      vsound.setAttribute('aria-label', on ? 'Mute video' : 'Unmute video');
    });
  }

  // ---- Live ticking price ----
  var priceEl = document.querySelector('.quote .price');
  var chgEl = document.querySelector('.quote .chg');
  var hiEl = document.querySelector('.hud-stats div:nth-child(1) .v');
  var loEl = document.querySelector('.hud-stats div:nth-child(2) .v');
  if(priceEl && chgEl && !reduce){
    var cur = 0.0428, ref = 0.04022, hi = 0.0441, lo = 0.0397;
    setInterval(function(){
      var delta = (Math.random() - 0.48) * 0.00045;
      cur = Math.max(0.0399, Math.min(0.0440, cur + delta));
      var rising = delta >= 0;
      priceEl.textContent = '$' + cur.toFixed(4);
      priceEl.style.color = rising ? 'var(--up)' : 'var(--down)';
      setTimeout(function(){ priceEl.style.color = 'var(--ink)'; }, 360);
      var pct = (cur - ref) / ref * 100;
      chgEl.className = 'chg ' + (pct >= 0 ? 'up' : 'down');
      chgEl.textContent = (pct >= 0 ? '▲ +' : '▼ ') + pct.toFixed(2) + '%';
      if(cur > hi){ hi = cur; if(hiEl) hiEl.textContent = '$' + hi.toFixed(4); }
      if(cur < lo){ lo = cur; if(loEl) loEl.textContent = '$' + lo.toFixed(4); }
    }, 1500);
  }

  // ---- Auth modal ----
  var modal = document.getElementById('authModal');
  var lastFocus = null, lastMode = 'login';
  var AUTH = {
    login:  { en:{t:"Welcome to<br>Sweep", b:'Sign In <span aria-hidden="true">↗</span>'},   tr:{t:"Sweep'e<br>Hoş geldin", b:'Giriş Yap <span aria-hidden="true">↗</span>'} },
    signup: { en:{t:"Create your<br>account", b:'Create account <span aria-hidden="true">↗</span>'}, tr:{t:"Hesabını<br>oluştur", b:'Hesap oluştur <span aria-hidden="true">↗</span>'} }
  };
  function setAuthMode(mode){
    var a = AUTH[mode] || AUTH.login; var s = a[curLang] || a.en;
    var tt = modal.querySelector('.modal-title'); if(tt) tt.innerHTML = s.t;
    var si = modal.querySelector('.signin'); if(si) si.innerHTML = s.b;
  }
  function openAuth(mode){
    lastMode = mode || 'login'; setAuthMode(lastMode);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    var f = modal.querySelector('.sso'); if(f) f.focus();
  }
  function closeAuth(){
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.querySelectorAll('[data-auth]').forEach(function(b){
    b.addEventListener('click', function(){ openAuth(b.getAttribute('data-auth')); });
  });
  var ac = document.getElementById('authClose');
  if(ac) ac.addEventListener('click', closeAuth);
  modal.addEventListener('click', function(e){ if(e.target === modal) closeAuth(); });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && !modal.hidden) closeAuth(); });

  // password show/hide
  var pwEye = document.getElementById('pwEye'), pwInput = document.getElementById('pwInput');
  if(pwEye && pwInput){
    pwEye.addEventListener('click', function(){
      var show = pwInput.type === 'password';
      pwInput.type = show ? 'text' : 'password';
      pwEye.textContent = show ? '🙈' : '👁';
      pwEye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }

  // ---- Stats bar count-up ----
  function fmt(n, dec){ return n.toLocaleString('en-US', {minimumFractionDigits:dec||0, maximumFractionDigits:dec||0}); }
  function countUp(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec')||'0', 10);
    var pre = el.getAttribute('data-prefix') || '';
    if(reduce){ el.textContent = pre + fmt(target, dec); return; }
    var start = null, dur = 1500;
    function step(ts){ if(!start) start = ts; var p = Math.min((ts-start)/dur, 1); var e = 1-Math.pow(1-p,3); el.textContent = pre + fmt(target*e, dec); if(p<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  var scounters = document.querySelectorAll('.statsbar [data-count]');
  if(scounters.length){
    var sio = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ countUp(en.target); sio.unobserve(en.target); } }); }, {threshold:.4});
    scounters.forEach(function(c){ sio.observe(c); });
  }

  // ---- Language (EN / TR) ----
  var curLang = 'en';
  var TR = {
    "How it works?":"Nasıl çalışır?", "Log In":"Giriş Yap", "Sign Up":"Kayıt Ol",
    "Redirecting to Google…":"Google'a yönlendiriliyorsun…", "Redirecting to X…":"X'e yönlendiriliyorsun…",
    "Please enter a valid email address.":"Lütfen geçerli bir e-posta adresi gir.",
    "Password must be at least 6 characters.":"Şifre en az 6 karakter olmalı.",
    "Please fix the errors in the form.":"Lütfen formdaki hataları düzelt.",
    "Welcome back! Signing you in…":"Tekrar hoş geldin! Giriş yapılıyor…",
    "Sweep operates without centralized custody or financial guarantees. Access may be restricted in some jurisdictions. By continuing you accept our Terms & Privacy.":"Sweep, merkezi saklama veya finansal garanti olmadan çalışır. Erişim bazı ülkelerde kısıtlı olabilir. Devam ederek Şartlar ve Gizlilik politikamızı kabul etmiş olursun.",
    "Learn more":"Daha fazla", "Accept":"Kabul et",
    "Tasks":"Görevler", "Leaderboard":"Liderlik", "For Rewards":"Ödüller için",
    "Birds":"Kuşlar", "Bird Tiers":"Kuş Seviyeleri", "Sweepbird Leaderboard":"Sweepbird Liderlik Tablosu",
    "players today":"bugün oynayan", "Your XP":"XP'niz", "Rank":"Sıra",
    "SPACE / CLICK TO FLAP":"BOŞLUK / TIKLA & UÇUR", "Game Over":"Oyun Bitti", "Best":"En iyi", "Score":"Skor",
    "Play. Earn XP. Claim $SWEEP.":"Oyna. XP Kazan. $SWEEP Al.",
    "Play Sweepbird, complete tasks, climb the leaderboard, and grow your final $SWEEP allocation through exclusive airdrop rewards.":"Sweepbird oyna, görevleri tamamla, liderlik tablosunda yüksel ve özel airdrop ödülleriyle nihai $SWEEP tahsisatını büyüt.",
    "What is SWEEP Token?":"SWEEP Token Nedir?",
    "Sound off":"Ses kapalı", "Sound on":"Ses açık",
    "24h High":"24s Yüksek", "24h Low":"24s Düşük", "Market Cap":"Piyasa Değeri", "Spot · 24h":"Spot · 24s",
    "SWEEP is the heartbeat of a Web3 gaming ecosystem where your activity creates value. Every interaction fuels a transparent, self-sustaining economy — part of the flow is burned on-chain, part is returned to the community in USDT.":"SWEEP, aktivitenizin değer yarattığı bir Web3 oyun ekosisteminin kalbidir. Her etkileşim şeffaf, kendi kendini besleyen bir ekonomiyi fonlar — akışın bir kısmı zincir üzerinde yakılır, bir kısmı topluluğa USDT olarak geri döner.",
    "BUY SWEEP":"SWEEP AL", "Join the Airdrop":"Airdrop'a Katıl",
    "Buy into the public sale. Phases 1 & 2 are fully subscribed — Phase 3 pricing lands soon.":"Halka arza katıl. Faz 1 ve 2 tamamen doldu — Faz 3 fiyatı çok yakında.",
    "Phase 1":"Faz 1", "Phase 2":"Faz 2", "Phase 3":"Faz 3",
    "· SOLD":"· SATILDI", "· SOON":"· YAKINDA",
    "Sales Rate · 0.00%":"Satış Oranı · %0.00",
    "Sold (USD)":"Satılan (USD)", "Allocation filled":"Tahsisat dolumu",
    "Place Order":"Emir Ver", "Fund your allocation directly.":"Tahsisatını doğrudan fonla.",
    "Credit Card":"Kredi Kartı", "Crypto":"Kripto",
    "Orders for Phase 3 are currently unavailable.":"Faz 3 emirleri şu anda kullanılamıyor.",
    "Total Raised":"Toplam Toplanan", "Total Holders":"Toplam Sahip", "Total Tokens Sold":"Satılan Token", "Countries":"Ülke", "Total Users":"Toplam Kullanıcı",
    "Breaking News":"Son Haberler", "The thinking behind Sweep":"Sweep'in ardındaki düşünce",
    "How the ecosystem works, where it's going, and why it's built the way it is.":"Ekosistem nasıl çalışır, nereye gidiyor ve neden bu şekilde kurgulandı.",
    "View All →":"Tümünü Gör →", "Read article →":"Makaleyi oku →",
    "How Sweep Works":"Sweep Nasıl Çalışır", "Deflationary Model":"Deflasyonist Model", "Distribution Model":"Dağıtım Modeli",
    "How Rewards Are Generated":"Ödüller Nasıl Oluşur", "What is Sweep":"Sweep Nedir", "Vision & Mission":"Vizyon & Misyon",
    "From Problem to Solution":"Sorundan Çözüme", "Why Sweep?":"Neden Sweep?", "Economic Engine":"Ekonomik Motor",
    "Continue with Google":"Google ile devam et", "Continue with X":"X ile devam et", "or":"veya",
    "Privacy":"Gizlilik", "Terms":"Şartlar",
    "Platform":"Platform", "Token":"Token", "Company":"Şirket",
    "Help Center":"Yardım Merkezi", "Terms of Use":"Kullanım Şartları", "Privacy Policy":"Gizlilik Politikası",
    "What is SWEEP?":"SWEEP Nedir?", "Token Sale":"Token Satışı", "Docs":"Dokümanlar",
    "Building the future of web3 economies":"Web3 ekonomilerinin geleceğini inşa ediyoruz",
    "A global Web3 platform where entertainment, financial infrastructure and value creation converge. Built so that the people who generate activity are the ones who share in its value.":"Eğlence, finansal altyapı ve değer üretiminin birleştiği küresel bir Web3 platformu. Aktiviteyi üretenlerin onun değerinden pay aldığı bir yapı.",
    "Sweep is a global Web3 platform operating without centralized custody or financial guarantees. Access may be restricted in some jurisdictions. Users are responsible for complying with their local laws and regulations. Digital assets are volatile and nothing here is financial advice — only commit funds you can afford to lose.":"Sweep, merkezi saklama veya finansal garanti olmadan çalışan küresel bir Web3 platformudur. Erişim bazı ülkelerde kısıtlı olabilir. Kullanıcılar kendi yerel yasa ve düzenlemelerine uymaktan sorumludur. Dijital varlıklar oynaktır ve buradaki hiçbir şey finansal tavsiye değildir — yalnızca kaybetmeyi göze alabileceğin kadarını yatır."
  };
  var PH = { "Search people, news, pages…":"Kişi, haber, sayfa ara…", "E-Mail Address":"E-posta Adresi", "Password":"Şifre" };
  var HTMLTR = [
    ['.hero-copy h1', 'Web3 ekonomilerinin <span class="g">geleceğini inşa ediyoruz</span>.'],
    ['.livepill', '<i></i> Canlı piyasa'],
    ['.cards .card:first-child h3', '$SWEEP Token Satışı <span class="tag soon">Faz 3 · Yakında</span>'],
    ['.airdrop-card h3', 'Airdrop <span class="tag soon">Çok yakında</span>'],
    ['.airdrop-card .lead', '<b style="color:var(--ink)">Sweepbird</b> oyna, görevleri tamamla, XP kazan, liderlik tablosunda yüksel ve özel airdrop ödülleriyle nihai <b style="color:var(--gold)">$SWEEP</b> tahsisatını artır.']
  ];
  function t(key){ return (curLang==='tr' && TR[key]!==undefined) ? TR[key] : key; }
  function applyLang(lang){
    document.querySelectorAll('h1,h2,h3,h4,h5,p,span,a,button,li,label,div').forEach(function(el){
      if(el.children.length) return;
      var en = el.getAttribute('data-en');
      if(en===null){
        var cur = el.textContent.trim();
        if(TR[cur]===undefined) return;
        el.setAttribute('data-en', el.textContent); en = el.textContent;
      }
      var k = en.trim();
      if(TR[k]===undefined) return;
      el.textContent = (lang==='tr') ? TR[k] : en;
    });
    document.querySelectorAll('input[placeholder]').forEach(function(el){
      var en = el.getAttribute('data-enph');
      if(en===null){ if(PH[el.placeholder]===undefined) return; el.setAttribute('data-enph', el.placeholder); en = el.placeholder; }
      el.placeholder = (lang==='tr' && PH[en]) ? PH[en] : en;
    });
    HTMLTR.forEach(function(pair){
      var el = document.querySelector(pair[0]); if(!el) return;
      if(el.getAttribute('data-enhtml')===null) el.setAttribute('data-enhtml', el.innerHTML);
      el.innerHTML = (lang==='tr') ? pair[1] : el.getAttribute('data-enhtml');
    });
    // modal two-line links
    var mrows = document.querySelectorAll('.modal .mrow');
    if(mrows.length>=2){
      [["Hesabın yok mu? ", '<a href="#">Kayıt ol</a>'], ["Şifreni mi unuttun? ", '<a href="#"><b>Şifremi Unuttum</b></a>']].forEach(function(trp, i){
        var el = mrows[i]; if(!el) return;
        if(el.getAttribute('data-enhtml')===null) el.setAttribute('data-enhtml', el.innerHTML);
        el.innerHTML = (lang==='tr') ? (trp[0]+trp[1]) : el.getAttribute('data-enhtml');
      });
    }
    curLang = lang;
    document.documentElement.lang = lang;
    var lbl = document.getElementById('langLbl'); if(lbl) lbl.textContent = (lang==='tr') ? 'EN' : 'TR';
    if(typeof modal !== 'undefined' && modal && !modal.hidden) setAuthMode(lastMode);
  }
  var langBtn = document.getElementById('langBtn');
  if(langBtn){ langBtn.addEventListener('click', function(){ applyLang(curLang==='en' ? 'tr' : 'en'); }); }

  // ---- Toast notifications ----
  window.toast = function(msg, type){
    var w = document.getElementById('toastWrap');
    if(!w){ w = document.createElement('div'); w.id='toastWrap'; w.className='toast-wrap'; document.body.appendChild(w); }
    var e = document.createElement('div'); e.className = 'toast ' + (type || 'info');
    var ic = type==='success' ? '✓' : (type==='error' ? '⚠' : 'ℹ');
    e.innerHTML = '<span class="ti"></span><span class="tm"></span>';
    e.querySelector('.ti').textContent = ic; e.querySelector('.tm').textContent = msg;
    w.appendChild(e);
    requestAnimationFrame(function(){ e.classList.add('show'); });
    setTimeout(function(){ e.classList.remove('show'); setTimeout(function(){ e.remove(); }, 280); }, 3600);
  };
  window.__t = t; // expose translator for page scripts

  // ---- Auth: SSO + wallet feedback + form validation (demo) ----
  if(modal){
    var ssoBtns = modal.querySelectorAll('.sso');
    if(ssoBtns[0]) ssoBtns[0].addEventListener('click', function(){ toast(t('Redirecting to Google…'), 'info'); });
    if(ssoBtns[1]) ssoBtns[1].addEventListener('click', function(){ toast(t('Redirecting to X…'), 'info'); });
    modal.querySelectorAll('.wtile').forEach(function(w){
      w.addEventListener('click', function(){ toast('Opening ' + (w.getAttribute('title') || 'wallet') + '…', 'info'); });
    });
    var email = modal.querySelector('input[type=email]');
    var pass = modal.querySelector('#pwInput');
    var signin = modal.querySelector('.signin');
    function mkErr(field){ var e = field.querySelector('.ferr'); if(!e){ e = document.createElement('div'); e.className='ferr'; field.appendChild(e); } return e; }
    function clearErr(field){ var e = field.querySelector('.ferr'); if(e) e.textContent=''; field.classList.remove('bad'); }
    if(signin && email && pass){
      signin.addEventListener('click', function(){
        var ef = email.closest('.field'), pf = pass.closest('.field'), ok = true;
        clearErr(ef); clearErr(pf);
        if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())){ mkErr(ef).textContent = t('Please enter a valid email address.'); ef.classList.add('bad'); ok = false; }
        if(pass.value.length < 6){ mkErr(pf).textContent = t('Password must be at least 6 characters.'); pf.classList.add('bad'); ok = false; }
        if(!ok){ toast(t('Please fix the errors in the form.'), 'error'); return; }
        toast(t('Welcome back! Signing you in…'), 'success');
      });
      [email, pass].forEach(function(inp){ inp.addEventListener('input', function(){ clearErr(inp.closest('.field')); }); });
    }
  }

  // ---- Consent / risk banner ----
  (function(){
    var seen = false; try { seen = sessionStorage.getItem('sweep_consent')==='1'; } catch(e){}
    if(seen) return;
    var b = document.createElement('div'); b.className = 'consent'; b.id = 'consentBar';
    b.innerHTML = '<div class="consent-in"><span class="cwarn">⚠</span>'
      + '<p>Sweep operates without centralized custody or financial guarantees. Access may be restricted in some jurisdictions. By continuing you accept our Terms &amp; Privacy.</p>'
      + '<div class="consent-actions"><a class="btn-login" href="#">Learn more</a><button class="btn-signup" id="consentOk">Accept</button></div></div>';
    document.body.appendChild(b);
    requestAnimationFrame(function(){ b.classList.add('show'); });
    document.getElementById('consentOk').addEventListener('click', function(){
      b.classList.remove('show'); setTimeout(function(){ b.remove(); }, 320);
      try { sessionStorage.setItem('sweep_consent','1'); } catch(e){}
    });
  })();

  // ===== Shared components (How it works, mobile menu, search, chat, nav) =====
  Object.assign(TR, {
    "1. Get Started with Sweep in Seconds":"1. Saniyeler içinde Sweep'e başla",
    "Sign up quickly using your Gmail, connect your wallet, or create your account in just a few steps. Everything is designed to be simple and instant so you can start using Sweep without any delays.":"Gmail'inle hızlıca kaydol, cüzdanını bağla ya da birkaç adımda hesabını oluştur. Her şey basit ve anlık olacak şekilde tasarlandı; gecikme yaşamadan Sweep'i kullanmaya başlarsın.",
    "2. Fund Your Balance":"2. Bakiyeni Yükle",
    "Choose from multiple payment methods like cryptocurrency or credit card to fund your balance and start using it instantly.":"Kripto para veya kredi kartı gibi birçok ödeme yönteminden birini seçerek bakiyeni yükle ve anında kullanmaya başla.",
    "3. Play on Your Terms":"3. Kendi Kurallarınla Oyna",
    "Join games, make your moves, and play the way you want. Everything is designed to give you full control from start to finish.":"Oyunlara katıl, hamleni yap ve istediğin gibi oyna. Her şey, baştan sona kontrolün sende olması için tasarlandı.",
    "Back":"Geri", "Next":"İleri", "Get Started":"Hemen Başla",
    "Sign in to play":"Oynamak için giriş yap", "No results for":"Sonuç yok:", "Opening":"Açılıyor:",
    "Live Chat":"Canlı Sohbet", "Send":"Gönder", "Home":"Ana Sayfa", "Games":"Oyunlar",
    "Thanks! Our team will reply shortly. Meanwhile, check “How it works”.":"Teşekkürler! Ekibimiz kısa süre içinde yanıtlayacak. Bu arada “Nasıl çalışır” bölümüne göz at."
  });
  var GAMES = (typeof games !== 'undefined') ? games : ["Market","Sport","Trade","Sweepstake","Cases","Upgrade","Changer","Click","Boomb","Booster","Plincoin","Flip","Tower","Fighter","Racing","Card","Crash"];

  // ---- How it works (3-step tour) ----
  var HOW = [
    ["1. Get Started with Sweep in Seconds","Sign up quickly using your Gmail, connect your wallet, or create your account in just a few steps. Everything is designed to be simple and instant so you can start using Sweep without any delays.","https://cdn.sweep.finance/web/images/modals/How-work_Modal.webp"],
    ["2. Fund Your Balance","Choose from multiple payment methods like cryptocurrency or credit card to fund your balance and start using it instantly.","https://cdn.sweep.finance/web/images/modals/How-work_Modal-1.webp"],
    ["3. Play on Your Terms","Join games, make your moves, and play the way you want. Everything is designed to give you full control from start to finish.","https://cdn.sweep.finance/web/images/modals/How-work_Modal-2.webp"]
  ];
  (function(){
    var ov = document.createElement('div'); ov.className = 'overlay'; ov.id = 'howModal'; ov.hidden = true;
    ov.innerHTML = '<div class="modal how"><button class="modal-close" id="howClose" aria-label="Close">✕</button>'
      + '<div class="how-img"><img id="howImg" alt=""></div>'
      + '<h2 class="how-title" id="howTitle"></h2><p class="how-text" id="howText"></p>'
      + '<button class="how-next" id="howNext"></button></div>';
    document.body.appendChild(ov);
    var idx = 0;
    function render(){
      var s = HOW[idx];
      ov.querySelector('#howImg').src = s[2];
      ov.querySelector('#howTitle').textContent = t(s[0]);
      ov.querySelector('#howText').textContent = t(s[1]);
      ov.querySelector('#howNext').innerHTML = (idx === HOW.length - 1 ? t('Get Started') : t('Next')) + ' <span>→</span>';
    }
    function open(){ idx = 0; render(); ov.hidden = false; document.body.classList.add('modal-open'); }
    function close(){ ov.hidden = true; document.body.classList.remove('modal-open'); }
    ov.querySelector('#howClose').addEventListener('click', close);
    ov.addEventListener('click', function(e){ if(e.target === ov) close(); });
    ov.querySelector('#howNext').addEventListener('click', function(){ if(idx < HOW.length - 1){ idx++; render(); } else { close(); if(typeof openAuth==='function') openAuth('signup'); } });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape' && !ov.hidden) close(); });
    window.__openHow = open;
    document.querySelectorAll('.howit').forEach(function(l){ l.addEventListener('click', function(e){ e.preventDefault(); open(); }); });
  })();

  // ---- Game nav → sign-in prompt ----
  document.querySelectorAll('.gamenav .pill:not(.perp-pill)').forEach(function(p){
    p.addEventListener('click', function(e){ e.preventDefault(); location.href = 'game.html?g=' + encodeURIComponent(p.textContent.trim().toLowerCase()); });
  });

  // ---- Mobile menu ----
  (function(){
    var actions = document.querySelector('.top-actions'); if(!actions) return;
    var btn = document.createElement('button'); btn.className = 'burger'; btn.id = 'burger'; btn.setAttribute('aria-label','Menu'); btn.innerHTML = '☰';
    actions.appendChild(btn);
    var drawer = document.createElement('div'); drawer.className = 'drawer'; drawer.id = 'drawer';
    var links = '<a href="index.html" data-en="Home">Home</a><a href="airdrop.html">Airdrop</a><a class="perp-link" target="_blank" rel="noopener">⚡ Sweep Perp</a><a href="#" class="howit" data-en="How it works?">How it works?</a><div class="drawer-h" data-en="Games">Games</div>';
    GAMES.forEach(function(g){ links += '<a href="#" class="dg">' + g + '</a>'; });
    drawer.innerHTML = '<div class="drawer-in">' + links + '</div>';
    document.body.appendChild(drawer);
    btn.addEventListener('click', function(){ drawer.classList.toggle('open'); });
    drawer.addEventListener('click', function(e){ if(e.target === drawer) drawer.classList.remove('open'); });
    drawer.querySelectorAll('.dg').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); location.href = 'game.html?g=' + encodeURIComponent(a.textContent.trim().toLowerCase()); }); });
    drawer.querySelectorAll('.howit').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); drawer.classList.remove('open'); if(window.__openHow) window.__openHow(); }); });
  })();

  // ---- Search dropdown ----
  (function(){
    var input = document.querySelector('.search input'); if(!input) return;
    var box = document.createElement('div'); box.className = 'search-results'; box.hidden = true;
    input.parentElement.appendChild(box);
    var items = GAMES.concat(["Airdrop","Token Sale","What is SWEEP?","How it works?","Leaderboard","Sweepbird","Bird Tiers"]);
    function render(){
      var q = input.value.trim().toLowerCase();
      if(!q){ box.hidden = true; return; }
      var hits = items.filter(function(x){ return x.toLowerCase().indexOf(q) > -1; });
      box.innerHTML = '';
      if(!hits.length){ box.innerHTML = '<div class="sr-empty">' + t('No results for') + ' "' + input.value + '"</div>'; box.hidden = false; return; }
      hits.slice(0,7).forEach(function(x){
        var a = document.createElement('a'); a.className = 'sr-item'; a.textContent = x;
        a.addEventListener('mousedown', function(ev){ ev.preventDefault();
          box.hidden = true; input.value = '';
          if(GAMES.indexOf(x) > -1){ location.href = 'game.html?g=' + encodeURIComponent(x.toLowerCase()); }
          else if(x === 'Airdrop' || x === 'Sweepbird' || x === 'Leaderboard' || x === 'Bird Tiers'){ location.href = 'airdrop.html'; }
          else if(x === 'How it works?'){ if(window.__openHow) window.__openHow(); }
          else { toast(t('Opening') + ' ' + x + '…', 'info'); }
        });
        box.appendChild(a);
      });
      box.hidden = false;
    }
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('blur', function(){ setTimeout(function(){ box.hidden = true; }, 160); });
  })();

  // ---- Live chat widget ----
  (function(){
    var bubble = document.createElement('button'); bubble.className = 'chat-bubble'; bubble.id = 'chatBubble'; bubble.setAttribute('aria-label','Live chat');
    bubble.innerHTML = '<span class="cb-ic">💬</span><span class="cb-badge">146</span>';
    document.body.appendChild(bubble);
    var panel = document.createElement('div'); panel.className = 'chat-panel'; panel.id = 'chatPanel'; panel.hidden = true;
    panel.innerHTML = '<div class="cp-head"><span><i class="cp-dot"></i> <b data-en="Live Chat">Live Chat</b></span><button id="chatClose" aria-label="Close">✕</button></div>'
      + '<div class="cp-body" id="chatBody">'
      + '<div class="cmsg"><b>SweepBot</b> 👋 Welcome to Sweep! How can we help you today?</div>'
      + '<div class="cmsg"><b>SweepBot</b> Try the Airdrop to earn XP, or ask us anything.</div>'
      + '</div>'
      + '<form class="cp-foot" id="chatForm"><input id="chatInput" placeholder="Message…" autocomplete="off"><button type="submit" class="btn-signup" data-en="Send">Send</button></form>';
    document.body.appendChild(panel);
    bubble.addEventListener('click', function(){ panel.hidden = !panel.hidden; if(!panel.hidden){ panel.querySelector('#chatInput').focus(); } });
    panel.querySelector('#chatClose').addEventListener('click', function(){ panel.hidden = true; });
    panel.querySelector('#chatForm').addEventListener('submit', function(e){
      e.preventDefault(); var inp = panel.querySelector('#chatInput'); var v = inp.value.trim(); if(!v) return;
      var body = panel.querySelector('#chatBody');
      var m = document.createElement('div'); m.className = 'cmsg me'; m.textContent = v; body.appendChild(m); inp.value = ''; body.scrollTop = body.scrollHeight;
      setTimeout(function(){ var r = document.createElement('div'); r.className = 'cmsg'; r.innerHTML = '<b>SweepBot</b> ' + t('Thanks! Our team will reply shortly. Meanwhile, check “How it works”.'); body.appendChild(r); body.scrollTop = body.scrollHeight; }, 900);
    });
  })();

  // ---- Wire footer links + full disclaimer ----
  var footMap = {"Privacy Policy":"privacy.html","Terms of Use":"terms.html","Help Center":"help.html","Docs":"docs.html","What is SWEEP?":"index.html#whatis","Token Sale":"index.html#economy","Airdrop":"airdrop.html"};
  document.querySelectorAll('footer a.fl').forEach(function(a){ var h = footMap[a.textContent.trim()]; if(h) a.setAttribute('href', h); });
  (function(){
    var disc = document.querySelector('.disclaimer'); if(!disc) return;
    var en = "Sweep is a global Web3 platform operating without centralized custody or financial guarantees. Access may be restricted in some jurisdictions. Users are responsible for complying with local laws. Participation involves risk, and Sweep does not provide financial, investment, or legal advice. See our Terms of Service & Privacy Policy.";
    TR[en] = "Sweep, merkezi saklama veya finansal garanti olmadan çalışan küresel bir Web3 platformudur. Erişim bazı ülkelerde kısıtlı olabilir. Kullanıcılar yerel yasalara uymaktan sorumludur. Katılım risk içerir ve Sweep finansal, yatırım veya hukuki tavsiye vermez. Hizmet Şartları ve Gizlilik Politikamıza bakın.";
    disc.removeAttribute('data-i18n'); disc.textContent = en;
  })();

  // ---- Sweep Perp: links + mini chart ----
  (function(){
    // Sweep Perp (KAAN PLATFORM TRADE) app URL. On localhost/LAN it targets :3300;
    // for production, set PERP_DEPLOYED to your deployed perp URL.
    var PERP_DEPLOYED = 'https://sweep-perp.onrender.com/';
    var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || /^192\.168\./.test(location.hostname) || /^10\./.test(location.hostname);
    var PERP = isLocal ? (location.protocol + '//' + location.hostname + ':3300/') : PERP_DEPLOYED;
    var pb = document.getElementById('perpBanner'); if(pb) pb.href = PERP;
    document.querySelectorAll('.perp-pill, .perp-link').forEach(function(a){ a.href = PERP; a.target = '_blank'; a.rel = 'noopener'; });
    // add to footer Platform column
    document.querySelectorAll('footer .foot-grid > div').forEach(function(col){
      var h = col.querySelector('h5');
      if(h && /Platform/i.test(h.textContent)){
        var a = document.createElement('a'); a.className = 'fl'; a.textContent = '⚡ Sweep Perp';
        a.href = PERP; a.target = '_blank'; a.rel = 'noopener'; col.appendChild(a);
      }
    });
    // mini area chart on banner
    var cv = document.getElementById('perpChart');
    if(cv){ var ctx = cv.getContext('2d'), W = cv.width, H = cv.height, pts = [], v = 60;
      for(var i=0;i<48;i++){ v += (Math.random()-0.45)*6; pts.push(v); }
      var mx = Math.max.apply(null, pts), mn = Math.min.apply(null, pts);
      function Y(p){ return 12 + (mx-p)/((mx-mn)||1)*(H-24); }
      var g = ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'rgba(124,92,255,.5)'); g.addColorStop(1,'rgba(124,92,255,0)');
      ctx.beginPath(); ctx.moveTo(0,H); pts.forEach(function(p,i){ ctx.lineTo(i/(pts.length-1)*W, Y(p)); }); ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); pts.forEach(function(p,i){ var x=i/(pts.length-1)*W, y=Y(p); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.strokeStyle = '#b9a3ff'; ctx.lineWidth = 2; ctx.stroke();
      var last = pts[pts.length-1]; ctx.fillStyle = '#F5B63D'; ctx.beginPath(); ctx.arc(W-2, Y(last), 4, 0, 7); ctx.fill();
    }
  })();
})();
