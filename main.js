/* Koehl Studio, draft 2. Everything here is progressive enhancement: the page reads fine without it. */

/*
  THE MAP DATA. One line per website.

  To add a site, copy any line below and change the fields:
    type   "client" for a paying client (warm light, gentle pulse, label shows the business name)
           "concept" for an unsolicited concept redesign (dim light, anonymous label, tagged Concept redesign)
    name   business name. Shown for clients only. Leave it "" for concepts.
    trade  what the business is, e.g. "Body shop". Concept labels show this instead of a name.
    town   town or city
    state  two-letter state
    lat    latitude  (in Google Maps, right-click the business and click the numbers to copy them;
    lng    longitude  the first number is lat, the second is lng)
    url    the live website address

  Lower 48 states only. Alaska and Hawaii are not drawn on this map.
*/
const SITES = [
  { type: "concept", name: "", trade: "Body shop",              town: "Knoxville",   state: "TN", lat: 35.910, lng: -84.213, url: "https://kentonkoehl.github.io/hvbs-preview/" },
  { type: "concept", name: "", trade: "Steakhouse",             town: "Knoxville",   state: "TN", lat: 35.916, lng: -83.857, url: "https://kentonkoehl.github.io/yeolde-preview/" },
  { type: "concept", name: "", trade: "Sewing machine shop",    town: "Knoxville",   state: "TN", lat: 35.923, lng: -84.061, url: "https://kentonkoehl.github.io/sme-preview/" },
  { type: "concept", name: "", trade: "Soup and sandwich cafe", town: "Knoxville",   state: "TN", lat: 35.912, lng: -84.087, url: "https://kentonkoehl.github.io/soupkitchen-preview/" },
  { type: "concept", name: "", trade: "Tire and auto shop",     town: "Lenoir City", state: "TN", lat: 35.796, lng: -84.258, url: "https://kentonkoehl.github.io/dependable-preview/" },
  { type: "concept", name: "", trade: "Pest control",           town: "Loudon",      state: "TN", lat: 35.742, lng: -84.336, url: "https://kentonkoehl.github.io/eastvol-preview/" },
  { type: "concept", name: "", trade: "Transmission shop",      town: "Maryville",   state: "TN", lat: 35.778, lng: -83.952, url: "https://kentonkoehl.github.io/tranco-preview/" },
  { type: "concept", name: "", trade: "Well driller",           town: "Sevierville", state: "TN", lat: 35.862, lng: -83.494, url: "https://kentonkoehl.github.io/clearwater-preview/" },
  { type: "concept", name: "", trade: "Boat dealer",            town: "Harriman",    state: "TN", lat: 35.918, lng: -84.569, url: "https://kentonkoehl.github.io/reynolds-preview/" },
  { type: "concept", name: "", trade: "Septic service",         town: "Morristown",  state: "TN", lat: 36.243, lng: -83.201, url: "https://kentonkoehl.github.io/enviroseptic-preview/" },
  { type: "concept", name: "", trade: "Frame shop and gallery", town: "Kingsport",   state: "TN", lat: 36.545, lng: -82.558, url: "https://kentonkoehl.github.io/uatw-preview/" },
  { type: "concept", name: "", trade: "Drain and septic",       town: "Sale Creek",  state: "TN", lat: 35.342, lng: -85.131, url: "https://kentonkoehl.github.io/choochoo-preview/" },
  { type: "concept", name: "", trade: "Plumber",                town: "Clarksville", state: "TN", lat: 36.528, lng: -87.359, url: "https://kentonkoehl.github.io/stifflers-preview/" },
  { type: "concept", name: "", trade: "Towing service",         town: "Jackson",     state: "TN", lat: 35.630, lng: -88.770, url: "https://kentonkoehl.github.io/manns-preview/" },
];

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const title = s => (s.type === 'client' && s.name) ? s.name : s.trade;
const place = s => `${s.town}, ${s.state}`;

/* First paint is never blocked. */
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('is-ready')));

/* Smooth scroll (Lenis) plus ONE frame loop for everything scroll-linked.
   Reduced motion: no Lenis, no drift, native scrolling only. */
(() => {
  const top = $('#top');
  const drifts = $$('[data-drift]');
  let lastY = 0, ticking = false;

  function update(y) {
    if (Math.abs(y - lastY) > 2) { top.classList.toggle('is-hidden', y > lastY && y > 200); lastY = y; }
    if (reduce) return;
    const vh = innerHeight;
    for (const el of drifts) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      const p = 1 - (r.top + r.height / 2) / (vh / 2);   // -1 low on screen, +1 high on screen
      el.style.transform = `translate3d(0,${(p * -24).toFixed(2)}px,0)`;
    }
  }

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
    lenis.on('scroll', e => update(e.scroll));
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  } else {
    addEventListener('scroll', () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => { ticking = false; update(scrollY); });
    }, { passive: true });
  }
  update(scrollY);
})();

