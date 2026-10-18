// Travel map data. To add a trip, append a [from, to] pair to `trips`; if a name isn't in `places` yet,
// add it there as [lat, lon] (the build fails with a clear message listing any unknown names).
export const home = "Bengaluru";

export const trips: [string, string][] = [
  ["Bengaluru", "Coorg"],
  ["Bengaluru", "Kodaikanal"],
  ["Bengaluru", "Singapore"],
  ["Bengaluru", "Goa"],
  ["Bengaluru", "Jaipur"],
  ["Bengaluru", "Guwahati"],
  ["Guwahati", "Umngot River"],
  ["Singapore", "Malaysia"],
];

export const lastTrip = "Coorg";
export const nextTrip = "Unknown"; // shown as a "?" marker near home

// [lat, lon]
export const places: Record<string, [number, number]> = {
  // Tejas's places
  Bengaluru: [12.9716, 77.5946], Coorg: [12.4244, 75.7382], Kodaikanal: [10.2381, 77.4892], Goa: [15.4909, 73.8278],
  Jaipur: [26.9124, 75.7873], Guwahati: [26.1445, 91.7362], "Umngot River": [25.1879, 92.0243],
  Singapore: [1.3521, 103.8198], Malaysia: [3.139, 101.6869], // Malaysia is pinned on Kuala Lumpur
  // India
  Delhi: [28.6139, 77.209], Mumbai: [19.076, 72.8777], Chennai: [13.0827, 80.2707], Kolkata: [22.5726, 88.3639], Hyderabad: [17.385, 78.4867],
  Pune: [18.5204, 73.8567], Ooty: [11.4102, 76.695], Munnar: [10.0889, 77.0595], Mysuru: [12.2958, 76.6394], Hampi: [15.335, 76.46],
  Gokarna: [14.5479, 74.3188], Pondicherry: [11.9416, 79.8083], Udaipur: [24.5854, 73.7125], Jodhpur: [26.2389, 73.0243], Jaisalmer: [26.9157, 70.9083],
  Agra: [27.1767, 78.0081], Varanasi: [25.3176, 82.9739], Rishikesh: [30.0869, 78.2676], Manali: [32.2396, 77.1887], Leh: [34.1526, 77.5771],
  Shillong: [25.5788, 91.8933], Cherrapunji: [25.2702, 91.7323], Darjeeling: [27.036, 88.2627], Gangtok: [27.3389, 88.6065], Kochi: [9.9312, 76.2673],
  Alleppey: [9.4981, 76.3388], Andaman: [11.7401, 92.6586], Chikmagalur: [13.3161, 75.772], Wayanad: [11.6854, 76.132],
  // World
  Kathmandu: [27.7172, 85.324], Colombo: [6.9271, 79.8612], Male: [4.1755, 73.5093], Dubai: [25.2048, 55.2708], Bangkok: [13.7563, 100.5018],
  Bali: [-8.4095, 115.1889], Jakarta: [-6.2088, 106.8456], "Kuala Lumpur": [3.139, 101.6869], Hanoi: [21.0278, 105.8342], "Ho Chi Minh City": [10.8231, 106.6297],
  Tokyo: [35.6762, 139.6503], Seoul: [37.5665, 126.978], "Hong Kong": [22.3193, 114.1694], Beijing: [39.9042, 116.4074], Shanghai: [31.2304, 121.4737],
  Istanbul: [41.0082, 28.9784], Paris: [48.8566, 2.3522], London: [51.5072, -0.1276], Rome: [41.9028, 12.4964], Zurich: [47.3769, 8.5417],
  Amsterdam: [52.3676, 4.9041], Berlin: [52.52, 13.405], Barcelona: [41.3851, 2.1734], Cairo: [30.0444, 31.2357], Nairobi: [-1.2921, 36.8219],
  "Cape Town": [-33.9249, 18.4241], Sydney: [-33.8688, 151.2093], Melbourne: [-37.8136, 144.9631], Auckland: [-36.8485, 174.7633],
  "New York": [40.7128, -74.006], "San Francisco": [37.7749, -122.4194], Seattle: [47.6062, -122.3321], Toronto: [43.6532, -79.3832],
  "Mexico City": [19.4326, -99.1332], "Sao Paulo": [-23.5505, -46.6333], "Buenos Aires": [-34.6037, -58.3816], Reykjavik: [64.1466, -21.9426],
};
