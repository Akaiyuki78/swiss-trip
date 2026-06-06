/* ============================================================
   Site configuration.
   Paste your Google Maps API key below to enable the interactive
   map and per-day photos. Leave it empty to use the free offline
   route map instead (the site still works without a key).

   IMPORTANT (public site): in Google Cloud, restrict this key by
   HTTP referrer to your Pages domain, e.g.
     https://akaiyuki78.github.io/*
   and enable the "Maps JavaScript API" + "Places API (New)".
   Keep a billing budget alert on.
   ============================================================ */
const CONFIG = {
  googleMapsApiKey: "",   // e.g. "AIzaSy..."
  enablePhotos: true,     // set false to disable per-day Google photos
};
window.CONFIG = CONFIG;
