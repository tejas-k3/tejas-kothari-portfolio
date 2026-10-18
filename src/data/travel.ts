// Travel map data. To add a trip, append a [from, to] pair to `trips`; if a name isn't in `places` yet,
// add it there as [lat, lon] (the build fails with a clear message listing any unknown names).
export const home = "Bengaluru";

// [from, to, meta?]. meta is optional: when ("YYYY-MM" or "YYYY-MM-DD", approximate is fine), mode, note.
export type TripMeta = { when?: string; mode?: "flight" | "cruise" | "trek" | "road" | "train"; note?: string };
export type Trip = [string, string, TripMeta?];
export const trips: Trip[] = [
  ["Bengaluru", "Coorg", { when: "2026-06", mode: "road" }],
  ["Bengaluru", "Kodaikanal", { when: "2026-05" }],
  ["Bengaluru", "Savandurga", { when: "2026-04-25", mode: "trek", note: "Trek" }],
  ["Bengaluru", "Singapore", { when: "2025-08", mode: "flight" }],
  ["Singapore", "Malaysia", { when: "2025-08" }],
  ["Bengaluru", "Mumbai", { when: "2025-06" }],
  ["Mumbai", "Goa", { when: "2025-06", mode: "cruise", note: "Cruise ship" }],
  ["Bengaluru", "Jaipur"],
  ["Bengaluru", "Guwahati"],
  ["Guwahati", "Umngot River"],
];

export const lastTrip = "Coorg";
export const nextTrip = "Unknown"; // shown as a "?" marker near home

// [lat, lon, country]
export const places: Record<string, [number, number, string]> = {
  // Tejas's places
  Bengaluru: [12.9716, 77.5946, "India"], Coorg: [12.4244, 75.7382, "India"], Kodaikanal: [10.2381, 77.4892, "India"], Goa: [15.4909, 73.8278, "India"],
  Jaipur: [26.9124, 75.7873, "India"], Guwahati: [26.1445, 91.7362, "India"], "Umngot River": [25.1879, 92.0243, "India"],
  Singapore: [1.3521, 103.8198, "Singapore"], Savandurga: [12.9246, 77.2976, "India"], Malaysia: [3.139, 101.6869, "Malaysia"], // Malaysia is pinned on Kuala Lumpur
  // India
  Delhi: [28.6139, 77.209, "India"], Mumbai: [19.076, 72.8777, "India"], Chennai: [13.0827, 80.2707, "India"], Kolkata: [22.5726, 88.3639, "India"], Hyderabad: [17.385, 78.4867, "India"],
  Pune: [18.5204, 73.8567, "India"], Ooty: [11.4102, 76.695, "India"], Munnar: [10.0889, 77.0595, "India"], Mysuru: [12.2958, 76.6394, "India"], Hampi: [15.335, 76.46, "India"],
  Gokarna: [14.5479, 74.3188, "India"], Pondicherry: [11.9416, 79.8083, "India"], Udaipur: [24.5854, 73.7125, "India"], Jodhpur: [26.2389, 73.0243, "India"], Jaisalmer: [26.9157, 70.9083, "India"],
  Agra: [27.1767, 78.0081, "India"], Varanasi: [25.3176, 82.9739, "India"], Rishikesh: [30.0869, 78.2676, "India"], Manali: [32.2396, 77.1887, "India"], Leh: [34.1526, 77.5771, "India"],
  Shillong: [25.5788, 91.8933, "India"], Cherrapunji: [25.2702, 91.7323, "India"], Darjeeling: [27.036, 88.2627, "India"], Gangtok: [27.3389, 88.6065, "India"], Kochi: [9.9312, 76.2673, "India"],
  Alleppey: [9.4981, 76.3388, "India"], Andaman: [11.7401, 92.6586, "India"], Chikmagalur: [13.3161, 75.772, "India"], Wayanad: [11.6854, 76.132, "India"],
  // World
  Kathmandu: [27.7172, 85.324, "Nepal"], Colombo: [6.9271, 79.8612, "Sri Lanka"], Male: [4.1755, 73.5093, "Maldives"], Dubai: [25.2048, 55.2708, "UAE"], Bangkok: [13.7563, 100.5018, "Thailand"],
  Bali: [-8.4095, 115.1889, "Indonesia"], Jakarta: [-6.2088, 106.8456, "Indonesia"], "Kuala Lumpur": [3.139, 101.6869, "Malaysia"], Hanoi: [21.0278, 105.8342, "Vietnam"], "Ho Chi Minh City": [10.8231, 106.6297, "Vietnam"],
  Tokyo: [35.6762, 139.6503, "Japan"], Seoul: [37.5665, 126.978, "South Korea"], "Hong Kong": [22.3193, 114.1694, "China"], Beijing: [39.9042, 116.4074, "China"], Shanghai: [31.2304, 121.4737, "China"],
  Istanbul: [41.0082, 28.9784, "Turkey"], Paris: [48.8566, 2.3522, "France"], London: [51.5072, -0.1276, "UK"], Rome: [41.9028, 12.4964, "Italy"], Zurich: [47.3769, 8.5417, "Switzerland"],
  Amsterdam: [52.3676, 4.9041, "Netherlands"], Berlin: [52.52, 13.405, "Germany"], Barcelona: [41.3851, 2.1734, "Spain"], Cairo: [30.0444, 31.2357, "Egypt"], Nairobi: [-1.2921, 36.8219, "Kenya"],
  "Cape Town": [-33.9249, 18.4241, "South Africa"], Sydney: [-33.8688, 151.2093, "Australia"], Melbourne: [-37.8136, 144.9631, "Australia"], Auckland: [-36.8485, 174.7633, "New Zealand"],
  "New York": [40.7128, -74.006, "USA"], "San Francisco": [37.7749, -122.4194, "USA"], Seattle: [47.6062, -122.3321, "USA"], Toronto: [43.6532, -79.3832, "Canada"],
  "Mexico City": [19.4326, -99.1332, "Mexico"], "Sao Paulo": [-23.5505, -46.6333, "Brazil"], "Buenos Aires": [-34.6037, -58.3816, "Argentina"], Reykjavik: [64.1466, -21.9426, "Iceland"],
};