/* The kept-up / left-alone slider. Plays once on load, then it is the visitor's. */
(() => {
  const frame = $('#tend'), range = $('#tend-range'); if (!frame) return;
  const set = v => frame.style.setProperty('--cut', v + '%');
  let stop = false;
  range.addEventListener('input', () => { stop = true; set(range.value); });
  set(range.value);
  if (reduce) return;
  const from = 6, to = 48, dur = 2400, delay = 900;
  set(from); range.value = from;
  const ease = t => 1 - Math.pow(1 - t, 4);
  let t0 = null;
  const step = ts => {
    if (stop) return;
    if (t0 === null) t0 = ts + delay;
    const p = Math.min(Math.max((ts - t0) / dur, 0), 1);
    const v = from + (to - from) * ease(p);
    set(v.toFixed(2)); range.value = Math.round(v);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();

/* Reveal on scroll: big statements and the process rows only. */
(() => {
  const els = $$('[data-rise], .step');
  if (!('IntersectionObserver' in window) || reduce) { els.forEach(e => e.classList.add('is-in')); return; }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  els.forEach(e => io.observe(e));
})();

/* Contact form: composes an email in the visitor's own mail app. No service, no storage. */
(() => {
  const f = $('#form'); if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (!f.reportValidity()) return;
    const v = n => (f.elements[n].value || '').trim();
    const subject = `Website for ${v('business')}`;
    const body = [
      `Name: ${v('name')}`,
      `Business: ${v('business')}`,
      v('website') ? `Current website: ${v('website')}` : 'Current website: none yet',
      '',
      v('message'),
    ].join('\n');
    location.href = `mailto:kentonkoehl@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();

/* ---------------- The map ---------------- */
(() => {
  const map = $('#map'), layer = $('#lights'), world = $('#world'), resetBtn = $('#reset'), index = $('#index');
  if (!map) return;

  // Albers equal-area conic, lower 48 (same projection that drew the outline at build time).
  const K = 1271.0432294976, TX = 490.02367350262426, TY = 1116.8250720630604;
  const R = Math.PI / 180, p0 = 29.5 * R, p1 = 45.5 * R, sy0 = Math.sin(p0), n = (sy0 + Math.sin(p1)) / 2;
  const c = 1 + sy0 * (2 * n - sy0), r0 = Math.sqrt(c) / n;
  const project = (lng, lat) => {
    const x = (lng + 96) * R * n, r = Math.sqrt(c - 2 * n * Math.sin(lat * R)) / n;
    return [TX + K * r * Math.sin(x), TY - K * (r0 - r * Math.cos(x))];
  };
  const W = 960, H = 600, MAX = 28, CLUSTER_PX = 30;
  let pointer = 'mouse', armed = null;
  map.addEventListener('pointerdown', e => { pointer = e.pointerType; }, true);

  const pts = SITES.map((s, i) => ({ ...s, i, p: project(s.lng, s.lat) }));

  // Index list (also the fallback for anyone who prefers a list).
  pts.forEach(s => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener"></a><span></span>`;
    li.firstChild.textContent = `${title(s)}, ${place(s)}`;
    li.lastChild.textContent = s.type === 'concept' ? 'Concept redesign' : 'Client';
    index.appendChild(li);
  });

  let view = { s: 1, x: 0, y: 0 };      // world -> viewBox: v = p * s + (x, y)

  const toPx = (p, v = view) => {
    const k = map.clientWidth / W;
    return [(p[0] * v.s + v.x) * k, (p[1] * v.s + v.y) * k];
  };

  function clusters() {
    const out = [];
    pts.forEach(pt => {
      const q = toPx(pt.p);
      const hit = out.find(cl => Math.hypot(cl.q[0] - q[0], cl.q[1] - q[1]) < CLUSTER_PX);
      if (hit) { hit.m.push(pt); const L = hit.m.length; hit.q = [(hit.q[0] * (L - 1) + q[0]) / L, (hit.q[1] * (L - 1) + q[1]) / L]; }
      else out.push({ q, m: [pt] });
    });
    out.forEach(cl => cl.id = cl.m.map(m => m.i).sort().join('-'));
    return out;
  }

  function light(pt, x, y) {
    const a = document.createElement('a');
    a.className = 'lt lt--' + pt.type + (x > map.clientWidth * .62 ? ' flip' : '');
    a.href = pt.url; a.target = '_blank'; a.rel = 'noopener';
    const kind = pt.type === 'client' ? 'Client' : 'Concept redesign';
    a.setAttribute('aria-label', `${title(pt)}, ${place(pt)}. ${kind}. Opens in a new tab.`);
    a.innerHTML = '<span class="lt__dot"></span><span class="lt__tag" aria-hidden="true"><b></b><span></span><i></i></span>';
    a.querySelector('b').textContent = title(pt);
    a.querySelector('.lt__tag > span').textContent = place(pt);
    const i = a.querySelector('i'); i.textContent = kind; a.querySelector('.lt__tag').insertAdjacentHTML('beforeend', '<i class="tap">Tap again to open</i>');
    a.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    // On touch screens the first tap shows the label, the second tap opens the site.
    a.addEventListener('click', e => {
      if (pointer !== 'touch' || armed === a) return;
      e.preventDefault();
      if (armed) armed.classList.remove('is-armed');
      armed = a; a.classList.add('is-armed');
    });
    return a;
  }

  function render() {
    world.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.s})`);
    layer.textContent = ''; armed = null;
    const close = view.s >= MAX * .99;
    clusters().forEach(cl => {
      const [x, y] = cl.q;
      if (cl.m.length === 1) {
        const p = toPx(cl.m[0].p); layer.appendChild(light(cl.m[0], p[0], p[1])); return;
      }
      if (close) {
        // Spread the group in a small ring so each light can be tapped.
        const rad = Math.min(70, Math.max(38, cl.m.length * 12));
        cl.m.forEach((pt, j) => {
          const ang = -Math.PI / 2 + j * (2 * Math.PI / cl.m.length);
          const lx = x + Math.cos(ang) * rad, ly = y + Math.sin(ang) * rad;
          const sp = document.createElement('span'); sp.className = 'spoke';
          sp.style.width = rad + 'px'; sp.style.transform = `translate(${x}px,${y}px) rotate(${ang}rad)`;
          layer.appendChild(sp);
          layer.appendChild(light(pt, lx, ly));
        });
        return;
      }
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cl'; b.textContent = cl.m.length;
      b.setAttribute('aria-label', `${cl.m.length} websites near ${place(cl.m[0])}. Zoom in.`);
      b.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
      b.addEventListener('click', () => zoomTo(cl));
      layer.appendChild(b);
    });
    resetBtn.hidden = view.s === 1;
  }

  function zoomTo(cl) {
    const xs = cl.m.map(m => m.p[0]), ys = cl.m.map(m => m.p[1]);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const pad = 0.28;
    const bw = Math.max(maxX - minX, 1e-3), bh = Math.max(maxY - minY, 1e-3);
    let s = Math.min(W * (1 - 2 * pad) / bw, H * (1 - 2 * pad) / bh);
    s = Math.min(Math.max(s, view.s * 2.5), MAX);
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const target = { s, x: W / 2 - cx * s, y: H / 2 - cy * s };
    animateTo(target, () => {
      const first = layer.querySelector('.lt, .cl'); if (first) first.focus({ preventScroll: true });
    });
  }

  function animateTo(target, done) {
    const from = { ...view };
    if (reduce) { view = target; render(); done && done(); return; }
    layer.style.opacity = '0';
    const dur = 1100, t0 = performance.now();
    const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    // Interpolate in log scale so zoom feels even.
    const ls0 = Math.log(from.s), ls1 = Math.log(target.s);
    const c0 = [(W / 2 - from.x) / from.s, (H / 2 - from.y) / from.s];
    const c1 = [(W / 2 - target.x) / target.s, (H / 2 - target.y) / target.s];
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1), e = ease(p);
      const s = Math.exp(ls0 + (ls1 - ls0) * e);
      const cx = c0[0] + (c1[0] - c0[0]) * e, cy = c0[1] + (c1[1] - c0[1]) * e;
      view = { s, x: W / 2 - cx * s, y: H / 2 - cy * s };
      world.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.s})`);
      if (p < 1) requestAnimationFrame(tick);
      else { view = target; layer.style.transition = 'opacity .5s linear'; layer.style.opacity = '1'; render(); done && done(); }
    };
    requestAnimationFrame(tick);
  }

  resetBtn.addEventListener('click', () => { animateTo({ s: 1, x: 0, y: 0 }, () => { const f = layer.querySelector(".lt, .cl"); if (f) f.focus({ preventScroll: true }); }); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !resetBtn.hidden) resetBtn.click(); });

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(render, 120); });
  render();

  // Lights come up when the map scrolls into view.
  if (reduce || !('IntersectionObserver' in window)) { map.classList.add('is-on'); return; }
  const io = new IntersectionObserver(es => {
    if (es[0].isIntersecting) {
      map.classList.add('is-on');
      $$('#lights > *').forEach((el, i) => { el.style.transitionDelay = (i * 0.08) + 's'; setTimeout(() => el.style.transitionDelay = '', 1600); });
      io.disconnect();
    }
  }, { threshold: .35 });
  io.observe(map);
})();
