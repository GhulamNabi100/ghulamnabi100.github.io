(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var fine = window.matchMedia('(hover:hover)').matches;

  /* ---------- Preloader: 0% -> hello -> slide up ---------- */
  var loader = $('#loader'), count = $('#loaderCount'), pct = 0, done = false;
  var t = setInterval(function () {
    pct = Math.min(pct + Math.random() * 9 + 3, 100);
    count.textContent = Math.floor(pct) + '%';
    if (pct >= 100) { clearInterval(t); loader.classList.add('hello'); setTimeout(finish, 1500); }
  }, 90);
  function finish() {
    if (done) return; done = true;
    loader.classList.add('out');
    document.body.classList.remove('loading');
    setTimeout(function () { loader.style.display = 'none'; }, 1100);
    intro();
  }
  setTimeout(function () { clearInterval(t); loader.classList.add('hello'); setTimeout(finish, 700); }, 6000); // safety

  /* ---------- Cursor ---------- */
  var cur = $('#cursor');
  if (fine) {
    window.addEventListener('mousemove', function (e) { cur.classList.add('on'); cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }, { passive: true });
    $$('a,button,.exp-list li,.proj,input,textarea,.feat-img').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('big'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('big'); });
    });
  }

  /* ---------- Fit hero title to screen width (works with any font) ---------- */
  function fitTitle() {
    var t = $('#heroTitle'); t.style.fontSize = '';
    var base = parseFloat(getComputedStyle(t).fontSize), max = window.innerWidth * 0.88, w = t.offsetWidth;
    if (w > max) t.style.fontSize = (base * max / w).toFixed(1) + 'px';
  }
  window.addEventListener('resize', fitTitle);
  fitTitle();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);
  window.addEventListener('load', fitTitle);

  /* ---------- Hero title: melting liquid distortion ---------- */
  var title = $('#heroTitle'), disp = $('#disp'), turb = $('#turb');
  var target = 0, cur_s = 0, phase = 0, introPulse = 0, hovering = false;
  function intro() { introPulse = 70; }
  title.addEventListener('mouseenter', function () { hovering = true; });
  title.addEventListener('mouseleave', function () { hovering = false; });
  title.addEventListener('touchstart', function () { hovering = true; setTimeout(function () { hovering = false; }, 1400); }, { passive: true });
  (function loop() {
    phase += 0.012;
    introPulse *= 0.96;
    target = (hovering ? 62 : 0) + introPulse;
    cur_s += (target - cur_s) * 0.08;
    disp.setAttribute('scale', cur_s.toFixed(2));
    var fx = 0.010 + Math.sin(phase) * 0.003, fy = 0.022 + Math.cos(phase * 0.8) * 0.005;
    turb.setAttribute('baseFrequency', fx.toFixed(4) + ' ' + fy.toFixed(4));
    requestAnimationFrame(loop);
  })();

  /* ---------- Nav / menu ---------- */
  var menuBtn = $('#menuBtn'), links = $('#navLinks');
  function setMenu(open) { links.classList.toggle('open', open); $('#nav').classList.toggle('menu-open', open); document.body.style.overflow = open ? 'hidden' : ''; }
  menuBtn.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  $$('.reveal').forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    if (io) io.observe(el); else el.classList.add('in');
  });

  /* ---------- Giant WORK text driven by scroll ---------- */
  var sec = $('#work'), giant = $('#giantWork');
  function onScroll() {
    var r = sec.getBoundingClientRect(), total = sec.offsetHeight - window.innerHeight;
    var p = Math.max(0, Math.min(1, -r.top / total));
    var gw = giant.scrollWidth, vw = window.innerWidth;
    var startX = vw * 0.55, endX = -(gw - vw * 0.25);
    giant.style.transform = 'translateX(' + (startX + (endX - startX) * p).toFixed(1) + 'px)';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll);

  /* ---------- Floating preview card (expertise + projects) ---------- */
  var fc = $('#floatCard'), fe = $('#floatEmoji'), tx = 0, ty = 0, cx = 0, cy = 0, run = false;
  function fl() { cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; fc.style.left = cx + 'px'; fc.style.top = cy + 'px'; if (run) requestAnimationFrame(fl); }
  function bindPreview(li) {
    if (!fine) return;
    li.addEventListener('mouseenter', function (e) {
      fe.textContent = li.dataset.emoji || '✨';
      var h = +li.dataset.hue || 40;
      fc.style.background = 'linear-gradient(135deg,hsl(' + h + ' 60% 30%),hsl(' + (h + 50) + ' 60% 12%))';
      fc.style.transform = 'translate(-50%,-50%) scale(1) rotate(-5deg)';
      fc.classList.add('show'); tx = cx = e.clientX + 170; ty = cy = e.clientY;
      if (!run) { run = true; fl(); }
    });
    li.addEventListener('mousemove', function (e) { tx = e.clientX + 170; ty = e.clientY; });
    li.addEventListener('mouseleave', function () { fc.classList.remove('show'); fc.style.transform = 'translate(-50%,-50%) scale(.6)'; run = false; });
  }
  $$('#expList li, #projList .proj').forEach(bindPreview);
  $$('#expList li').forEach(function (li) { li.addEventListener('click', function () { $('#contact').scrollIntoView({ behavior: 'smooth' }); }); });
  $$('#projList .proj').forEach(function (li) {
    li.addEventListener('click', function () {
      var u = li.dataset.url;
      if (u) window.open(u, '_blank', 'noopener'); else $('#contact').scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Lightbox for featured designs ---------- */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lastFocus = null;
  function openLb(src, alt) { lastFocus = document.activeElement; lbImg.src = src; lbImg.alt = alt || ''; lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
  function closeLb() { lb.hidden = true; lbImg.removeAttribute('src'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $$('.feat-img').forEach(function (b) { b.addEventListener('click', function () { openLb(b.dataset.full, b.dataset.alt); }); });
  lb.addEventListener('click', closeLb);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  /* ---------- Contact form -> WhatsApp ---------- */
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#cName').value.trim(), need = $('#cNeed').value.trim(), m = $('#cMsg').value.trim();
    var text = 'Hi Ghulam, I am ' + n + '. I need: ' + need + (m ? '\n' + m : '');
    window.open('https://wa.me/923414046318?text=' + encodeURIComponent(text), '_blank');
  });

  $('#year').textContent = new Date().getFullYear();
})();
