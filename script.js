(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Theme (remembered, safe if storage blocked) ---------- */
  var root = document.documentElement, toggle = $('#themeToggle');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    toggle.textContent = t === 'dark' ? '☀️' : '🌙';
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '#070a12' : '#f5f7fb');
  }
  var saved = null;
  try { saved = localStorage.getItem('gn-theme'); } catch (e) {}
  setTheme(saved || 'dark');
  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('gn-theme', next); } catch (e) {}
  });

  /* ---------- Loader ---------- */
  var loader = $('#loader'), bar = $('#loaderBar');
  document.body.classList.add('loading');
  var p = 0, tick = setInterval(function () {
    p = Math.min(p + Math.random() * 18 + 6, 100);
    bar.style.width = p + '%';
    if (p >= 100) { clearInterval(tick); setTimeout(finishLoad, 250); }
  }, 120);
  var finished = false;
  function finishLoad() {
    if (finished) return; finished = true;
    loader.classList.add('done');
    document.body.classList.remove('loading');
    startTyping();
    revealCheck();
  }
  setTimeout(finishLoad, 3000); // safety

  /* ---------- Typewriter ---------- */
  var words = ['build websites', 'design brands', 'automate work', 'learn security', 'create AI content'];
  var typed = $('#typed'), wi = 0, ci = 0, del = false, typingStarted = false;
  function startTyping() { if (typingStarted) return; typingStarted = true; type(); }
  function type() {
    var w = words[wi];
    typed.textContent = w.slice(0, ci);
    if (!del && ci < w.length) { ci++; setTimeout(type, 85); }
    else if (!del) { del = true; setTimeout(type, 1500); }
    else if (ci > 0) { ci--; setTimeout(type, 45); }
    else { del = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
  }

  /* ---------- Nav: scroll state, progress, active link, mobile menu ---------- */
  var nav = $('#nav'), prog = $('#scrollProgress'), links = $$('.nav-links a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    nav.classList.toggle('scrolled', y > 30);
    var cur = 0;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = $('#burger'), navLinks = $('#navLinks');
  burger.addEventListener('click', function () { navLinks.classList.toggle('open'); });
  links.forEach(function (a) { a.addEventListener('click', function () { navLinks.classList.remove('open'); }); });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal');
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); if (e.target.classList.contains('stat')) countUp(e.target.querySelector('b')); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  revealEls.forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + 'ms';
    if (io) io.observe(el); else { el.classList.add('in'); if (el.classList.contains('stat')) countUp(el.querySelector('b')); }
  });
  function revealCheck() { /* observer handles initial viewport */ }

  /* ---------- Counters ---------- */
  function countUp(el) {
    if (!el || el.dataset.done) return; el.dataset.done = 1;
    var target = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1), eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased) + suf;
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Cursor glow ---------- */
  var glow = $('#cursorGlow');
  window.addEventListener('mousemove', function (e) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }, { passive: true });

  /* ---------- Character: head + eyes follow mouse, parallax ---------- */
  var tilt = $('#tilt'), head = $('#head'), scene = $('#scene'), pupils = $$('.pupil');
  if (tilt && window.matchMedia('(hover:hover)').matches) {
    var hero = $('#home');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = 'perspective(1000px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 6) + 'deg)';
      if (head) head.style.transform = 'rotate(' + (x * 14) + 'deg) translate(' + (x * 6) + 'px,' + (y * 3) + 'px)';
      if (scene) scene.style.transform = 'translate(' + (-x * 10) + 'px,' + (-y * 4) + 'px)';
      pupils.forEach(function (pp) { pp.style.transform = 'translate(' + (x * 7) + 'px,' + (y * 5) + 'px)'; });
    });
    hero.addEventListener('mouseleave', function () {
      tilt.style.transform = '';
      if (head) head.style.transform = '';
      if (scene) scene.style.transform = '';
      pupils.forEach(function (pp) { pp.style.transform = ''; });
    });
  }

  /* ---------- Skill card tilt ---------- */
  if (window.matchMedia('(hover:hover)').matches) {
    $$('.tilt-card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(700px) rotateY(' + (x * 9) + 'deg) rotateX(' + (-y * 9) + 'deg) translateY(-4px)';
      });
      c.addEventListener('mouseleave', function () { c.style.transform = ''; });
    });
  }

  /* ---------- Services: floating preview follows mouse ---------- */
  var fp = $('#floatPreview'), fe = $('#floatEmoji'), tx = 0, ty = 0, cx = 0, cy = 0, running = false;
  function loop() {
    cx += (tx - cx) * 0.15; cy += (ty - cy) * 0.15;
    fp.style.left = cx + 'px'; fp.style.top = cy + 'px';
    if (running) requestAnimationFrame(loop);
  }
  $$('#services-list li').forEach(function (li) {
    li.addEventListener('mouseenter', function (e) {
      fe.textContent = li.dataset.preview;
      var h = +li.dataset.hue;
      fp.style.background = 'linear-gradient(135deg,hsl(' + h + ' 70% 24%),hsl(' + (h + 60) + ' 70% 12%))';
      fp.style.transform = 'translate(-50%,-50%) scale(1) rotate(-4deg)';
      fp.classList.add('show'); tx = cx = e.clientX + 150; ty = cy = e.clientY;
      if (!running) { running = true; loop(); }
    });
    li.addEventListener('mousemove', function (e) { tx = e.clientX + 150; ty = e.clientY; });
    li.addEventListener('mouseleave', function () {
      fp.classList.remove('show'); fp.style.transform = 'translate(-50%,-50%) scale(.6)'; running = false;
    });
    li.addEventListener('click', function () { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); });
  });

  /* ---------- Contact form -> WhatsApp ---------- */
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#cName').value.trim(), s = $('#cService').value.trim(), m = $('#cMsg').value.trim();
    var text = 'Hi Ghulam, I am ' + n + '. I need: ' + s + (m ? '\n' + m : '');
    window.open('https://wa.me/923414046318?text=' + encodeURIComponent(text), '_blank');
  });

  $('#year').textContent = new Date().getFullYear();
})();
