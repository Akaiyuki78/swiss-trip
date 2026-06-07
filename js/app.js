/* Boot, theme, today auto-open, per-view interactions, SW registration. */
(function () {
  /* ---- clipboard (works on https AND local file://) ---- */
  function copyText(t) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    const ta = document.createElement("textarea");
    ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  /* ---- theme ---- */
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) document.documentElement.setAttribute("data-theme", savedTheme);

  function ensureThemeToggle() {
    // add a floating theme button into each topbar-less view via the nav area once
    if (document.getElementById("themeBtn")) return;
    const btn = document.createElement("button");
    btn.id = "themeBtn";
    btn.className = "icon-btn";
    btn.style.cssText = "position:fixed;top:12px;right:12px;z-index:80";
    btn.setAttribute("aria-label", "Toggle theme");
    btn.textContent = document.documentElement.getAttribute("data-theme") === "light" ? "🌙" : "☀️";
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      btn.textContent = next === "light" ? "🌙" : "☀️";
    });
    document.body.appendChild(btn);
  }

  /* ---- multi-trip: default trip, active-trip switch, back-to-hub button ---- */
  const NAV_ROUTES = ["", "hotels", "map", "weather", "info"];

  // Which trip opens by default. User's saved choice wins; otherwise pick the
  // smartest one: a trip happening today, else the next upcoming, else the latest.
  window.getDefaultTripId = function () {
    const trips = window.TRIPS || {};
    const ids = Object.keys(trips);
    if (!ids.length) return null;
    const saved = localStorage.getItem("defaultTripId");
    if (saved && trips[saved]) return saved;
    const today = new Date().toISOString().slice(0, 10);
    const byDate = ids.slice().sort((a, b) => trips[a].meta.startDate.localeCompare(trips[b].meta.startDate));
    const ongoing = byDate.find((id) => trips[id].meta.startDate <= today && today <= trips[id].meta.endDate);
    if (ongoing) return ongoing;
    const upcoming = byDate.find((id) => trips[id].meta.startDate >= today);
    return upcoming || byDate[byDate.length - 1];
  };
  window.setDefaultTripId = function (id) {
    if (window.TRIPS && window.TRIPS[id]) localStorage.setItem("defaultTripId", id);
  };
  // Point window.TRIP at the chosen trip and reflect it in title + nav.
  // Pass null on the hub (no active trip): hide the bottom nav.
  window.setActiveTrip = function (id) {
    const nav = document.getElementById("nav");
    if (!id || !(window.TRIPS && window.TRIPS[id])) {
      window.ACTIVE_TRIP_ID = null;
      document.title = "My Trips";
      if (nav) nav.style.display = "none";
      return;
    }
    window.ACTIVE_TRIP_ID = id;
    window.TRIP = window.TRIPS[id];
    document.title = window.TRIP.meta.title;
    if (nav) {
      nav.style.display = "";
      // rewrite each per-trip nav link to point inside the active trip;
      // the "Trips" tab (data-hub) always points at the hub, so skip it.
      nav.querySelectorAll(".nav__item").forEach((aEl) => {
        if (aEl.dataset.hub) return;
        const r = aEl.dataset.route || "";
        aEl.setAttribute("href", "#/" + id + "/" + (r ? r : ""));
      });
    }
  };

  /* ---- per-view interactions ---- */
  window.addEventListener("view:rendered", (e) => {
    const route = e.detail.route;

    // hub: open a trip on card tap; the ★ sets the default without navigating
    if (route === "hub") {
      document.querySelectorAll("[data-set-default]").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.preventDefault(); ev.stopPropagation();
          window.setDefaultTripId(btn.dataset.setDefault);
          window.Router.render();               // re-render hub to update the stars
        });
      });
      document.querySelectorAll("[data-trip-open]").forEach((card) => {
        const go = () => { location.hash = "#/" + card.dataset.tripOpen + "/"; };
        card.addEventListener("click", (ev) => { if (ev.target.closest("[data-set-default]")) return; go(); });
        card.addEventListener("keydown", (ev) => { if (ev.key === "Enter") go(); });
      });
    }

    // weather: live forecast
    if (route === "weather") loadWeather();

    // map: interactive Google map (falls back to SVG) + stop thumbnails
    if (route === "map") { loadGoogleMap(); loadPlaceThumbs(); }

    // hotels: load a Places photo thumbnail per hotel (same mechanism as map stops)
    if (route === "hotels") loadPlaceThumbs();

    // day: check-off toggles + photo
    if (route === "day") {
      document.querySelectorAll(".tl").forEach((li) => {
        li.addEventListener("click", (ev) => {
          if (ev.target.closest("a")) return;
          const key = li.dataset.key;
          const now = localStorage.getItem(key) === "1" ? "0" : "1";
          localStorage.setItem(key, now);
          li.classList.toggle("is-done", now === "1");
          const chk = li.querySelector(".tl__check");
          if (chk) chk.textContent = now === "1" ? "✓" : "";
        });
      });
      const slot = document.querySelector("[data-photo-day]");
      if (slot) loadDayPhoto(Number(slot.dataset.photoDay), slot);
      const dm = document.querySelector("[data-day-map]");
      if (dm) loadDayMap(Number(dm.dataset.dayMap));
    }

    // info: converter + packing persistence
    if (route === "info") {
      const chf = document.getElementById("convChf");
      const sgd = document.getElementById("convSgd");
      const rate = window.TRIP.meta.chfToSgd;
      const conv = () => { sgd.value = chf.value ? (parseFloat(chf.value) * rate).toFixed(2) : ""; };
      if (chf) { chf.addEventListener("input", conv); conv(); }
      document.querySelectorAll("[data-pack]").forEach((cb) =>
        cb.addEventListener("change", () => localStorage.setItem(cb.dataset.pack, cb.checked ? "1" : "0")));
    }
  });

  /* ---- small helpers ---- */
  function escHtml(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmtShort(iso){ var d=new Date(iso+"T00:00:00"); return d.toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}); }
  function wmo(code){
    var m={0:["☀️","Clear"],1:["🌤️","Mainly clear"],2:["⛅","Partly cloudy"],3:["☁️","Overcast"],
      45:["🌫️","Fog"],48:["🌫️","Rime fog"],51:["🌦️","Light drizzle"],53:["🌦️","Drizzle"],55:["🌧️","Heavy drizzle"],
      61:["🌦️","Light rain"],63:["🌧️","Rain"],65:["🌧️","Heavy rain"],71:["🌨️","Light snow"],73:["🌨️","Snow"],75:["❄️","Heavy snow"],
      80:["🌦️","Showers"],81:["🌧️","Showers"],82:["⛈️","Violent showers"],95:["⛈️","Thunderstorm"],96:["⛈️","Thunderstorm + hail"],99:["⛈️","Thunderstorm + hail"]};
    return m[code]||["🌡️","—"];
  }

  /* ---- Weather (Open-Meteo, no key) ---- */
  async function loadWeather(){
    var list=document.getElementById("wxList"); if(!list) return;
    var T=window.TRIP, start=T.meta.startDate, end=T.meta.endDate, regions=T.regions;
    var data={}, anyLive=false, usedCache=false;
    await Promise.all(Object.keys(regions).map(async function(rk){
      var r=regions[rk], cacheKey="wx:"+rk+":"+start+"_"+end;
      try{
        var url="https://api.open-meteo.com/v1/forecast?latitude="+r.lat+"&longitude="+r.lng
          +"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto"
          +"&start_date="+start+"&end_date="+end;
        var res=await fetch(url); var j=await res.json();
        if(j&&j.daily&&j.daily.time&&j.daily.time.length){
          data[rk]=j.daily; anyLive=true;
          localStorage.setItem(cacheKey,JSON.stringify({t:Date.now(),daily:j.daily}));
        } else throw new Error("no daily");
      }catch(e){
        var c=localStorage.getItem(cacheKey);
        if(c){ try{ data[rk]=JSON.parse(c).daily; usedCache=true; }catch(_){} }
      }
    }));
    if(!Object.keys(data).length){
      list.innerHTML='<div class="card muted small">Live forecast isn\'t available yet — it appears within ~16 days of the trip and needs internet. Seasonal averages are shown below.</div>';
      return;
    }
    function pick(rk,date){
      var d=data[rk]; if(!d) return null; var i=d.time.indexOf(date); if(i<0) return null;
      return { hi:Math.round(d.temperature_2m_max[i]), lo:Math.round(d.temperature_2m_min[i]),
               precip:d.precipitation_sum[i], code:d.weather_code[i] };
    }
    var cards=T.days.map(function(day){
      var w=pick(day.region,day.date); if(!w) return "";
      var label=regions[day.region]?regions[day.region].label:"";
      var wd=wmo(w.code);
      return '<div class="card wxcard"><div class="row row--between">'
        +'<div><div class="wxcard__day">Day '+day.n+' · '+fmtShort(day.date)+'</div>'
        +'<div class="wxcard__loc">'+escHtml(label)+'</div></div>'
        +'<div class="wxcard__emoji">'+wd[0]+'</div></div>'
        +'<div class="row row--between" style="margin-top:8px">'
        +'<div class="wxcard__desc">'+escHtml(wd[1])+'</div>'
        +'<div class="wxcard__temp">'+w.hi+'°<span class="ghost"> / '+w.lo+'°</span></div></div>'
        +(w.precip>0?'<div class="caption ghost" style="margin-top:4px">☔ '+w.precip+' mm</div>':'')
        +'</div>';
    }).filter(Boolean).join("");
    list.innerHTML='<div class="caption ghost" style="margin-bottom:8px">'
      +((usedCache&&!anyLive)?"Last saved forecast (offline).":"Live forecast · updates as the trip nears.")
      +'</div>'+cards;
  }

  /* ---- platform-aware Google Maps link (iOS app scheme vs web) ---- */
  var _isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  function mapsLink(query){
    var q = encodeURIComponent(query);
    var href = _isIOS ? "comgooglemaps://?q=" + q : "https://www.google.com/maps/search/?api=1&query=" + q;
    return '<a href="' + href + '"' + (_isIOS ? "" : ' target="_blank" rel="noopener"') + '>Open in Google Maps ↗</a>';
  }
  // active trip's country suffix for place searches (keeps results in the right country)
  function tripCountry(){ return (window.TRIP && window.TRIP.meta && window.TRIP.meta.country) ? ", " + window.TRIP.meta.country : ""; }

  /* ---- Google Maps (interactive; falls back to SVG) ---- */
  function initGMap(){
    var el=document.getElementById("gmap"), fb=document.getElementById("mapFallback");
    if(!el||!window.google||!google.maps) return;
    el.style.display="block"; if(fb) fb.style.display="none";
    var T=window.TRIP;
    var map=new google.maps.Map(el,{zoom:8,center:{lat:46.8,lng:8.0},mapTypeControl:false,streetViewControl:false});
    var b=new google.maps.LatLngBounds();
    T.places.forEach(function(p){
      var pos={lat:p.lat,lng:p.lng};
      var mk=new google.maps.Marker({position:pos,map:map,title:p.name,label:{text:String(p.day),color:"#fff",fontSize:"11px"}});
      var iw=new google.maps.InfoWindow({content:"<strong>"+escHtml(p.name)+"</strong><br>Day "+p.day+"<br>"+mapsLink(p.name+tripCountry())});
      mk.addListener("click",function(){iw.open(map,mk);});
      b.extend(pos);
    });
    map.fitBounds(b);
  }
  // shared one-time loader for the Maps JS API; runs queued callbacks once ready
  var _gmapReq=false, _gmapCbs=[];
  function ensureMapsApi(cb){
    var key=window.CONFIG&&window.CONFIG.googleMapsApiKey;
    if(!key){ console.warn("[Map] No API key in window.CONFIG — showing offline fallback."); return; }
    if(window.google&&window.google.maps){ cb(); return; }
    _gmapCbs.push(cb);
    if(_gmapReq) return; _gmapReq=true;
    window.__initGMap=function(){ _gmapCbs.splice(0).forEach(function(fn){ try{fn();}catch(e){} }); };
    var s=document.createElement("script");
    s.src="https://maps.googleapis.com/maps/api/js?key="+encodeURIComponent(key)+"&callback=__initGMap&loading=async";
    s.onerror=function(){ console.error("[Map] Failed to load Maps JS API — check key + referrer restriction + billing."); };
    s.async=true; document.head.appendChild(s);
  }
  function loadGoogleMap(){ ensureMapsApi(initGMap); }

  /* ---- Per-day interactive map (this day's stops only) ---- */
  function initDayMap(dayN){
    var el=document.getElementById("dayGmap"), fb=document.getElementById("dayMapFallback");
    if(!el||!window.google||!google.maps) return;
    var T=window.TRIP, pts=T.places.filter(function(p){return p.day===dayN;});
    if(!pts.length) return;
    el.style.display="block"; if(fb) fb.style.display="none";
    var map=new google.maps.Map(el,{zoom:11,center:{lat:pts[0].lat,lng:pts[0].lng},mapTypeControl:false,streetViewControl:false,fullscreenControl:false});
    var b=new google.maps.LatLngBounds();
    pts.forEach(function(p){
      var pos={lat:p.lat,lng:p.lng};
      var mk=new google.maps.Marker({position:pos,map:map,title:p.name});
      var iw=new google.maps.InfoWindow({content:"<strong>"+escHtml(p.name)+"</strong><br>"+mapsLink(p.name+tripCountry())});
      mk.addListener("click",function(){iw.open(map,mk);});
      b.extend(pos);
    });
    if(pts.length>1) map.fitBounds(b);
  }
  function loadDayMap(dayN){ ensureMapsApi(function(){ initDayMap(dayN); }); }

  /* ---- Per-day photo (Google Places Photos, cached) ---- */
  async function loadDayPhoto(dayN, slot){
    var cfg=window.CONFIG||{};
    if(!cfg.googleMapsApiKey||cfg.enablePhotos===false||!navigator.onLine) return;
    var T=window.TRIP;
    var first=T.places.find(function(p){return p.day===dayN;});
    var dayObj=T.days.find(function(d){return d.n===dayN;});
    var place=(first&&first.name)||(dayObj&&dayObj.title); if(!place) return;
    var ctry=(T.meta&&T.meta.country)?", "+T.meta.country:"";
    var q=place+ctry, cacheKey="photo:"+q;
    var photoName=localStorage.getItem(cacheKey);
    try{
      if(!photoName){
        var res=await fetch("https://places.googleapis.com/v1/places:searchText",{
          method:"POST",
          headers:{"Content-Type":"application/json","X-Goog-Api-Key":cfg.googleMapsApiKey,"X-Goog-FieldMask":"places.photos"},
          body:JSON.stringify({textQuery:q,maxResultCount:1})
        });
        var j=await res.json();
        var ph=j.places&&j.places[0]&&j.places[0].photos;
        if(ph&&ph.length){ photoName=ph[0].name; localStorage.setItem(cacheKey,photoName); }
      }
      if(photoName){
        var media="https://places.googleapis.com/v1/"+photoName+"/media?maxWidthPx=800&key="+encodeURIComponent(cfg.googleMapsApiKey);
        slot.style.display="block";
        slot.innerHTML='<img src="'+media+'" alt="'+escHtml(place)+'" loading="lazy"><div class="dayphoto__cap">'+escHtml(place)+'</div>';
      }
    }catch(e){ /* silent: no photo */ }
  }

  /* ---- Place thumbnails for the Map stops list ---- */
  async function loadPlaceThumbs(){
    var cfg=window.CONFIG||{};
    if(!cfg.googleMapsApiKey||cfg.enablePhotos===false||!navigator.onLine) return;
    var slots=document.querySelectorAll("[data-thumb]");
    var ctry=(window.TRIP&&window.TRIP.meta&&window.TRIP.meta.country)?", "+window.TRIP.meta.country:"";
    // load up to 6 at a time to avoid flooding the network
    async function loadOne(slot){
      var name=slot.dataset.thumb; if(!name||slot.dataset.loaded) return;
      slot.dataset.loaded="1";
      var q=name+ctry, cacheKey="photo:"+q;
      var photoName=localStorage.getItem(cacheKey);
      try{
        if(!photoName){
          var res=await fetch("https://places.googleapis.com/v1/places:searchText",{
            method:"POST",
            headers:{"Content-Type":"application/json","X-Goog-Api-Key":cfg.googleMapsApiKey,"X-Goog-FieldMask":"places.photos"},
            body:JSON.stringify({textQuery:q,maxResultCount:1})
          });
          var j=await res.json();
          var ph=j.places&&j.places[0]&&j.places[0].photos;
          if(ph&&ph.length){ photoName=ph[0].name; localStorage.setItem(cacheKey,photoName); }
        }
        if(photoName){
          var src="https://places.googleapis.com/v1/"+photoName+"/media?maxWidthPx=120&key="+encodeURIComponent(cfg.googleMapsApiKey);
          slot.innerHTML='<img src="'+src+'" alt="" loading="lazy" class="place__thumb-img">';
        }
      }catch(e){ /* silent */ }
    }
    // stagger: 6 concurrent, then rest
    var arr=Array.from(slots);
    for(var i=0;i<arr.length;i+=6){
      await Promise.all(arr.slice(i,i+6).map(loadOne));
    }
  }

  /* ---- offline indicator ---- */
  const pill = document.getElementById("offlinePill");
  const updateOnline = () => pill && pill.classList.toggle("show", !navigator.onLine);
  window.addEventListener("online", updateOnline);
  window.addEventListener("offline", updateOnline);

  /* ---- boot ---- */
  function boot() {
    ensureThemeToggle();
    // Fresh visit (no hash) → open the default trip directly, so you're not
    // forced through the hub every time. An explicit "#/" (the ← button) still
    // shows the hub, and deep links open their trip.
    if (!location.hash) {
      const def = window.getDefaultTripId();
      if (def) { location.replace("#/" + def + "/"); }
    }
    window.Router.render();
    updateOnline();
  }
  boot();

  /* ---- service worker ---- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((err) => console.warn("SW registration failed:", err));
    });
  }
})();
