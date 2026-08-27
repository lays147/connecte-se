const GTAG_ID = "G-TSCP67XFVK";
const STORAGE_KEY = "cookie-consent";

export type ConsentChoice = "accepted" | "declined";

export function getStoredConsent(): ConsentChoice | null {
  const value = localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "declined" ? value : null;
}

function loadGtag(): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}`;
  document.head.appendChild(script);

  const win = window as typeof window & { dataLayer?: unknown[] };
  win.dataLayer = win.dataLayer || [];
  function gtag(...args: unknown[]): void {
    win.dataLayer!.push(args);
  }
  gtag("js", new Date());
  gtag("config", GTAG_ID);
}

export function applyStoredConsent(): void {
  if (getStoredConsent() === "accepted") loadGtag();
}

export function grantConsent(): void {
  localStorage.setItem(STORAGE_KEY, "accepted");
  loadGtag();
}

export function declineConsent(): void {
  localStorage.setItem(STORAGE_KEY, "declined");
}
