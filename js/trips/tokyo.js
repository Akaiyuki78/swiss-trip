/* ============================================================
   Tokyo 2026 — itinerary stub. Fill in via the build-trip-pwa
   skill once the itinerary is confirmed. The hub lists it now
   so the structure is in place.
   ============================================================ */
window.TRIPS = window.TRIPS || {};
window.TRIPS.tokyo = {
  meta: {
    id: "tokyo",
    emoji: "🗼",
    country: "Japan",
    title: "Tokyo 2026",
    subtitle: "City break — itinerary coming soon",
    startDate: "2026-11-20",
    endDate: "2026-11-25",
    chfToSgd: 1.0,   // placeholder; switch to JPY→SGD and relabel converter when filling in
    note: "Placeholder — day-by-day plan to be added closer to the trip.",
  },

  regions: {
    tokyo: { label: "Tokyo", lat: 35.6762, lng: 139.6503 },
  },

  flights: [],
  car: { company: "—", pickup: "—", returns: [{ who: "Getting around", value: "JR / Tokyo Metro" }] },
  hotels: [],
  days: [],
  restaurants: [],
  places: [],
  weather: [
    { region: "Tokyo", hi: "16°C", lo: "8°C", note: "Late-November autumn — cool, mostly dry, vivid foliage. Light layers + a warm jacket for evenings." },
  ],
  phrasebook: {
    ja: {
      label: "Japanese",
      rows: [
        ["Hello", "Konnichiwa"], ["Thank you", "Arigatō"], ["Excuse me / sorry", "Sumimasen"],
        ["Yes / No", "Hai / Iie"], ["How much?", "Ikura desu ka?"], ["The bill, please", "Okaikei onegaishimasu"],
        ["Water", "Mizu"], ["Delicious", "Oishii"], ["Where is…?", "…wa doko desu ka?"], ["Goodbye", "Sayōnara"],
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
      "Light layers + warm jacket (Nov evenings)", "Comfortable walking shoes", "IC card (Suica/PASMO) or phone wallet",
      "Pocket Wi-Fi / eSIM", "Type-A power adapter", "Coin purse (lots of coins)",
    ],
    droneNote: "Drones are heavily restricted in central Tokyo — banned in most parks and dense urban areas without permits. Assume no flying in the city.",
  },
};
