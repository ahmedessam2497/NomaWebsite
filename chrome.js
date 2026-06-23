/* NōMA Stays — shared chrome: header, footer, back button, heroes,
   cursor, photo lightbox, and live Cloudbeds room content (/api/rooms). */
(function () {

  var NAV = [
    { id: 'group',   label: 'The Group',      href: 'index.html' },
    { id: 'noma',    label: 'NōMA',           href: 'noma.html', brand: true },
    { id: 'beit',    label: 'BEIT',           href: 'beit.html', brand: true },
    { id: 'about',   label: 'About',          href: 'about.html' },
    { id: 'partner', label: 'Partner With Us', href: 'partner.html' }
  ];
  var page = document.body.dataset.page || '';
  var isHome = (page === 'group');

  /* Header */
  var head = document.createElement('header');
  head.className = 'site-head';
  head.innerHTML =
    '<div class="head-in">' +
      '<a class="brandmark" href="index.html">' +
        '<img src="assets/noma-wordmark-maroon.png" alt="NōMA Stays" /><span class="sub">Stays</span>' +
      '</a>' +
      '<nav class="mainnav">' +
        NAV.map(function (n) {
          return '<a href="' + n.href + '" class="' + (n.brand ? 'brand-link ' : '') + (n.id === page ? 'active' : '') + '">' + (n.id === 'noma' ? '<img class="noma-wm" src="assets/noma-wordmark-maroon.png" alt="NōMA" />' : n.label) + '</a>';
        }).join('') +
      '</nav>' +
      '<div class="head-actions">' +
        '<button class="nav-toggle" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
        (isHome ? '' : '<button class="back-link" type="button" aria-label="Go back">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
          '<span>Back</span></button>') +
        '<cb-book-now-button property-code="q3dbO7" label="Book a stay" class-name="btn btn-accent" height="90vh" width="min(900px,95vw)"></cb-book-now-button>' +
      '</div>' +
    '</div>';
  document.body.insertBefore(head, document.body.firstChild);

  var backBtn = head.querySelector('.back-link');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      var sameOrigin = document.referrer && document.referrer.indexOf(location.origin) === 0;
      if (sameOrigin && history.length > 1) history.back();
      else location.href = 'index.html';
    });
  }

  /* Mobile hamburger menu */
  var navToggle = head.querySelector('.nav-toggle');
  if (navToggle) {
    navToggle.addEventListener('click', function () {
      var open = head.classList.toggle('nav-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    head.querySelectorAll('.mainnav a').forEach(function (a) {
      a.addEventListener('click', function () {
        head.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* Open the Cloudbeds booking overlay from anywhere (header, homepage search).
     Optional params (checkin/checkout/adults/kids) are written to the URL first,
     because the booking engine reads search params when the overlay first opens. */
  window.NOMA_BOOK = function (params) {
    try {
      if (params && Object.keys(params).length) {
        var qs = new URLSearchParams(params).toString();
        history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
      }
    } catch (e) {}
    var el = document.querySelector('cb-book-now-button');
    if (!el) { location.href = 'book.html'; return; }
    var root = el.shadowRoot || el;
    var inner = root.querySelector('button, a, [role="button"]');
    (inner || el).click();
  };

  /* Footer */
  var foot = document.createElement('footer');
  foot.className = 'site-foot';
  foot.innerHTML =
    '<div class="wrap-wide"><div class="foot-top">' +
      '<div>' +
        '<img class="wm" src="assets/noma-wordmark-lower-cream.png" alt="NōMA Stays" />' +
        '<p class="blurb">An all-Egyptian hospitality company. Two brands — NōMA serviced buildings and BEIT boutique stays — refurbished and run end-to-end by HAAM Management.</p>' +
        '<p class="ar">من قلب مصر · القاهرة</p>' +
      '</div>' +
      '<div class="foot-col"><h4><img class="noma-wm" src="assets/noma-wordmark-cream.png" alt="NōMA" /></h4><a href="noma.html">The brand</a><a href="noma.html#arabella">Arabella</a><a href="noma.html#district9">District 9</a><a href="noma.html#services">Serviced living</a></div>' +
      '<div class="foot-col"><h4>BEIT</h4><a href="beit.html">The brand</a><a href="beit.html#beit-hend">Beit Hend</a><a href="beit.html#experiences">Experiences</a></div>' +
      '<div class="foot-col"><h4>Company</h4><a href="about.html">Our story</a><a href="about.html#people">Our people</a><a href="partner.html">For property owners</a><a href="mailto:hello@nomastays.com">Contact</a></div>' +
    '</div>' +
    '<div class="foot-bottom"><span>© 2026 HAAM Management · Cairo, Egypt</span>' +
      '<div class="powered"><span>Booking by Cloudbeds</span><span>Payments by Stripe</span></div></div></div>';
  document.body.appendChild(foot);

  /* Rotating hero photos: assets/hero-<page>/1.jpg, 2.jpg … (.jpg/.jpeg/.png/.webp) */
  var HERO_FOLDERS = { group: 'assets/hero-main/', noma: 'assets/hero-noma/', beit: 'assets/hero-beit/' };
  var HERO_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

  document.querySelectorAll('.hero-photo').forEach(function (box) {
    var folder = HERO_FOLDERS[page];
    if (!folder) { startRotation(box); return; }
    if (box.querySelector('video')) return;
    box.innerHTML = '';
    var shown = 0;
    (function tryLoad(num, ext) {
      var img = document.createElement('img');
      img.alt = '';
      img.onload = function () {
        box.appendChild(img);
        shown++;
        if (shown === 1) img.classList.add('on');
        if (shown === 2) startRotation(box);
        tryLoad(num + 1, 0);
      };
      img.onerror = function () {
        if (ext + 1 < HERO_EXTS.length) tryLoad(num, ext + 1);
      };
      img.src = folder + num + '.' + HERO_EXTS[ext];
    })(1, 0);
  });

  function startRotation(box) {
    if (box.__rotating) return;
    box.__rotating = true;
    var first = box.querySelectorAll('img');
    if (first.length && !box.querySelector('img.on')) first[0].classList.add('on');
    setInterval(function () {
      var imgs = box.querySelectorAll('img');
      if (imgs.length < 2) return;
      var cur = box.querySelector('img.on');
      var idx = cur ? Array.prototype.indexOf.call(imgs, cur) : -1;
      if (cur) cur.classList.remove('on');
      imgs[(idx + 1) % imgs.length].classList.add('on');
    }, 6500);
  }

  if (window.lucide) window.lucide.createIcons();

  /* Ō cursor */
  (function () {
    if (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches) return;
    if (document.getElementById('o-cursor')) return;
    var c = document.createElement('div');
    c.id = 'o-cursor';
    c.innerHTML = '<span class="bar"></span><span class="ring"></span>';
    document.body.appendChild(c);
    document.addEventListener('mousemove', function (e) {
      document.body.classList.add('o-cursor-on');
      c.style.left = e.clientX + 'px';
      c.style.top = e.clientY + 'px';
      c.classList.toggle('lift', !!e.target.closest('a, button, select, input, textarea, [role="button"], label, .g, .rt'));
    });
    document.addEventListener('mouseleave', function () { document.body.classList.remove('o-cursor-on'); });
  })();

  /* Photo lightbox + live Cloudbeds photos */
  (function () {
    function buildList(prefix, count) {
      var out = [];
      for (var i = 1; i <= count; i++) out.push('assets/rooms/' + prefix + '-' + i + '.jpg');
      return out;
    }

    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.id = 'lb';
    lb.setAttribute('aria-hidden', 'true');
    lb.innerHTML =
      '<button class="lb-x" aria-label="Close">&times;</button>' +
      '<button class="lb-nav lb-prev" aria-label="Previous">&#8249;</button>' +
      '<button class="lb-nav lb-next" aria-label="Next">&#8250;</button>' +
      '<div class="lb-stage"><div class="lb-title"></div><img class="lb-img" alt="" />' +
      '<div class="lb-empty">Photos coming soon</div><div class="lb-count"></div></div>' +
      '<div class="lb-thumbs"></div>';
    document.body.appendChild(lb);

    var imgEl = lb.querySelector('.lb-img'), countEl = lb.querySelector('.lb-count'),
        titleEl = lb.querySelector('.lb-title'), thumbsEl = lb.querySelector('.lb-thumbs'),
        emptyEl = lb.querySelector('.lb-empty'), navPrev = lb.querySelector('.lb-prev'),
        navNext = lb.querySelector('.lb-next');
    var photos = [], idx = 0;

    function render() {
      var has = photos.length > 0;
      emptyEl.style.display = has ? 'none' : 'block';
      imgEl.style.display = has ? 'block' : 'none';
      navPrev.style.display = navNext.style.display = photos.length > 1 ? 'flex' : 'none';
      if (!has) { countEl.textContent = ''; thumbsEl.innerHTML = ''; return; }
      idx = (idx + photos.length) % photos.length;
      imgEl.src = photos[idx];
      countEl.textContent = (idx + 1) + ' / ' + photos.length;
      Array.prototype.forEach.call(thumbsEl.children, function (t, k) { t.classList.toggle('on', k === idx); });
      var on = thumbsEl.children[idx];
      if (on && on.scrollIntoView) on.scrollIntoView({ inline: 'center', block: 'nearest' });
    }
    function buildThumbs() {
      thumbsEl.innerHTML = '';
      photos.forEach(function (src, k) {
        var t = document.createElement('button');
        t.className = 'lb-thumb';
        var im = document.createElement('img');
        im.src = src; im.alt = '';
        t.appendChild(im);
        t.addEventListener('click', function () { idx = k; render(); });
        thumbsEl.appendChild(t);
      });
    }
    function go(d) { idx += d; render(); }
    function openWith(loaded, start, title) {
      photos = loaded; idx = start || 0;
      titleEl.textContent = title || '';
      buildThumbs(); render();
      lb.classList.add('on');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function open(list, start, title) {
      openWith((list || []).filter(Boolean), start || 0, title);
    }
    function close() {
      lb.classList.remove('on');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      imgEl.src = '';
    }

    lb.querySelector('.lb-x').addEventListener('click', close);
    navPrev.addEventListener('click', function () { go(-1); });
    navNext.addEventListener('click', function () { go(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    });

    function listFor(el, local) { return (el.__cbPhotos && el.__cbPhotos.length) ? el.__cbPhotos : local; }

    document.querySelectorAll('.prop-gallery[data-prefix]').forEach(function (gal) {
      var list = buildList(gal.getAttribute('data-prefix'), parseInt(gal.getAttribute('data-count'), 10) || 0);
      var title = gal.getAttribute('data-gallery-title') || '';
      Array.prototype.forEach.call(gal.querySelectorAll('.g'), function (tile) {
        var start = parseInt(tile.getAttribute('data-i'), 10) || 0;
        tile.setAttribute('role', 'button');
        tile.setAttribute('tabindex', '0');
        tile.addEventListener('click', function () { open(listFor(gal, list), start, title); });
        tile.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(listFor(gal, list), start, title); }
        });
      });
      Array.prototype.forEach.call(gal.querySelectorAll('.g img'), function (im) {
        im.addEventListener('error', function () { im.closest('.g').classList.add('empty'); });
        if (im.complete && im.naturalWidth === 0) im.closest('.g').classList.add('empty');
      });
    });

    document.querySelectorAll('.rt[data-prefix]').forEach(function (el) {
      var list = buildList(el.getAttribute('data-prefix'), parseInt(el.getAttribute('data-count'), 10) || 0);
      var title = el.getAttribute('data-title') || '';
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.addEventListener('click', function () { open(listFor(el, list), 0, title); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(listFor(el, list), 0, title); }
      });
    });

    window.NOMA_LB = { open: open };

    /* Live Cloudbeds content: rebuild [data-cb-roomtypes], fill [data-cb-gallery]. */
    if (!document.querySelector('[data-cb-roomtypes], .prop-gallery[data-cb-gallery]')) return;

    function cbCard(rm) {
      var n = (rm.photos && rm.photos.length) || 0;
      var spec = rm.maxGuests ? ('sleeps ' + rm.maxGuests) : '';
      var card = document.createElement('div');
      card.className = 'rt' + (n ? '' : ' rt-empty');
      card.innerHTML =
        '<div class="rt-top"><h4></h4></div>' +
        (spec ? '<span class="rt-spec"></span>' : '') +
        '<p></p>' +
        '<span class="rt-photos"><i data-lucide="camera"></i> <span class="rt-photos-n"></span></span>';
      card.querySelector('h4').textContent = rm.name || '';
      if (spec) card.querySelector('.rt-spec').textContent = spec;
      card.querySelector('p').textContent = rm.description || '';
      card.querySelector('.rt-photos-n').textContent = n ? (n + (n === 1 ? ' photo' : ' photos')) : 'Photos coming soon';
      if (n) {
        card.__cbPhotos = rm.photos;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', function () { open(rm.photos, 0, rm.name); });
        card.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(rm.photos, 0, rm.name); }
        });
      }
      return card;
    }

    fetch('/api/rooms', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok || !d.rooms || !d.rooms.length) return;
        document.querySelectorAll('[data-cb-roomtypes]').forEach(function (box) {
          box.innerHTML = '';
          d.rooms.forEach(function (rm) { box.appendChild(cbCard(rm)); });
        });
        var all = [];
        d.rooms.forEach(function (rm) { (rm.photos || []).forEach(function (u) { all.push(u); }); });
        if (all.length) {
          document.querySelectorAll('.prop-gallery[data-cb-gallery]').forEach(function (gal) {
            gal.__cbPhotos = all;
            Array.prototype.forEach.call(gal.querySelectorAll('.g img'), function (im, i) {
              if (all[i]) { im.src = all[i]; var g = im.closest('.g'); if (g) g.classList.remove('empty'); }
            });
          });
        }
        if (window.lucide) window.lucide.createIcons();
      })
      .catch(function () {});
  })();

})();

