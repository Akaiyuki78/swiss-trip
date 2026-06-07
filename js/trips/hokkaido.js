/* ============================================================
   Hokkaido 2026 — itinerary stub. Fill in via the build-trip-pwa
   skill once the itinerary is confirmed. The hub lists it now
   so the structure is in place.
   ============================================================ */
window.TRIPS = window.TRIPS || {};
window.TRIPS.hokkaido = {
  meta: {
    id: "hokkaido",
    emoji: "🏔️",
    country: "Japan",
    title: "Hokkaido 2026",
    subtitle: "Winter trip — itinerary coming soon",
    startDate: "2026-12-18",
    endDate: "2026-12-24",
    chfToSgd: 1.0,   // placeholder; switch to JPY→SGD and relabel converter when filling in
    note: "Placeholder — day-by-day plan to be added closer to the trip.",
  },

  regions: {
    sapporo: { label: "Sapporo & central Hokkaido", lat: 43.0618, lng: 141.3545 },
  },

  flights: [],
  car: { company: "Rental car (winter tyres)", pickup: "—", returns: [{ who: "Drop-off", value: "—" }] },
  hotels: [],
  days: [],
  restaurants: [],
  places: [],
  weather: [
    { region: "Sapporo & central Hokkaido", hi: "-1°C", lo: "-7°C", note: "Deep winter — snow, ice and short days. Serious cold-weather gear, waterproof boots and grips essential." },
  ],
  phrasebook: {
    ja: {
      label: "Japanese",
      rows: [
        ["Hello", "Konnichiwa"], ["Thank you", "Arigatō"], ["Excuse me / sorry", "Sumimasen"],
        ["Yes / No", "Hai / Iie"], ["How much?", "Ikura desu ka?"], ["The bill, please", "Okaikei onegaishimasu"],
        ["It's cold!", "Samui!"], ["Delicious", "Oishii"], ["Where is…?", "…wa doko desu ka?"], ["Goodbye", "Sayōnara"],
      ],
    },
  },
  practical: {
    emergency: [
      { label: "Police", value: "110" },
      { label: "Fire / Ambulance", value: "119" },
      { label: "Japan Visitor Hotline (24h)", value: "+81 50 3816 2787" },
    ],
    packing: [
      "Insulated winter coat + thermals", "Waterproof snow boots + ice grips", "Gloves, beanie, scarf",
      "Hand/foot warmers", "Lip balm + moisturiser (dry cold)", "Type-A power adapter",
      "Snow-driving confidence / check rental winter tyres",
    ],
    droneNote: "Rural Hokkaido is more drone-friendly than cities, but check ski-resort and national-park rules and Japan's registration/altitude limits before flying.",
  },
};
