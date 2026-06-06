/* Pre-renders all views to static HTML for the offline single-file build.
   Run: node prerender.js  → writes prerendered.json
   Requires: npm install jsdom  (one-time) */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const root = __dirname;

// Minimal DOM environment
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", { url: "http://localhost/" });
const { window } = dom;
global.window = window;
global.document = window.document;
global.localStorage = { _d: {}, getItem(k){ return this._d[k]||null; }, setItem(){}, removeItem(){} };
global.navigator = { onLine: true };
global.location = { hash: "#/" };
global.performance = { getEntriesByType: () => [] };
global.CustomEvent = window.CustomEvent;

// Load data + views
eval(fs.readFileSync(path.join(root, "js/data.js"), "utf8"));
// patch window.TRIP into global
global.TRIP = window.TRIP;
eval(fs.readFileSync(path.join(root, "js/views.js"), "utf8"));
const V = window.Views;

const out = {};
// Home (no today highlight — pre-trip)
out.home = V.home(null);
// All 8 days
for (const d of window.TRIP.days) {
  out[`day_${d.n}`] = V.day(d.n);
}
out.hotels  = V.hotels();
out.bookings = V.bookings();
out.map     = V.map();
out.info    = V.info();

fs.writeFileSync(path.join(root, "prerendered.json"), JSON.stringify(out, null, 2));
console.log("prerendered.json written —", Object.keys(out).length, "views");
