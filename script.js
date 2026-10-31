(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fine = window.matchMedia('(hover:hover)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* =============== Falling petals (decorative, CSS-animated) =============== */
  function petals(host, n) {
    if (!host || reduce) return;
    var box = document.createElement('div'); box.className = 'petals'; box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i'); p.className = 'petal';
      var s = 0.7 + Math.random() * 0.9;
      p.style.left = (Math.random() * 100).toFixed(1) + '%';
      p.style.width = (14 * s).toFixed(1) + 'px'; p.style.height = (18 * s).toFixed(1) + 'px';
      p.style.animationDuration = (11 + Math.random() * 12).toFixed(1) + 's';
      p.style.animationDelay = '-' + (Math.random() * 20).toFixed(1) + 's';
      box.appendChild(p);
    }
    host.insertBefore(box, host.firstChild);
  }
  petals($('#home'), 12); petals($('#contact'), 10);

  /* =============== Loader: 0% -> ring -> "hello" writes -> slide up =============== */
  var loader = $('#loader'), countEl = $('#loaderCount'), pct = 0, finished = false, introPulse = 0;
  var tick = setInterval(function () {
    pct = Math.min(pct + Math.random() * 8 + 3, 100);
    countEl.textContent = Math.floor(pct) + '%';
    if (pct >= 100) { clearInterval(tick); sayHello(); }
  }, 90);
  function sayHello() { loader.classList.add('is-hello'); setTimeout(finish, 2100); }
  function finish() {
    if (finished) return; finished = true;
    loader.classList.add('out');
    document.body.classList.remove('loading');
    setTimeout(function () { loader.style.display = 'none'; }, 1200);
    introPulse = 80;
  }
  setTimeout(function () { clearInterval(tick); if (!finished) { loader.classList.add('is-hello'); setTimeout(finish, 800); } }, 7000);

  /* =============== Cursor =============== */
  var cur = $('#cursor'), curText = $('#cursorText');
  if (fine) {
    window.addEventListener('mousemove', function (e) { cur.classList.add('on'); cur.style.left = e.clientX + 'px'; cur.style.top = e.clientY + 'px'; }, { passive: true });
    $$('a,button,input,textarea,.exp-list li,.pb,.badge').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('big'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('big'); });
    });
    $$('.pc-media').forEach(function (el) {
      el.addEventListener('mouseenter', function () { curText.textContent = 'VIEW'; cur.classList.add('text'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('text'); });
    });
  }

  /* =============== Hero title: tall + liquid distortion =============== */
  var title = $('#heroTitle'), wrap = $('#titleWrap'), disp = $('#disp'), turb = $('#turb');
  var LH = 0.86; // matches .hero-title line-height
  function fitTitle() {
    var vw = window.innerWidth, vh = window.innerHeight, wide = vw > 960;
    title.style.transform = 'none'; title.style.fontSize = '100px';
    var w100 = title.offsetWidth;
    var fs = 100 * (vw * (wide ? 0.58 : 0.88)) / w100;
    title.style.fontSize = fs.toFixed(1) + 'px';
    var h0 = fs * LH, H = vh * (wide ? 0.5 : 0.4);
    var sy = clamp(H / h0, 1, 3.4);
    title.style.transform = 'scaleY(' + sy.toFixed(3) + ')';
    wrap.style.height = (h0 * sy).toFixed(0) + 'px';
  }
  window.addEventListener('resize', fitTitle);
  window.addEventListener('load', fitTitle);
  fitTitle();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitTitle);

  var hovering = false, curScale = 0, phase = 0;
  title.addEventListener('mouseenter', function () { hovering = true; });
  title.addEventListener('mouseleave', function () { hovering = false; });
  title.addEventListener('touchstart', function () { hovering = true; setTimeout(function () { hovering = false; }, 1500); }, { passive: true });
  (function loop() {
    phase += 0.012; introPulse *= 0.96;
    var target = (hovering ? 70 : 0) + introPulse;
    curScale += (target - curScale) * 0.08;
    if (curScale > 0.05 || target > 0) {
      disp.setAttribute('scale', curScale.toFixed(2));
      turb.setAttribute('baseFrequency', (0.010 + Math.sin(phase) * 0.003).toFixed(4) + ' ' + (0.022 + Math.cos(phase * 0.8) * 0.005).toFixed(4));
    }
    requestAnimationFrame(loop);
  })();

  /* =============== Menu =============== */
  var menuBtn = $('#menuBtn'), menu = $('#menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
  }
  menuBtn.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeLb(); } });

  /* =============== About: elastic gold string =============== */
  var svgStr = $('#string'), strPath = $('#stringPath');
  var mx = -999, my = -999, cy = 30, cx = 400, vy = 0, tcy = 30, tcx = 400;
  window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function stringLoop() {
    var r = svgStr.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight) {
      var midY = r.top + r.height / 2, dy = my - midY;
      if (Math.abs(dy) < 110 && mx > r.left && mx < r.right) { tcx = (mx - r.left) / r.width * 800; tcy = 30 + clamp(dy * 1.2, -46, 46); }
      else { tcy = 30; }
      vy += (tcy - cy) * 0.14; vy *= 0.8; cy += vy; cx += (tcx - cx) * 0.2;
      if (Math.abs(vy) > 0.02 || Math.abs(cy - 30) > 0.05) strPath.setAttribute('d', 'M0 30 Q' + cx.toFixed(1) + ' ' + (cy * 2 - 30).toFixed(1) + ' 800 30');
    }
    requestAnimationFrame(stringLoop);
  })();

  /* =============== About: scroll-scrubbed text =============== */
  var scrubGroups = [];
  function esc(s) { return String(s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  $$('.scrub').forEach(function (el) {
    var parts = el.textContent.trim().split('*'), html = '', words = [];
    parts.forEach(function (chunk, i) {
      chunk.split(/\s+/).filter(Boolean).forEach(function (w) { words.push('<span class="w' + (i % 2 ? ' g' : '') + '">' + esc(w) + '</span>'); });
    });
    el.innerHTML = words.join(' '); scrubGroups.push(el);
  });
  $$('.scrub-p').forEach(function (el) {
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' ');
    scrubGroups.push(el);
  });
  function scrubUpdate() {
    var vh = window.innerHeight;
    scrubGroups.forEach(function (el) {
      var r = el.getBoundingClientRect(), spans = el.children;
      var p = clamp((vh * 0.92 - r.top) / (vh * 0.5 + r.height * 0.6), 0, 1), n = Math.round(p * spans.length);
      for (var i = 0; i < spans.length; i++) spans[i].classList.toggle('on', i < n);
    });
  }

  /* =============== Portrait: fallback if the photo is missing (no inline handlers: CSP) =============== */
  (function photoFallback() {
    var img = $('#portrait img'); if (!img) return;
    var fail = function () { img.style.display = 'none'; img.parentNode.classList.add('nophoto'); };
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
  })();

  /* =============== Portrait parallax =============== */
  var portrait = $('#portrait'), pImg = portrait && $('img', portrait);
  function portraitUpdate() {
    if (!pImg) return;
    var r = portrait.getBoundingClientRect(), vh = window.innerHeight;
    var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
    pImg.style.transform = 'scale(' + (1.5 - 0.5 * p).toFixed(3) + ') translateY(' + ((0.5 - p) * -34).toFixed(1) + 'px)';
  }

  /* =============== Expertise: floating preview card =============== */
  var fc = $('#floatCard'), fe = $('#floatEmoji'), tx = 0, ty = 0, cx2 = 0, cy2 = 0, running = false;
  function floatLoop() { cx2 += (tx - cx2) * 0.14; cy2 += (ty - cy2) * 0.14; fc.style.left = cx2 + 'px'; fc.style.top = cy2 + 'px'; if (running) requestAnimationFrame(floatLoop); }
  if (fine) $$('#expList li').forEach(function (li) {
    li.addEventListener('mouseenter', function (e) {
      fe.textContent = li.dataset.emoji || '✨';
      var h = +li.dataset.hue || 40;
      fc.style.background = 'linear-gradient(135deg,hsl(' + h + ' 60% 30%),hsl(' + (h + 50) + ' 60% 12%))';
      fc.style.transform = 'translate(-50%,-50%) scale(1) rotate(-5deg)';
      fc.classList.add('show'); tx = cx2 = e.clientX + 170; ty = cy2 = e.clientY;
      if (!running) { running = true; floatLoop(); }
    });
    li.addEventListener('mousemove', function (e) { tx = e.clientX + 170; ty = e.clientY; });
    li.addEventListener('mouseleave', function () { fc.classList.remove('show'); fc.style.transform = 'translate(-50%,-50%) scale(.6)'; running = false; });
    li.addEventListener('click', function () { $('#contact').scrollIntoView({ behavior: 'smooth' }); });
  });
  $$('#expList li').forEach(function (li) { li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); $('#contact').scrollIntoView({ behavior: 'smooth' }); } }); });

  /* =============== Expertise: physics icons (gravity, collisions, drag) =============== */
  (function physics() {
    var box = $('#physics'); if (!box || reduce) return;
    var defs = [['H5', '#e879a6'], ['C3', '#8b5cf6'], ['JS', '#c79bf0'], ['Py', '#6d3fd1'], ['Ps', '#f0a9c0'], ['Ai', '#a85adf'], ['Git', '#d36fb0'], ['Xl', '#9a86e8']];
    var bodies = [], W = 0, H = 0, vis = false, drag = null, last = { x: 0, y: 0 }, mouse = { x: -999, y: -999 };
    function size() { W = box.clientWidth; H = box.clientHeight; }
    size(); window.addEventListener('resize', size);
    defs.forEach(function (d, i) {
      var el = document.createElement('div'); el.className = 'pb'; el.textContent = d[0]; el.style.background = 'radial-gradient(circle at 32% 28%,' + d[1] + ',#000 160%)';
      box.appendChild(el);
      var r = el.offsetWidth / 2 || 29;
      bodies.push({ el: el, r: r, x: 40 + Math.random() * Math.max(W - 80, 10), y: -r - i * 60, vx: (Math.random() - .5) * 3, vy: 0 });
    });
    box.addEventListener('pointermove', function (e) { var b = box.getBoundingClientRect(); mouse.x = e.clientX - b.left; mouse.y = e.clientY - b.top; if (drag) { last.x = drag.x; last.y = drag.y; drag.x = clamp(mouse.x - drag.ox, drag.r, W - drag.r); drag.y = clamp(mouse.y - drag.oy, drag.r, H - drag.r); drag.vx = drag.x - last.x; drag.vy = drag.y - last.y; } });
    box.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    bodies.forEach(function (b) {
      b.el.addEventListener('pointerdown', function (e) { var bb = box.getBoundingClientRect(); drag = b; b.ox = e.clientX - bb.left - b.x; b.oy = e.clientY - bb.top - b.y; try { b.el.setPointerCapture(e.pointerId); } catch (_) {} e.preventDefault(); });
      b.el.addEventListener('pointerup', function () { if (drag === b) { drag = null; } });
      b.el.addEventListener('pointercancel', function () { drag = null; });
    });
    function step() {
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        if (b !== drag) {
          b.vy += 0.45; b.x += b.vx; b.y += b.vy;
          var dx = b.x - mouse.x, dy = b.y - mouse.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 80 && d > 0.1) { b.vx += dx / d * 0.9; b.vy += dy / d * 0.9; }
          if (b.y + b.r > H) { b.y = H - b.r; b.vy *= -0.5; b.vx *= 0.985; if (Math.abs(b.vy) < 0.8) b.vy = 0; }
          if (b.y - b.r < -400) { b.y = -400 + b.r; b.vy = 0; }
          if (b.x - b.r < 0) { b.x = b.r; b.vx *= -0.6; }
          if (b.x + b.r > W) { b.x = W - b.r; b.vx *= -0.6; }
          b.vx *= 0.995;
        }
      }
      for (var p = 0; p < bodies.length; p++) for (var q = p + 1; q < bodies.length; q++) {
        var a = bodies[p], c = bodies[q], ddx = c.x - a.x, ddy = c.y - a.y, dist = Math.sqrt(ddx * ddx + ddy * ddy), min = a.r + c.r;
        if (dist < min && dist > 0.01) {
          var nx = ddx / dist, ny = ddy / dist, ov = (min - dist) / 2;
          if (a !== drag) { a.x -= nx * ov; a.y -= ny * ov; } if (c !== drag) { c.x += nx * ov; c.y += ny * ov; }
          var rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
          if (rv < 0) { var j = -rv * 0.8; if (a !== drag) { a.vx -= j * nx; a.vy -= j * ny; } if (c !== drag) { c.vx += j * nx; c.vy += j * ny; } }
        }
      }
      bodies.forEach(function (b) { b.el.style.transform = 'translate(' + (b.x - b.r).toFixed(1) + 'px,' + (b.y - b.r).toFixed(1) + 'px)'; });
    }
    function loop() { if (vis) step(); requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(box); else vis = true;
    loop();
  })();

  /* =============== Work: strips, drips, scroll-driven giant text =============== */
  var techs = ['HTML', 'CSS', 'JAVASCRIPT', 'PYTHON', 'PHOTOSHOP', 'ILLUSTRATOR', 'GITHUB', 'EXCEL'];
  $('#techTrack').innerHTML = techs.concat(techs, techs, techs).map(function (t) { return '<span>' + t + '</span>'; }).join('');
  var svcs = ['PERSONAL PORTFOLIOS', 'SHOPIFY STORES', 'BUSINESS WEBSITES', 'BRANDING & LOGOS', 'AUTOMATION', 'CYBERSECURITY', 'UI/UX'];
  var svcHtml = svcs.map(function (t) { return '<span>' + t + '</span><b>✦</b>'; }).join('');
  $('#svcTrack').innerHTML = svcHtml + svcHtml + svcHtml + svcHtml;
  setInterval(function () {
    var mid = window.innerWidth / 2, best = null, bd = 1e9;
    $$('#techTrack span').forEach(function (s) { var r = s.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < bd) { bd = d; best = s; } s.classList.remove('hot'); });
    if (best) best.classList.add('hot');
  }, 160);

  var scrollTop = $('.scroll-top'), gWrap = $('#giantWrap'), drips = $('#drips'), myWork = $('#myWork'), workSec = $('#work');
  function buildDrips() {
    drips.innerHTML = '';
    var w = gWrap.offsetWidth, h = gWrap.offsetHeight, u = w / 100, base = h * 0.80, html = '';
    [8, 20, 33, 47, 58, 70, 83, 93].forEach(function (x, i) {
      var dw = u * (1.3 + (i * 37 % 10) / 9), dh = u * (3 + (i * 53 % 10) * 0.9);
      html += '<i class="drip" style="left:' + x + '%;top:' + base + 'px;width:' + dw.toFixed(1) + 'px;height:' + dh.toFixed(1) + 'px;animation-delay:-' + (i * 0.5) + 's"></i>';
    });
    for (var k = 0; k < 22; k++) {
      var s = u * (0.35 + ((k * 29) % 10) / 7), lx = (k * 4.6 + (k % 3) * 2.2) % 100, ty = base + u * (1.5 + ((k * 17) % 13));
      html += '<i class="dot" style="left:' + lx.toFixed(1) + '%;top:' + ty.toFixed(1) + 'px;width:' + s.toFixed(1) + 'px;height:' + s.toFixed(1) + 'px"></i>';
    }
    drips.innerHTML = html;
  }
  function workUpdate() {
    var r = workSec.getBoundingClientRect(), total = workSec.offsetHeight - window.innerHeight;
    var p = clamp(-r.top / total, 0, 1), vw = window.innerWidth / 100, vh = window.innerHeight / 100;
    var t1 = clamp(p / 0.35, 0, 1), t2 = clamp((p - 0.35) / 0.5, 0, 1);
    var x = (1 - t1 * 2) * 5 * vw, y = -t2 * 36 * vh, s = (1.1 - 0.1 * t1) * (1 - 0.5 * t2);
    gWrap.style.transform = 'translate(-50%,-50%) translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    gWrap.style.opacity = clamp(1 - t2 * 1.25, 0, 1).toFixed(2);
    myWork.style.opacity = clamp((p - 0.62) / 0.22, 0, 1).toFixed(2);
    scrollTop.style.opacity = clamp(1 - t2 * 2.2, 0, 1).toFixed(2);
  }
  buildDrips(); window.addEventListener('resize', buildDrips);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(buildDrips);

  /* =============== Projects: stacking cards =============== */
  var cards = $$('.pcard');
  cards.forEach(function (c) { if (!$('.pc-media', c)) c.classList.add('nomedia'); });
  function stackUpdate() {
    var vh = window.innerHeight;
    cards.forEach(function (c, i) {
      var next = cards[i + 1]; if (!next) return;
      var nr = next.getBoundingClientRect(), stick = parseFloat(getComputedStyle(next).top) || 0, h = c.offsetHeight;
      var q = clamp(1 - (nr.top - stick) / (h * 0.95), 0, 1);
      c.style.transform = 'scale(' + (1 - 0.07 * q).toFixed(4) + ')';
      c.style.filter = 'brightness(' + (1 - 0.5 * q).toFixed(3) + ')';
    });
  }

  /* =============== Lightbox + badges =============== */
  var lb = $('#lightbox'), lbImg = $('#lbImg'), lastFocus = null;
  function openLb(src, alt) { lastFocus = document.activeElement; lbImg.src = src; lbImg.alt = alt || ''; lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbClose').focus(); }
  function closeLb() { if (lb.hidden) return; lb.hidden = true; lbImg.removeAttribute('src'); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  lb.addEventListener('click', closeLb);
  $$('.pc-badge[data-full], .screens-btn[data-full]').forEach(function (b) { b.addEventListener('click', function () { openLb(b.dataset.full, b.dataset.alt); }); });
  $$('.pcard').forEach(function (card) {
    var badge = $('.pc-badge[data-full]', card), media = $('.pc-media', card);
    if (badge && media) { media.style.cursor = 'pointer'; media.addEventListener('click', function () { badge.click(); }); }
  });
  $$('.pc-badge.talk').forEach(function (b) { b.addEventListener('click', function () { $('#contact').scrollIntoView({ behavior: 'smooth' }); }); });

  /* =============== Contact form (no network calls: opens WhatsApp with a pre-filled, sanitised message) =============== */
  function clean(s, max) { return String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = clean($('#cName').value, 60), need = clean($('#cNeed').value, 120), m = clean($('#cMsg').value, 600);
    if (!n || !need) return;
    var text = 'Hi Ghulam, I am ' + n + '. I need: ' + need + (m ? ' - ' + m : '');
    window.open('https://wa.me/923414046318?text=' + encodeURIComponent(text), '_blank', 'noopener,noreferrer');
  });
  $('#year').textContent = new Date().getFullYear();

  /* =============== One scroll handler =============== */
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { scrubUpdate(); portraitUpdate(); workUpdate(); stackUpdate(); ticking = false; }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  scrubUpdate(); portraitUpdate(); workUpdate(); stackUpdate();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onScroll);
})();
