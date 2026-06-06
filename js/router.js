/* Tiny hash router. */
(function () {
  const app = document.getElementById("app");
  const nav = document.getElementById("nav");

  // which day is "today" (only during the trip)
  function todayDayNumber() {
    const t = new Date();
    const iso = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    const d = window.TRIP.days.find((x) => x.date === iso);
    return d ? d.n : null;
  }

  function render() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\//, "").split("/");
    let html, navKey = hash;

    if (parts[0] === "" ) { html = Views.home(todayDayNumber()); navKey = "#/"; }
    else if (parts[0] === "day") { html = Views.day(parts[1]); navKey = "#/"; }
    else if (parts[0] === "hotels") html = Views.hotels();
    else if (parts[0] === "weather") html = Views.weather();
    else if (parts[0] === "map") html = Views.map();
    else if (parts[0] === "info") html = Views.info();
    else { html = Views.home(todayDayNumber()); navKey = "#/"; }

    app.innerHTML = html;
    window.scrollTo(0, 0);

    // nav active state
    nav.querySelectorAll(".nav__item").forEach((a) =>
      a.classList.toggle("is-active", a.dataset.route === navKey));

    // let app.js wire up per-view interactions
    window.dispatchEvent(new CustomEvent("view:rendered", { detail: { route: parts[0] || "home" } }));
  }

  window.Router = { render, todayDayNumber };
  window.addEventListener("hashchange", render);
})();
