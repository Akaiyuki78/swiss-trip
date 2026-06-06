#!/usr/bin/env python3
"""Build swiss-trip.html — a single self-contained offline file.

All views are pre-rendered to static HTML (works on iOS Quick Look /
any browser with JS disabled). JS progressively enhances: tab switching,
search, check-offs, converter, today-detection, Now/Next.

Usage: python build_single.py
Requires: node + jsdom installed (npm install jsdom --save-dev)
"""
import base64, json, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).parent
read = lambda p: (ROOT / p).read_text(encoding="utf-8")
b64  = lambda p: base64.b64encode((ROOT / p).read_bytes()).decode()

# ── Step 1: pre-render all views with Node ──────────────────────────────────
print("Pre-rendering views…")
result = subprocess.run(
    ["node", "prerender.js"],
    cwd=ROOT, capture_output=True, text=True
)
if result.returncode != 0:
    print("prerender.js failed:\n", result.stderr); sys.exit(1)
print(" ", result.stdout.strip())
views = json.loads((ROOT / "prerendered.json").read_text(encoding="utf-8"))

# ── Step 2: build CSS (fonts inlined as data URIs) ──────────────────────────
fonts_css = read("css/fonts.css")
for name, path in [("dm-serif-display", "fonts/dm-serif-display.woff2"),
                   ("figtree",           "fonts/figtree.woff2")]:
    fonts_css = re.sub(
        r'url\(["\']?\.\./fonts/' + name + r'\.woff2["\']?\)',
        f'url(data:font/woff2;base64,{b64(path)})',
        fonts_css
    )
style = "\n".join([fonts_css,
                   read("css/tokens.css"),
                   read("css/base.css"),
                   read("css/trip.css")])

