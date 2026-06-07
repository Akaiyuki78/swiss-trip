/* Tiny hash router — now trip-aware.
   #/                      → trips hub (list all trips)
   #/<tripId>              → that trip's home (day list)
   #/<tripId>/day/N        → day detail
   #/<tripId>/hotels|map|weather|info
   Legacy #/day/N etc. (no trip id) redirect to the first/most-recent trip. */
(function () {
  const app = document.getElementById("app");
  const nav = document.getElementById("nav");

  const knownTrip = (id) => !!(window.TRIPS && window.TRIPS[id]);

  // which day is "today" in the ACTIVE trip (only during the trip)
  function todayDayNumber() {
    if (!window.TRIP) return null;
    const t = new Date();
    const iso = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    const d = window.TRIP.days.find((x) => x.date === iso);
    return d ? d.n : null;
  }

  // fallback trip id when a legacy (trip-less) route is used
  function defaultTripId() {
    const ids = Object.keys(window.TRIPS || {});
    return ids.length ? ids[0] : null;
  }

  function render() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\/?/, "").split("/").filter((s) => s !== "");
    // parts: [] = hub; [tripId, sub?, arg?]; or legacy [sub, arg?]

    // --- hub (no trip selected) ---
    if (parts.length === 0) {
      window.setActiveTrip(null);
      app.innerHTML = Views.hub();
      window.scrollTo(0, 0);
      window.dispatchEvent(new CustomEvent("view:rendered", { detail: { route: "hub" } }));
      return;
    }

    // --- resolve trip id (with legacy fallback) ---
    let tripId, sub, arg;
    if (knownTrip(parts[0])) {
      tripId = parts[0]; sub = parts[1] || ""; arg = parts[2];
    } else {
      // legacy route like #/day/3 or #/map — attach to the default trip
      tripId = defaultTripId(); sub = parts[0] || ""; arg = parts[1];
      if (tripId) { location.replace("#/" + tripId + (sub ? "/" + sub : "/") + (arg ? "/" + arg : "")); return; }
    }
    if (!tripId) { app.innerHTML = Views.hub(); return; }

    window.setActiveTrip(tripId);

    let html, route = sub || "home";
    if (sub === "" || sub === "home") { html = Views.home(todayDayNumber()); route = "home"; }
    else if (sub === "day") html = Views.day(arg);
    else if (sub === "hotels") html = Views.hotels();
    else if (sub === "weather") html = Views.weather();
    else if (sub === "map") html = Views.map();
    else if (sub === "info") html = Views.info();
    else { html = Views.home(todayDayNumber()); route = "home"; }

    app.innerHTML = html;
    window.scrollTo(0, 0);

    // nav active state — compare against the bare route name
    const activeRoute = (route === "day") ? "home" : route;
    nav.querySelectorAll(".nav__item").forEach((a) =>
      a.classList.toggle("is-active", (a.dataset.route || "") === (activeRoute === "home" ? "" : activeRoute)));

    window.dispatchEvent(new CustomEvent("view:rendered", { detail: { route } }));
  }

  window.Router = { render, todayDayNumber };
  window.addEventListener("hashchange", render);
})();
