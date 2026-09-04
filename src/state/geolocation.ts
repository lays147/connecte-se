const STORAGE_KEY = "user-location";

export interface Coords {
  lat: number;
  lng: number;
}

export function getStoredLocation(): Coords | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") return parsed;
    return null;
  } catch {
    return null;
  }
}

function storeLocation(coords: Coords): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
}

export function clearStoredLocation(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export type LocationError = "unsupported" | "denied" | "unavailable";

// Only ever called from a direct user gesture (button click) — never on page
// load — so the permission prompt has a clear, expected trigger.
export function requestLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject("unsupported" satisfies LocationError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        storeLocation(coords);
        resolve(coords);
      },
      (error) => {
        reject((error.code === error.PERMISSION_DENIED ? "denied" : "unavailable") satisfies LocationError);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
    );
  });
}
