export const KARLSKOGA = {
  lat: 59.3267,
  lon: 14.5208,
};

export const TARGET_RADIUS_KM = 100;

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  karlskoga: { lat: 59.3267, lon: 14.5208 },
  degerfors: { lat: 59.2379, lon: 14.4304 },
  kristinehamn: { lat: 59.3098, lon: 14.1081 },
  storfors: { lat: 59.5318, lon: 14.2727 },
  filipstad: { lat: 59.7124, lon: 14.1683 },
  hallefors: { lat: 59.7839, lon: 14.5214 },
  hällefors: { lat: 59.7839, lon: 14.5214 },
  nora: { lat: 59.5193, lon: 15.0398 },
  lindesberg: { lat: 59.5929, lon: 15.2304 },
  hallsberg: { lat: 59.0664, lon: 15.1099 },
  laxa: { lat: 58.9863, lon: 14.619 },
  laxå: { lat: 58.9863, lon: 14.619 },
  kumla: { lat: 59.1277, lon: 15.1434 },
  askersund: { lat: 58.8799, lon: 14.9034 },
  lekeberg: { lat: 59.1486, lon: 14.8059 },
  fjugesta: { lat: 59.1737, lon: 14.8739 },
  orebro: { lat: 59.2741, lon: 15.2066 },
  örebro: { lat: 59.2741, lon: 15.2066 },
  karlstad: { lat: 59.3793, lon: 13.5036 },
  kil: { lat: 59.5023, lon: 13.3131 },
  forshaga: { lat: 59.5254, lon: 13.4809 },
  forsaga: { lat: 59.5254, lon: 13.4809 },
  grums: { lat: 59.3514, lon: 13.1111 },
  skoghall: { lat: 59.3245, lon: 13.4656 },
  hammaro: { lat: 59.3088, lon: 13.5057 },
  hammarö: { lat: 59.3088, lon: 13.5057 },
  saffle: { lat: 59.1323, lon: 12.9239 },
  säffle: { lat: 59.1323, lon: 12.9239 },
  mariestad: { lat: 58.7097, lon: 13.8237 },
  toreboda: { lat: 58.7076, lon: 14.1258 },
  töreboda: { lat: 58.7076, lon: 14.1258 },
  gullspang: { lat: 58.9873, lon: 14.0997 },
  gullspång: { lat: 58.9873, lon: 14.0997 },
  skovde: { lat: 58.3903, lon: 13.8451 },
  skövde: { lat: 58.3903, lon: 13.8451 },
  arboga: { lat: 59.3939, lon: 15.8388 },
  kungsor: { lat: 59.4223, lon: 16.0966 },
  kungsör: { lat: 59.4223, lon: 16.0966 },
  koping: { lat: 59.514, lon: 15.9926 },
  köping: { lat: 59.514, lon: 15.9926 },
  vasteras: { lat: 59.6099, lon: 16.5448 },
  västerås: { lat: 59.6099, lon: 16.5448 },
  stockholm: { lat: 59.3293, lon: 18.0686 },
  solna: { lat: 59.3601, lon: 18.0009 },
  goteborg: { lat: 57.7089, lon: 11.9746 },
  göteborg: { lat: 57.7089, lon: 11.9746 },
  molndal: { lat: 57.6554, lon: 12.0138 },
  mölndal: { lat: 57.6554, lon: 12.0138 },
  malmo: { lat: 55.605, lon: 13.0038 },
  malmö: { lat: 55.605, lon: 13.0038 },
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function buildHaystack(parts: Array<string | null | undefined>) {
  return normalize(parts.filter(Boolean).join(" "));
}

export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function inferCoordinatesFromLocation(location: string | null | undefined) {
  if (!location) {
    return null;
  }

  const text = normalize(location);

  for (const [key, coordinates] of Object.entries(CITY_COORDINATES)) {
    if (text.includes(key)) {
      return coordinates;
    }
  }

  return null;
}

export function inferCoordinatesFromTexts(...parts: Array<string | null | undefined>) {
  return inferCoordinatesFromLocation(parts.filter(Boolean).join(" "));
}

export function isRemoteFriendly(text: string | null | undefined) {
  if (!text) {
    return false;
  }

  const normalized = normalize(text);
  return (
    normalized.includes("remote") ||
    normalized.includes("distans") ||
    normalized.includes("hybrid")
  );
}

export function isSwedenRelatedLocation(text: string | null | undefined) {
  if (!text) {
    return false;
  }

  const normalized = normalize(text);
  return (
    normalized.includes("sweden") ||
    normalized.includes("sverige") ||
    Object.keys(CITY_COORDINATES).some((city) => normalized.includes(city))
  );
}

export function isRelevantForKarlskogaArea(
  ...parts: Array<string | null | undefined>
) {
  const haystack = buildHaystack(parts);

  if (isRemoteFriendly(haystack)) {
    return true;
  }

  if (!isSwedenRelatedLocation(haystack)) {
    return false;
  }

  const coordinates = inferCoordinatesFromLocation(haystack);
  if (!coordinates) {
    return false;
  }

  return (
    distanceKm(KARLSKOGA.lat, KARLSKOGA.lon, coordinates.lat, coordinates.lon) <=
    TARGET_RADIUS_KM
  );
}
