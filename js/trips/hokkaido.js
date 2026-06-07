/* ============================================================
   Hokkaido 2026/27 — Niseko ski week (public itinerary).
   Mostly a skeleton for now — ski days to be detailed later.
   Registered on window.TRIPS so the hub can list it.
   ============================================================ */
window.TRIPS = window.TRIPS || {};
window.TRIPS.hokkaido = {
  meta: {
    id: "hokkaido",
    emoji: "🎿",
    country: "Japan",
    currency: "JPY",
    title: "Hokkaido 2026",
    subtitle: "Niseko ski week",
    startDate: "2026-12-25",
    endDate: "2027-01-02",
    chfToSgd: 0.0089,   // JPY → SGD (≈ 1 JPY = 0.0089 SGD)
    note: "A week of powder at Niseko United — staying at Alpen Ridge in Grand Hirafu over New Year.",
  },

  regions: {
    niseko: { label: "Niseko", lat: 42.8048, lng: 140.6874 },
  },

  flights: [],

  car: {
    company: "No car — airport transfer + resort shuttles",
    pickup: "Airport coach: New Chitose (CTS) → Niseko Welcome Centre",
    returns: [{ who: "Getting around", value: "Niseko United village shuttles; coach back to CTS on departure" }],
  },

  hotels: [
    { name: "Alpen Ridge", location: "Niseko (Grand Hirafu)", nights: 7, night: "26 Dec – 1 Jan",
      url: "", room: "Ski-in/ski-out base, Grand Hirafu",
      phone: "", addr: "Niseko Grand Hirafu, Kutchan, Abuta District, Hokkaido" },
  ],

  days: [
    {
      n: 1, date: "2026-12-25", dow: "Fri", title: "Depart for Hokkaido", region: "niseko",
      route: "Singapore ✈ Japan · overnight",
      hotel: "Overnight flight",
      drones: [],
      segments: [
        { t: "22:00", type: "flight", act: "Evening flight from Singapore", note: "Overnight; arrive Japan Saturday." },
      ],
    },
    {
      n: 2, date: "2026-12-26", dow: "Sat", title: "Arrival & transfer to Niseko", region: "niseko",
      route: "New Chitose Airport → Niseko Welcome Centre → Alpen Ridge",
      hotel: "Alpen Ridge (Niseko)",
      drones: [],
      segments: [
        { t: "10:00", type: "flight", act: "Arrive New Chitose Airport (CTS)", note: "Serves Sapporo." },
        { t: "11:30", type: "drive", act: "Airport coach: New Chitose (CTS) → Niseko Welcome Centre", note: "~2.5–3 h by transfer coach. Pre-book the Niseko shuttle/limousine bus." },
        { t: "14:30", type: "drive", act: "Niseko Welcome Centre → Alpen Ridge", note: "Short village shuttle / taxi to Grand Hirafu." },
        { t: "15:30", type: "hotel", act: "Check in at Alpen Ridge; collect rental gear / lift passes" },
      ],
    },
    { n: 3, date: "2026-12-27", dow: "Sun", title: "Ski day 1", region: "niseko",
      route: "Niseko United — Grand Hirafu", hotel: "Alpen Ridge (Niseko)", drones: [],
      segments: [{ t: "09:00", type: "play", act: "Ski day 1 — Niseko United (Grand Hirafu)" }] },
    { n: 4, date: "2026-12-28", dow: "Mon", title: "Ski day 2", region: "niseko",
      route: "Niseko United", hotel: "Alpen Ridge (Niseko)", drones: [],
      segments: [{ t: "09:00", type: "play", act: "Ski day 2 — Niseko United" }] },
    { n: 5, date: "2026-12-29", dow: "Tue", title: "Ski day 3", region: "niseko",
      route: "Niseko United", hotel: "Alpen Ridge (Niseko)", drones: [],
      segments: [{ t: "09:00", type: "play", act: "Ski day 3 — Niseko United" }] },
    { n: 6, date: "2026-12-30", dow: "Wed", title: "Ski day 4", region: "niseko",
      route: "Niseko United", hotel: "Alpen Ridge (Niseko)", drones: [],
      segments: [{ t: "09:00", type: "play", act: "Ski day 4 — Niseko United" }] },
    { n: 7, date: "2026-12-31", dow: "Thu", title: "Ski day 5 · New Year's Eve", region: "niseko",
      route: "Niseko United · NYE in Hirafu", hotel: "Alpen Ridge (Niseko)", drones: [],
      segments: [{ t: "09:00", type: "play", act: "Ski day 5 — Niseko United" }, { t: "20:00", type: "free", act: "New Year's Eve in Hirafu village" }] },
    { n: 8, date: "2027-01-01", dow: "Fri", title: "Ski day 6 · New Year's Day", region: "niseko",
      route: "Niseko United", hotel: "Alpen Ridge (Niseko)", drones: [],
      segments: [{ t: "09:00", type: "play", act: "Ski day 6 — Niseko United" }] },
    {
      n: 9, date: "2027-01-02", dow: "Sat", title: "Transfer out · fly home", region: "niseko",
      route: "Niseko → New Chitose → Singapore",
      hotel: "Return flight",
      drones: [],
      segments: [
        { t: "08:00", type: "hotel", act: "Check out of Alpen Ridge; return rental gear" },
        { t: "09:00", type: "drive", act: "Coach: Niseko → New Chitose Airport (CTS)", note: "~2.5–3 h; allow buffer for winter roads." },
        { t: "13:00", type: "flight", act: "Fly New Chitose → Singapore", note: "May connect via Tokyo. Arrive SG same day / overnight." },
      ],
    },
  ],

  restaurants: [],

  places: [
    { name: "New Chitose Airport", day: 2, lat: 42.7752, lng: 141.6923 },
    { name: "Niseko Grand Hirafu", day: 3, lat: 42.8615, lng: 140.6993 },
  ],

  weather: [
    { region: "Niseko", hi: "-3°C", lo: "-9°C", note: "Deep winter, world-famous powder. Frequent heavy snow and short days — full cold-weather and waterproof gear essential." },
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
      "Insulated ski jacket + trousers", "Thermal base layers", "Waterproof snow boots + après footwear",
      "Goggles, helmet, gloves, neck warmer", "Hand/foot warmers", "Lip balm + heavy moisturiser (dry cold)",
      "Sunscreen (snow glare)", "Type-A power adapter", "Passport + travel insurance with wintersports cover",
    ],
    droneNote: "Check Niseko United / resort and Japanese CAA rules before flying — ski areas and lifts are generally no-fly. Rural backcountry may be allowed with registration; verify locally.",
  },
};
