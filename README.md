# Switzerland 2026 — Itinerary

A clean, installable itinerary web app for an 8-day Switzerland road trip (13–20 Jun 2026):
day-by-day timeline, hotels, an interactive map, and a **live weather forecast**. Built as a
plain static site (no framework, no build step) and deployed on GitHub Pages.

> This is the **public** version — all personal details (prices, booking confirmations, flight
> references, names) have been removed. The full private copy is kept off this repo.

## Features
- **Days** — hour-by-hour timeline per day with drives, cable cars, meals and sights; tick
  activities off; today's day auto-opens during the trip.
- **Hotels** — names, locations, nights and website links.
- **Map** — interactive Google Map with a marker per stop (+ an offline SVG route map fallback).
- **Weather** — live forecast for the trip dates via [Open-Meteo](https://open-meteo.com)
  (no key needed), with seasonal averages as a fallback.
- **Info** — packing checklist, emergency numbers, currency converter, German/French phrasebook.
- Installable PWA, works offline for the core itinerary (service worker).

## Enabling the map & photos (Google Maps API)
The map and per-day photos use Google's API. Without a key the site still works (it shows the
offline SVG route map and no photos). To enable them:

1. In [Google Cloud Console](https://console.cloud.google.com/): create a project and
   **enable billing** (required even for the free tier).
2. Enable two APIs: **Maps JavaScript API** and **Places API (New)**.
3. Create an **API key**, then **restrict it**:
   - *Application restrictions* → **HTTP referrers** → add `https://akaiyuki78.github.io/*`
   - *API restrictions* → limit to the two APIs above.
4. Paste the key into [`js/config.js`](js/config.js):
   ```js
   const CONFIG = { googleMapsApiKey: "AIza…", enablePhotos: true };
   ```
5. Set a **budget alert** in Cloud Billing. Photos are capped at one per day and cached to
   keep usage tiny; set `enablePhotos: false` to disable them entirely.

The key is visible in the page source (unavoidable for a static site) — the **referrer
restriction** is what protects it, so don't skip step 3.

## Run locally
```bash
python -m http.server 8123    # then open http://localhost:8123
```

## Deploy (GitHub Pages)
Already wired via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
1. Push to a **public** repo's `main` branch.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Site goes live at `https://akaiyuki78.github.io/swiss-trip/`.

## Editing
All content is in [`js/data.js`](js/data.js) (one `TRIP` object). After editing, bump `CACHE`
in [`sw.js`](sw.js) so installed copies refresh.