# ── Step 3: tiny enhancement JS (show/hide + interactions) ──────────────────
# We no longer need views.js or router.js at runtime.
# app.js handles theme, today-detection, and per-view interactions.
# We add a minimal router that shows/hides the pre-rendered panels.
enhance_js = r"""
(function(){
  /* ── clipboard ── */
  function copyText(t){
    if(navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(t);
    var ta=document.createElement('textarea'); ta.value=t;
    ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try{document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta);
  }

  /* ── theme ── */
  var savedTheme=localStorage.getItem('theme');
  if(savedTheme) document.documentElement.setAttribute('data-theme',savedTheme);

  function ensureThemeToggle(){
    if(document.getElementById('themeBtn')) return;
    var btn=document.createElement('button');
    btn.id='themeBtn'; btn.className='icon-btn';
    btn.style.cssText='position:fixed;top:12px;right:12px;z-index:80';
    btn.setAttribute('aria-label','Toggle theme');
    btn.textContent=document.documentElement.getAttribute('data-theme')==='light'?'🌙':'☀️';
    btn.addEventListener('click',function(){
      var next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme',next);
      localStorage.setItem('theme',next);
      btn.textContent=next==='light'?'🌙':'☀️';
    });
    document.body.appendChild(btn);
  }

  /* ── today detection ── */
  function todayDayN(){
    var t=new Date();
    var iso=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');
    var days=window.TRIP?window.TRIP.days:[];
    var d=days.find(function(x){return x.date===iso;});
    return d?d.n:null;
  }

  /* ── now/next (inject into home panel) ── */
  function HM(t){var p=String(t).split(':').map(Number);return p[0]*60+(p[1]||0);}
  function toISO(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function buildNowNext(){
    if(!window.TRIP) return '';
    var now=new Date(), m=now.getHours()*60+now.getMinutes(), iso=toISO(now);
    var T=window.TRIP;
    var start=new Date(T.meta.startDate+'T00:00:00');
    var end=new Date(T.days[T.days.length-1].date+'T23:59:59');
    if(now<start){
      var days=Math.ceil((start-now)/86400000);
      return '<a class="card nownext acc-4" href="#/day/1"><div class="nownext__lbl">Countdown</div>'
        +'<div class="nownext__big">'+days+' day'+(days===1?'':'s')+' to go ✈️</div>'
        +'<div class="muted small">Until Switzerland · tap to preview Day 1</div></a>';
    }
    if(now>end) return '<div class="card"><div class="nownext__lbl">Trip complete 🎉</div>'
      +'<div class="muted small">Hope it was unforgettable.</div></div>';
    var day=T.days.find(function(d){return d.date===iso;});
    if(!day) return '';
    var cur=null;
    day.segments.forEach(function(sg){if(HM(sg.t)<=m)cur=sg;});
    var next=day.segments.find(function(sg){return HM(sg.t)>m;})||null;
    function row(sg,cls){
      return sg?'<div class="nownext__row '+cls+'"><span class="nownext__time">'+sg.t+'</span><span>'+sg.act+'</span></div>'
               :'<div class="muted small">'+(cls.indexOf('next')>-1?'That\'s a wrap for today.':'Day starts soon…')+'</div>';
    }
    return '<a class="card nownext acc-'+day.n+'" href="#/day/'+day.n+'">'
      +'<div class="nownext__lbl">Now · Day '+day.n+'</div>'+row(cur,'')
      +'<div class="nownext__lbl" style="margin-top:10px">Up next</div>'+row(next,'nownext__row--next')+'</a>';
  }

  /* ── router: show/hide pre-rendered panels ── */
  var panels={}, navLinks=[];
  function init(){
    document.querySelectorAll('[data-panel]').forEach(function(el){
      panels[el.dataset.panel]=el;
    });
    navLinks=Array.from(document.querySelectorAll('.nav__item'));

    // inject live now/next into home
    var nn=buildNowNext();
    if(nn){
      var hero=document.querySelector('[data-panel="home"] .hero');
      if(hero){var div=document.createElement('div');div.innerHTML=nn;hero.after(div.firstChild);}
    }

    // mark today's day card
    var n=todayDayN();
    if(n){
      var card=document.querySelector('[data-panel="home"] [href="#/day/'+n+'"]');
      if(card) card.classList.add('is-today');
    }

    // restore saved check-offs on whichever day panels exist
    document.querySelectorAll('.tl[data-key]').forEach(function(li){
      if(localStorage.getItem(li.dataset.key)==='1') li.classList.add('is-done');
    });

    window.addEventListener('hashchange',route);
    route();
  }

  function route(){
    var hash=location.hash||'#/';
    var parts=hash.replace(/^#\//,'').split('/');
    var show;
    if(!parts[0]||parts[0]==='')          show='home';
    else if(parts[0]==='day')              show='day_'+parts[1];
    else if(panels[parts[0]])              show=parts[0];
    else                                   show='home';

    Object.keys(panels).forEach(function(k){
      panels[k].style.display= k===show?'':'none';
    });
    window.scrollTo(0,0);

    // nav active
    navLinks.forEach(function(a){
      var r=a.dataset.route;
      a.classList.toggle('is-active',
        r==='#/'? (show==='home'):
        r==='#/hotels'?   show==='hotels':
        r==='#/bookings'? show==='bookings':
        r==='#/map'?      show==='map':
        r==='#/info'?     show==='info': false);
    });

    wireView(show);
  }

  /* ── per-view interactions ── */
  function wireView(show){
    if(show==='bookings'){
      var search=document.getElementById('bookSearch');
      var list=document.getElementById('bookList');
      if(search && !search._wired){
        search._wired=true;
        search.addEventListener('input',function(){
          var q=search.value.trim().toLowerCase();
          list.querySelectorAll('.booking').forEach(function(row){
            row.style.display=(!q||row.dataset.search.includes(q))?'':'none';
          });
          list.querySelectorAll('[data-group]').forEach(function(h){
            var next=h.nextElementSibling, any=false;
            if(next) next.querySelectorAll('.booking').forEach(function(r){if(r.style.display!=='none')any=true;});
            h.style.display=any?'':'none';
          });
        });
      }
      if(list && !list._wired){
        list._wired=true;
        list.addEventListener('click',function(ev){
          var b=ev.target.closest('[data-copy]'); if(!b) return;
          copyText(b.dataset.copy);
          var old=b.textContent; b.textContent='Copied ✓';
          setTimeout(function(){b.textContent=old;},1200);
        });
      }
    }

    if(show.startsWith('day_')){
      document.querySelectorAll('#panel-'+show+' .tl, [data-panel="'+show+'"] .tl').forEach(function(li){
        if(li._wired) return; li._wired=true;
        li.addEventListener('click',function(ev){
          if(ev.target.closest('a')) return;
          var key=li.dataset.key; if(!key) return;
          var now=localStorage.getItem(key)==='1'?'0':'1';
          localStorage.setItem(key,now);
          li.classList.toggle('is-done',now==='1');
          var chk=li.querySelector('.tl__check');
          if(chk) chk.textContent=now==='1'?'✓':'';
        });
      });
    }

    if(show==='info'){
      var chf=document.getElementById('convChf'), sgd=document.getElementById('convSgd');
      var rate=window.TRIP?window.TRIP.meta.chfToSgd:1.63;
      if(chf && !chf._wired){
        chf._wired=true;
        function conv(){sgd.value=chf.value?(parseFloat(chf.value)*rate).toFixed(2):'';}
        chf.addEventListener('input',conv); conv();
      }
      document.querySelectorAll('[data-pack]').forEach(function(cb){
        if(cb._wired) return; cb._wired=true;
        if(localStorage.getItem(cb.dataset.pack)==='1') cb.checked=true;
        cb.addEventListener('change',function(){localStorage.setItem(cb.dataset.pack,cb.checked?'1':'0');});
      });
    }
  }

  /* ── offline banner ── */
  var pill=document.getElementById('offlinePill');
  function updateOnline(){if(pill) pill.classList.toggle('show',!navigator.onLine);}
  window.addEventListener('online',updateOnline);
  window.addEventListener('offline',updateOnline);

  /* ── boot ── */
  ensureThemeToggle();
  // auto-open today's day on first load during trip
  if(!location.hash||location.hash==='#/'||location.hash==='#'){
    var n=todayDayN();
    if(n) location.replace('#/day/'+n);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',function(){init();updateOnline();});
  } else {
    init(); updateOnline();
  }
})();
"""

