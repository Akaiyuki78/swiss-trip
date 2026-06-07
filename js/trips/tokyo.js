/* ============================================================
   Tokyo 2026 — public itinerary data (no personal info).
   Registered on window.TRIPS so the hub can list it.
   ============================================================ */
window.TRIPS = window.TRIPS || {};
window.TRIPS.tokyo = {
  meta: {
    id: "tokyo",
    emoji: "🗼",
    country: "Japan",
    currency: "JPY",
    title: "Tokyo 2026",
    subtitle: "6-day city break — anime, Disney & dining",
    startDate: "2026-10-09",
    endDate: "2026-10-14",
    chfToSgd: 0.0089,   // JPY → SGD (≈ 1 JPY = 0.0089 SGD)
    note: "A long Tokyo weekend: a Harajuku makeover, a Western-Tokyo anime trail, two days of Disney, and a Harry Potter studio finale.",
  },

  regions: {
    tokyo: { label: "Tokyo", lat: 35.6762, lng: 139.6503 },
  },

  flights: [],

  car: {
    company: "No car — trains & taxi",
    pickup: "—",
    returns: [{ who: "Getting around", value: "Suica / PASMO IC card · JR & Tokyo Metro · taxi" }],
  },

  hotels: [
    { name: "Marunouchi Hotel", location: "Marunouchi, Tokyo", nights: 2, night: "10 & 13 Oct",
      url: "https://www.marunouchi-hotel.co.jp/", room: "Central Tokyo base (nights 1 & 4)",
      phone: "+81 3 3217 1111", addr: "1-6-3 Marunouchi, Chiyoda City, Tokyo 100-0005" },
    { name: "Tokyo Disneyland Hotel", location: "Maihama, Urayasu", nights: 1, night: "11 Oct",
      url: "https://www.tokyodisneyresort.jp/en/hotel/dh.html", room: "By the park entrance",
      phone: "+81 47 305 3333", addr: "29-1 Maihama, Urayasu, Chiba 279-8505" },
    { name: "Tokyo DisneySea Fantasy Springs Hotel", location: "Maihama, Urayasu", nights: 1, night: "12 Oct",
      url: "https://www.tokyodisneyresort.jp/en/hotel/fsh.html", room: "Exclusive Fantasy Springs entrance",
      phone: "+81 47 305 8888", addr: "1-13 Maihama, Urayasu, Chiba 279-8511" },
  ],

  days: [
    {
      n: 1, date: "2026-10-09", dow: "Fri", title: "Depart for Tokyo", region: "tokyo",
      route: "Singapore ✈ Tokyo · overnight flight",
      hotel: "Overnight flight",
      drones: [],
      segments: [
        { t: "22:00", type: "flight", act: "Overnight flight Singapore → Tokyo", note: "Red-eye; arrive Tokyo Saturday morning." },
      ],
    },
    {
      n: 2, date: "2026-10-10", dow: "Sat", title: "Arrival & Harajuku makeover", region: "tokyo",
      route: "Land · Marunouchi · Harajuku & Omotesando",
      hotel: "Marunouchi Hotel",
      drones: [],
      segments: [
        { t: "08:00", type: "flight", act: "Land in Tokyo", note: "Clear customs & immigration." },
        { t: "09:30", type: "hotel", act: "Drop bags at Marunouchi Hotel" },
        { t: "12:00", type: "meal", act: "Lunch (play by ear)" },
        { t: "14:00", type: "shop", act: "Salon & makeover experience — Harajuku & Omotesando" },
        { t: "18:30", type: "meal", act: "Dinner (play by ear)" },
      ],
    },
    {
      n: 3, date: "2026-10-11", dow: "Sun", title: "Western Tokyo anime trail → Disney", region: "tokyo",
      route: "Toei · Suginami · Nakano → Disneyland Hotel",
      hotel: "Tokyo Disneyland Hotel",
      drones: [],
      segments: [
        { t: "10:00", type: "sight", act: "Toei Animation Museum, Nerima", note: "10:00–11:15" },
        { t: "11:30", type: "sight", act: "Kami-Igusa Station, Suginami", note: "11:30–12:30 · Gundam-themed station" },
        { t: "12:30", type: "meal", act: "Lunch (play by ear)" },
        { t: "12:45", type: "sight", act: "Suginami Animation Museum", note: "12:45–14:15" },
        { t: "14:30", type: "shop", act: "Nakano Broadway — archival anime cels", note: "14:30–16:00" },
        { t: "17:00", type: "meal", act: "Early dinner: Tempura Tenmasa", note: "Marunouchi · 35th-floor views, family-friendly" },
        { t: "18:30", type: "hotel", act: "Move to Tokyo Disneyland Hotel; collect Happy Entry pass" },
      ],
    },
    {
      n: 4, date: "2026-10-12", dow: "Mon", title: "Tokyo Disneyland", region: "tokyo",
      route: "Full day at Tokyo Disneyland",
      hotel: "Tokyo DisneySea Fantasy Springs Hotel",
      drones: [],
      segments: [
        { t: "08:00", type: "play", act: "Tokyo Disneyland", note: "Use Happy Entry pass 45–60 min before official opening." },
        { t: "19:00", type: "hotel", act: "Stay at Fantasy Springs Hotel" },
      ],
    },
    {
      n: 5, date: "2026-10-13", dow: "Tue", title: "DisneySea & Fantasy Springs", region: "tokyo",
      route: "DisneySea → back to central Tokyo",
      hotel: "Marunouchi Hotel",
      drones: [],
      segments: [
        { t: "08:00", type: "play", act: "Tokyo DisneySea & Fantasy Springs", note: "Enter via the hotel's exclusive Fantasy Springs entrance." },
        { t: "18:00", type: "hotel", act: "Move back to Marunouchi Hotel (central Tokyo)" },
      ],
    },
    {
      n: 6, date: "2026-10-14", dow: "Wed", title: "Harry Potter · Akihabara · fly home", region: "tokyo",
      route: "Studio tour · Akihabara · depart",
      hotel: "Return flight",
      drones: [],
      segments: [
        { t: "09:30", type: "sight", act: "Warner Bros. Studio Tour Tokyo — The Making of Harry Potter", note: "09:30–14:00 · Nerima (former Toshimaen)" },
        { t: "14:30", type: "shop", act: "Tamashii Nations Store Tokyo, Akihabara", note: "14:30–16:30" },
        { t: "17:00", type: "meal", act: "Dinner: Manten Sushi Marunouchi", note: "17:00–19:00 · reserve ~3 months ahead (booking opens 14 Jul)" },
        { t: "19:15", type: "drive", act: "Depart for the airport" },
        { t: "22:55", type: "flight", act: "Flight back to Singapore" },
      ],
    },
  ],

  restaurants: [
    { name: "Tempura Tenmasa", day: "Sun 11 Oct", time: "17:00", addr: "Marunouchi, Chiyoda, Tokyo" },
    { name: "Manten Sushi Marunouchi", day: "Wed 14 Oct", time: "17:00", addr: "Marunouchi, Chiyoda, Tokyo" },
  ],

  places: [
    { name: "Marunouchi / Tokyo Station", day: 2, lat: 35.6812, lng: 139.7671 },
    { name: "Harajuku & Omotesando", day: 2, lat: 35.6702, lng: 139.7027 },
    { name: "Toei Animation Museum, Nerima", day: 3, lat: 35.7585, lng: 139.5869 },
    { name: "Kami-Igusa Station, Suginami", day: 3, lat: 35.7188, lng: 139.6005 },
    { name: "Suginami Animation Museum", day: 3, lat: 35.7039, lng: 139.6086 },
    { name: "Nakano Broadway", day: 3, lat: 35.7088, lng: 139.6657 },
    { name: "Tokyo Disneyland", day: 4, lat: 35.6329, lng: 139.8804 },
    { name: "Tokyo DisneySea", day: 5, lat: 35.6267, lng: 139.8851 },
    { name: "Warner Bros. Studio Tour Tokyo", day: 6, lat: 35.7350, lng: 139.6470 },
    { name: "Tamashii Nations Store Tokyo, Akihabara", day: 6, lat: 35.6993, lng: 139.7714 },
  ],

  weather: [
    { region: "Tokyo", hi: "22°C", lo: "15°C", note: "Pleasant mid-autumn — mostly mild and dry with the odd shower. Comfortable for walking; a light jacket for the evenings." },
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
      "Light layers + a jacket (autumn evenings)", "Comfortable walking shoes", "IC card (Suica/PASMO) or phone wallet",
      "Pocket Wi-Fi / eSIM", "Portable charger", "Type-A power adapter", "Compact umbrella", "Disney park bag / ponchos",
    ],
    droneNote: "Drones are heavily restricted across central Tokyo — banned in most wards, parks and near stations without a permit. Assume no flying on this trip.",
    dining: [
      { label: "Tempura", items: [
        { name: "Tempura Tenmasa (Marunouchi)", note: "35th-floor views, family-friendly, Wagyu tempura; open Sundays." },
        { name: "Tempura Fukamachi (Kyobashi)", note: "1 Michelin star, shiso-wrapped uni; closed Mon & some Sun." },
        { name: "Tempura Kondo", note: "2 Michelin stars, vegetable-forward; advance booking; closed Sun." },
      ] },
      { label: "Wagyu & steak", items: [
        { name: "Vesta (Nihonbashi)", note: "Sanda Gyu in a 900°F charcoal kiln; private rooms; open Sun." },
        { name: "Steak House Shima", note: "Open-charcoal, take-home Wagyu sando; 7yo+; closed Sun." },
        { name: "Ginza Ukai Tei", note: "Michelin teppanyaki theatre; 12yo+ at the counter." },
      ] },
      { label: "Unagi (eel)", items: [
        { name: "Komagata Maekawa (Shin-Marunouchi)", note: "220-yr eel house, Tokyo Station views." },
        { name: "Unagi Kitao (Marunouchi Oazo)", note: "Crispy Fukuoka grill; private family suites." },
        { name: "Yondaime Kikukawa (Gransta Yaesu)", note: "Open-kitchen whole-eel charcoal grilling." },
        { name: "Godaime Nodaiwa (Azabu)", note: "200-yr, 1 Michelin star, very family-friendly." },
        { name: "Unagi Hashimoto", note: "1 Michelin star neighbourhood gem; great value." },
      ] },
      { label: "Sushi & fine dining", items: [
        { name: "Sushi Ginza Onodera", note: "English-fluent counter; lunch omakase ~200 SGD; 10yo+." },
        { name: "Udatsu Sushi", note: "Michelin gallery vibe; private rooms for families." },
        { name: "Sushi Kourin (Shibuya)", note: "Relaxed insider neighbourhood favourite." },
        { name: "Florilège", note: "2 Michelin stars French-Japanese; counter only; 12yo+." },
      ] },
    ],
  },
};
