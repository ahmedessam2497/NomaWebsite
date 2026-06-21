/* NōMA Stays — shared chrome: header, footer, back button, heroes,
   cursor, photo lightbox, and live Cloudbeds room content (/api/rooms).
   Pages set <body data-page="..." class="brand-noma|brand-beit">. */
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

  /* ---------- Header ---------- */
  var head = document.createElement('header');
  head.className = 'site-head';
  head.innerHTML =
    '<div class="head-in">' +
      '<a class="brandmark" href="index.html">' +
        '<img src="assets/noma-wordmark-lower-maroon.png" alt="NōMA Stays" /><span class="sub">Stays</span>' +
      '</a>' +
      '<nav class="mainnav">' +
        NAV.map(function (n) {
          return '<a href="' + n.href + '" class="' + (n.brand ? 'brand-link ' : '') + (n.id === page ? 'active' : '') + '">' + n.label + '</a>';
        }).join('') +
      '</nav>' +
      '<div class="head-actions">' +
        (isHome ? '' : '<button class="back-link" type="button" aria-label="Go back">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>' +
          '<span>Back</span></button>') +
        '<a class="btn btn-accent" href="book.html">Book a stay</a>' +
      '</div>' +
    '</div>';
  document.body.insertBefore(head, document.body.firstChild);

  /* ---------- Back button: previous in-site page, else homepage ---------- */
  var backBtn = head.querySelector('.back-link');
  if (backBtn) {
    backBtn.addEventListener('click', function () {
      var sameOrigin = document.referrer && document.referrer.indexOf(location.origin) === 0;
      if (sameOrigin && history.length > 1) history.back();
      else location.href = 'index.html';
    });
  }

  /* ---------- Footer ---------- */
  var foot = document.createElement('footer');
  foot.className = 'site-foot';
  foot.innerHTML =
    '<div class="wrap-wide"><div class="foot-top">' +
      '<div>' +
        '<img class="wm" src="assets/noma-wordmark-lower-cream.png" alt="NōMA Stays" />' +
        '<p class="blurb">An all-Egyptian hospitality company. Two brands — NōMA serviced buildings and BEIT boutique stays — refurbished and run end-to-end by HAAM Management.</p>' +
        '<p class="ar">من قلب مصر · القاهرة</p>' +
      '</div>' +
      '<div class="foot-col"><h4>NōMA</h4><a href="noma.html">The brand</a><a href="noma.html#arabella">NōMA Arabella</a><a href="noma.html#district9">NōMA District 9</a><a href="noma.html#services">Serviced living</a></div>' +
      '<div class="foot-col"><h4>BEIT</h4><a href="beit.html">The brand</a><a href="beit.html#beit-hend">Beit Hend</a><a href="beit.html#experiences">Experiences</a></div>' +
      '<div class="foot-col"><h4>Company</h4><a href="about.html">Our story</a><a href="about.html#people">Our people</a><a href="partner.html">For property owners</a><a href="mailto:hello@nomastays.com">Contact</a></div>' +
    '</div>' +
    '<div class="foot-bottom"><span>© 2026 HAAM Management · Cairo, Egypt</span>' +
      '<div class="powered"><span>Booking by Cloudbeds</span><span>Payments by Stripe</span></div></div></div>';
  document.body.appendChild(foot);

  /* ---------- Rotating hero photos (assets/hero-<page>/1.jpg, 2.jpg…; also .jpeg/.png/.webp) ---------- */
  var HERO_FOLDERS = { group: 'assets/hero-main/', noma: 'assets/hero-noma/', beit: 'assets/hero-beit/' };
  var HERO_EXTS = ['jpg', 'jpeg', 'png', 'webp'];

  document.querySelectorAll('.hero-photo').forEach(function (box) {
    var folder = HERO_FOLDERS[page];
    if (!folder) { startRotation(box); return; }
    if (box.querySelector('video')) return;
    box.innerHTML = '';
    (function tryLoad(num, ext) {
      var img = document.createElement('img');
      img.alt = '';
      img.onload = function () { box.appendChild(img); tryLoad(num + 1, 0); };
      img.onerror = function () {
        if (ext + 1 < HERO_EXTS.length) tryLoad(num, ext + 1);
        else startRotation(box);
      };
      img.src = folder + num + '.' + HERO_EXTS[ext];
    })(1, 0);
  });

  function startRotation(box) {
    var imgs = box.querySelectorAll('img');
    if (!imgs.length) return;
    var i = 0;
    imgs[0].classList.add('on');
    if (imgs.length < 2) return;
    setInterval(function () {
      imgs[i].classList.remove('on');
      i = (i + 1) % imgs.length;
      imgs[i].classList.add('on');
    }, 6500);
  }

  if (window.lucide) window.lucide.createIcons();

  /* ---------- Ō cursor ---------- */
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

  /* ---------- Photo lightbox + live Cloudbeds photos ---------- */
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
      if (!list || !list.length) { openWith([], 0, title); return; }
      var results = new Array(list.length), checked = 0;
      list.forEach(function (src, k) {
        var im = new Image();
        im.onload = function () { results[k] = src; if (++checked === list.length) finalize(); };
        im.onerror = function () { results[k] = null; if (++checked === list.length) finalize(); };
        im.src = src;
      });
      function finalize() {
        var loaded = results.filter(Boolean), s = 0, seen = 0;
        for (var k = 0; k < results.length; k++) { if (k === start) { s = seen; break; } if (results[k]) seen++; }
        openWith(loaded, s, title);
      }
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

    /* ----- Live Cloudbeds content -----
       Rebuilds [data-cb-roomtypes] from the real Cloudbeds room types
       (name, description, photos) and fills [data-cb-gallery] with all
       property photos. On failure the static markup is left untouched. */
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