# ── Step 4: wrap each view in a data-panel div ──────────────────────────────
def panel(key, html):
    return f'<div data-panel="{key}" style="display:none">\n{html}\n</div>\n'

panels_html = panel("home", views["home"])
for i in range(1, 9):
    panels_html += panel(f"day_{i}", views[f"day_{i}"])
panels_html += panel("hotels",   views["hotels"])
panels_html += panel("bookings", views["bookings"])
panels_html += panel("map",      views["map"])
panels_html += panel("info",     views["info"])

# ── Step 5: assemble final HTML ──────────────────────────────────────────────
icon_uri = f"data:image/png;base64,{b64('icons/icon-192.png')}"

html = f"""<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>Switzerland 2026</title>
  <meta name="description" content="8-day Switzerland road-trip itinerary, June 2026." />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Switzerland" />
  <link rel="apple-touch-icon" href="{icon_uri}" />
  <link rel="icon" href="{icon_uri}" />
  <style>
{style}
  </style>
</head>
<body>
  <main id="app">
{panels_html}
  </main>

  <nav class="nav" id="nav">
    <a class="nav__item is-active" data-route="#/"        href="#/"><span class="ico">🗓️</span>Days</a>
    <a class="nav__item"           data-route="#/hotels"  href="#/hotels"><span class="ico">🏨</span>Hotels</a>
    <a class="nav__item"           data-route="#/bookings" href="#/bookings"><span class="ico">🎟️</span>Bookings</a>
    <a class="nav__item"           data-route="#/map"     href="#/map"><span class="ico">🗺️</span>Map</a>
    <a class="nav__item"           data-route="#/info"    href="#/info"><span class="ico">ℹ️</span>Info</a>
  </nav>

  <div class="offline-pill" id="offlinePill">Offline — showing saved itinerary</div>

  <!-- Trip data (needed for live Now/Next and converter rate) -->
  <script>
{read('js/data.js')}
  </script>
  <!-- Progressive enhancement: tab switching, interactions -->
  <script>
{enhance_js}
  </script>
</body>
</html>"""

out = ROOT / "swiss-trip.html"
out.write_text(html, encoding="utf-8")
kb = out.stat().st_size / 1024
print(f"wrote swiss-trip.html  ({kb:.0f} KB)")
print("  Pre-rendered static HTML - works on iOS without JavaScript.")
