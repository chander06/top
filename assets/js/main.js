/* THE PAPPAPPERO — interazioni del sito. Nessuna dipendenza esterna.
 * Tutto il contenuto proveniente dalla configurazione viene inserito come testo
 * (textContent / setAttribute), mai come HTML: nessun rischio di iniezione. */
(function () {
  'use strict';
  var C = window.PAPPAPPERO;
  if (!C) return;

  var doc = document, html = doc.documentElement, body = doc.body;
  var ROOT = body.getAttribute('data-root') || './';
  var params = new URLSearchParams(location.search);
  var DRAFT = params.has('bozza');
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  html.classList.add('js');
  if (!REDUCE) html.classList.add('motion');
  if (DRAFT) html.classList.add('is-draft');

  /* ---------- helpers ---------- */
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function h(tag, attrs) {
    var el = doc.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { append(el, k); }); return; }
    el.appendChild(kid.nodeType ? kid : doc.createTextNode(String(kid)));
  }
  var ICONS = {
    arrow: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    out: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5h8v8M15 5L5 15" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
  };
  function icon(name) { var s = doc.createElement('span'); s.className = 'ico'; s.innerHTML = ICONS[name]; return s; }
  function todo(label) { return DRAFT ? h('span', { class: 'todo', text: 'Da completare · ' + label }) : null; }
  function sedeById(id) { return C.sedi.filter(function (s) { return s.id === id; })[0]; }
  function canBook(s) { return !!s && s.service !== 'walk-in'; }
  var BOOKABLE = C.sedi.filter(canBook);
  function isUrl(u) { return typeof u === 'string' && /^https:\/\/[^\s]+$/.test(u); }

  function waNumber(sede) {
    var n = String(sede && sede.whatsapp || '').replace(/\D/g, '');
    return /^[1-9]\d{7,14}$/.test(n) ? n : '';
  }
  function waUrl(n, text) { return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : ''); }
  function telHref(sede) {
    var p = String(sede.phone || '').replace(/[^\d+]/g, '');
    return p.length >= 6 ? 'tel:' + p : '';
  }
  function fullAddress(sede, a) { return a.street + ', ' + (sede.postalCode ? sede.postalCode + ' ' : '') + sede.city; }
  function mapsUrl(sede, a) {
    if (isUrl(sede.googleMapsUrl)) return sede.googleMapsUrl;
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(sede.name + ', ' + fullAddress(sede, a || sede.addresses[0]));
  }
  function dirUrl(sede, a) {
    if (isUrl(sede.directionsUrl) && (!a || a === sede.addresses[0])) return sede.directionsUrl;
    return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(fullAddress(sede, a || sede.addresses[0]));
  }
  function link(href) { return ROOT + href; }
  function cleanPath(s) { return s.path.replace(/index\.html$/, ''); }

  /* ---------- consenso & misurazione ---------- */
  var CONSENT_KEY = 'pp-consent';
  function readConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
      return c && c.v === C.consentVersion ? c : null;
    } catch (e) { return null; }
  }
  function saveConsent(analytics) {
    var c = { v: C.consentVersion, analytics: !!analytics, ts: new Date().toISOString() };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch (e) { /* storage non disponibile */ }
    applyConsent(c);
    return c;
  }
  var analyticsLoaded = false;
  function analyticsConfigured() { return C.analytics && C.analytics.provider === 'ga4' && /^G-[A-Z0-9]+$/.test(C.analytics.ga4Id || ''); }
  function applyConsent(c) {
    if (!c || !c.analytics || !analyticsConfigured() || analyticsLoaded) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.analytics.ga4Id, { anonymize_ip: true });
    var s = doc.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.analytics.ga4Id);
    doc.head.appendChild(s);
  }
  // Eventi documentati in documentazione/ANALYTICS.md. Nessun dato personale viene inviato.
  function track(name, data) {
    var c = readConsent();
    if (analyticsLoaded && c && c.analytics && window.gtag) window.gtag('event', name, data || {});
    if (DRAFT && window.console) console.info('[track]', name, data || {});
  }

  /* ---------- orari ---------- */
  var DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  var DAY_IT = { mon: 'Lunedì', tue: 'Martedì', wed: 'Mercoledì', thu: 'Giovedì', fri: 'Venerdì', sat: 'Sabato', sun: 'Domenica' };
  var DAY_SCHEMA = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
  function hasHours(s) { return s.hours && DAYS.some(function (d) { return Array.isArray(s.hours[d]); }); }
  function romeNow() {
    var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    return { day: o.weekday.toLowerCase().slice(0, 3), min: (+o.hour % 24) * 60 + (+o.minute) };
  }
  function toMin(t) { var a = t.split(':'); return (+a[0]) * 60 + (+a[1]); }
  function openStatus(s) {
    if (!hasHours(s)) return null;
    var n = romeNow(), slots = s.hours[n.day] || [];
    for (var i = 0; i < slots.length; i++) {
      var o = toMin(slots[i][0]), c = toMin(slots[i][1]); if (c <= o) c += 1440;
      if (n.min >= o && n.min < c) return { open: true, label: 'Aperto ora · fino alle ' + slots[i][1] };
      if (n.min < o) return { open: false, label: 'Apre alle ' + slots[i][0] };
    }
    return { open: false, label: 'Chiuso ora' };
  }
  function hoursTable(s) {
    if (!hasHours(s)) return todo('orari di apertura');
    var today = romeNow().day;
    var dl = h('dl', { class: 'hours' });
    DAYS.forEach(function (d) {
      var slots = s.hours[d] || [];
      var row = h('div', { class: 'hours__row' + (d === today ? ' is-today' : '') },
        h('dt', { text: DAY_IT[d] }),
        h('dd', { text: slots.length ? slots.map(function (x) { return x[0] + '–' + x[1]; }).join('  ·  ') : 'Chiuso' }));
      dl.appendChild(row);
    });
    return dl;
  }
  function statusPill(s) {
    var st = openStatus(s);
    return st ? h('p', { class: 'status' + (st.open ? ' is-open' : '') }, h('span', { class: 'status__dot', 'aria-hidden': 'true' }), st.label) : null;
  }

  /* ---------- azioni sede ---------- */
  function btn(label, opts) {
    var el = h(opts.href ? 'a' : 'button', {
      class: 'btn ' + (opts.cls || ''),
      href: opts.href, type: opts.href ? null : 'button',
      target: opts.external ? '_blank' : null, rel: opts.external ? 'noopener noreferrer' : null,
      'data-book': opts.book, 'aria-label': opts.aria,
      onclick: opts.onclick
    }, h('span', { text: label }), icon(opts.external ? 'out' : 'arrow'));
    return el;
  }
  function sedeActions(s, variant) {
    var n = waNumber(s), tel = telHref(s), wrap = h('div', { class: 'actions actions--' + (variant || 'card') });
    if (!canBook(s)) {
      wrap.appendChild(btn('Vieni a trovarci', { cls: 'btn--primary', href: dirUrl(s), external: true, aria: 'Vieni a trovarci a ' + s.areaShort + ': indicazioni su Google Maps', onclick: function () { track('visit_click', { sede: s.id }); } }));
      wrap.appendChild(btn('Apri in Google Maps', { cls: 'btn--line', href: mapsUrl(s), external: true, aria: s.name + ' ' + s.areaShort + ' su Google Maps', onclick: function () { track('maps_click', { sede: s.id }); } }));
      if (tel) wrap.appendChild(btn('Chiama', { cls: 'btn--line', href: tel, onclick: function () { track('phone_click', { sede: s.id }); } }));
      if (isUrl(s.googleBusinessUrl)) wrap.appendChild(btn('Scheda Google', { cls: 'btn--line', href: s.googleBusinessUrl, external: true, aria: 'Profilo Google di ' + s.name + ' ' + s.areaShort, onclick: function () { track('google_business_click', { sede: s.id }); } }));
      var m0 = []; if (!tel) m0.push('telefono'); if (!isUrl(s.googleBusinessUrl)) m0.push('scheda Google'); if (!isUrl(s.googleMapsUrl)) m0.push('link Google Maps ufficiale');
      if (m0.length) append(wrap, todo(m0.join(', ')));
      return wrap;
    }
    wrap.appendChild(btn('Prenota un tavolo', { cls: 'btn--primary', book: s.id, aria: 'Prenota un tavolo a ' + s.areaShort }));
    if (n) wrap.appendChild(btn('Scrivici su WhatsApp', { cls: 'btn--line', href: waUrl(n, 'Ciao! Vi scrivo dal sito per la sede di ' + s.area + '.'), external: true, onclick: function () { track('whatsapp_chat_click', { sede: s.id }); } }));
    if (tel) wrap.appendChild(btn('Chiama', { cls: 'btn--line', href: tel, onclick: function () { track('phone_click', { sede: s.id }); } }));
    wrap.appendChild(btn('Indicazioni', { cls: 'btn--line', href: dirUrl(s), external: true, aria: 'Indicazioni stradali per ' + s.areaShort + ' su Google Maps', onclick: function () { track('maps_directions_click', { sede: s.id }); } }));
    if (isUrl(s.googleBusinessUrl)) wrap.appendChild(btn('Scheda Google', { cls: 'btn--line', href: s.googleBusinessUrl, external: true, aria: 'Profilo Google di ' + s.name + ' ' + s.areaShort, onclick: function () { track('google_business_click', { sede: s.id }); } }));
    var miss = [];
    if (!n) miss.push('WhatsApp'); if (!tel) miss.push('telefono'); if (!isUrl(s.googleBusinessUrl)) miss.push('scheda Google');
    if (miss.length) append(wrap, todo(miss.join(', ')));
    return wrap;
  }
  function addressList(s, withLinks) {
    var ul = h('ul', { class: 'addr' });
    s.addresses.forEach(function (a) {
      ul.appendChild(h('li', null,
        h('span', { class: 'addr__street', text: a.street }),
        h('span', { class: 'addr__city', text: (s.postalCode ? s.postalCode + ' ' : '') + s.city + (s.province ? ' (' + s.province + ')' : '') }),
        a.note ? h('span', { class: 'addr__note', text: a.note }) : null,
        withLinks ? h('a', { class: 'link', href: mapsUrl(s, a), target: '_blank', rel: 'noopener noreferrer', onclick: function () { track('maps_click', { sede: s.id }); } }, 'Apri in Google Maps', icon('out')) : null
      ));
    });
    if (s.addressRelation === 'da-confermare') append(ul, todo('relazione tra gli indirizzi'));
    return ul;
  }

  function serviceTag(s) {
    var walk = !canBook(s);
    return h('p', { class: 'svc' + (walk ? ' svc--walk' : '') }, h('span', { class: 'svc__dot', 'aria-hidden': 'true' }), walk ? 'Ti aspettiamo senza prenotazioni · 7 su 7' : 'Su prenotazione · via WhatsApp');
  }
  $$('[data-visit]').forEach(function (a) {
    var s = sedeById(a.getAttribute('data-visit')); if (!s) return;
    a.href = dirUrl(s); a.target = '_blank'; a.rel = 'noopener noreferrer';
    a.addEventListener('click', function () { track('visit_click', { sede: s.id }); });
  });

  /* ---------- render: card sedi (home) ---------- */
  $$('[data-sedi-cards]').forEach(function (host) {
    host.textContent = '';
    C.sedi.forEach(function (s) {
      var photo = s.photos && s.photos[0];
      host.appendChild(h('article', { class: 'sede', 'data-reveal': '' },
        h('div', { class: 'sede__disc', 'aria-hidden': 'true' }),
        h('p', { class: 'sede__num', text: s.number }),
        h('h3', { class: 'sede__name' }, h('a', { href: link(s.path), onclick: function () { track('sede_card_open', { sede: s.id }); } }, s.area)),
        h('p', { class: 'sede__region', text: s.region }),
        serviceTag(s),
        s.serviceNote ? h('p', { class: 'sede__note', text: s.serviceNote }) : null,
        photo ? h('img', { class: 'sede__photo', src: link(photo.src), alt: photo.alt || '', loading: 'lazy', decoding: 'async' }) : null,
        addressList(s, false),
        statusPill(s),
        sedeActions(s, 'card'),
        h('a', { class: 'sede__more link', href: link(s.path) }, 'Scopri la sede', icon('arrow'))
      ));
    });
  });

  /* ---------- render: pannello sede (pagina sede) ---------- */
  $$('[data-sede-panel]').forEach(function (host) {
    var s = sedeById(host.getAttribute('data-sede-panel')); if (!s) return;
    host.textContent = '';
    var tel = telHref(s);
    append(host, [
      h('div', { class: 'panel__block panel__svc' }, h('h2', { class: 'label', text: 'Come funziona' }), serviceTag(s), s.serviceNote ? h('p', { text: s.serviceNote }) : null),
      h('div', { class: 'panel__block' }, h('h2', { class: 'label', text: s.addresses.length > 1 ? 'Indirizzi' : 'Indirizzo' }), addressList(s, true)),
      hasHours(s) ? h('div', { class: 'panel__block' }, h('h2', { class: 'label', text: 'Orari' }), statusPill(s), hoursTable(s)) : todo('orari di apertura'),
      tel ? h('div', { class: 'panel__block' }, h('h2', { class: 'label', text: 'Telefono' }), h('a', { class: 'panel__tel', href: tel, text: s.phone })) : null,
      sedeActions(s, 'panel')
    ]);
  });
  $$('[data-sede-directions]').forEach(function (host) {
    var s = sedeById(host.getAttribute('data-sede-directions')); if (!s) return;
    host.textContent = '';
    s.addresses.forEach(function (a) {
      host.appendChild(h('a', { class: 'route', href: dirUrl(s, a), target: '_blank', rel: 'noopener noreferrer', onclick: function () { track('maps_directions_click', { sede: s.id }); } },
        h('span', { class: 'route__k', text: 'Portami a' }),
        h('span', { class: 'route__v', text: a.street }),
        a.note ? h('span', { class: 'route__note', text: a.note }) : null,
        icon('out')));
    });
  });
  $$('[data-sede-menu]').forEach(function (host) {
    var s = sedeById(host.getAttribute('data-sede-menu')); if (!s) return;
    if (isUrl(s.menuUrl) || /^assets\//.test(s.menuUrl || '')) {
      host.appendChild(btn('Sfoglia il menu', { cls: 'btn--line', href: isUrl(s.menuUrl) ? s.menuUrl : link(s.menuUrl), external: true, onclick: function () { track('menu_open', { sede: s.id }); } }));
    } else append(host, todo('menu della sede'));
  });
  $$('[data-sede-photos]').forEach(function (host) {
    var s = sedeById(host.getAttribute('data-sede-photos')); if (!s) return;
    if (!s.photos || !s.photos.length) { host.hidden = !DRAFT; append(host, todo('fotografie della sede')); return; }
    s.photos.forEach(function (p) { host.appendChild(h('img', { src: link(p.src), alt: p.alt || '', loading: 'lazy', decoding: 'async' })); });
  });
  $$('[data-wa-direct]').forEach(function (host) {
    var s = sedeById(host.getAttribute('data-wa-direct')); if (!s) return;
    var n = waNumber(s); if (!n) { host.hidden = true; return; }
  });

  /* ---------- footer & legali ---------- */
  $$('[data-footer-sedi]').forEach(function (host) {
    host.textContent = '';
    C.sedi.forEach(function (s) {
      var n = waNumber(s);
      host.appendChild(h('div', { class: 'fsede' },
        h('a', { class: 'fsede__name', href: link(s.path), text: s.area }),
        s.addresses.map(function (a) { return h('p', { text: a.street + (a.note ? ' — ' + a.note.toLowerCase() : '') }); }),
        h('p', { class: 'fsede__links' },
          h('a', { href: mapsUrl(s), target: '_blank', rel: 'noopener noreferrer', text: 'Google Maps' }),
          isUrl(s.googleBusinessUrl) ? h('a', { href: s.googleBusinessUrl, target: '_blank', rel: 'noopener noreferrer', text: 'Scheda Google' }) : null,
          n ? h('a', { href: waUrl(n), target: '_blank', rel: 'noopener noreferrer', text: 'WhatsApp' }) : null,
          telHref(s) ? h('a', { href: telHref(s), text: s.phone }) : null)
      ));
    });
  });
  $$('[data-footer-social]').forEach(function (host) {
    var so = C.site.social || {}, names = { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok' }, any = false;
    host.textContent = '';
    Object.keys(names).forEach(function (k) { if (isUrl(so[k])) { any = true; host.appendChild(h('a', { href: so[k], target: '_blank', rel: 'noopener noreferrer', text: names[k] })); } });
    if (!any) { if (DRAFT) append(host, todo('profili social')); else host.closest('[data-footer-social-wrap]') && (host.closest('[data-footer-social-wrap]').hidden = true); }
  });
  var owner = C.site.owner || {};
  $$('[data-owner]').forEach(function (el) {
    var k = el.getAttribute('data-owner'), v = owner[k];
    if (v) el.textContent = v; else if (DRAFT) { el.textContent = ''; append(el, todo(el.getAttribute('data-owner-label') || k)); } else el.textContent = '—';
  });
  $$('[data-owner-line]').forEach(function (el) {
    var parts = [owner.ragioneSociale, owner.indirizzo, owner.partitaIva ? 'P. IVA ' + owner.partitaIva : ''].filter(Boolean);
    if (parts.length) el.textContent = parts.join(' · '); else { el.textContent = ''; DRAFT ? append(el, todo('ragione sociale, indirizzo, P. IVA')) : el.hidden = true; }
  });
  $$('[data-legal-updated]').forEach(function (el) { if (C.site.legalUpdated) el.textContent = C.site.legalUpdated; else if (DRAFT) { el.textContent = ''; append(el, todo('data aggiornamento')); } else el.textContent = '—'; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- dati strutturati Schema.org ---------- */
  function restaurantLD(s) {
    var a = s.addresses[0];
    var o = {
      '@type': 'Restaurant', '@id': (C.site.url ? C.site.url + '/' + cleanPath(s) : '') + '#restaurant',
      name: s.name + ' — ' + s.areaShort, servesCuisine: ['Romana', 'Italiana'],
      address: { '@type': 'PostalAddress', streetAddress: a.street, addressLocality: s.city, postalCode: s.postalCode || undefined, addressRegion: s.province, addressCountry: s.country },
      hasMap: mapsUrl(s),
      acceptsReservations: canBook(s)
    };
    if (C.site.url) { o.url = C.site.url + '/' + cleanPath(s); o.image = C.site.url + '/assets/img/og-image.jpg'; }
    if (s.phone) o.telephone = s.phone;
    if (typeof s.geo.lat === 'number' && typeof s.geo.lng === 'number') o.geo = { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng };
    if (hasHours(s)) {
      o.openingHoursSpecification = [];
      DAYS.forEach(function (d) { (s.hours[d] || []).forEach(function (sl) { o.openingHoursSpecification.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: DAY_SCHEMA[d], opens: sl[0], closes: sl[1] }); }); });
    }
    var same = [s.googleBusinessUrl].filter(isUrl);
    if (same.length) o.sameAs = same;
    if (s.addressRelation === 'da-confermare' && s.addresses.length > 1) o.description = 'Indirizzi: ' + s.addresses.map(function (x) { return x.street; }).join(' / ');
    return o;
  }
  (function ld() {
    var page = body.getAttribute('data-ld');
    if (!page) return;
    var graph = [];
    if (page === 'home') {
      var org = { '@type': 'Organization', name: C.site.brand, description: C.site.category };
      if (C.site.url) { org.url = C.site.url + '/'; org.logo = C.site.url + '/assets/icons/icon-512.png'; }
      var so = C.site.social || {}, sameAs = [so.instagram, so.facebook, so.tiktok].filter(isUrl);
      if (sameAs.length) org.sameAs = sameAs;
      graph.push(org);
      C.sedi.forEach(function (s) { graph.push(restaurantLD(s)); });
    } else {
      var s = sedeById(page); if (!s) return;
      graph.push(restaurantLD(s));
      graph.push({ '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: C.site.url ? C.site.url + '/' : undefined },
        { '@type': 'ListItem', position: 2, name: s.area, item: C.site.url ? C.site.url + '/' + cleanPath(s) : undefined }] });
    }
    var tag = doc.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    doc.head.appendChild(tag);
  })();

  /* ---------- header & menu mobile ---------- */
  var header = $('.hdr');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-solid', window.scrollY > 24); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
  var menuBtn = $('[data-menu-toggle]'), menu = $('#menu');
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
    menu.inert = !open;
    body.classList.toggle('no-scroll', open);
    if (open) { var f = $('a, button', menu); f && f.focus(); } else menuBtn.focus({ preventScroll: true });
  }
  if (menu && menuBtn) {
    menu.inert = true;
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (m) { if (m.matches && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* ---------- comparsa allo scroll + leggero movimento hero ---------- */
  if (!REDUCE && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    var drift = $('[data-drift]');
    if (drift && window.matchMedia('(min-width: 960px)').matches) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () {
          var y = Math.min(window.scrollY, window.innerHeight);
          drift.style.transform = 'translate3d(0,' + (y * 0.08).toFixed(1) + 'px,0)';
          ticking = false;
        });
      }, { passive: true });
    }
  } else {
    $$('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- modulo di prenotazione WhatsApp ---------- */
  var dlg, form, state = { sede: BOOKABLE.length ? BOOKABLE[0].id : '', people: 2 };
  function fmtDate(v) {
    if (!v) return '';
    var p = v.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  function todayISO() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function clean(v, max) { return String(v || '').replace(/[\u0000-\u001F\u007F<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max); }
  function buildMessage(s, f) {
    return 'Ciao! Vorrei prenotare un tavolo da THE PAPPAPPERO presso la sede di ' + s.area + '.\n' +
      'Nome: ' + f.name + '\n' +
      'Data: ' + fmtDate(f.date) + '\n' +
      'Orario: ' + f.time + '\n' +
      'Numero di persone: ' + f.people + '\n' +
      (f.notes ? 'Note: ' + f.notes + '\n' : '') +
      'Grazie!';
  }
  function buildDialog() {
    dlg = h('dialog', { class: 'book', 'aria-labelledby': 'book-title' });
    var sedeOpts = h('div', { class: 'seg', role: 'radiogroup', 'aria-labelledby': 'book-sede-l' });
    BOOKABLE.forEach(function (s) {
      var id = 'bs-' + s.id;
      sedeOpts.appendChild(h('label', { class: 'seg__opt', for: id },
        h('input', { type: 'radio', name: 'sede', id: id, value: s.id }),
        h('span', { class: 'seg__num', text: s.number }), h('span', { class: 'seg__name', text: s.area })));
    });
    function field(id, label, input, hint) {
      return h('div', { class: 'fld' }, h('label', { for: id, class: 'fld__l', text: label }), input,
        hint ? h('p', { class: 'fld__hint', id: id + '-hint', text: hint }) : null,
        h('p', { class: 'fld__err', id: id + '-err', 'aria-live': 'polite' }));
    }
    var stepper = h('div', { class: 'stepper' },
      h('button', { type: 'button', class: 'stepper__b', 'aria-label': 'Una persona in meno', 'data-step': '-1', text: '−' }),
      h('input', { id: 'bk-people', name: 'people', type: 'number', inputmode: 'numeric', min: '1', max: '30', value: '2', required: true, 'aria-describedby': 'bk-people-err' }),
      h('button', { type: 'button', class: 'stepper__b', 'aria-label': 'Una persona in più', 'data-step': '1', text: '+' }));
    form = h('form', { class: 'book__form', novalidate: true },
      h('fieldset', { class: 'fld fld--sede' }, h('legend', { id: 'book-sede-l', class: 'fld__l', text: 'Sede' }), sedeOpts,
        C.sedi.filter(function (s) { return !canBook(s); }).map(function (s) {
          return h('p', { class: 'fld__hint book__walk' }, 'A ' + s.areaShort + ' non serve prenotare: vieni direttamente. ', h('a', { href: link(s.path), text: 'Come arrivare' }));
        })),
      field('bk-name', 'Nome', h('input', { id: 'bk-name', name: 'name', type: 'text', autocomplete: 'name', maxlength: '60', required: true, 'aria-describedby': 'bk-name-err' })),
      h('div', { class: 'fld-row' },
        field('bk-date', 'Data', h('input', { id: 'bk-date', name: 'date', type: 'date', required: true, min: todayISO(), 'aria-describedby': 'bk-date-err' })),
        field('bk-time', 'Orario', h('input', { id: 'bk-time', name: 'time', type: 'time', required: true, step: '900', 'aria-describedby': 'bk-time-err' }))),
      field('bk-people', 'Persone', stepper),
      field('bk-notes', 'Note (facoltative)', h('input', { id: 'bk-notes', name: 'notes', type: 'text', maxlength: '140', placeholder: 'Seggiolone, intolleranze, un compleanno…', 'aria-describedby': 'bk-notes-hint' }), 'Evita di inserire dati sanitari dettagliati: basta un accenno, ne parliamo in chat.'),
      h('div', { class: 'book__out', 'aria-live': 'polite' }),
      h('div', { class: 'book__foot' },
        h('button', { type: 'submit', class: 'btn btn--primary btn--wide' }, h('span', { text: 'Continua su WhatsApp' }), icon('out')),
        h('p', { class: 'book__fine' }, 'Si aprirà WhatsApp con il messaggio già scritto: controlla e invia. La prenotazione è confermata solo quando ti rispondiamo.'),
        h('a', { class: 'link book__direct', href: '#', 'data-direct': '' }, 'Preferisci scrivere tu? Apri solo la chat', icon('out')))
    );
    append(dlg, h('div', { class: 'book__in' },
      h('header', { class: 'book__hd' },
        h('p', { class: 'eyebrow', text: 'Prenota un tavolo' }),
        h('h2', { id: 'book-title', class: 'book__title', text: 'Quanti siete, e quando?' }),
        h('button', { type: 'button', class: 'book__x', 'aria-label': 'Chiudi', 'data-close': '' }, h('span', { 'aria-hidden': 'true' }))),
      form));
    body.appendChild(dlg);

    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
    dlg.addEventListener('close', function () { body.classList.remove('no-scroll'); });
    $$('input[name="sede"]', dlg).forEach(function (r) { r.addEventListener('change', function () { state.sede = r.value; syncDirect(); clearOut(); }); });
    $$('[data-step]', dlg).forEach(function (b) {
      b.addEventListener('click', function () {
        var i = $('#bk-people'), v = Math.min(30, Math.max(1, (parseInt(i.value, 10) || 1) + (+b.getAttribute('data-step'))));
        i.value = v;
      });
    });
    $('[data-direct]', dlg).addEventListener('click', function (e) {
      var s = sedeById(state.sede), n = waNumber(s);
      if (!n) { e.preventDefault(); showUnavailable(s); return; }
      track('whatsapp_chat_click', { sede: s.id, from: 'booking_form' });
    });
    form.addEventListener('submit', onSubmit);
    $$('input', form).forEach(function (i) { i.addEventListener('input', function () { setErr(i, ''); }); });
  }
  function syncDirect() {
    var s = sedeById(state.sede), n = waNumber(s), a = $('[data-direct]', dlg);
    a.href = n ? waUrl(n, 'Ciao! Vi scrivo dal sito per la sede di ' + s.area + '.') : '#';
    if (n) { a.target = '_blank'; a.rel = 'noopener noreferrer'; } else { a.removeAttribute('target'); }
  }
  function clearOut() { $('.book__out', dlg).textContent = ''; }
  function setErr(input, msg) {
    var e = $('#' + input.id + '-err', dlg); if (!e) return;
    e.textContent = msg; input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function showUnavailable(s) {
    var out = $('.book__out', dlg), tel = telHref(s);
    out.textContent = '';
    append(out, h('div', { class: 'notice' },
      h('p', { class: 'notice__t', text: 'La prenotazione via WhatsApp per ' + s.area + ' sarà attiva a breve.' }),
      tel ? h('p', null, 'Nel frattempo puoi chiamarci: ', h('a', { href: tel, text: s.phone })) : h('p', { text: 'Nel frattempo trovi la sede su Google Maps.' }),
      todo('numero WhatsApp della sede')));
  }
  function onSubmit(e) {
    e.preventDefault();
    var s = sedeById(state.sede), el = form.elements;
    var f = {
      name: clean(el.namedItem("name").value, 60), date: el.date.value, time: el.time.value,
      people: parseInt(el.people.value, 10), notes: clean(el.notes.value, 140)
    };
    var first = null;
    function bad(input, msg) { setErr(input, msg); first = first || input; }
    if (f.name.length < 2) bad(el.namedItem("name"), 'Scrivi il nome a cui intestare il tavolo.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f.date)) bad(el.date, 'Scegli il giorno.');
    else if (f.date < todayISO()) bad(el.date, 'Scegli un giorno a partire da oggi.');
    if (!/^\d{2}:\d{2}$/.test(f.time)) bad(el.time, 'Indica a che ora arrivate.');
    if (!(f.people >= 1 && f.people <= 30)) bad(el.people, 'Da 1 a 30 persone. Per gruppi più grandi scrivici in chat.');
    if (first) { first.focus(); track('booking_form_error', { sede: s.id }); return; }
    var n = waNumber(s);
    if (!n) { showUnavailable(s); track('booking_unavailable', { sede: s.id }); return; }
    track('booking_whatsapp_submit', { sede: s.id, persone: f.people });
    window.open(waUrl(n, buildMessage(s, f)), '_blank', 'noopener');
  }
  function openBooking(sedeId) {
    if (!BOOKABLE.length) return;
    if (!dlg) buildDialog();
    var pageSede = sedeById(body.getAttribute('data-sede'));
    if (sedeId && canBook(sedeById(sedeId))) state.sede = sedeId;
    else if (canBook(pageSede)) state.sede = pageSede.id;
    else state.sede = BOOKABLE[0].id;
    var r = $('#bs-' + state.sede, dlg); if (r) r.checked = true;
    syncDirect(); clearOut();
    dlg.showModal(); body.classList.add('no-scroll');
    track('booking_form_open', { sede: state.sede });
    setTimeout(function () { var nm = $('#bk-name', dlg); nm && nm.focus(); }, 30);
  }
  doc.addEventListener('click', function (e) {
    var t = e.target.closest('[data-book]');
    if (!t) return;
    e.preventDefault();
    openBooking(t.getAttribute('data-book'));
  });
  if (params.get('prenota') !== null) openBooking(params.get('prenota'));

  /* ---------- banner e preferenze cookie ---------- */
  var cdlg;
  function buildConsentPanel() {
    var active = analyticsConfigured();
    cdlg = h('dialog', { class: 'consent', 'aria-labelledby': 'cons-t' },
      h('div', { class: 'consent__in' },
        h('h2', { id: 'cons-t', class: 'consent__t', text: 'Preferenze privacy' }),
        h('p', { text: 'Usiamo solo ciò che serve al funzionamento del sito. Gli strumenti facoltativi restano spenti finché non scegli tu.' }),
        h('div', { class: 'toggle' },
          h('div', null, h('p', { class: 'toggle__t', text: 'Tecnici' }), h('p', { class: 'toggle__d', text: 'Ricordano le tue preferenze sulla privacy. Sempre attivi.' })),
          h('input', { type: 'checkbox', checked: true, disabled: true, 'aria-label': 'Tecnici, sempre attivi' })),
        h('div', { class: 'toggle' },
          h('div', null, h('p', { class: 'toggle__t', text: 'Statistiche' }), h('p', { class: 'toggle__d', text: active ? 'Ci aiutano a capire quali pagine e quali sedi interessano di più, in forma aggregata.' : 'Al momento il sito non utilizza strumenti statistici.' })),
          h('input', { type: 'checkbox', id: 'cons-an', disabled: !active, 'aria-label': 'Statistiche' })),
        h('div', { class: 'consent__act' },
          h('button', { type: 'button', class: 'btn btn--line', 'data-c': 'reject', text: 'Rifiuta' }),
          h('button', { type: 'button', class: 'btn btn--line', 'data-c': 'save', text: 'Salva scelte' }),
          h('button', { type: 'button', class: 'btn btn--primary', 'data-c': 'accept', text: 'Accetta tutti' })),
        h('p', { class: 'consent__more' }, h('a', { class: 'link', href: link('cookie/index.html'), text: 'Cookie Policy' }), h('a', { class: 'link', href: link('privacy/index.html'), text: 'Privacy Policy' }))));
    body.appendChild(cdlg);
    cdlg.addEventListener('click', function (e) {
      if (e.target === cdlg) return cdlg.close();
      var b = e.target.closest('[data-c]'); if (!b) return;
      var a = b.getAttribute('data-c');
      saveConsent(a === 'accept' ? true : a === 'reject' ? false : $('#cons-an', cdlg).checked);
      cdlg.close(); hideBanner();
    });
  }
  function openConsent() {
    if (!cdlg) buildConsentPanel();
    var c = readConsent(); $('#cons-an', cdlg).checked = !!(c && c.analytics);
    cdlg.showModal();
  }
  var banner;
  function hideBanner() { if (banner) { banner.classList.remove('is-in'); setTimeout(function () { banner && banner.remove(); banner = null; }, 300); } }
  function showBanner() {
    banner = h('section', { class: 'cbar', 'aria-label': 'Consenso cookie', role: 'region' },
      h('p', { class: 'cbar__t' }, 'Il sito funziona anche senza statistiche. Se ci dai il permesso, ci aiutano a capire quali sedi interessano di più. ', h('a', { class: 'link', href: link('cookie/index.html'), text: 'Cookie Policy' })),
      h('div', { class: 'cbar__act' },
        h('button', { type: 'button', class: 'btn btn--line btn--sm', text: 'Rifiuta', onclick: function () { saveConsent(false); hideBanner(); } }),
        h('button', { type: 'button', class: 'btn btn--line btn--sm', text: 'Personalizza', onclick: openConsent }),
        h('button', { type: 'button', class: 'btn btn--primary btn--sm', text: 'Accetta', onclick: function () { saveConsent(true); hideBanner(); } })));
    body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add('is-in'); });
  }
  $$('[data-consent-open]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); openConsent(); }); });
  var stored = readConsent();
  if (stored) applyConsent(stored);
  // Il banner compare solo se esistono strumenti che richiedono consenso (o in modalità bozza, per revisione).
  else if (analyticsConfigured() || (DRAFT && params.has('banner'))) showBanner();

  // misurazione apertura pagina sede
  if (body.getAttribute('data-sede')) track('sede_page_view', { sede: body.getAttribute('data-sede') });
})();