/* ===== Waitlist modal (not-yet-open properties) ===== */
(function () {
  var ENDPOINT = '/api/waitlist';
  var modal, form, statusEl, propInput;

  function build() {
    modal = document.createElement('div');
    modal.className = 'wl';
    modal.id = 'wl';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="wl-panel" role="dialog" aria-modal="true" aria-label="Join the waitlist">' +
        '<button class="wl-x" type="button" aria-label="Close">&times;</button>' +
        '<div class="wl-head"><span class="eyebrow">Join the waitlist</span>' +
        '<h3 class="wl-title">Be first to know</h3>' +
        '<p class="wl-sub">Leave your details and we will reach out as soon as this property opens for booking.</p></div>' +
        '<form class="wl-form">' +
          '<label>Full name<input name="name" type="text" autocomplete="name" required></label>' +
          '<label>Email<input name="email" type="email" autocomplete="email" required></label>' +
          '<label>Phone (WhatsApp)<input name="phone" type="tel" autocomplete="tel"></label>' +
          '<input name="property" type="hidden">' +
          '<button class="btn btn-accent wl-submit" type="submit">Join the waitlist</button>' +
          '<p class="wl-status" role="status"></p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(modal);
    form = modal.querySelector('.wl-form');
    statusEl = modal.querySelector('.wl-status');
    propInput = modal.querySelector('[name=property]');
    modal.querySelector('.wl-x').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('on')) close(); });
    form.addEventListener('submit', submit);
  }

  function open(property, label) {
    if (!modal) build();
    propInput.value = property || '';
    if (label) modal.querySelector('.wl-title').textContent = label;
    else modal.querySelector('.wl-title').textContent = 'Be first to know';
    statusEl.textContent = ''; statusEl.className = 'wl-status';
    form.reset(); propInput.value = property || '';
    form.querySelector('.wl-submit').disabled = false;
    modal.classList.add('on'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var first = form.querySelector('input'); if (first) first.focus();
  }
  function close() {
    modal.classList.remove('on'); modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function submit(e) {
    e.preventDefault();
    var data = {
      name: form.name.value.trim(), email: form.email.value.trim(),
      phone: form.phone.value.trim(), property: propInput.value, source: location.pathname
    };
    if (!data.email) return;
    var btn = form.querySelector('.wl-submit'); btn.disabled = true;
    statusEl.className = 'wl-status'; statusEl.textContent = 'Sending…';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        if (res && res.ok) {
          statusEl.className = 'wl-status ok';
          statusEl.textContent = 'You are on the list — we will be in touch.';
          form.reset();
        } else {
          statusEl.className = 'wl-status err';
          statusEl.textContent = (res && res.configured === false)
            ? 'Waitlist is not connected yet — please email hello@nomastays.com.'
            : 'Something went wrong. Please try again, or email hello@nomastays.com.';
          btn.disabled = false;
        }
      })
      .catch(function () {
        statusEl.className = 'wl-status err';
        statusEl.textContent = 'Network error. Please email hello@nomastays.com.';
        btn.disabled = false;
      });
  }

  window.NOMA_WAITLIST = open;
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-waitlist]');
    if (!t) return;
    e.preventDefault();
    open(t.getAttribute('data-waitlist'), t.getAttribute('data-waitlist-title') || null);
  });
})();
