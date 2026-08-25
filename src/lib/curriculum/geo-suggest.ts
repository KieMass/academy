/**
 * Suggests a curriculum slug from a browser geolocation coordinate, using
 * a coarse bounding box per supported curriculum rather than a full
 * reverse-geocoding service — the app only needs to tell "Guyana" from
 * "Cayman Islands", not resolve an address, so this stays self-contained
 * (no external API/key). Add a curriculum's box here as new countries are
 * supported; if a coordinate falls in none of them, the registration form
 * asks the user to choose explicitly rather than guessing.
 */
export interface GeoBoundingBox {
  curriculumSlug: string;
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export const CURRICULUM_BOUNDING_BOXES: GeoBoundingBox[] = [
  // Guyana: mainland South America, roughly 1°N-8.6°N, 56.5°W-61.5°W.
  { curriculumSlug: "guyana", minLat: 1, maxLat: 8.6, minLng: -61.5, maxLng: -56.4 },
  // Cayman Islands: roughly 19.2°N-19.8°N, 79.7°W-81.5°W.
  { curriculumSlug: "cayman", minLat: 19.2, maxLat: 19.8, minLng: -81.5, maxLng: -79.6 },
];

/** Returns the curriculum slug whose bounding box contains the given
 *  coordinate, or null if it falls in none of them (ask the user instead
 *  of guessing). */
export function suggestCurriculumFromCoords(latitude: number, longitude: number): string | null {
  const match = CURRICULUM_BOUNDING_BOXES.find(
    (box) => latitude >= box.minLat && latitude <= box.maxLat && longitude >= box.minLng && longitude <= box.maxLng
  );
  return match?.curriculumSlug ?? null;
}
