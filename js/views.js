/* Render functions. Each returns an HTML string for #app.
   Plain globals (no modules) so it also runs from file://. */
(function () {
  const T = window.TRIP;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICON = {
    flight: "✈️", drive: "🚗", car: "🔑", hotel: "🏨", meal: "🍽️", walk: "🚶",
    shop: "🛍️", sight: "🏛️", cable: "🚠", drone: "📸", free: "☕", play: "🎢",
  };

  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  };
  const sgd = (chf) => chf == null ? "" : "S$" + Math.round(chf * T.meta.chfToSgd).toLocaleString();

  // iOS opens the native Google Maps app via the comgooglemaps:// scheme;
  // everywhere else (desktop Chrome, Android) falls back to the universal https URL.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const mapsHref = (name) => {
    const q = encodeURIComponent(name + ", Switzerland");
    return isIOS ? `comgooglemaps://?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`;
  };

  const HM = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
  const toISO = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  // day-number → accent colour (index 0 unused)
  const DAY_COLORS = ["#6E87A6", "#6E87A6", "#4FA3A0", "#8AA678", "#C8674B", "#D9A441", "#8B6F9E", "#C77A8A", "#6E87A6"];
  const dayColor = (n) => DAY_COLORS[n] || "#6E87A6";

  /* offline schematic map: projects lat/lng into an SVG (uniform scale, geographic) */
  function miniMapSVG(places, o) {
    o = o || {};
    if (!places || !places.length) return "";
    const W = o.w || 328, H = o.h || 190, pad = o.pad || 24;
    const lats = places.map((p) => p.lat), lngs = places.map((p) => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const meanLat = (minLat + maxLat) / 2, kx = Math.cos(meanLat * Math.PI / 180);
    const geoW = Math.max((maxLng - minLng) * kx, 1e-4), geoH = Math.max(maxLat - minLat, 1e-4);
    const s = Math.min((W - 2 * pad) / geoW, (H - 2 * pad) / geoH);
    const offX = (W - geoW * s) / 2, offY = (H - geoH * s) / 2;
    const proj = (lat, lng) => [offX + (lng - minLng) * kx * s, offY + (maxLat - lat) * s];
    const pts = places.map((p) => { const [x, y] = proj(p.lat, p.lng); return { p, x, y }; });

    let grid = "";
    for (let i = 1; i < 4; i++) { const gx = (W / 4) * i; grid += `<line x1="${gx}" y1="0" x2="${gx}" y2="${H}" class="mm-grid"/>`; }
    for (let i = 1; i < 3; i++) { const gy = (H / 3) * i; grid += `<line x1="0" y1="${gy}" x2="${W}" y2="${gy}" class="mm-grid"/>`; }

    let path = "";
    if (o.connect !== false && pts.length > 1) {
      const d = "M" + pts.map((q) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`).join(" L");
      path = `<path d="${d}" fill="none" stroke="${o.accent || "var(--accent)"}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>`;
    }
    let dots = "";
    pts.forEach((q, i) => {
      const c = o.colorByDay ? dayColor(q.p.day) : (o.accent || "var(--accent)");
      dots += `<circle cx="${q.x.toFixed(1)}" cy="${q.y.toFixed(1)}" r="5" fill="${c}" stroke="var(--surface)" stroke-width="1.5"><title>${esc(q.p.name)}</title></circle>`;
      if (o.labels) {
        const right = q.x > W * 0.6;
        const tx = right ? q.x - 8 : q.x + 8;
        dots += `<text x="${tx.toFixed(1)}" y="${(q.y + 3).toFixed(1)}" text-anchor="${right ? "end" : "start"}" class="mm-label">${esc(q.p.name)}</text>`;
      }
    });
    return `<svg class="minimap" viewBox="0 0 ${W} ${H}" role="img" aria-label="Route map">${grid}${path}${dots}</svg>`;
  }

  /* where are we in the trip right now? */
  function tripStatus(now) {
    now = now || new Date();
    const start = new Date(T.meta.startDate + "T00:00:00");
    const end = new Date(T.days[T.days.length - 1].date + "T23:59:59");
    if (now < start) return { phase: "before", days: Math.ceil((start - now) / 86400000) };
    if (now > end) return { phase: "after" };
    const day = T.days.find((d) => d.date === toISO(now));
    if (!day) return { phase: "during" };
    const mins = now.getHours() * 60 + now.getMinutes();
    let cur = null;
    day.segments.forEach((sg) => { if (HM(sg.t) <= mins) cur = sg; });
    const next = day.segments.find((sg) => HM(sg.t) > mins) || null;
    return { phase: "during", day, cur, next };
  }

  function nowNextHTML(st) {
    if (st.phase === "before") {
      return `<a class="card nownext acc-4" href="#/day/1">
        <div class="nownext__lbl">Countdown</div>
        <div class="nownext__big">${st.days} day${st.days === 1 ? "" : "s"} to go ✈️</div>
        <div class="muted small">Until Switzerland · tap to preview Day 1</div></a>`;
    }
    if (st.phase === "after") {
      return `<div class="card"><div class="nownext__lbl">Trip complete 🎉</div><div class="muted small">Hope it was unforgettable.</div></div>`;
    }
    if (st.phase === "during" && st.day) {
      const row = (sg, cls) => sg
        ? `<div class="nownext__row ${cls}"><span class="nownext__time">${esc(sg.t)}</span><span>${esc(sg.act)}</span></div>`
        : `<div class="muted small">${cls.includes("next") ? "That's a wrap for today." : "Day starts soon…"}</div>`;
      return `<a class="card nownext acc-${st.day.n}" href="#/day/${st.day.n}">
        <div class="nownext__lbl">Now · Day ${st.day.n}</div>
        ${row(st.cur, "")}
        <div class="nownext__lbl" style="margin-top:10px">Up next</div>
        ${row(st.next, "nownext__row--next")}</a>`;
    }
    return "";
  }

  /* ---------- Home / Days ---------- */
  function home(todayN) {
    const m = T.meta;
    const days = T.days.map((d) => {
      const isToday = d.n === todayN;
      const top3 = d.segments.filter((s) => ["sight", "cable", "drone", "meal", "play", "shop"].includes(s.type))
        .slice(0, 3).map((s) => esc(s.act.split("(")[0].trim())).join(" · ");
      return `
        <a class="card card--link daycard acc-${d.n} ${isToday ? "is-today" : ""}" href="#/day/${d.n}">
          <div class="daycard__head">
            <span class="daycard__day">Day ${d.n} · ${esc(d.dow)}</span>
            ${isToday ? `<span class="today-tag">Today</span>` : `<span class="daycard__date">${fmtDate(d.date)}</span>`}
          </div>
          <div class="daycard__title">${esc(d.title)}</div>
          <div class="daycard__route">${esc(d.route)}</div>
          ${top3 ? `<div class="caption ghost" style="margin-top:8px">${top3}</div>` : ""}
        </a>`;
    }).join("");

    return `
      <section class="view">
        <div class="hero">
          <div class="hero__eyebrow">${esc(m.subtitle)}</div>
          <h1 class="hero__title">${esc(m.title)}</h1>
          <div class="hero__meta">${fmtDate(m.startDate)} – ${fmtDate(m.endDate)} · ${T.days.length} days</div>
          <p class="hero__note">${esc(m.note)}</p>
        </div>

        ${nowNextHTML(tripStatus())}

        <div class="quick">
          ${quickItem("#/weather", "🌤️", "Weather", "Live trip forecast")}
          ${quickItem("#/hotels", "🏨", "Hotels", T.hotels.length + " stays")}
          ${quickItem("#/map", "🗺️", "Map", T.places.length + " stops")}
          ${quickItem("#/info", "🧳", "Info", "Packing & emergencies")}
        </div>

        <div class="section-label">Day by day</div>
        <div class="stack">${days}</div>
      </section>`;
  }
  const quickItem = (href, ico, t, s) => `
    <a class="card card--link quick__item acc-4" href="${href}">
      <span class="quick__ico">${ico}</span>
      <span><span class="quick__t">${esc(t)}</span><br><span class="quick__s">${esc(s)}</span></span>
    </a>`;

  /* ---------- Day detail ---------- */
  function day(n) {
    const d = T.days.find((x) => x.n === Number(n));
    if (!d) return `<section class="view"><p>Day not found.</p></section>`;
    const items = d.segments.map((s, i) => {
      const key = `done:${d.date}:${i}`;
      const done = localStorage.getItem(key) === "1";
      return `
        <li class="tl ${done ? "is-done" : ""}" data-key="${key}">
          <span class="tl__dot">${ICON[s.type] || ""}</span>
          <button class="tl__check" aria-label="toggle done">${done ? "✓" : ""}</button>
          <div class="tl__time">${esc(s.t)}</div>
          <div class="tl__act">${esc(s.act)}</div>
          ${s.note ? `<div class="tl__note">${esc(s.note)}</div>` : ""}
          ${s.booking ? `<div style="margin-top:6px"><span class="chip">🎟️ ${esc(s.booking)}</span></div>` : ""}
        </li>`;
    }).join("");

    const todayISO = toISO(new Date());
    const banner = d.date === todayISO ? nowNextHTML(tripStatus()) : "";
    const dayPlaces = T.places.filter((p) => p.day === d.n);
    const placeLinks = dayPlaces.map((p) =>
      `<a class="place-chip" href="${mapsHref(p.name)}"${isIOS ? "" : ' target="_blank" rel="noopener"'}>📍 ${esc(p.name)}</a>`
    ).join("");
    const mapCard = dayPlaces.length
      ? `<div class="card acc-${d.n}" style="padding:var(--sp-3);margin-bottom:var(--sp-4)">
           <div id="dayGmap" class="gmap" data-day-map="${d.n}" style="display:none"></div>
           <div id="dayMapFallback">${miniMapSVG(dayPlaces, { labels: true, connect: true, accent: dayColor(d.n), h: 200 })}</div>
           <div class="place-chips">${placeLinks}</div>
         </div>`
      : "";

    const drones = d.drones && d.drones.length
      ? `<div class="card acc-${d.n}" style="margin-top:var(--sp-4)">
           <div class="section-label" style="margin-top:0">📸 Drone / photo spots</div>
           <div class="row wrap">${d.drones.map((x) => `<span class="chip chip--muted">${esc(x)}</span>`).join("")}</div>
         </div>` : "";

    return `
      <section class="view acc-${d.n}">
        <div class="dayphoto" id="dayphoto-${d.n}" data-photo-day="${d.n}" style="display:none"></div>
        <div class="hero" style="padding-bottom:var(--sp-3)">
          <div class="hero__eyebrow">Day ${d.n} · ${fmtDate(d.date)}</div>
          <h1 class="hero__title">${esc(d.title)}</h1>
          <div class="day-route">${esc(d.route)}</div>
        </div>
        ${banner}
        ${d.note ? `<div class="daynote">ℹ️ ${esc(d.note)}</div>` : ""}
        ${mapCard}
        <ul class="timeline">${items}</ul>
        ${drones}
        <div class="card acc-${d.n} day-foot">
          <div class="row"><span class="tl__icon">🏨</span><div><b>Tonight:</b> ${esc(d.hotel)}</div></div>
        </div>
      </section>`;
  }

  /* ---------- Hotels ---------- */
  function hotels() {
    const cards = T.hotels.map((h) => `
        <div class="card stack">
          <div class="row row--between">
            <div><div class="hotel__name">${esc(h.name)}</div><div class="hotel__loc">${esc(h.location)} · ${h.nights} night${h.nights > 1 ? "s" : ""}</div></div>
            <span class="chip chip--muted">🌙 ${esc(h.night)}</span>
          </div>
          ${h.room ? `<div class="small muted">${esc(h.room)}</div>` : ""}
          ${h.url ? `<a class="btn btn--ghost" href="${esc(h.url)}" target="_blank" rel="noopener">Open website ↗</a>` : ""}
        </div>`).join("");
    return `<section class="view"><div class="hero" style="padding-bottom:var(--sp-3)"><h1 class="hero__title">Hotels</h1><div class="hero__meta">${T.hotels.length} stays across the route</div></div><div class="stack">${cards}</div></section>`;
  }

  /* ---------- Weather (live forecast via Open-Meteo, see app.js) ---------- */
  function weather() {
    // app.js fills #wxList after fetching; we render the seasonal fallback inline first.
    const seasonal = T.weather.map((w) => `
      <div class="weatherrow"><div><b>${esc(w.region)}</b><div class="caption ghost">${esc(w.note)}</div></div>
      <div class="weathertemp">${esc(w.hi)}<span class="ghost"> / ${esc(w.lo)}</span></div></div>`).join("");
    return `
      <section class="view">
        <div class="hero" style="padding-bottom:var(--sp-3)"><h1 class="hero__title">Weather</h1><div class="hero__meta">Live forecast for your trip dates (Open-Meteo)</div></div>
        <div id="wxList" class="stack"><div class="card center muted small">Loading forecast…</div></div>
        <div class="section-label">Typical June (seasonal average)</div>
        <div class="card">${seasonal}<div class="caption ghost" style="margin-top:8px">Shown when a live forecast isn't available yet.</div></div>
      </section>`;
  }

  /* ---------- Map ---------- */
  function map() {
    const rows = T.places.map((p) => `
      <a class="place" href="${mapsHref(p.name)}"${isIOS ? "" : ' target="_blank" rel="noopener"'}>
        <div class="place__thumb" data-thumb="${esc(p.name)}"></div>
        <div style="flex:1;min-width:0"><div class="place__name">${esc(p.name)}</div><div class="caption ghost">Day ${p.day}</div></div>
        <div class="caption" style="color:var(--accent);white-space:nowrap">Open ↗</div>
      </a>`).join("");
    const legend = T.days.map((d) => `<span class="legend"><i style="background:${dayColor(d.n)}"></i>Day ${d.n}</span>`).join("");
    const overview = `
      <div class="card" style="padding:var(--sp-3)">
        ${miniMapSVG(T.places, { colorByDay: true, connect: true, labels: false, accent: "var(--ink-ghost)", h: 240 })}
        <div class="row wrap" style="margin-top:var(--sp-3)">${legend}</div>
        <div class="caption ghost" style="margin-top:8px">Schematic route — positions are geographic but not for navigation.</div>
      </div>`;
    return `
      <section class="view">
        <div class="hero" style="padding-bottom:var(--sp-3)"><h1 class="hero__title">Map & stops</h1><div class="hero__meta">Interactive map needs internet · the schematic works offline</div></div>
        <div id="gmap" class="gmap" style="display:none"></div>
        <div id="mapFallback">${overview}</div>
        <div class="section-label">All stops</div>
        <div class="card" style="padding:0">${rows}</div>
      </section>`;
  }

  /* ---------- Info ---------- */
  function info() {
    const p = T.practical;
    const emergencies = p.emergency.map((e) => `<div class="roomrow"><span>${esc(e.label)}</span><span class="mono" style="font-weight:700">${esc(e.value)}</span></div>`).join("");
    const packing = p.packing.map((x, i) => {
      const k = `packing:${i}`;
      const checked = localStorage.getItem(k) === "1";
      return `<label><input type="checkbox" data-pack="${k}" ${checked ? "checked" : ""}><span>${esc(x)}</span></label>`;
    }).join("");
    return `
      <section class="view stack">
        <div class="hero" style="padding-bottom:0"><h1 class="hero__title">Info</h1></div>

        <div class="card stack">
          <div class="section-label" style="margin:0">💱 Currency converter</div>
          <div class="conv"><span class="conv__lbl">CHF</span><input id="convChf" type="number" inputmode="decimal" value="100"></div>
          <div class="conv"><span class="conv__lbl">SGD</span><input id="convSgd" type="number" inputmode="decimal" readonly></div>
          <div class="caption ghost">Rate ≈ 1 CHF = ${T.meta.chfToSgd} SGD (edit CHF to convert)</div>
        </div>

        <div class="card">
          <div class="section-label" style="margin-top:0">🌤️ Typical June weather</div>
          ${T.weather.map((w) => `<div class="weatherrow"><div><b>${esc(w.region)}</b><div class="caption ghost">${esc(w.note)}</div></div><div class="weathertemp">${esc(w.hi)}<span class="ghost"> / ${esc(w.lo)}</span></div></div>`).join("")}
          <div class="caption ghost" style="margin-top:8px">Seasonal averages — not a live forecast.</div>
        </div>

        <div class="card">
          <div class="section-label" style="margin-top:0">🗣️ Phrasebook</div>
          ${["de", "fr"].map((k) => { const p = T.phrasebook[k]; return `<div class="phrase"><div class="phrase__lbl">${esc(p.label)}</div>${p.rows.map((r) => `<div class="phraserow"><span class="muted">${esc(r[0])}</span><span class="mono">${esc(r[1])}</span></div>`).join("")}</div>`; }).join("")}
        </div>

        <div class="card">
          <div class="section-label" style="margin-top:0">🆘 Emergency numbers</div>
          <div class="rooms">${emergencies}</div>
        </div>

        <div class="card">
          <div class="section-label" style="margin-top:0">🧳 Packing checklist</div>
          <div class="checklist">${packing}</div>
        </div>

        <div class="card">
          <div class="section-label" style="margin-top:0">📸 Drones</div>
          <p class="small muted">${esc(p.droneNote)}</p>
        </div>

        <div class="card">
          <div class="section-label" style="margin-top:0">🚗 Rental car</div>
          <dl class="kv">
            <dt>Company</dt><dd>${esc(T.car.company)}</dd>
            <dt>Pick-up</dt><dd>${esc(T.car.pickup)}</dd>
            ${T.car.returns.map((r) => `<dt>Return</dt><dd>${esc(r.who)}: ${esc(r.value)}</dd>`).join("")}
          </dl>
        </div>

        <p class="caption ghost center">Built offline-first · install to your home screen for the trip.</p>
      </section>`;
  }

  window.Views = { home, day, hotels, weather, map, info };
})();
